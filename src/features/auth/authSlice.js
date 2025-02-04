import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import { jwtDecode } from 'jwt-decode';

// Helper function to get user from token and API response
const processUserData = (token, apiUser = null) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // Combine decoded token data with API user data
    return {
      _id: apiUser?._id || decoded.id || decoded.sub,
      name: apiUser?.name || decoded.name,
      email: apiUser?.email || decoded.email,
      role: apiUser?.role || decoded.role
    };
  } catch (error) {
    console.error('Failed to process user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

// Get initial state from localStorage
const token = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');
let user = null;

try {
  user = storedUser ? JSON.parse(storedUser) : processUserData(token);
} catch (error) {
  console.error('Failed to parse stored user:', error);
  localStorage.removeItem('user');
}

const initialState = {
  user,
  token,
  isAuthenticated: !!(token && user?._id),
  isLoading: false,
  error: null
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      if (!token || !user) {
        return rejectWithValue('Invalid response from server');
      }

      return { token, user };
    } catch (error) {
      console.error('Login thunk error:', error);
      return rejectWithValue(
        error.message || 'Failed to login. Please check your credentials.'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: apiUser } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      const processedUser = processUserData(token, apiUser);
      
      if (!processedUser?._id) {
        throw new Error('Invalid user data received');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(processedUser));
      
      return { token, user: processedUser };
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload || 'Failed to login';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Actions
export const { clearError, logout, updateUser } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectIsLoading = (state) => state.auth.isLoading;

export default authSlice.reducer;
