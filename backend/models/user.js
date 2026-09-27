const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const currencyConfig = require('../config/currency.Config.js');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        default: ""
    },
    dob: {
        type: Date,
        default: null
    },
    profilePic: {
        type: String,
        default: "",
    },
    gender: {
        type: String,
        enum: ["male", "female", "other", null],
        default: null
    },
    phone: {
        type: String,
        default: "",
        trim: true
    },
    currency: {
        type: String,
        enum: Object.keys(currencyConfig),
        default: "INR"
    },
    country: {
        type: String,
        trim: true,
        default: ""
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified("password")) return;
        this.password = await bcrypt.hash(this.password, 16);
        
    } catch (error) {
        console.error(`Hash Error ~ ${error}`);
        next(error);
    }
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

module.exports = mongoose.models.User || mongoose.model("User", userSchema);