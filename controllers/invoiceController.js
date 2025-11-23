const Invoice = require('../models/Invoice');
const Sponsor = require('../models/Sponsor');
const paystack = require('../config/paystack');

// Get all invoices
const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find()
            .populate('sponsorId', 'name contactPerson email phone')
            .populate('students.studentId', 'fullName course studentId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoices'
        });
    }
};

// Get invoices by sponsor
const getInvoicesBySponsor = async (req, res) => {
    try {
        const invoices = await Invoice.find({ sponsorId: req.params.sponsorId })
            .populate('sponsorId', 'name contactPerson email')
            .populate('students.studentId', 'fullName course studentId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (error) {
        console.error('Get invoices by sponsor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoices'
        });
    }
};

// Get single invoice
const getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('sponsorId', 'name contactPerson email phone address')
            .populate('students.studentId', 'fullName course studentId status');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoice'
        });
    }
};

// Initialize invoice payment
const initializeInvoicePayment = async (req, res) => {
    try {
        const { invoiceId, email } = req.body;

        const invoice = await Invoice.findById(invoiceId)
            .populate('sponsorId');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        if (invoice.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Invoice already paid'
            });
        }

        const reference = `INV_${invoice.invoiceNumber}_${Date.now()}`;

        // Convert amount to smallest unit (PayStack requirement)
        const amountInSmallestUnit = Math.round(invoice.totalAmount * 100);

        const payload = {
            email: email || invoice.sponsorId.email,
            amount: amountInSmallestUnit,
            currency: 'KES',
            reference: reference,
            metadata: {
                invoice_id: invoiceId,
                sponsor_name: invoice.sponsorId.name,
                invoice_number: invoice.invoiceNumber,
                custom_fields: [
                    {
                        display_name: "Invoice Number",
                        variable_name: "invoice_number",
                        value: invoice.invoiceNumber
                    },
                    {
                        display_name: "Sponsor Name",
                        variable_name: "sponsor_name",
                        value: invoice.sponsorId.name
                    }
                ]
            },
            callback_url: `https://bipstechnicalcollege.co.ke/invoice-payment-success?reference=${reference}`
        };

        const response = await paystack.post('/transaction/initialize', payload);

        res.json({
            success: true,
            message: 'Invoice payment initialized successfully',
            data: {
                authorization_url: response.data.data.authorization_url,
                reference: response.data.data.reference,
                access_code: response.data.data.access_code,
                invoice: {
                    id: invoice._id,
                    invoiceNumber: invoice.invoiceNumber,
                    totalAmount: invoice.totalAmount
                }
            }
        });

    } catch (error) {
        console.error('Initialize invoice payment error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize invoice payment',
            error: error.response?.data || error.message
        });
    }
};

// Update invoice status after payment
const updateInvoiceStatus = async (req, res) => {
    try {
        const { invoiceId, status, paymentData } = req.body;

        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        const updateData = { status };
        
        if (status === 'paid') {
            updateData.paidAt = new Date();
            updateData.balanceDue = 0;
            
            if (paymentData) {
                updateData.payments.push({
                    paymentId: paymentData.paymentId,
                    amount: paymentData.amount,
                    date: new Date(),
                    method: paymentData.method
                });
            }
        }

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            invoiceId,
            updateData,
            { new: true }
        ).populate('sponsorId');

        res.json({
            success: true,
            message: `Invoice ${status} successfully`,
            data: updatedInvoice
        });

    } catch (error) {
        console.error('Update invoice status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update invoice status',
            error: error.message
        });
    }
};

module.exports = {
    getInvoices,
    getInvoicesBySponsor,
    getInvoice,
    initializeInvoicePayment,
    updateInvoiceStatus
};