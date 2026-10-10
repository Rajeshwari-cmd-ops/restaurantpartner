import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fallback if setServers fails
}

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/forge_india_connect';
    const maskedUri = connStr.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
    console.log(`[Database] Connecting to MongoDB: ${maskedUri}`);
    
    mongoose.set('strictQuery', false);
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`[Database] MongoDB Connected Successfully: ${mongoose.connection.host}`);
  } catch (error: any) {
    console.warn(`[Database Warning] Mongoose Atlas Connection Notice: ${error.message}`);
    console.log(`[Database] Operating in Standalone / In-Memory Seed Fallback Mode.`);
  }
};
