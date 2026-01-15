const express = require('express');
const router = express.Router();
const Medicine = require('../models/medicine');
const Batch = require('../models/batch'); 
const AuditLog = require('../models/Auditlog');
const auth = require('../middleware/authmiddleware');

/**
 * @route   GET /api/medicine/all
 * @desc    Fetch all medicines for the Master Stock List
 */
router.get('/all', auth(), async (req, res) => {
    try {
        const medicines = await Medicine.find().sort({ name: 1 });
        res.json(medicines);
    } catch (err) {
        console.error("Error fetching inventory:", err.message);
        res.status(500).json({ msg: "Server Error fetching inventory" });
    }
});

/**
 * @route   POST /api/medicine/add
 * @desc    Add a new batch or Restock existing medicine
 */
router.post('/add', auth(['admin', 'pharmacist']), async (req, res) => {
    const { 
        medicineId, name, company, quantity, buyingPrice, 
        sellingPrice, batchNumber, expiryDate, category, 
        formulation, receiptNo 
    } = req.body;

    try {
        const qtyInt = parseFloat(quantity); 
        const bPrice = parseFloat(buyingPrice);
        const sPrice = parseFloat(sellingPrice);

        if (isNaN(qtyInt) || qtyInt <= 0) {
            return res.status(400).json({ msg: "Please enter a valid quantity greater than 0" });
        }

        // 1. Find or Create the Medicine Master record
        let medicine = await Medicine.findOne({ medicineId });

        if (!medicine) {
            medicine = new Medicine({ 
                medicineId, name, company, 
                formulation: formulation || 'Tablet',
                buyingPrice: bPrice, sellingPrice: sPrice,
                category: category || 'General',
                totalStock: qtyInt 
            });
        } else {
            medicine.buyingPrice = bPrice; 
            medicine.sellingPrice = sPrice;
            medicine.totalStock = Number((medicine.totalStock + qtyInt).toFixed(2)); 
        }

        // 2. Prepare the specific Batch entry 
        const newBatch = new Batch({
            medicineId,
            batchNumber,
            expiryDate: new Date(expiryDate),
            quantity: qtyInt,
            buyingPrice: bPrice
        });

        // 3. Prepare Audit Log
        const logEntry = new AuditLog({
            pharmacistName: req.user.username || "Authorized Staff", 
            action: "RESTOCK",
            medicineName: name,
            batchNumber: batchNumber,
            quantityChanged: qtyInt,
            details: `Received ${qtyInt} units at ${bPrice} bob. Batch: ${batchNumber}. Receipt: ${receiptNo || 'N/A'}`
        });

        await Promise.all([
            medicine.save(),
            newBatch.save(),
            logEntry.save()
        ]);

        res.status(200).json({ 
            msg: `Stock updated: ${name} (Batch ${batchNumber})`, 
            totalStock: medicine.totalStock 
        });

    } catch (err) {
        console.error("Critical Inventory Error:", err.message);
        res.status(500).json({ msg: "Inventory Server Error" });
    }
});

/**
 * @route   GET /api/medicine/batches/:medicineId
 */
router.get('/batches/:medicineId', auth(), async (req, res) => {
    try {
        const batches = await Batch.find({ 
            medicineId: req.params.medicineId,
            quantity: { $gt: 0 } 
        }).sort({ expiryDate: 1 });
        res.json(batches);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching batches" });
    }
});

/**
 * @route   GET /api/medicine/admin/stock-value
 * @desc    Detailed financial breakdown for Dr. Rev. Polly Wawira
 */
router.get('/admin/stock-value', auth(['admin']), async (req, res) => {
    try {
        const batches = await Batch.find({ quantity: { $gt: 0 } }).sort({ medicineId: 1 });
        
        const detailedStock = await Promise.all(batches.map(async (batch) => {
            const med = await Medicine.findOne({ medicineId: batch.medicineId });
            
            const bPrice = batch.buyingPrice || (med ? med.buyingPrice : 0);
            const sPrice = med ? med.sellingPrice : 0;

            return {
                medicineId: batch.medicineId,
                name: med ? med.name : "Unknown Product",
                batchNumber: batch.batchNumber,
                quantity: batch.quantity,
                unitBuyingPrice: bPrice,
                unitSellingPrice: sPrice,
                totalInvestment: (batch.quantity * bPrice).toFixed(2),
                potentialRevenue: (batch.quantity * sPrice).toFixed(2),
                potentialProfit: ((sPrice - bPrice) * batch.quantity).toFixed(2)
            };
        }));

        res.json(detailedStock);
    } catch (err) {
        console.error("Admin Report Error:", err);
        res.status(500).json({ msg: "Failed to generate admin report" });
    }
});

module.exports = router;