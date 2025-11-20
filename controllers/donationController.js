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

// Helper function to format payment method
const getPaymentMethod = (channel) => {
    const methodMap = {
        'mobile_money': 'Mobile Money (M-Pesa)',
        'card': 'Credit/Debit Card',
        'bank': 'Bank Transfer',
        'ussd': 'USSD',
        'qr': 'QR Code',
        'mpesa': 'M-Pesa',
        'mptill': 'M-Pesa Till',
        'atl_ke': 'Airtel Money'
    };
    return methodMap[channel] || channel;
};

// Verify donation payment
const verifyDonation = async (req, res) => {
    try {
        const { reference } = req.params;

        const response = await paystack.get(`/transaction/verify/${reference}`);
        const paystackData = response.data.data;

        if (paystackData.status === 'success') {
            // Update donation status
            await Donation.findOneAndUpdate(
                { reference },
                { 
                    status: 'success',
                    completedAt: new Date(),
                    paystackData: paystackData
                }
            );

            // Create clean, user-friendly response while keeping original data structure
            const cleanResponse = {
                success: true,
                message: 'Payment verified successfully',
                data: {
                    // Keep original Paystack data for compatibility
                    ...paystackData,
                    // Add clean formatted data
                    formatted: {
                        transactionId: paystackData.id,
                        reference: paystackData.reference,
                        receiptNumber: paystackData.receipt_number,
                        amount: paystackData.amount / 100, // Convert back from kobo
                        currency: paystackData.currency,
                        paidAt: paystackData.paid_at,
                        paymentMethod: getPaymentMethod(paystackData.channel),
                        customer: {
                            name: paystackData.metadata?.donor_name || 'Customer',
                            email: paystackData.customer?.email,
                            phone: paystackData.authorization?.mobile_money_number
                        },
                        summary: {
                            amountPaid: `KES ${(paystackData.amount / 100).toLocaleString()}`,
                            transactionFee: `KES ${(paystackData.fees / 100).toLocaleString()}`,
                            netAmount: `KES ${((paystackData.amount - paystackData.fees) / 100).toLocaleString()}`,
                            paymentDate: new Date(paystackData.paid_at).toLocaleDateString('en-KE', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                        }
                    }
                }
            };

            res.json(cleanResponse);
        } else {
            await Donation.findOneAndUpdate(
                { reference },
                { 
                    status: 'failed',
                    paystackData: paystackData
                }
            );

            res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                data: paystackData
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