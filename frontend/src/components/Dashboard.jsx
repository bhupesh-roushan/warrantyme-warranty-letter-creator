import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { googleDriveService } from '../services/googleDrive';

const Dashboard = () => {
  const [drafts, setDrafts] = useState([]);
  const [driveFiles, setDriveFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('drafts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load local drafts
      const savedDrafts = JSON.parse(localStorage.getItem('drafts') || '[]');
      setDrafts(savedDrafts);

      // Load Google Drive files
      const files = await googleDriveService.listFiles();
      setDriveFiles(files);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = (id) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== id);
    localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
    setMessage('Draft deleted successfully!');
    setMessageType('success');
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleDeleteDriveFile = async (fileId) => {
    try {
      await googleDriveService.deleteFile(fileId);
      setDriveFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      setMessage('File deleted from Google Drive successfully!');
      setMessageType('success');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting file:', error);
      setMessage('Failed to delete file from Google Drive');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    }
  };

  const handleEditDraft = (id) => {
    navigate(`/editor?id=${id}`);
  };

  const handleEditDriveFile = (fileId) => {
    navigate(`/editor?driveFile=${fileId}`);
  };

  const handleNewLetter = () => {
    navigate('/editor');
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      // Only clear Google-related items, keep the drafts
      localStorage.removeItem('googleAccessToken');
      localStorage.removeItem('googleUserEmail');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {message && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out ${
          messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleNewLetter}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
          >
            New Letter
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Letters</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{drafts.length + driveFiles.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Local Drafts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{drafts.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drive Files</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{driveFiles.length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4 sm:px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('drafts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'drafts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Local Drafts
              </button>
              <button
                onClick={() => setActiveTab('drive')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'drive'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Google Drive Files
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'drafts' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-md group"
                    onClick={() => handleEditDraft(draft.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{draft.title || 'Untitled'}</h3>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDraft(draft.id);
                          }}
                          className="p-1 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      
                      <p className="text-xs text-gray-500">
                        Last modified: {new Date(draft.lastModified).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-md group"
                    onClick={() => handleEditDriveFile(file.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDriveFile(file.id);
                          }}
                          className="p-1 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500">
                        Created: {new Date(file.createdTime).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last modified: {new Date(file.modifiedTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 