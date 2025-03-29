import { auth } from '../firebase/config';

const GOOGLE_DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const GOOGLE_DOCS_API_URL = 'https://docs.googleapis.com/v1';

// App-specific metadata key to identify our files
const APP_METADATA_KEY = 'warrantyMeApp';

class GoogleDriveService {
  constructor() {
    this.accessToken = null;
    this.userEmail = null;
  }

  async initialize() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the access token from localStorage
    this.accessToken = localStorage.getItem('googleAccessToken');
    this.userEmail = localStorage.getItem('googleUserEmail');

    // Validate token and user
    if (!this.accessToken || !this.userEmail || this.userEmail !== user.email) {
      console.log('Token validation failed:', {
        hasToken: !!this.accessToken,
        storedEmail: this.userEmail,
        currentEmail: user.email
      });
      throw new Error('Invalid or expired Google access token. Please sign in again.');
    }
  }

  checkApiError(errorData) {
    if (errorData.error?.message?.includes('API has not been used') || 
        errorData.error?.message?.includes('it is disabled')) {
      const apiName = errorData.error.message.includes('drive.googleapis.com') ? 'Drive' : 'Docs';
      throw new Error(
        `Google ${apiName} API is not enabled. Please enable both APIs in the Google Cloud Console and wait a few minutes.\n\n` +
        '1. Enable Google Drive API:\n' +
        'https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=996261202782\n\n' +
        '2. Enable Google Docs API:\n' +
        'https://console.developers.google.com/apis/api/docs.googleapis.com/overview?project=996261202782\n\n' +
        'After enabling both APIs, wait 2-3 minutes for the changes to propagate.'
      );
    }
    throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
  }

  async deleteFile(fileId) {
    if (!this.accessToken) {
      await this.initialize();
    }

    try {
      // First verify this is our file and belongs to the current user
      const verifyResponse = await fetch(
        `${GOOGLE_DRIVE_API_URL}/files/${fileId}?fields=appProperties`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        console.error('Google Drive API Error:', errorData);
        this.checkApiError(errorData);
      }

      const fileData = await verifyResponse.json();
      
      // Check if this is our file and belongs to the current user
      if (!fileData.appProperties?.[APP_METADATA_KEY]) {
        throw new Error('Unauthorized access: This file was not created by WarrantyMe');
      }

      if (fileData.appProperties?.createdBy !== this.userEmail) {
        throw new Error('Unauthorized access: You do not have permission to delete this file');
      }

      // Delete the file
      const deleteResponse = await fetch(`${GOOGLE_DRIVE_API_URL}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        console.error('Google Drive API Error:', errorData);
        this.checkApiError(errorData);
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async saveToDrive(content, title) {
    if (!this.accessToken) {
      await this.initialize();
    }

    try {
      // Create a new Google Doc
      const docResponse = await fetch(`${GOOGLE_DOCS_API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || 'Warranty Letter',
        }),
      });

      if (!docResponse.ok) {
        const errorData = await docResponse.json();
        console.error('Google Drive API Error:', errorData);
        this.checkApiError(errorData);
      }

      const doc = await docResponse.json();

      // Update the document content
      const updateResponse = await fetch(`${GOOGLE_DOCS_API_URL}/documents/${doc.documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: {
                  index: 1,
                },
                text: content,
              },
            },
          ],
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Google Drive API Error:', errorData);
        this.checkApiError(errorData);
      }

      // Add app-specific metadata to the file
      const metadataResponse = await fetch(`${GOOGLE_DRIVE_API_URL}/files/${doc.documentId}?fields=id`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appProperties: {
            [APP_METADATA_KEY]: 'true',
            createdBy: this.userEmail,
            createdAt: new Date().toISOString(),
            userId: auth.currentUser.uid, // Add Firebase UID for additional security
          }
        }),
      });

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json();
        console.error('Google Drive API Error:', errorData);
        this.checkApiError(errorData);
      }

      // Get the file metadata to include the web view link
      const fileResponse = await fetch(`${GOOGLE_DRIVE_API_URL}/files/${doc.documentId}?fields=webViewLink`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!fileResponse.ok) {
        const errorData = await fileResponse.json();
        console.error('Google Drive API Error:', errorData);
        this.checkApiError(errorData);
      }

      const fileData = await fileResponse.json();

      return {
        ...doc,
        webViewLink: fileData.webViewLink
      };
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      throw error;
    }
  }

  async listFiles() {
    if (!this.accessToken) {
      await this.initialize();
    }

    try {
      // Only fetch files created by our app AND the current user
      const response = await fetch(
        `${GOOGLE_DRIVE_API_URL}/files?q=mimeType='application/vnd.google-apps.document' and appProperties has { key='${APP_METADATA_KEY}' and value='true' } and appProperties has { key='createdBy' and value='${this.userEmail}' }&fields=files(id,name,modifiedTime,webViewLink,appProperties)`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Drive API Error:', errorData);
        this.checkApiError(errorData);
      }

      const data = await response.json();
      return data.files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  async getFileContent(fileId) {
    if (!this.accessToken) {
      await this.initialize();
    }

    try {
      // First verify this is our file and belongs to the current user
      const verifyResponse = await fetch(
        `${GOOGLE_DRIVE_API_URL}/files/${fileId}?fields=appProperties,name`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        console.error('Google Drive API Error:', errorData);
        this.checkApiError(errorData);
      }

      const fileData = await verifyResponse.json();
      
      // Check if this is our file and belongs to the current user
      if (!fileData.appProperties?.[APP_METADATA_KEY]) {
        throw new Error('Unauthorized access: This file was not created by WarrantyMe');
      }

      if (fileData.appProperties?.createdBy !== this.userEmail) {
        throw new Error('Unauthorized access: You do not have permission to access this file');
      }

      // Get the document content
      const response = await fetch(`${GOOGLE_DOCS_API_URL}/documents/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Drive API Error:', errorData);
        this.checkApiError(errorData);
      }

      const data = await response.json();
      
      // Extract content from the document
      let content = '';
      if (data.body && data.body.content) {
        content = data.body.content
          .map(item => {
            if (item.paragraph) {
              return item.paragraph.elements
                .map(element => {
                  if (element.textRun) {
                    return element.textRun.content;
                  }
                  return '';
                })
                .join('');
            }
            return '';
          })
          .join('\n');
      }

      return {
        content,
        title: fileData.name
      };
    } catch (error) {
      console.error('Error getting file content:', error);
      throw error;
    }
  }

  async updateFile(fileId, content, title) {
    if (!this.accessToken) {
      await this.initialize();
    }

    try {
      // First verify this is our file and belongs to the current user
      const verifyResponse = await fetch(
        `${GOOGLE_DRIVE_API_URL}/files/${fileId}?fields=appProperties`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        console.error('Google Drive API Error:', errorData);
        this.checkApiError(errorData);
      }

      const fileData = await verifyResponse.json();
      
      // Check if this is our file and belongs to the current user
      if (!fileData.appProperties?.[APP_METADATA_KEY]) {
        throw new Error('Unauthorized access: This file was not created by WarrantyMe');
      }

      if (fileData.appProperties?.createdBy !== this.userEmail) {
        throw new Error('Unauthorized access: You do not have permission to edit this file');
      }

      // Update the document title if provided
      if (title) {
        const titleResponse = await fetch(`${GOOGLE_DRIVE_API_URL}/files/${fileId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: title,
          }),
        });

        if (!titleResponse.ok) {
          const errorData = await titleResponse.json();
          console.error('Google Drive API Error:', errorData);
          this.checkApiError(errorData);
        }
      }

      // Update the document content
      const updateResponse = await fetch(`${GOOGLE_DOCS_API_URL}/documents/${fileId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              replaceAllText: {
                containsText: {
                  text: '.*',
                  matchCase: true,
                },
                replaceText: content,
              },
            },
          ],
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Google Drive API Error:', errorData);
        this.checkApiError(errorData);
      }

      return true;
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  }
}

export const googleDriveService = new GoogleDriveService(); 