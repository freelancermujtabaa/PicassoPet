import React, { useState } from "react";
import { authAPI } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import PinVerificationModal from "./PinVerificationModal.jsx";
import GoogleOAuth from "./GoogleOAuth.jsx";
import FacebookOAuth from "./FacebookOAuth.jsx";

export default function LoginModal({ onClose, onSwitchToSignup, onLoginSuccess }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await authAPI.login(formData);

      if (data.success) {
        // Store token and user data in localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Update global auth state
        login(data.data.user);
        
        // Call the callback to update navbar state
        if (onLoginSuccess) {
          onLoginSuccess(data.data.user);
        }
        
        // Close modal
        onClose();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      // Check if error is due to unverified account
      if (err.message.includes('verify your account')) {
        setUnverifiedEmail(formData.email);
        setShowPinVerification(true);
        setError('');
      } else {
        setError(err.message || 'Network error. Please try again.');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinVerification = async (pin) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await authAPI.verifyPin(unverifiedEmail, pin);
      if (data.success) {
        // Store token and user data in localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Update global auth state
        login(data.data.user);
        
        // Call the callback to update navbar state
        if (onLoginSuccess) {
          onLoginSuccess(data.data.user);
        }
        
        // Close modal
        onClose();
      } else {
        setError(data.error || 'PIN verification failed');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      console.error('PIN verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendPin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await authAPI.resendPin(unverifiedEmail);
      if (data.success) {
        setError('PIN resent to your email. Please check your inbox.');
      } else {
        setError(data.error || 'Failed to resend PIN.');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      console.error('Resend PIN error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white p-8 rounded-lg relative z-10 max-w-md w-full shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-center mb-4">Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium">Email Address*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password*</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-400 to-purple-600 text-white py-2 rounded hover:from-orange-500 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? 'Logging in...' : 'Login Now'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Social Login Buttons - Side by Side */}
        <div className="flex gap-3">
          {/* Google OAuth Button */}
          <GoogleOAuth
            onSuccess={onLoginSuccess}
            onError={(error) => setError(error)}
            buttonText="SIGN IN WITH GOOGLE"
            className="flex-1"
          />

          {/* Facebook OAuth Button */}
          <FacebookOAuth
            onSuccess={onLoginSuccess}
            onError={(error) => setError(error)}
            buttonText="SIGN IN WITH FACEBOOK"
            className="flex-1"
          />
        </div>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-purple-600 font-medium hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>

      {/* PIN Verification Modal */}
      {showPinVerification && (
        <PinVerificationModal
          onClose={() => setShowPinVerification(false)}
          onVerify={handlePinVerification}
          onResend={handleResendPin}
          email={unverifiedEmail}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
