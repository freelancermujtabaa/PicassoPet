import { ChevronDown, Menu, X, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/onlylogo.svg";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useAuth } from "../context/AuthContext.jsx";
import { logoutUser } from "../utils/api.js";

export default function NavigationHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const { isLoggedIn, currentUser, logout, login } = useAuth();




  

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout(); // Use context logout function
      setIsUserDropdownOpen(false);
      localStorage.removeItem("aiImageUrl");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  const toggleUserDropdown = (e) => {
    e.stopPropagation(); // Prevent this click from triggering the outside click handler
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  return (
    <header className="w-full relative bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center justify-center">
              <img
                src={logo}
                alt="Picasso Pet Logo"
                className="w-16 h-16 object-contain ml-8"
              />
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8 lg:mr-72">
            <Link to="/" className="text-gray-800 hover:text-orange-500 font-bold text-lg transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-800 hover:text-orange-500 font-bold text-lg transition-colors">
              About Us
            </Link>

            <Link to="/shop" className="text-gray-800 hover:text-orange-500 font-bold text-lg transition-colors">
              Shop
            </Link>
            <Link to="/faqs" className="text-gray-800 hover:text-orange-500 font-bold text-lg transition-colors">
              FAQs
            </Link>
            <Link to="/contactus" className="text-gray-800 hover:text-orange-500 font-bold text-lg transition-colors">
              Contact Us
            </Link>
          </nav>

          {/* Desktop User Section */}
          {isLoggedIn ? (
            <div className="hidden md:block relative user-dropdown">
              <button
                onClick={toggleUserDropdown}
                className="flex items-center space-x-2  hover:border-gray-300  py-2 rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-800 font-bold text-lg">
                  {currentUser?.firstName || 'User'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/*  User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser?.firstName} {currentUser?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                    </div>
                    {/* <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link> */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowSignup(true)}
              className="hidden md:block bg-[linear-gradient(to_right,_#F26F24_0%,_#D0596C_33%,_#B246A9_60%,_#9333EA_100%)] hover:bg-[linear-gradient(to_right,_#F26F24,_#D0596C,_#B246A9,_#9333EA)] text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Sign Up
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-gray-900 p-2"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg z-40">
            <nav className="px-4 py-4 space-y-4">
              <Link
                to="/"
                className="block text-gray-800 hover:text-orange-500 font-bold text-lg py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block text-gray-800 hover:text-orange-500 font-bold text-lg py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>

              <Link to="/shop"
                className="block text-gray-800 hover:text-orange-500 font-bold text-lg py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link to="/faqs"
                className="block text-gray-800 hover:text-orange-500 font-bold text-lg py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQs
              </Link>
              <Link to="/contactus"
                className="block text-gray-800 hover:text-orange-500 font-bold text-lg py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
              </Link>

              {/* Mobile User Section */}
              {isLoggedIn ? (
                <div className="border-t border-gray-200 pt-4 mt-4 user-dropdown">
                  <div className="px-2 py-2 mb-3">
                    <p className="text-sm font-medium text-gray-900">
                      Welcome, {currentUser?.firstName}!
                    </p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    className="block text-gray-700 hover:text-gray-900 font-medium py-2 transition-colors "
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-600 hover:text-red-700 font-medium py-2 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 mt-4"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowLogin(true);
                  }}
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Modals */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onLoginSuccess={(user) => {
            login(user); // Use context login function
          }}
        />
      )}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
          onSignupSuccess={(user) => {
            login(user); // Use context login function
          }}
        />
      )}

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Overlay for user dropdown */}
      {isUserDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserDropdownOpen(false)}
        />
      )}
    </header>
  );
}