const crypto = require('crypto');
const User = require('../models/user.model');
const Token = require('../models/token.model');


const adminUserData = {
    username: 'admin',
    email: 'admin@system.com',
    password: 'SecurePassword123!',
    loginAttempts: 0,
    isLocked: false,
    role: 'admin'
};



const initializeAdminAndPermissions = async () => {
    // Check if admin already exists
    let user = await User.findOne({ email: adminUserData.email });
    if (user) {
        console.log('Admin user already exists:', user.email);
        return user;
    }

    // Create admin user (password will be hashed by pre-save hook)
    user = new User(adminUserData);
    await user.save();
    console.log('✅ Admin user created successfully:', user.email);

    // Generate a secure refresh token
    const tokenString = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const token = new Token({
        userId: user._id,
        token: tokenString, // Optionally hash this token for extra security
        type: 'refresh',
        expiresAt,
    });
    await token.save();
    console.log('✅ Refresh token created for admin');

    return user;
};

module.exports = { initializeAdminAndPermissions };
