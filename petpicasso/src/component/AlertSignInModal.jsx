import React from "react";

export default function AlertSignInModal({ onClose, onSignIn }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full text-center">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Alert
        </h2>
        <p className="text-gray-600 mb-6">
          You need to Sign in first to create Pet Art.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onSignIn}
            className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:via-pink-600 hover:to-purple-700"
          >
            Sign In
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
