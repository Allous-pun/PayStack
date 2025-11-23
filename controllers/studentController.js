const Student = require('../models/Student');
const Sponsor = require('../models/Sponsor');

// Create single student
const createStudent = async (req, res) => {
    try {
        const { 
            fullName, 
            sponsorId, 
            course, 
            semester, 
            academicYear, 
            tuitionFee, 
            registrationFee 
        } = req.body;

        // Validate input
        if (!fullName || !sponsorId || !course || !semester || !academicYear) {
            return res.status(400).json({
                success: false,
                message: 'All fields except fees are required'
            });
        }

        // Check if sponsor exists
        const sponsor = await Sponsor.findById(sponsorId);
        if (!sponsor) {
            return res.status(404).json({
                success: false,
                message: 'Sponsor not found'
            });
        }

        // Calculate total fees
        const totalFees = (tuitionFee || 0) + (registrationFee || 0);

        // Generate student ID
        const studentId = `STU_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // Create student
        const student = new Student({
            fullName,
            sponsorId,
            course,
            semester,
            academicYear,
            tuitionFee: tuitionFee || 0,
            registrationFee: registrationFee || 0,
            totalFees,
            studentId
        });

        await student.save();

        // Update sponsor's student count
        await Sponsor.findByIdAndUpdate(sponsorId, {
            $inc: { studentsReferred: 1 }
        });

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: student
        });

    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create student',
            error: error.message
        });
    }
};

// Get all students by sponsor
const getStudentsBySponsor = async (req, res) => {
    try {
        const students = await Student.find({ sponsorId: req.params.sponsorId })
            .populate('sponsorId', 'name contactPerson')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Get students by sponsor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch students'
        });
    }
};

// Get all students
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate('sponsorId', 'name contactPerson email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Get all students error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch students'
        });
    }
};

// Update student status
const updateStudentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('sponsorId', 'name contactPerson');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student status updated successfully',
            data: student
        });
    } catch (error) {
        console.error('Update student status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update student status',
            error: error.message
        });
    }
};

module.exports = {
    createStudent,
    getStudentsBySponsor,
    getAllStudents,
    updateStudentStatus
};