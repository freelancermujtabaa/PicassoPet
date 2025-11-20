import React, { useState, useRef, useEffect } from "react";

export default function PinVerificationModal({ 
  onClose, 
  onVerify, 
  onResend, 
  email, 
  isLoading = false 
}) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handlePinChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    
    // Clear error when user types
    if (error) setError('');
    
    // Auto-focus next input if current input has value
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace - go to previous input if current is empty
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pinString = pin.join('');
    
    if (pinString.length !== 4) {
      setError('Please enter the complete 4-digit code');
      return;
    }
    
    onVerify(pinString);
  };

  const handleResend = () => {
    setPin(['', '', '', '']);
    setError('');
    onResend();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white p-8 rounded-lg relative z-10 max-w-md w-full shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-2">Verification Code</h2>
        <p className="text-center text-gray-600 mb-6">
          An Email Has Been Sent To You With A Verification Code
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* PIN Input Fields */}
          <div className="flex justify-center gap-3 mb-6">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                placeholder="-"
              />
            ))}
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={isLoading || pin.join('').length !== 4}
            className="w-full bg-gradient-to-r from-orange-400 to-purple-600 text-white py-3 rounded-lg hover:from-orange-500 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium mb-4"
          >
            {isLoading ? 'Verifying...' : 'Continue'}
          </button>

          {/* Resend Code Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Resend Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
