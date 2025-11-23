// Email service placeholder - to be implemented when SMTP is available
// For now, we'll just log the email content

const sendInvoiceEmail = async (sponsorEmail, invoiceData, pdfBuffer = null) => {
    console.log('=== EMAIL WOULD BE SENT ===');
    console.log('To:', sponsorEmail);
    console.log('Subject:', `Invoice ${invoiceData.invoiceNumber} - BIPS Technical College`);
    console.log('Invoice Data:', JSON.stringify(invoiceData, null, 2));
    console.log('PDF Generated:', pdfBuffer ? 'Yes' : 'No');
    console.log('=== END EMAIL LOG ===');
    
    return {
        success: true,
        message: 'Email logged (SMTP not configured)',
        loggedData: {
            to: sponsorEmail,
            invoiceNumber: invoiceData.invoiceNumber,
            timestamp: new Date().toISOString()
        }
    };
};

const sendPaymentConfirmation = async (sponsorEmail, paymentData) => {
    console.log('=== PAYMENT CONFIRMATION EMAIL ===');
    console.log('To:', sponsorEmail);
    console.log('Payment Data:', JSON.stringify(paymentData, null, 2));
    console.log('=== END PAYMENT EMAIL LOG ===');
    
    return {
        success: true,
        message: 'Payment confirmation logged (SMTP not configured)'
    };
};

module.exports = {
    sendInvoiceEmail,
    sendPaymentConfirmation
};