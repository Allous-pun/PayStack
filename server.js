require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Route imports
const donationRoutes = require('./routes/donations');
const webhookRoutes = require('./routes/webhooks');

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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'PayStack Donation API is running!',
        timestamp: new Date().toISOString()
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
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});