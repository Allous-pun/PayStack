// Generate unique IDs and references
const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `BIPS-INV-${timestamp}-${random}`;
};

const generateBatchNumber = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `BIPS-BATCH-${timestamp}-${random}`;
};

const generateStudentId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `BIPS-STU-${timestamp}-${random}`;
};

// Format currency for display
const formatCurrency = (amount, currency = 'KES') => {
    const currencySymbols = {
        'KES': 'KES ',
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toLocaleString()}`;
};

// Format date for display
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Calculate due date (default 30 days from now)
const calculateDueDate = (days = 30) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number (basic Kenyan format)
const isValidPhone = (phone) => {
    const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
    return phoneRegex.test(phone);
};

module.exports = {
    generateInvoiceNumber,
    generateBatchNumber,
    generateStudentId,
    formatCurrency,
    formatDate,
    calculateDueDate,
    isValidEmail,
    isValidPhone
};