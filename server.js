require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Route imports
const donationRoutes = require('./routes/donations');
const webhookRoutes = require('./routes/webhooks');
const sponsorRoutes = require('./routes/sponsors');
const studentRoutes = require('./routes/students');
const invoiceRoutes = require('./routes/invoices');
const batchRoutes = require('./routes/batches');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware - CORS first
app.use(cors());

// Webhook route needs raw body - MUST come before express.json()
app.use('/api/webhooks', express.raw({type: 'application/json'}));

// Now parse JSON for all other routes
app.use(express.json());

// Routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/batches', batchRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'BIPS College API is running!',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        features: ['donations', 'sponsors', 'students', 'invoices', 'batch-registrations']
    });
});

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🎓 BIPS College API v2.0.0`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📈 Available endpoints:`);
    console.log(`   POST /api/donations/initialize`);
    console.log(`   GET  /api/donations/verify/:reference`);
    console.log(`   GET  /api/donations`);
    console.log(`   POST /api/sponsors`);
    console.log(`   GET  /api/sponsors`);
    console.log(`   GET  /api/sponsors/:id`);
    console.log(`   PUT  /api/sponsors/:id`);
    console.log(`   POST /api/students`);
    console.log(`   GET  /api/students`);
    console.log(`   GET  /api/students/sponsor/:sponsorId`);
    console.log(`   PUT  /api/students/:id/status`);
    console.log(`   GET  /api/invoices`);
    console.log(`   GET  /api/invoices/sponsor/:sponsorId`);
    console.log(`   GET  /api/invoices/:id`);
    console.log(`   POST /api/invoices/initialize-payment`);
    console.log(`   PUT  /api/invoices/:id/status`);
    console.log(`   POST /api/batches`);
    console.log(`   GET  /api/batches`);
    console.log(`   POST /api/batches/:id/process`);
});