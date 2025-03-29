import googleDriveService from '../services/googleDriveService.js';

export const uploadFile = async (req, res) => {
  try {
    const { file } = req;
    const { name, mimeType } = req.body;

    const fileMetadata = {
      name: name || file.originalname,
      mimeType: mimeType || file.mimetype,
    };

    const media = {
      mimeType: file.mimetype,
      body: file.buffer,
    };

    const fileId = await googleDriveService.uploadFile(fileMetadata, media);
    res.json({ fileId });
  } catch (error) {
    console.error('Error in uploadFile controller:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

export const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const fileData = await googleDriveService.getFile(fileId);
    res.json(fileData);
  } catch (error) {
    console.error('Error in getFile controller:', error);
    res.status(500).json({ error: 'Failed to get file' });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    await googleDriveService.deleteFile(fileId);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error in deleteFile controller:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

export const listFiles = async (req, res) => {
  try {
    const { query } = req.query;
    const files = await googleDriveService.listFiles(query);
    res.json(files);
  } catch (error) {
    console.error('Error in listFiles controller:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
}; 