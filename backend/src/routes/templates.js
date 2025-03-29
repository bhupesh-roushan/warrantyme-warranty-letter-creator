import express from 'express';
import Template from '../models/Template.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all templates for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const templates = await Template.find({ userId: req.user.id })
      .sort({ updatedAt: -1 });
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single template
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new template
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, content, isDefault } = req.body;
    
    // If this is a default template, unset any existing default templates
    if (isDefault) {
      await Template.updateMany(
        { userId: req.user.id },
        { isDefault: false }
      );
    }
    
    const template = await Template.create({
      userId: req.user.id,
      name,
      content,
      isDefault
    });
    
    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a template
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, content, isDefault } = req.body;
    
    // If this is a default template, unset any existing default templates
    if (isDefault) {
      await Template.updateMany(
        { userId: req.user.id, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }
    
    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, content, isDefault },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 