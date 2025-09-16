const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        lowercase: true, 
        match: [/^\S+@\S+\.\S+$/, 'Invalid email'], 
        index: true 
    },
    password: { type: String, required: true, minlength: 8 },
    loginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    lastLogin: { type: Date },
}, {
    timestamps: true
});

// Hash password before save
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incLoginAttempts = async function() {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) this.isLocked = true;
    await this.save();
};

userSchema.methods.resetLoginAttempts = async function() {
    this.loginAttempts = 0;
    this.isLocked = false;
    await this.save();
};

userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
};

// Hide sensitive info in responses
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// Statics
userSchema.statics.findByEmail = async function(email) {
    return await this.findOne({ email });
};

module.exports = mongoose.model('User', userSchema);
