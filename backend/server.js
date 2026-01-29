const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

/**
 * POLYCARE CHEMIST - BACKEND ENGINE

 */
const app = express();

// --- 1. MIDDLEWARE ---
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// UPDATED: Configure CORS to allow your Vercel URL

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://polycare-chemist.vercel.app' //  FRONTEND URL
  ],
  credentials: true
}));
 

// --- 2. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Polycare Database Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- 3. HEALTH CHECK & TEST ROUTE ---

app.get('/', (req, res) => {
    res.status(200).send('🚀 Polycare API is Live and Running!');
});

// --- 4. ROUTE MOUNTING ---
app.use('/api/auth', require('./routes/authroutes')); 
app.use('/api/medicine', require('./routes/medicineroutes')); 
app.use('/api/sales', require('./routes/salesroutes')); 
app.use('/api/reports', require('./routes/reportsroutes')); 

// --- 5. GLOBAL ERROR HANDLING ---
app.use((err, req, res, next) => {
    console.error("Internal Server Error Log:", err.stack);
    res.status(500).json({ 
        msg: 'Something went wrong in the Polycare Backend!', 
        error: err.message 
    });
});

// --- 6. SERVER INITIALIZATION ---
const PORT = process.env.PORT || 10000; // Render uses port 10000 by default
app.listen(PORT, () => {
  console.log('----------------------------------------------------');
  console.log(`🚀 Polycare Server is active on port ${PORT}`);
  console.log(`👤 Admin: Dr. Rev. Polly Wawira`);
  console.log(`📡 Endpoints ready: Auth, Medicine, Sales, Reports`);
  console.log(`📦 Max Payload Size: 50MB`);
  console.log('----------------------------------------------------');
});