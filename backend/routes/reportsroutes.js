const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Medicine = require('../models/medicine');

router.get('/business-summary', async (req, res) => {
    try {
        // 1. Calculate total money currently sitting in stock (Assets)
        const medicines = await Medicine.find();
        const totalStockValue = medicines.reduce((acc, med) => acc + (med.stockQuantity * med.buyingPrice), 0);

        // 2. Calculate today's sales and profit
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const salesToday = await Sale.find({ date: { $gte: startOfDay } });
        
        const totalRevenue = salesToday.reduce((acc, sale) => acc + sale.totalSellingPrice, 0);
        const totalProfit = salesToday.reduce((acc, sale) => acc + sale.profit, 0);

        res.json({
            stockValueOnShelves: totalStockValue,
            todayRevenue: totalRevenue,
            todayProfit: totalProfit,
            itemsSoldToday: salesToday.length
        });
    } catch (err) {
        res.status(500).send("Report Error");
    }
});

module.exports = router;