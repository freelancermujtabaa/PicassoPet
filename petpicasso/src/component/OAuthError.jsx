import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuthError() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message') || 'oauth_failed';
    
    // Log the error
    console.error('OAuth error:', message);
    
    // Redirect to home page with error after 3 seconds
    const timer = setTimeout(() => {
      navigate('/?error=oauth_failed', { replace: true });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Authentication Failed
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was an error during Google authentication. You will be redirected to the login page.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    </div>
  );
}
