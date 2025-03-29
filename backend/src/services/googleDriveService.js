import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

class GoogleDriveService {
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  async uploadFile(fileMetadata, media) {
    try {
      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });
      return response.data.id;
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw error;
    }
  }

  async getFile(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });
      return response.data;
    } catch (error) {
      console.error('Error getting file from Google Drive:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId,
      });
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw error;
    }
  }

  async listFiles(query = '') {
    try {
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, createdTime)',
      });
      return response.data.files;
    } catch (error) {
      console.error('Error listing files from Google Drive:', error);
      throw error;
    }
  }
}

const googleDriveService = new GoogleDriveService();
export default googleDriveService; 