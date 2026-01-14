const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale'); 
const Medicine = require('../models/medicine');
const Batch = require('../models/Batch'); 
const AuditLog = require('../models/Auditlog'); 
const auth = require('../middleware/authmiddleware');

// @route    GET /api/sales/dashboard-stats
// @desc     Calculate Stock Investment, Revenue, and Profit for Dashboard
router.get('/dashboard-stats', auth(), async (req, res) => {
    try {
        // 1. Calculate Stock Investment (The value of all current stock)
        const allBatches = await Batch.find({ quantity: { $gt: 0 } });
        
        let totalInvestment = 0;
        for (let batch of allBatches) {
            const med = await Medicine.findOne({ medicineId: batch.medicineId });
            // Use Batch price first. If null, use Medicine master price. If both null, 0.
            const costPrice = batch.buyingPrice || (med ? med.buyingPrice : 0);
            totalInvestment += (batch.quantity * costPrice);
        }

        // 2. Get Today's Totals (Corrected Timezone Logic)
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const todaySales = await Sale.find({ date: { $gte: start, $lte: end } });
        
        const todayRevenue = todaySales.reduce((acc, s) => acc + (s.totalSellingPrice || 0), 0);
        const todayProfit = todaySales.reduce((acc, s) => acc + (s.profit || 0), 0);
        const itemsSold = todaySales.reduce((acc, s) => acc + (s.quantitySold || 0), 0);

        res.json({
            stockInvestment: Number(totalInvestment.toFixed(2)),
            todayRevenue: Number(todayRevenue.toFixed(2)),
            todayProfit: Number(todayProfit.toFixed(2)),
            itemsSold: itemsSold
        });
    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).send("Error fetching dashboard stats");
    }
});

// @route    POST /api/sales/checkout
router.post('/checkout', auth(), async (req, res) => {
    const { medicineId, quantitySold, pharmacistName } = req.body;
    let remainingToDeduct = parseFloat(quantitySold);

    try {
        const med = await Medicine.findOne({ medicineId });
        if (!med) return res.status(404).json({ msg: "Medicine not found" });
        
        if (med.totalStock < remainingToDeduct) {
            return res.status(400).json({ msg: `Only ${med.totalStock} units left!` });
        }

        // FEFO - Find unexpired batches, sorted by soonest expiry
        const batches = await Batch.find({ 
            medicineId, 
            quantity: { $gt: 0 },
            expiryDate: { $gt: new Date() } 
        }).sort({ expiryDate: 1 });

        if (batches.length === 0) {
            return res.status(400).json({ msg: "No valid unexpired batches found!" });
        }

        let totalBuyingCostForThisSale = 0;
        let actualDeducted = 0;

        for (let batch of batches) {
            if (remainingToDeduct <= 0) break;

            let canTake = Math.min(batch.quantity, remainingToDeduct);
            const batchCost = batch.buyingPrice || med.buyingPrice || 0; 
            
            totalBuyingCostForThisSale += (canTake * batchCost);
            batch.quantity = Number((batch.quantity - canTake).toFixed(2));
            
            remainingToDeduct -= canTake;
            actualDeducted += canTake;

            await batch.save();

            // Log Batch Deduction
            await new AuditLog({
                pharmacistName,
                action: "SALE",
                medicineName: med.name,
                batchNumber: batch.batchNumber,
                quantityChanged: -canTake,
                details: `Sold from batch ${batch.batchNumber}`
            }).save();
        }

        // Update Master Stock
        med.totalStock = Number((med.totalStock - actualDeducted).toFixed(2));
        await med.save();

        const totalSellingPrice = med.sellingPrice * actualDeducted;
        const netProfit = totalSellingPrice - totalBuyingCostForThisSale;

        const newSale = new Sale({
            medicineId,
            name: med.name,
            quantitySold: actualDeducted,
            totalBuyingCost: Number(totalBuyingCostForThisSale.toFixed(2)),
            totalSellingPrice: Number(totalSellingPrice.toFixed(2)),
            profit: Number(netProfit.toFixed(2)),
            pharmacistName,
            date: new Date()
        });

        await newSale.save();
        res.json({ msg: "Sold successfully", soldQty: actualDeducted, totalPrice: totalSellingPrice });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error in Checkout");
    }
});

// @route    GET /api/sales/profit-summary
router.get('/profit-summary', auth(), async (req, res) => {
    try {
        const { start, end } = req.query;
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        const summary = await Sale.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: "$name",
                    totalQty: { $sum: "$quantitySold" },
                    totalRevenue: { $sum: "$totalSellingPrice" },
                    totalProfit: { $sum: "$profit" }
                }
            },
            { $project: { name: "$_id", totalQty: 1, totalRevenue: 1, totalProfit: 1, _id: 0 } }
        ]);

        res.json(summary);
    } catch (err) {
        console.error("Profit Summary Error:", err);
        res.status(500).send("Error generating profit summary");
    }
});

// @route    GET /api/sales/history
router.get('/history', auth(), async (req, res) => {
    try {
        const { date } = req.query;
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        
        const sales = await Sale.find({ date: { $gte: start, $lte: end } }).sort({ date: -1 });
        res.json(sales);
    } catch (err) { res.status(500).send("Error fetching history"); }
});

// @route    DELETE /api/sales/:id
router.delete('/:id', auth(['admin']), async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) return res.status(404).json({ msg: "Sale not found" });
        
        const med = await Medicine.findOne({ medicineId: sale.medicineId });
        if (med) {
            med.totalStock = Number((med.totalStock + sale.quantitySold).toFixed(2));
            await med.save();
        }
        
        await Sale.findByIdAndDelete(req.params.id);
        res.json({ msg: "Sale reversed successfully" });
    } catch (err) { res.status(500).send("Error reversing sale"); }
});

module.exports = router;