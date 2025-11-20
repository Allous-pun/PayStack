const axios = require('axios');

const paystack = axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
    }
});

// Add response interceptor for better error handling
paystack.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('PayStack API Error:', error.response?.data);
        return Promise.reject(error);
    }
);

module.exports = paystack;