import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { sendPinVerificationEmail, sendPinResendEmail } from '../utils/emailService.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword
    });

    // Generate verification PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const pinExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    user.verificationPin = pin;
    user.pinExpiry = pinExpiry;
    user.pinAttempts = 0;
    user.isVerified = false;
    
    await user.save();

    // Send PIN via email asynchronously (non-blocking)
    sendPinVerificationEmail(email, pin, user.firstName)
      .then(emailResult => {
        if (!emailResult.success) {
          console.error('Failed to send email:', emailResult.error);
        } else {
          console.log('Email sent successfully for user:', email);
        }
      })
      .catch(error => {
        console.error('Email sending error:', error);
      });

    console.log(`Verification PIN for ${email}: ${pin}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification code.',
      data: {
        email: user.email,
        message: 'Verification PIN sent to your email'
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isPasswordCorrect = await user.correctPassword(password, user.password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        error: 'Please verify your account with the PIN sent to your email'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // In a real application, you might want to add the token to a blacklist
    // For now, we'll just return success and let the client remove the token
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user'
    });
  }
});

// @route   POST /api/auth/verify-pin
// @desc    Verify user's PIN and activate account
// @access  Public
router.post('/verify-pin', async (req, res) => {
  try {
    const { email, pin } = req.body;

    if (!email || !pin) {
      return res.status(400).json({
        success: false,
        error: 'Email and PIN are required'
      });
    }

    // Find user with PIN fields
    const user = await User.findOne({ email }).select('+verificationPin');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Account is already verified'
      });
    }

    // Check if PIN is expired
    if (user.pinExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'PIN has expired. Please request a new PIN.'
      });
    }

    // Check if too many attempts
    if (user.pinAttempts >= 3) {
      return res.status(400).json({
        success: false,
        error: 'Too many failed attempts. Please request a new PIN.'
      });
    }

    // Check if PIN matches
    if (user.verificationPin !== pin) {
      user.pinAttempts += 1;
      await user.save();
      
      return res.status(400).json({
        success: false,
        error: `Invalid PIN. ${3 - user.pinAttempts} attempts remaining.`
      });
    }

    // PIN is correct! Activate the user
    user.isVerified = true;
    user.verificationPin = undefined;
    user.pinExpiry = undefined;
    user.pinAttempts = 0;
    
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Account verified successfully',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('PIN verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during PIN verification'
    });
  }
});

// @route   POST /api/auth/resend-pin
// @desc    Resend verification PIN
// @access  Public
router.post('/resend-pin', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Account is already verified'
      });
    }

    // Generate new PIN
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    const newPinExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    user.verificationPin = newPin;
    user.pinExpiry = newPinExpiry;
    user.pinAttempts = 0;
    
    await user.save();

    // Send new PIN via email asynchronously (non-blocking)
    sendPinResendEmail(email, newPin, user.firstName)
      .then(emailResult => {
        if (!emailResult.success) {
          console.error('Failed to send resend email:', emailResult.error);
        } else {
          console.log('Resend email sent successfully for user:', email);
        }
      })
      .catch(error => {
        console.error('Resend email sending error:', error);
      });

    console.log(`New verification PIN for ${email}: ${newPin}`);

    res.json({
      success: true,
      message: 'New verification PIN sent to your email'
    });

  } catch (error) {
    console.error('Resend PIN error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while resending PIN'
    });
  }
});

// Google OAuth Routes
// @route   GET /api/auth/google
// @desc    Initiate Google OAuth login
// @access  Public
router.get('/google', (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.NODE_ENV === 'production' 
      ? 'https://petpicassobackend.onrender.com/api/auth/google/callback'
      : 'http://localhost:5000/api/auth/google/callback')}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid email profile')}` +
    `&access_type=offline` +
    `&prompt=consent`;

  console.log('🔍 Google OAuth URL:', googleAuthUrl);
  res.redirect(googleAuthUrl);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      console.error('No authorization code received');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=no_auth_code`);
    }

    console.log('🔍 Google OAuth callback - Authorization code received');

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.NODE_ENV === 'production' 
          ? 'https://petpicassobackend.onrender.com/api/auth/google/callback'
          : 'http://localhost:5000/api/auth/google/callback'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    console.log('🔍 Google OAuth - Access token received');

    // Get user profile using access token
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!profileResponse.ok) {
      console.error('Profile fetch failed');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=profile_fetch_failed`);
    }

    const profile = await profileResponse.json();
    console.log('🔍 Google OAuth - Profile received:', profile);

    // Check if user already exists
    let user = await User.findOne({ email: profile.email });
    
    if (user) {
      // User exists, update OAuth info if needed
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        firstName: profile.given_name || profile.name.split(' ')[0],
        lastName: profile.family_name || profile.name.split(' ').slice(1).join(' ') || '',
        email: profile.email,
        googleId: profile.id,
        isVerified: true, // Google users are pre-verified
        password: 'google-oauth-' + Math.random().toString(36).substr(2, 9) // Generate random password
      });
      
      await user.save();
      console.log('🔍 Google OAuth - New user created:', user.email);
    }

    // Generate JWT token
    const token = generateToken(user._id);
    console.log('🔍 Google OAuth - JWT token generated');

    // Redirect to frontend with success and token
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}`;
    console.log('🔍 Google OAuth - Redirecting to:', redirectUrl);
    
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=oauth_failed`);
  }
});


//Facebook OAuth Routes
// @route   GET /api/auth/facebook
// @desc    Initiate Facebook OAuth login
// @access  Public
router.get("/facebook", (req,res)=>{
  const facebookAuthUrl = `https://www.facebook.com/v12.0/dialog/oauth?` +
    `client_id=${process.env.FACEBOOK_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.NODE_ENV === 'production' 
      ? 'https://petpicassobackend.onrender.com/api/auth/facebook/callback'
      : 'http://localhost:5000/api/auth/facebook/callback')}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('email public_profile')}`+ 
    `&state=${Math.random().toString(36).substring(2,9)}`;

    console.log("🔍 Facebook OAuth URL:", facebookAuthUrl);
    res.redirect(facebookAuthUrl);
});

router.get("/facebook/callback", async (req,res)=>{
try{
  const {code, state} = req.query;
  if(!code){
    console.error("No authorization code received");
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=no_auth_code`);
  }
  console.log("🔍 Facebook OAuth callback - Authorization code received");

  //Exchange authorization code for access token
  const tokenResponse = await fetch("https://graph.facebook.com/v12.0/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.NODE_ENV === 'production' 
        ? 'https://petpicassobackend.onrender.com/api/auth/facebook/callback'
        : 'http://localhost:5000/api/auth/facebook/callback'
    })
  });

  if(!tokenResponse.ok){
    const errorText = await tokenResponse.text();
    console.error("Token exchange failed:", errorText);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=token_exchange_failed`);
  }
  const tokenData = await tokenResponse.json();
  console.log("🔍 Facebook OAuth - Access token received");

  //Get user profile using access token
  const profileResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture&access_token=${tokenData.access_token}`);

  if(!profileResponse.ok){
    console.error("Profile fetch failed");
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=profile_fetch_failed`);
}

const profile = await profileResponse.json();
console.log("🔍 Facebook OAuth - Profile received:", profile);

//Check if user already exists

let user= await User.findOne({email: profile.email});

if(user){
  //User exists, update OAuth info if needed
  if(!user.facebookId){
    user.facebookId = profile.id;
    await user.save();
  }
}else{
  //Create new user
  user = new User({
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    facebookId: profile.id,
    isVerified: true, //Facebook users are pre-verified
    password: 'facebook-oauth-' + Math.random().toString(36).substr(2,9), //Generate random password
    profilePicture: profile.picture?.data?.url || null
  });
  await user.save();
  console.log("🔍 Facebook OAuth - New user created:", user.email);
}

//Generate JWT token
const token = generateToken(user._id);
console.log("🔍 Facebook OAuth - JWT token generated");

//redirect to frontend with success and token
const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}`;
console.log("🔍 Facebook OAuth - Redirecting to:", redirectUrl);

res.redirect(redirectUrl);
}catch(error){
  console.error("Facebook OAuth callback error:", error);
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=oauth_failed`);
}

});

export default router;

