const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    // Unique ID for internal tracking (e.g., MED001)
    medicineId: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    name: { 
        type: String, 
        required: true,
        index: true // Makes searching for medicine faster
    },
    // NEW: Added Formulation (Type) - Tablet, Syrup, Injection, etc.
    formulation: {
        type: String,
        required: true,
        enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler', 'Other'],
        default: 'Tablet'
    },
    company: { 
        type: String, 
        required: true 
    },
    // The master total calculated during Batch addition/Sales
    totalStock: { 
        type: Number, 
        default: 0,
        min: [0, 'Stock cannot be negative'] // Safety guard
    }, 
    // Triggers alerts when stock falls below this number
    reorderLevel: { 
        type: Number, 
        default: 10 
    }, 
    buyingPrice: { 
        type: Number, 
        required: true,
        min: [0, 'Price must be positive']
    },
    sellingPrice: { 
        type: Number, 
        required: true,
        min: [0, 'Price must be positive']
    },
    category: { 
        type: String, 
        default: 'General',
        trim: true
    },
    // Automatically tracked: When the medicine record was first created
    dateAdded: { 
        type: Date, 
        default: Date.now 
    }
});

// Helper Method: Check if stock is low
MedicineSchema.methods.needsRestock = function() {
    return this.totalStock <= this.reorderLevel;
};

// --- CRITICAL: Prevent OverwriteModelError ---
const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);

module.exports = Medicine;