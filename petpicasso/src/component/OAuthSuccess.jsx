import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authAPI } from '../utils/api.js';

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processOAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (token) {
        try {
          // Store the token
          localStorage.setItem('token', token);
          
          // Get user data from the token by calling the backend
          const userData = await authAPI.getProfile();
          
          if (userData.success) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(userData.data.user));
            
            // Update global auth state
            login(userData.data.user);
            
            console.log('OAuth successful, token and user data stored');
          } else {
            console.error('Failed to get user data:', userData.error);
          }
          
          // Redirect to home page
          navigate('/', { replace: true });
        } catch (error) {
          console.error('Error processing OAuth success:', error);
          navigate('/?error=oauth_processing_failed', { replace: true });
        }
      } else if (error) {
        console.error('OAuth error:', error);
        navigate('/?error=oauth_failed', { replace: true });
      } else {
        // No token or error, redirect to home page
        navigate('/', { replace: true });
      }
    };

    processOAuth();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Processing Login...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we complete your authentication.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
