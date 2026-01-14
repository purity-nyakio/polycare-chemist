const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/authmiddleware');

/**
 * @route    POST /api/auth/register
 * @desc     Register a new user
 */
router.post('/register', async (req, res) => {
    const { username, password, role, fullName, phoneNumber } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: "User already exists" });

        user = new User({
            username,
            password,
            role: role || 'pharmacist',
            fullName,
            phoneNumber
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.json({ msg: "User registered successfully" });

    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).send("Server Error");
    }
});

/**
 * @route    POST /api/auth/login
 * @desc     Authenticate user & get token
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

        const payload = {
            user: { id: user.id, role: user.role }
        };

        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    role: user.role, 
                    username: user.username,
                    fullName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    profilePic: user.profilePic // Include this so frontend gets it on login
                });
            }
        );
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send("Server Error");
    }
});

/**
 * @route    GET /api/auth/profile
 * @desc     Get current user data (for profile page load)
 */
router.get('/profile', auth(), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

/**
 * @route    PUT /api/auth/profile
 * @desc     Update user profile (Including Photo)
 */
router.put('/profile', auth(), async (req, res) => {
    const { fullName, phoneNumber, email, year, profilePic, currentPassword, newPassword } = req.body;

    try {
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        // 1. Verify Current Password if user wants to change password OR email
        if (newPassword || email !== user.email) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ msg: "Current password incorrect" });
        }

        // 2. Update Fields
        if (fullName) user.fullName = fullName;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (email) user.email = email;
        if (year) user.year = year;
        if (profilePic) user.profilePic = profilePic;

        // 3. Hash New Password if provided
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();
        res.json({ msg: "Profile updated successfully", user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
module.exports = router;