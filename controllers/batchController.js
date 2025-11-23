const BatchRegistration = require('../models/BatchRegistration');
const Student = require('../models/Student');
const Sponsor = require('../models/Sponsor');
const Invoice = require('../models/Invoice');

// Create batch registration
const createBatchRegistration = async (req, res) => {
    try {
        const { sponsorId, students } = req.body;

        // Validate input
        if (!sponsorId || !students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Sponsor ID and students array are required'
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

        // Calculate totals
        let totalAmount = 0;
        const processedStudents = students.map(student => {
            const tuitionFee = student.tuitionFee || 0;
            const registrationFee = student.registrationFee || 0;
            const studentTotal = tuitionFee + registrationFee;
            totalAmount += studentTotal;

            return {
                fullName: student.fullName,
                course: student.course,
                semester: student.semester,
                tuitionFee,
                registrationFee
            };
        });

        // Generate batch number
        const batchNumber = `BATCH_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // Create batch registration
        const batch = new BatchRegistration({
            batchNumber,
            sponsorId,
            students: processedStudents,
            totalStudents: students.length,
            totalAmount
        });

        await batch.save();

        res.status(201).json({
            success: true,
            message: 'Batch registration created successfully',
            data: batch
        });

    } catch (error) {
        console.error('Create batch registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create batch registration',
            error: error.message
        });
    }
};

// Process batch registration (create students and invoice)
const processBatchRegistration = async (req, res) => {
    try {
        const batch = await BatchRegistration.findById(req.params.id)
            .populate('sponsorId');

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch registration not found'
            });
        }

        if (batch.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Batch registration already processed'
            });
        }

        // Create individual student records
        const createdStudents = [];
        for (const studentData of batch.students) {
            const studentId = `STU_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            
            const student = new Student({
                fullName: studentData.fullName,
                sponsorId: batch.sponsorId._id,
                course: studentData.course,
                semester: studentData.semester,
                academicYear: new Date().getFullYear().toString(),
                tuitionFee: studentData.tuitionFee,
                registrationFee: studentData.registrationFee,
                totalFees: studentData.tuitionFee + studentData.registrationFee,
                studentId,
                status: 'registered'
            });

            await student.save();
            createdStudents.push(student);
        }

        // Generate invoice number
        const invoiceNumber = `INV_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // Create invoice
        const invoice = new Invoice({
            invoiceNumber,
            sponsorId: batch.sponsorId._id,
            academicYear: new Date().getFullYear().toString(),
            semester: 'First', // Default, can be customized
            students: createdStudents.map(student => ({
                studentId: student._id,
                name: student.fullName,
                course: student.course,
                amount: student.totalFees
            })),
            breakdown: {
                tuition: batch.students.reduce((sum, s) => sum + s.tuitionFee, 0),
                registration: batch.students.reduce((sum, s) => sum + s.registrationFee, 0),
                otherFees: 0
            },
            totalAmount: batch.totalAmount,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            balanceDue: batch.totalAmount
        });

        await invoice.save();

        // Update batch with invoice reference
        batch.invoiceId = invoice._id;
        batch.status = 'completed';
        batch.completedAt = new Date();
        await batch.save();

        // Update sponsor student count
        await Sponsor.findByIdAndUpdate(batch.sponsorId._id, {
            $inc: { studentsReferred: batch.totalStudents }
        });

        res.json({
            success: true,
            message: 'Batch registration processed successfully',
            data: {
                batch,
                invoice,
                students: createdStudents
            }
        });

    } catch (error) {
        console.error('Process batch registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process batch registration',
            error: error.message
        });
    }
};

// Get all batch registrations
const getBatchRegistrations = async (req, res) => {
    try {
        const batches = await BatchRegistration.find()
            .populate('sponsorId', 'name contactPerson')
            .populate('invoiceId', 'invoiceNumber totalAmount status')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: batches.length,
            data: batches
        });
    } catch (error) {
        console.error('Get batch registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch batch registrations'
        });
    }
};

module.exports = {
    createBatchRegistration,
    processBatchRegistration,
    getBatchRegistrations
};