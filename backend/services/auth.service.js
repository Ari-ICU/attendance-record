const jwt = require('jsonwebtoken');
const { generateToken, generateRefreshToken, REFRESH_EXPIRES_IN } = require('../middlewares/auth.middleware');
const User = require('../models/user.model');
const Token = require('../models/token.model');
const { loginSchema, userUpdateSchema } = require('../validations/user.validation');

class AuthService {
    static async loginUser(data) {
        const { error, value } = loginSchema.validate(data);
        if (error) throw new Error(error.details[0].message);

        const { identifier, password } = value;
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user) throw new Error('User not found');
        if (user.isLocked) throw new Error('Account is locked');

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            await user.incLoginAttempts();
            throw new Error('Incorrect password');
        }

        await user.resetLoginAttempts();
        await user.updateLastLogin();

        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // Validate REFRESH_EXPIRES_IN
        if (!Number.isFinite(REFRESH_EXPIRES_IN)) {
            throw new Error('Invalid refresh token expiration configuration');
        }

        // Save refresh token in DB
        const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_IN * 1000);
        if (isNaN(expiresAt.getTime())) {
            throw new Error('Invalid expiration date for refresh token');
        }

        await Token.create({
            userId: user._id,
            token: refreshToken,
            type: 'refresh',
            expiresAt
        });

        const userData = user.toObject();
        delete userData.password;

        return { user: userData, token: accessToken, refreshToken };
    }

    static async refreshToken(oldToken) {
        let decoded;
        try {
            decoded = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET);
        } catch {
            throw new Error('Invalid or expired refresh token');
        }

        const storedToken = await Token.findOne({
            token: oldToken,
            type: 'refresh',
            userId: decoded.userId
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new Error('Refresh token expired or invalid');
        }

        const user = await User.findById(decoded.userId);
        if (!user) throw new Error('User not found');

        const newAccessToken = generateToken(user);

        // 👇 ONLY rotate refresh token if it's within 10% of expiry (e.g., last 10 minutes of 7 days)
        const expiresAt = storedToken.expiresAt.getTime();
        const now = Date.now();
        const threshold = expiresAt - (REFRESH_EXPIRES_IN * 1000 * 0.1); // 10% of TTL

        let newRefreshToken = oldToken; // reuse old by default
        let saveToken = false;

        if (now > threshold) {
            // Time to rotate!
            newRefreshToken = generateRefreshToken(user);
            storedToken.token = newRefreshToken;
            storedToken.expiresAt = new Date(Date.now() + REFRESH_EXPIRES_IN * 1000);
            saveToken = true;
        }

        if (saveToken) {
            await storedToken.save();
        }

        return { token: newAccessToken, refreshToken: newRefreshToken };
    }

    static async logoutUser(userId, token) {
        await Token.deleteOne({ userId, token, type: 'refresh' });
        return true;
    }

    static async getProfile(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) throw new Error('User not found');
        return user;
    }

    static async updateProfile(userId, data) {
        const { error, value } = userUpdateSchema.validate(data);
        if (error) throw new Error(error.details[0].message);

        const user = await User.findByIdAndUpdate(userId, value, { new: true }).select('-password');
        if (!user) throw new Error('User not found');
        return user;
    }
}

module.exports = AuthService;