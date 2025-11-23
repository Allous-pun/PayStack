const express = require('express');
const { 
    getInvoices, 
    getInvoicesBySponsor, 
    getInvoice, 
    initializeInvoicePayment, 
    updateInvoiceStatus 
} = require('../controllers/invoiceController');

const router = express.Router();

router.get('/', getInvoices);
router.get('/sponsor/:sponsorId', getInvoicesBySponsor);
router.get('/:id', getInvoice);
router.post('/initialize-payment', initializeInvoicePayment);
router.put('/:id/status', updateInvoiceStatus);

module.exports = router;