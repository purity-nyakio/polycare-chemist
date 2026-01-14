const express = require('express');
const router = express.Router();
const AuditLog = require('../models/Auditlog'); // Ensure the filename matches (auditlog vs AuditLog)
const auth = require('../middleware/authmiddleware');

/**
 * @route   GET /api/reports/logs  (or whichever path you mounted in server.js)
 * @desc    Get system audit logs
 * @access  Admin Only
 */
router.get('/logs', auth(['admin']), async (req, res) => {
    try {
        // IMPORTANT: Check if your model uses 'date' or 'timestamp'
        // We use 'date' here as it's the standard for your restock logic
        const logs = await AuditLog.find()
            .sort({ date: -1 }) 
            .limit(100);

        if (!logs || logs.length === 0) {
            return res.json({ msg: "No audit logs found yet." });
        }

        res.json(logs);
    } catch (err) {
        console.error("Audit Fetch Error:", err.message);
        res.status(500).json({ msg: "Server Error fetching logs" });
    }
});

module.exports = router;