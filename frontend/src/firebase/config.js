import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Configure Google Auth Provider with minimal scopes
const googleProvider = new GoogleAuthProvider();

// Request minimal required scopes
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');  // For creating and managing files
googleProvider.addScope('https://www.googleapis.com/auth/drive.metadata');  // For deleting files

// Set additional parameters
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
});

export { auth, db, googleProvider };

export default app; 