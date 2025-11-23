const mongoose = require('mongoose');

const batchRegistrationSchema = new mongoose.Schema({
    batchNumber: {
        type: String,
        required: true,
        unique: true
    },
    sponsorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sponsor',
        required: true
    },
    students: [{
        fullName: String,
        course: String,
        semester: String,
        tuitionFee: Number,
        registrationFee: Number
    }],
    totalStudents: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
});

module.exports = mongoose.model('BatchRegistration', batchRegistrationSchema);