import mongoose from 'mongoose';

const letterSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isDraft: {
    type: Boolean,
    default: true
  },
  googleDriveFileId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Letter', letterSchema); 