const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    medicineId: { type: String, required: true }, // Links to Medicine
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true },
    // CRITICAL: This allows us to track that Batch A cost 20/- and Batch B cost 30/-
    buyingPrice: { type: Number, required: true, default: 0 }, 
    dateReceived: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', BatchSchema);