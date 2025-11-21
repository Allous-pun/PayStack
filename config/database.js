const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.log('💡 Please check:');
        console.log('1. MongoDB Atlas IP whitelisting');
        console.log('2. Database name in connection string');
        console.log('3. Username/password correctness');
        process.exit(1);
    }
};

module.exports = connectDB;