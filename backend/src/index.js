import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Import routes
import authRoutes from './routes/auth.js';
import letterRoutes from './routes/letters.js';
import templateRoutes from './routes/templates.js';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount)
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/templates', templateRoutes);
app.use('api/view',console.log("view"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Function to try starting the server on different ports
const startServer = async (initialPort) => {
  let port = initialPort;
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(port)
          .once('listening', () => {
            console.log(`Server running on port ${port}`);
            resolve();
          })
          .once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              console.log(`Port ${port} is busy, trying port ${port + 1}`);
              port++;
              server.close();
              reject(err);
            } else {
              reject(err);
            }
          });
      });
      // If we get here, the server started successfully
      break;
    } catch (err) {
      if (err.code !== 'EADDRINUSE' || attempts === maxAttempts - 1) {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
      attempts++;
    }
  }
};

// Start server with initial port from environment variable or default to 5000
startServer(parseInt(process.env.PORT) || 5001); 