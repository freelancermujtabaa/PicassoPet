import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: function() {
      // Phone is not required for OAuth users
      return !this.googleId && !this.facebookId;
    },
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Password is not required for OAuth users
      return !this.googleId && !this.facebookId;
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  confirmPassword: {
    type: String,
    required: function() {
      // Confirm password is not required for OAuth users
      return this.isNew && !this.googleId && !this.facebookId;
    },
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match'
    }
  },
  // OAuth fields
  googleId: {
    type: String,
    sparse: true
  },
  facebookId: {
    type: String,
    sparse: true
  },
  // PIN verification fields
  verificationPin: {
    type: String,
    select: false // Don't include PIN in queries by default
  },
  pinExpiry: {
    type: Date
  },
  pinAttempts: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: function() {
      // OAuth users are pre-verified
      return !!(this.googleId || this.facebookId);
    }
  },
  profilePicture: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    
    // Remove confirmPassword field
    this.confirmPassword = undefined;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to get user's full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Method to generate verification PIN
userSchema.methods.generateVerificationPin = function() {
  // Generate 4-digit PIN
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Set PIN expiry to 10 minutes from now
  const expiry = new Date(Date.now() + 10 * 60 * 1000);
  
  this.verificationPin = pin;
  this.pinExpiry = expiry;
  this.pinAttempts = 0;
  
  return pin;
};

// Method to verify PIN
userSchema.methods.verifyPin = function(inputPin) {
  // Check if PIN is expired
  if (this.pinExpiry < new Date()) {
    return { success: false, message: 'PIN has expired' };
  }
  
  // Check if too many attempts
  if (this.pinAttempts >= 3) {
    return { success: false, message: 'Too many attempts. Please request a new PIN.' };
  }
  
  // Increment attempts
  this.pinAttempts += 1;
  
  // Check if PIN matches
  if (this.verificationPin === inputPin) {
    this.isVerified = true;
    this.verificationPin = undefined;
    this.pinExpiry = undefined;
    this.pinAttempts = 0;
    return { success: true, message: 'PIN verified successfully' };
  }
  
  return { success: false, message: 'Invalid PIN' };
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

export default mongoose.model('User', userSchema);

