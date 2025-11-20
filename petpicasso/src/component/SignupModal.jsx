import React, { useState } from "react";
import { authAPI } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import PinVerificationModal from "./PinVerificationModal.jsx";
import GoogleOAuth from "./GoogleOAuth.jsx";
import FacebookOAuth from "./FacebookOAuth.jsx";

export default function SignupModal({ onClose, onSwitchToLogin, onSignupSuccess }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const data = await authAPI.signup(formData);

      if (data.success) {
        // Store email for PIN verification
        setUserEmail(formData.email);
        
        // Show PIN verification modal
        setShowPinVerification(true);
        
        // Clear form data
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinVerification = async (pin) => {
    setIsLoading(true);
    try {
      const data = await authAPI.verifyPin(userEmail, pin);
      if (data.success) {
        // Store token and user data in localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Update global auth state
        login(data.data.user);
        
        // Call the callback to update navbar state
        if (onSignupSuccess) {
          onSignupSuccess(data.data.user);
        }
        
        // Close modal
        setShowPinVerification(false);
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
    try {
      const data = await authAPI.resendPin(userEmail);
      if (data.success) {
        setError('PIN resent. Please check your email.');
      } else {
        setError(data.error || 'Failed to resend PIN');
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
      <div className="bg-white p-8 rounded-lg relative z-10 max-w-lg w-full shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-center mb-1">Sign Up</h2>
        <p className="text-center text-sm text-gray-500 mb-4">
          Fill Out This Form To Sign Up
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="grid grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2">First Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="firstName"  
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter First Name"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2">Last Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter Last Name"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2">Email Address<span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2">Phone Number<span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 ************"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2">Password<span className="text-red-500">*</span></label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="****************"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2">Confirm Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="****************"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-400 to-purple-600 text-white py-2 rounded hover:from-orange-500 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Creating Account...' : 'Register Now'}
            </button>
          </div>
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
            onSuccess={onSignupSuccess}
            onError={(error) => setError(error)}
            buttonText="SIGN UP WITH GOOGLE"
            className="flex-1"
          />

          {/* Facebook OAuth Button */}
          <FacebookOAuth
            onSuccess={onSignupSuccess}
            onError={(error) => setError(error)}
            buttonText="SIGN UP WITH FACEBOOK"
            className="flex-1"
          />
        </div>

        

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-purple-600 font-medium hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>

      {/* PIN Verification Modal */}
      {showPinVerification && (
        <PinVerificationModal
          onClose={() => setShowPinVerification(false)}
          onVerify={handlePinVerification}
          onResend={handleResendPin}
          email={userEmail}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
