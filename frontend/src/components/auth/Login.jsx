import React, { useState } from 'react';
import { auth, googleProvider } from '../../firebase/config';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google login process...');
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (!credential) {
        throw new Error('No credential received from Google');
      }

      // Store the access token
      const accessToken = credential.accessToken;
      if (!accessToken) {
        throw new Error('No access token received from Google');
      }
      
      // Store both the access token and the user's email
      localStorage.setItem('googleAccessToken', accessToken);
      localStorage.setItem('googleUserEmail', result.user.email);
      
      console.log('Google login successful:', {
        email: result.user.email,
        hasAccessToken: !!accessToken,
        scopes: credential.scope,
        tokenLength: accessToken.length
      });
      
      // Wait a moment to ensure token is stored
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify token is stored
      const storedToken = localStorage.getItem('googleAccessToken');
      if (!storedToken) {
        throw new Error('Failed to store access token');
      }
      
      console.log('Token verification:', {
        stored: !!storedToken,
        length: storedToken.length
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8">
          {error && (
            <div className="text-red-600 text-sm text-center mb-4">{error}</div>
          )}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 