import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { auth } from '../firebase/config.js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleDriveService } from '../services/googleDrive.js';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Bold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Italic"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-3.646 5.354a.5.5 0 10.707.707l3-3a.5.5 0 00-.707-.707l-3 3z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Bullet List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 4a1 1 0 011-1h10a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Numbered List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 4a1 1 0 011-1h10a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        title="Heading 2"
      >
        H2
      </button>
    </div>
  );
};

const LetterEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [title, setTitle] = useState('');
  const [draftId, setDraftId] = useState(null);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [driveFileId, setDriveFileId] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Dear Sir/Madam,\n\nI am writing regarding the warranty for [Product Name] that I purchased on [Date]...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[600px] p-6',
      },
    },
  });

  // Load draft from localStorage on component mount
  useEffect(() => {
    const draftId = searchParams.get('id');
    const driveFileId = searchParams.get('driveFile');

    if (draftId) {
      const savedDrafts = localStorage.getItem('drafts');
      if (savedDrafts) {
        const drafts = JSON.parse(savedDrafts);
        const draft = drafts.find(d => d.id === draftId);
        if (draft) {
          editor?.commands.setContent(draft.content);
          setTitle(draft.title || '');
          setDraftId(draft.id);
        }
      }
    } else if (driveFileId) {
      const loadDriveFile = async () => {
        try {
          const { content, title: fileTitle } = await googleDriveService.getFileContent(driveFileId);
          if (content) {
            editor?.commands.setContent(content);
            setTitle(fileTitle || '');
            setDriveFileId(driveFileId);
          } else {
            setMessage('No content found in the file');
            setMessageType('error');
            setTimeout(() => {
              setMessage('');
              setMessageType('');
            }, 3000);
          }
        } catch (error) {
          console.error('Error loading drive file:', error);
          setMessage('Failed to load Google Drive file');
          setMessageType('error');
          setTimeout(() => {
            setMessage('');
            setMessageType('');
          }, 3000);
        }
      };
      loadDriveFile();
    }
  }, [editor, searchParams]);

  const handleSaveDraft = () => {
    try {
      const existingDrafts = JSON.parse(localStorage.getItem('drafts') || '[]');
      const currentDraft = {
        id: draftId || Date.now().toString(),
        title: title || 'Untitled',
        content: editor.getHTML(),
        lastModified: new Date().toISOString()
      };

      // If editing an existing draft, update it
      if (draftId) {
        const updatedDrafts = existingDrafts.map(draft => 
          draft.id === draftId ? currentDraft : draft
        );
        localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
      } else {
        // If creating a new draft, add it to the list
        localStorage.setItem('drafts', JSON.stringify([...existingDrafts, currentDraft]));
      }

      setMessage('Draft saved successfully!');
      setMessageType('success');
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error saving draft:', error);
      setMessage('Error saving draft. Please try again.');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    }
  };

  const handleSaveToDrive = async () => {
    if (!editor) return;
    
    setIsSavingToDrive(true);
    try {
      const content = editor.getHTML();
      if (driveFileId) {
        // Update existing file
        await googleDriveService.updateFile(driveFileId, content, title);
        setMessage('Successfully updated in Google Drive!');
      } else {
        // Create new file
        await googleDriveService.saveToDrive(content, title);
        setMessage('Successfully saved to Google Drive!');
      }
      setMessageType('success');
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      setMessage('Failed to save to Google Drive. Please try again.');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const handleExport = () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    const formattedContent = `
      <html>
        <head>
          <title>${title || 'Warranty Letter'}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .content { 
              font-size: 14px;
            }
            .date {
              text-align: right;
              color: #666;
              margin-bottom: 20px;
            }
            .signature {
              margin-top: 40px;
            }
            h1 { font-size: 24px; margin-bottom: 20px; }
            h2 { font-size: 20px; margin-bottom: 16px; }
            ul, ol { padding-left: 20px; }
            li { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="date">${new Date().toLocaleDateString()}</div>
          ${title ? `<h1>${title}</h1>` : ''}
          <div class="content">${content}</div>
          <div class="signature">
            <p>Sincerely,</p>
            <p>${auth.currentUser?.displayName || 'Your Name'}</p>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([formattedContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'warranty-letter'}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      {message && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out ${
          messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter letter title..."
            className="w-full text-2xl font-bold border-none focus:outline-none focus:ring-0 mb-4 transition-all duration-200"
          />
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSaveToDrive}
              disabled={isSavingToDrive}
              className="w-full sm:w-auto px-6 py-2.5 text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center transition-all duration-200 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSavingToDrive ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h-2v5.586l-1.293-1.293z" />
                  </svg>
                  Save to Drive
                </>
              )}
            </button>
            <button
              onClick={handleExport}
              className="w-full sm:w-auto px-6 py-2.5 text-sm text-blue-600 hover:text-blue-800 transition-all duration-200 hover:bg-blue-50 rounded-lg shadow-sm hover:shadow-md"
            >
              Export
            </button>
          </div>
        </div>
        
        <MenuBar editor={editor} />
        
        <div className="relative">
          <EditorContent editor={editor} />
          {saveStatus && (
            <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm shadow-md transform transition-all duration-300">
              {saveStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LetterEditor; 