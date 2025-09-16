// utils/jwt.js
const jwt = require('jsonwebtoken');

/**
 * Generate Access Token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            userId: user._id
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );
};

module.exports = { generateToken, generateRefreshToken };
