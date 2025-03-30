import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Letter from './../models/letter.js';
import { google } from 'googleapis';

const router = express.Router();

// Get all letters for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const letters = await Letter.find({ userId: req.user.id })
      .sort({ updatedAt: -1 });
    res.json(letters);
  } catch (error) {
    console.error('Get letters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single letter
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }
    
    res.json(letter);
  } catch (error) {
    console.error('Get letter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new letter
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, isDraft } = req.body;
    
    const letter = await Letter.create({
      userId: req.user.id,
      title,
      content,
      isDraft
    });
    
    res.status(201).json(letter);
  } catch (error) {
    console.error('Create letter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a letter
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, isDraft } = req.body;
    
    const letter = await Letter.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, content, isDraft },
      { new: true }
    );
    
    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }
    
    res.json(letter);
  } catch (error) {
    console.error('Update letter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a letter
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const letter = await Letter.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }
    
    res.json({ message: 'Letter deleted successfully' });
  } catch (error) {
    console.error('Delete letter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save letter to Google Drive
router.post('/:id/save-to-drive', authenticateToken, async (req, res) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }
    
    // TODO: Implement Google Drive API integration
    // This will require setting up Google Drive API credentials and implementing the file upload
    
    res.json({ message: 'Letter saved to Google Drive' });
  } catch (error) {
    console.error('Save to Drive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 