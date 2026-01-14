const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'pharmacist'], default: 'pharmacist' },
    fullName: { type: String },
    phoneNumber: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);