const API_BASE_URL = 'https://petpicassobackend.onrender.com/api';

// Helper function to get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Helper function to logout user
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        logoutUser();
        throw new Error('Authentication failed. Please login again.');
      }
      
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  // Login user
  login: async (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Signup user
  signup: async (userData) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Verify PIN
  verifyPin: async (email, pin) => {
    return apiCall('/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ email, pin }),
    });
  },

// Resend PIN
  resendPin: async (email) => {
    return apiCall('/auth/resend-pin', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Logout user
  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  // Get current user profile
  getProfile: async () => {
    return apiCall('/auth/me');
  },
};

// User API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return apiCall('/user/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiCall('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (passwordData) => {
    return apiCall('/user/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },

  // Deactivate account
  deactivateAccount: async () => {
    return apiCall('/user/account', {
      method: 'DELETE',
    });
  },
};

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.message.includes('Authentication failed')) {
    return 'Please login again.';
  }
  
  if (error.message.includes('Network error')) {
    return 'Network error. Please check your connection.';
  }
  
  return error.message || 'Something went wrong. Please try again.';
};

export const subscribeToNewsletter = async (email) => {
  return apiCall('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};
