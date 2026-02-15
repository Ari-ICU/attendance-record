const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Parse duration strings like '30d' to seconds
const parseDuration = (duration) => {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) return null;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case 'd': return value * 24 * 60 * 60; // days to seconds
        case 'h': return value * 60 * 60; // hours to seconds
        case 'm': return value * 60; // minutes to seconds
        case 's': return value; // seconds
        default: return null;
    }
};

const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRE || '7d'; // Fallback to 7 days
const REFRESH_EXPIRES_IN = parseDuration(process.env.JWT_REFRESH_EXPIRE || '30d') || 30 * 24 * 60 * 60; // Fallback to 30 days

function generateToken(user) {
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

function generateRefreshToken(user) {
    return jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
}


const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) return res.status(401).json({ message: 'User not found' });

        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Authentication failed', error: err.message });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Forbidden: Admin access required'
        });
    }
};

module.exports = {
    authMiddleware,
    adminOnly,
    generateToken,
    generateRefreshToken,
    TOKEN_EXPIRES_IN,
    REFRESH_EXPIRES_IN
};