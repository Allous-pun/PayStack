const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    sponsorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sponsor',
        required: true
    },
    course: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: String,
        required: true,
        trim: true
    },
    academicYear: {
        type: String,
        required: true,
        trim: true
    },
    tuitionFee: {
        type: Number,
        required: true
    },
    registrationFee: {
        type: Number,
        required: true
    },
    totalFees: {
        type: Number,
        required: true
    },
    studentId: {
        type: String,
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'registered', 'active', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Student', studentSchema);