/**
 * MongoDB connection configuration using Mongoose
 * Uses Google DNS (8.8.8.8) to bypass Windows DNS SRV resolution issues
 * common with MongoDB Atlas on local dev environments.
 */
const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS so Atlas SRV records resolve correctly on all networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
