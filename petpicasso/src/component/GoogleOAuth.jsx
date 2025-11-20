import React from 'react';

export default function GoogleOAuth({ buttonText = "SIGN IN WITH GOOGLE", className = "" }) {
  const handleGoogleSignIn = () => {
    const backendUrl = 'https://petpicassobackend.onrender.com' || 'http://localhost:5000';
    console.log('Google OAuth - Redirecting to:', `${backendUrl}/api/auth/google`);
    window.location.href = `${backendUrl}/api/auth/google`;
  };
  

  return (
    <button
      onClick={handleGoogleSignIn}
      className={`flex-1 flex items-center justify-center text-[12px] border py-2 px-2 rounded hover:bg-gray-100 transition-colors duration-200 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        className="mr-2"
      >
        <path fill="#EA4335" d="M12 10.2v3.6h5.09c-.22 1.17-.88 2.17-1.88 2.84l3.04 2.36c1.78-1.64 2.81-4.05 2.81-6.9 0-.66-.06-1.29-.18-1.9H12z"/>
        <path fill="#34A853" d="M6.54 13.27l-.82.63-2.5 1.94C4.91 19.41 8.23 21.5 12 21.5c2.43 0 4.46-.8 5.94-2.17l-3.04-2.36c-.83.56-1.88.9-2.9.9-2.23 0-4.12-1.5-4.79-3.54z"/>
        <path fill="#4A90E2" d="M3.22 7.68A9.44 9.44 0 0 0 2 12c0 1.64.4 3.18 1.11 4.52l3.43-2.69a5.46 5.46 0 0 1 0-3.66L3.22 7.68z"/>
        <path fill="#FBBC05" d="M12 5.5c1.32 0 2.51.45 3.44 1.33l2.58-2.58C16.46 2.72 14.43 2 12 2 8.23 2 4.91 4.09 3.22 7.68l3.43 2.69C7.88 7 9.77 5.5 12 5.5z"/>
      </svg>
      {buttonText}
    </button>
  );
}
