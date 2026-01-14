const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    // Link to the user who made the sale
    pharmacistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pharmacistName: { type: String, required: true },
    
    // Product Details
    medicineId: { type: String, required: true },
    name: { type: String, required: true },
    quantitySold: { type: Number, required: true },
    
    // Financials in KES
    totalBuyingCost: { type: Number, required: true },
    totalSellingPrice: { type: Number, required: true },
    profit: { type: Number, required: true },
    
    // Date & Time
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', SaleSchema);