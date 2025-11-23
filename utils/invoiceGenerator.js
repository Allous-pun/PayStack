const PDFDocument = require('pdfkit');
const { formatCurrency, formatDate } = require('./helpers');

// Generate PDF invoice
const generateInvoicePDF = (invoiceData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Add college header
            doc.fontSize(20)
               .font('Helvetica-Bold')
               .fillColor('#1e40af')
               .text('BIPS TECHNICAL COLLEGE', 50, 50)
               .fontSize(10)
               .font('Helvetica')
               .fillColor('#666')
               .text('Quality Technical Education', 50, 75);

            // Invoice title
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor('#000')
               .text('INVOICE', 50, 120);

            // Invoice details
            doc.fontSize(10)
               .font('Helvetica')
               .text(`Invoice Number: ${invoiceData.invoiceNumber}`, 350, 120)
               .text(`Date: ${formatDate(invoiceData.createdAt)}`, 350, 135)
               .text(`Due Date: ${formatDate(invoiceData.dueDate)}`, 350, 150);

            // Sponsor information
            doc.text('Bill To:', 50, 180)
               .font('Helvetica-Bold')
               .text(invoiceData.sponsorId.name, 50, 195)
               .font('Helvetica')
               .text(invoiceData.sponsorId.contactPerson, 50, 210)
               .text(invoiceData.sponsorId.email, 50, 225)
               .text(invoiceData.sponsorId.phone, 50, 240);

            // Academic information
            doc.text(`Academic Year: ${invoiceData.academicYear}`, 50, 270)
               .text(`Semester: ${invoiceData.semester}`, 50, 285);

            // Students table header
            let yPosition = 320;
            doc.font('Helvetica-Bold')
               .text('Student Name', 50, yPosition)
               .text('Course', 200, yPosition)
               .text('Amount', 400, yPosition);

            // Students list
            yPosition += 20;
            doc.font('Helvetica');
            invoiceData.students.forEach((student, index) => {
                if (yPosition > 700) {
                    doc.addPage();
                    yPosition = 50;
                }
                
                doc.text(student.name, 50, yPosition)
                   .text(student.course, 200, yPosition)
                   .text(formatCurrency(student.amount), 400, yPosition);
                
                yPosition += 15;
            });

            // Fee breakdown
            yPosition += 30;
            doc.font('Helvetica-Bold')
               .text('Fee Breakdown:', 50, yPosition);
            
            yPosition += 15;
            doc.font('Helvetica')
               .text(`Tuition Fees: ${formatCurrency(invoiceData.breakdown.tuition)}`, 70, yPosition);
            
            yPosition += 15;
            doc.text(`Registration Fees: ${formatCurrency(invoiceData.breakdown.registration)}`, 70, yPosition);
            
            if (invoiceData.breakdown.otherFees > 0) {
                yPosition += 15;
                doc.text(`Other Fees: ${formatCurrency(invoiceData.breakdown.otherFees)}`, 70, yPosition);
            }

            // Total amount
            yPosition += 30;
            doc.font('Helvetica-Bold')
               .text(`Total Amount: ${formatCurrency(invoiceData.totalAmount)}`, 350, yPosition);

            // Payment status
            yPosition += 20;
            doc.text(`Status: ${invoiceData.status.toUpperCase()}`, 350, yPosition);

            // Footer
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor('#666')
               .text('Thank you for choosing BIPS Technical College. For payment inquiries, contact accounts@bipstechnicalcollege.co.ke', 
                     50, 750);

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

// Generate invoice data for API response (without PDF)
const generateInvoiceData = (invoice) => {
    return {
        invoiceNumber: invoice.invoiceNumber,
        sponsor: {
            name: invoice.sponsorId.name,
            contactPerson: invoice.sponsorId.contactPerson,
            email: invoice.sponsorId.email,
            phone: invoice.sponsorId.phone
        },
        academicYear: invoice.academicYear,
        semester: invoice.semester,
        students: invoice.students.map(student => ({
            name: student.name,
            course: student.course,
            amount: student.amount
        })),
        breakdown: {
            tuition: invoice.breakdown.tuition,
            registration: invoice.breakdown.registration,
            otherFees: invoice.breakdown.otherFees
        },
        totalAmount: invoice.totalAmount,
        dueDate: formatDate(invoice.dueDate),
        status: invoice.status,
        balanceDue: invoice.balanceDue,
        createdAt: formatDate(invoice.createdAt)
    };
};

module.exports = {
    generateInvoicePDF,
    generateInvoiceData
};