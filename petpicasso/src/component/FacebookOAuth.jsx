import React from 'react';

export default function FacebookOAuth({ buttonText = "SIGN IN WITH FACEBOOK", className = "" }) {
  const handleFacebookSignIn = () => {
    const backendUrl = 'https://petpicassobackend.onrender.com' || 'http://localhost:5000';
    console.log('Facebook OAuth - Redirecting to:', `${backendUrl}/api/auth/facebook`);
    window.location.href = `${backendUrl}/api/auth/facebook`;
  };

  return (
    <button
      onClick={handleFacebookSignIn}
      className={`flex-1 flex items-center justify-center text-[12px] border py-2 px-2 rounded hover:bg-gray-100 transition-colors duration-200 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        className="mr-2"
      >
        <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      {buttonText}
    </button>
  );
}