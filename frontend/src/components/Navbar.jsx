import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config.js';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                WarrantyMe
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-letter"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Create Letter
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="ml-2 text-sm text-gray-700">{user.displayName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 