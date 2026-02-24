/**
 * MongoDB connection configuration using Mongoose
 * Serverless-friendly: avoids process.exit() and manual DNS overrides that can break in cloud envs.
 */
const mongoose = require('mongoose');

// Cache the connection to prevent multiple connections in serverless environment
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI is missing from environment variables');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        isConnected = conn.connections[0].readyState;
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        // In serverless, we throw the error rather than process.exit
        throw error;
    }
};

module.exports = connectDB;
