const crypto = require('crypto');
const Donation = require('../models/Donation');

const handleWebhook = async (req, res) => {
    try {
        // Verify webhook signature (optional but recommended)
        const signature = req.headers['x-paystack-signature'];
        if (!signature) {
            return res.status(401).json({ message: 'No signature provided' });
        }

        const hash = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== signature) {
            return res.status(401).json({ message: 'Invalid signature' });
        }

        const event = req.body;

        // Handle charge.success event
        if (event.event === 'charge.success') {
            const { reference, amount, customer, status } = event.data;

            if (status === 'success') {
                await Donation.findOneAndUpdate(
                    { reference },
                    { 
                        status: 'success',
                        completedAt: new Date(),
                        paystackData: event.data
                    },
                    { new: true, upsert: false }
                );

                console.log(`Donation ${reference} completed successfully`);
            }
        }

        res.status(200).json({ message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};

module.exports = {
    handleWebhook
};