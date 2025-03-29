import express from 'express';
import { getAuth } from 'firebase-admin/auth';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Login with Google
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify the Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Check if user exists in our database
    let user = await User.findOne({ uid: decodedToken.uid });
    
    if (!user) {
      // Create new user if they don't exist
      user = await User.create({
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await User.findOne({ uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 