import Letter from '././../models/letter.js';
import googleDrive from '../utils/googleDrive.js';

class LetterController {
  static async createLetter(req, res, next) {
    try {
      const { title, content } = req.body;
      const userId = req.user.uid;

      // Create Google Doc
      const doc = await googleDrive.createDocument(title, content);

      // Share document with user
      await googleDrive.shareDocument(doc.id, req.user.email);

      // Save to MongoDB
      const letter = await Letter.create({
        userId,
        title,
        content,
        googleDocId: doc.id,
      });

      res.status(201).json({
        ...letter.toObject(),
        webViewLink: doc.webViewLink,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLetters(req, res, next) {
    try {
      const userId = req.user.uid;
      const letters = await Letter.find({ userId }).sort({ createdAt: -1 });
      res.json(letters);
    } catch (error) {
      next(error);
    }
  }

  static async getLetter(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.uid;
      const letter = await Letter.findOne({ _id: id, userId });

      if (!letter) {
        const error = new Error('Letter not found');
        error.type = 'validation';
        throw error;
      }

      res.json(letter);
    } catch (error) {
      next(error);
    }
  }

  static async updateLetter(req, res, next) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.user.uid;

      const letter = await Letter.findOneAndUpdate(
        { _id: id, userId },
        { title, content },
        { new: true }
      );

      if (!letter) {
        const error = new Error('Letter not found');
        error.type = 'validation';
        throw error;
      }

      res.json(letter);
    } catch (error) {
      next(error);
    }
  }

  static async deleteLetter(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      const letter = await Letter.findOneAndDelete({ _id: id, userId });

      if (!letter) {
        const error = new Error('Letter not found');
        error.type = 'validation';
        throw error;
      }

      // Delete from Google Drive
      await googleDrive.deleteDocument(letter.googleDocId);

      res.json({ message: 'Letter deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default LetterController; 