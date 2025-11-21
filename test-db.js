require('dotenv').config();
const mongoose = require('mongoose');

const testDB = async () => {
    try {
        // Test without appName
        const uri = process.env.MONGODB_URI.replace('&appName=PesaPal', '');
        await mongoose.connect(uri);
        console.log('✅ Database connected successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

testDB();