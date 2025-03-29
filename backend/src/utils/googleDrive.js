import { google } from 'googleapis';
import serviceAccount from '../../../serviceAccountKey.json' assert { type: 'json' };

class GoogleDriveService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  async createDocument(title, content) {
    try {
      const doc = await this.drive.files.create({
        requestBody: {
          name: title,
          mimeType: 'application/vnd.google-apps.document',
        },
        media: {
          mimeType: 'text/plain',
          body: content,
        },
      });

      return doc.data;
    } catch (error) {
      console.error('Error creating Google Doc:', error);
      throw error;
    }
  }

  async shareDocument(fileId, email) {
    try {
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: email,
        },
      });
    } catch (error) {
      console.error('Error sharing Google Doc:', error);
      throw error;
    }
  }

  async deleteDocument(fileId) {
    try {
      await this.drive.files.delete({
        fileId,
      });
    } catch (error) {
      console.error('Error deleting Google Doc:', error);
      throw error;
    }
  }
}

export default new GoogleDriveService(); 