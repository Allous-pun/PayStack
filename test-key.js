require('dotenv').config();
const axios = require('axios');

const testKey = async () => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    console.log('Key length:', secretKey.length);
    console.log('Key starts with sk_test_:', secretKey.startsWith('sk_test_'));
    
    try {
        const response = await axios.get('https://api.paystack.co/transaction', {
            headers: {
                Authorization: `Bearer ${secretKey}`
            }
        });
        console.log('✅ Key is valid!');
    } catch (error) {
        console.log('❌ Key is invalid:', error.response?.data?.message);
    }
};

testKey();