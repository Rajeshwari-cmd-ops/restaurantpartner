import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { corsOptions, getAllowedOrigins } from './config/corsConfig';
import { initSocketServer } from './socket/socketServer';
import { seedDatabase } from './seed/seedData';
import apiRoutes from './routes/apiRoutes';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Apply Express CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

// API Router
app.use('/api/v1', apiRoutes);

// Base Endpoint
app.get('/', (_req, res) => {
  res.send('Forge India Connect REST API & Socket.IO Engine is running. Access endpoints at /api/v1/*');
});

// Initialize Socket.IO
initSocketServer(httpServer);

// Start Server and Database Connection
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  httpServer.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(` 🚀 Forge India Connect Backend REST & WebSocket Engine Running`);
    console.log(` 📍 API Base URL : http://localhost:${PORT}/api/v1`);
    console.log(` 🔌 Socket.IO   : http://localhost:${PORT}`);
    console.log(` 🌐 Allowed CORS: ${getAllowedOrigins().join(', ')}`);
    console.log(`=============================================================\n`);
  });
};

startServer();
