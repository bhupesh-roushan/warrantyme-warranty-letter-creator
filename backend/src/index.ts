import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = require('../../serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to WarrantyMe API' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 