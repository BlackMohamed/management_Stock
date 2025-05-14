// src/context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { User, AuthState } from '../types';

// Initial state for the authentication context
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// Define action types
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'REGISTER_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Create the context
const AuthContext = createContext<{
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role: 'admin' | 'gestionnaire') => Promise<void>;
  logout: () => void;
  clearError: () => void;
}>({
  state: initialState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
});

// Create a reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      try {
        // Set the auth token for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Decode the token to get user data
        const decoded = jwtDecode<{
          id: string;
          role: 'admin' | 'gestionnaire';
          iat: number;
          exp: number;
        }>(token);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          dispatch({ type: 'AUTH_ERROR', payload: 'Token has expired' });
          return;
        }
        
        // Create user object from decoded token
        const user: User = {
          id: decoded.id,
          name: '', // Backend doesn't provide name; set as empty or fetch from API if needed
          email: '', // Backend doesn't provide email; set as empty or fetch from API if needed
          role: decoded.role,
        };
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { token, user } 
        });
      } catch (err) {
        dispatch({ 
          type: 'AUTH_ERROR', 
          payload: 'Invalid token' 
        });
      }
    };
    
    loadUser();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post('http://localhost:5000/auth/login', {
        username,
        password,
      });
      
      const { token } = response.data;
      const decoded = jwtDecode<{
        id: string;
        role: 'admin' | 'gestionnaire';
      }>(token);
      
      const user: User = {
        id: decoded.id,
        name: '', // Backend doesn't provide name
        email: '', // Backend doesn't provide email
        role: decoded.role,
      };
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      });
    } catch (err: any) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.message || 'Login failed',
      });
    }
  };

  // Register function
  const register = async (username: string, password: string, role: 'admin' | 'gestionnaire') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post('http://localhost:5000/auth/register', {
        username,
        password,
        role,
      });
      
      // After successful registration, log the user in
      await login(username, password);
    } catch (err: any) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.message || 'Registration failed',
      });
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);