const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    pharmacistName: { type: String, required: true },
    action: { type: String, required: true }, // e.g., "SALE", "RESTOCK"
    medicineName: { type: String, required: true },
    batchNumber: { type: String }, 
    quantityChanged: { type: Number, required: true },
    details: { type: String }, 
    timestamp: { type: Date, default: Date.now } // Use this name everywhere!
});

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);