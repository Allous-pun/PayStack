const express = require('express');
const { 
    initializeDonation, 
    verifyDonation, 
    getDonations 
} = require('../controllers/donationController');

const router = express.Router();

router.post('/initialize', initializeDonation);
router.get('/verify/:reference', verifyDonation);
router.get('/', getDonations);

module.exports = router;