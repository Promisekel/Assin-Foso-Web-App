import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, handleApiError } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token and user on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          // Verify token is still valid by fetching profile
          const response = await authAPI.getProfile();
          if (response.data.success) {
            const userData = response.data.data;
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
      return { success: false, error: errorInfo.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        toast.success('Account created successfully! Please log in.');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
      return { success: false, error: errorInfo.message };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint (optional, for server-side cleanup)
      await authAPI.logout().catch(() => {
        // Ignore errors on logout endpoint
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
      // If profile refresh fails, might need to re-login
      const errorInfo = handleApiError(error);
      if (errorInfo.status === 401) {
        await logout();
      }
    }
  };

  // Helper functions for role checking
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isUser = () => {
    return user?.role === 'user';
  };

  const hasPermission = (permission) => {
    if (isAdmin()) {
      return true; // Admins have all permissions
    }
    
    // Add specific permission checks here if needed
    // For now, regular users have basic permissions
    const userPermissions = [
      'view_gallery',
      'view_projects',
      'view_calendar',
      'create_tasks',
      'update_own_tasks'
    ];
    
    return userPermissions.includes(permission);
  };

  const canUploadImages = () => {
    return isAdmin(); // Only admins can upload images
  };

  const canUploadDocuments = () => {
    return isAdmin(); // Only admins can upload documents
  };

  const canManageProjects = () => {
    return isAdmin(); // Only admins can create/edit/delete projects
  };

  const canManageUsers = () => {
    return isAdmin(); // Only admins can manage users
  };

  const canSendInvites = () => {
    return isAdmin(); // Only admins can send invites
  };

  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    refreshProfile,
    
    // Helper functions
    isAdmin,
    isUser,
    hasPermission,
    canUploadImages,
    canUploadDocuments,
    canManageProjects,
    canManageUsers,
    canSendInvites,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
