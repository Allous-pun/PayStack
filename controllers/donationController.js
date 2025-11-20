const paystack = require('../config/paystack');
const Donation = require('../models/Donation');

// Initialize donation payment
const initializeDonation = async (req, res) => {
    try {
        const { email, amount, name } = req.body;

        // Validate input
        if (!email || !amount || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email, amount, and name are required'
            });
        }

        // Validate amount
        if (amount < 1) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be at least 1 KES'
            });
        }

        const reference = `DON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create PayStack transaction
        const payload = {
            email: email,
            amount: Math.round(amount * 100), // Convert to kobo
            currency: 'KES',
            reference: reference,
            metadata: {
                donor_name: name,
                custom_fields: [
                    {
                        display_name: "Donor Name",
                        variable_name: "donor_name",
                        value: name
                    }
                ]
            },
            callback_url: `https://paystack-5vql.onrender.com/api/donations/verify/${reference}`
        };

        console.log('Sending payload to PayStack:', payload);

        const response = await paystack.post('/transaction/initialize', payload);

        // Save donation record
        const donation = new Donation({
            donorEmail: email,
            donorName: name,
            amount: amount,
            reference: reference,
            status: 'pending'
        });

        await donation.save();

        console.log('PayStack response:', response.data);

        res.json({
            success: true,
            message: 'Payment initialized successfully',
            data: {
                authorization_url: response.data.data.authorization_url,
                reference: response.data.data.reference,
                access_code: response.data.data.access_code
            }
        });

    } catch (error) {
        console.error('Initialize donation error:', error.response?.data || error.message);
        console.error('Error details:', error.response ? {
            status: error.response.status,
            headers: error.response.headers,
            data: error.response.data
        } : error.message);
        
        res.status(500).json({
            success: false,
            message: 'Failed to initialize payment',
            error: error.response?.data || error.message
        });
    }
};

// Verify donation payment
const verifyDonation = async (req, res) => {
    try {
        const { reference } = req.params;

        const response = await paystack.get(`/transaction/verify/${reference}`);

        if (response.data.data.status === 'success') {
            // Update donation status
            await Donation.findOneAndUpdate(
                { reference },
                { 
                    status: 'success',
                    completedAt: new Date(),
                    paystackData: response.data.data
                }
            );

            res.json({
                success: true,
                message: 'Payment verified successfully',
                data: response.data.data
            });
        } else {
            await Donation.findOneAndUpdate(
                { reference },
                { 
                    status: 'failed',
                    paystackData: response.data.data
                }
            );

            res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                data: response.data.data
            });
        }

    } catch (error) {
        console.error('Verify donation error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.response?.data || error.message
        });
    }
};

// Get all donations
const getDonations = async (req, res) => {
    try {
        const donations = await Donation.find().sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: donations.length,
            data: donations
        });
    } catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donations'
        });
    }
};

module.exports = {
    initializeDonation,
    verifyDonation,
    getDonations
};