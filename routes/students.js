const express = require('express');
const { 
    createStudent, 
    getStudentsBySponsor, 
    getAllStudents, 
    updateStudentStatus 
} = require('../controllers/studentController');

const router = express.Router();

router.post('/', createStudent);
router.get('/', getAllStudents);
router.get('/sponsor/:sponsorId', getStudentsBySponsor);
router.put('/:id/status', updateStudentStatus);

module.exports = router;