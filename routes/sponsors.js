const express = require('express');
const { 
    createSponsor, 
    getSponsors, 
    getSponsor, 
    updateSponsor 
} = require('../controllers/sponsorController');

const router = express.Router();

router.post('/', createSponsor);
router.get('/', getSponsors);
router.get('/:id', getSponsor);
router.put('/:id', updateSponsor);

module.exports = router;