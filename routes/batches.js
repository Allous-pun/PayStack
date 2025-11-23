const express = require('express');
const { 
    createBatchRegistration, 
    processBatchRegistration, 
    getBatchRegistrations 
} = require('../controllers/batchController');

const router = express.Router();

router.post('/', createBatchRegistration);
router.get('/', getBatchRegistrations);
router.post('/:id/process', processBatchRegistration);

module.exports = router;