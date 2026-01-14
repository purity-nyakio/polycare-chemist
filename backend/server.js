const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

/**
 * POLYCARE CHEMIST - BACKEND ENGINE
 * Primary Server Configuration
 */
const app = express();

// --- 1. MIDDLEWARE ---
/** * IMPORTANT: Limits increased to 50MB to support profile photo uploads 
 * (Base64 strings are much larger than standard text).
 */
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Allows your React frontend (port 3000) to communicate with this API (port 5000)
app.use(cors()); 

// --- 2. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Polycare Database Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- 3. ROUTE MOUNTING ---
app.use('/api/auth', require('./routes/authroutes')); 
app.use('/api/medicine', require('./routes/medicineroutes')); 
app.use('/api/sales', require('./routes/salesroutes')); 
app.use('/api/reports', require('./routes/reportsroutes')); 

// --- 4. GLOBAL ERROR HANDLING ---
app.use((err, req, res, next) => {
    console.error("Internal Server Error Log:", err.stack);
    res.status(500).json({ 
        msg: 'Something went wrong in the Polycare Backend!', 
        error: err.message 
    });
});

// --- 5. SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('----------------------------------------------------');
  console.log(`🚀 Polycare Server is active on port ${PORT}`);
  console.log(`👤 Admin: Dr. Rev. Polly Wawira`);
  console.log(`📡 Endpoints ready: Auth, Medicine, Sales, Reports`);
  console.log(`📦 Max Payload Size: 50MB`);
  console.log('----------------------------------------------------');
});