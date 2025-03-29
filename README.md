# WarrantyMe

WarrantyMe is a full-stack application designed to help users create, manage, and store professional warranty letters. The application integrates with Google Drive for cloud storage and Firebase for authentication.

## Features

### Frontend
- **User Authentication**: Google OAuth-based login using Firebase Authentication.
- **Dashboard**: Displays local drafts and Google Drive files with options to edit or delete.
- **Letter Editor**: Rich text editor powered by Tiptap for creating and editing warranty letters.
- **Draft Management**: Save letters locally or upload them to Google Drive.
- **Export Letters**: Export letters as HTML files for offline use.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS.

### Backend
- **RESTful API**: Backend API built with Express.js for managing letters and templates.
- **Google Drive Integration**: Upload, update, delete, and list files on Google Drive.
- **MongoDB Database**: Store user data, letters, and templates.
- **Authentication Middleware**: Secure API endpoints with JWT-based authentication.
- **Error Handling**: Centralized error handling for consistent API responses.

## Technology Stack

### Frontend
- **React**: Component-based UI development.
- **React Router**: Client-side routing for navigation.
- **Tiptap**: Rich text editor for letter creation.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Vite**: Fast development server and build tool.
- **Firebase**: Authentication and Firestore integration.

### Backend
- **Node.js**: JavaScript runtime for server-side development.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing user data and letters.
- **Mongoose**: ODM for MongoDB.
- **Google APIs**: Integration with Google Drive and Google Docs.
- **JWT**: Secure authentication using JSON Web Tokens.
- **Firebase Admin SDK**: Manage Firebase Authentication and Firestore.

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Firebase project with Google OAuth enabled
- Google Cloud project with Drive and Docs APIs enabled

### Backend
1. Navigate to the `backend` directory:
   ```sh
   cd backend

2. Install dependencies: 
```sh
  npm install

3. Create a .env file based on .env.example and fill in the required values.

4. Start the server: 
npm run dev


Usage
Open the frontend in your browser at http://localhost:5173.
Log in using your Google account.
Create, edit, and manage warranty letters from the dashboard.
Save letters locally or upload them to Google Drive.




warrantyme/ ├── backend/ │ ├── src/ │ │ ├── config/ │ │ ├── controllers/ │ │ ├── middleware/ │ │ ├── models/ │ │ ├── routes/ │ │ ├── utils/ │ │ └── index.js │ ├── .env.example │ ├── package.json │ └── README.md ├── frontend/ │ ├── src/ │ │ ├── components/ │ │ ├── firebase/ │ │ ├── services/ │ │ ├── App.jsx │ │ ├── main.jsx │ │ └── index.css │ ├── .env │ ├── package.json │ ├── vite.config.js │ └── README.md └── README.md




