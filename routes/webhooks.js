const express = require('express');
const { handleWebhook } = require('../controllers/webhookController');

const router = express.Router();

// Webhook route - handle raw body
router.post('/paystack', express.raw({type: 'application/json'}), handleWebhook);

module.exports = router;