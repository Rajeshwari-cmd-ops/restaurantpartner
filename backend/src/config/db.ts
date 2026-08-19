import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/forge_india_connect';
    console.log(`[Database] Connecting to MongoDB: ${connStr.replace(/\/\/.*@/, '//***:***@')}`);
    
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
