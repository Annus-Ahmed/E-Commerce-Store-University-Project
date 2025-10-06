import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set up axios defaults - Update the URL to match your backend server
    axios.defaults.baseURL = 'http://localhost:5001';
    axios.defaults.withCredentials = true; // Changed to true for CORS with credentials
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    // Add request interceptor to automatically include the Authorization header
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Use useCallback to prevent recreation of these functions on every render
    const fetchUserProfile = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token available');
            }
            
            // Authorization is now handled by the interceptor
            const response = await axios.get('/api/users/profile');
            
            const userData = response.data;
            
            // Ensure role is properly set
            if (!userData.role) {
                // Try to get role from localStorage first
                const storedRole = localStorage.getItem('userRole');
                if (storedRole && ['user', 'admin', 'seller', 'buyer'].includes(storedRole)) {
                    userData.role = storedRole;
                } else {
                    // Default to user if no role is found
                    userData.role = 'user';
                }
            }
            
            // Always update localStorage with the current role from the server
            localStorage.setItem('userRole', userData.role);
            
            setUser(userData);
            setLoading(false);
            return userData;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
            throw error;
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, [fetchUserProfile]);

    const login = useCallback(async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            
            // Special case for admin
            if (email === 'admin@example.com') {
                // Try the admin login endpoint first
                try {
                    const adminResponse = await axios.post('/api/auth/admin-login', {
                        email,
                        password
                    });
                    
                    const { token, user } = adminResponse.data;
                    user.role = 'admin';
                    
                    localStorage.setItem('token', token);
                    localStorage.setItem('userRole', 'admin');
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    setUser(user);
                    setLoading(false);
                    return user;
                } catch (adminError) {
                    console.error('Admin login failed:', adminError);
                    // Continue with regular login if admin login fails
                }
            }
            
            const response = await axios.post('/api/auth/login', {
                email,
                password
            });
            
            // Check if we got a valid response
            if (!response.data || !response.data.token) {
                throw new Error('Invalid response from server');
            }
            
            const { token, user } = response.data;
            
            // Force admin role for admin email
            if (email === 'admin@example.com') {
                user.role = 'admin';
            }
            
            if (!user || !user.role) {
                if (user && !user.role) {
                    user.role = 'user';
                }
            }
            
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', user.role); // Store role separately for redundancy
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            setLoading(false);
            return user;
        } catch (error) {
            setLoading(false);
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
            setError(errorMessage);
            console.error('Login error:', error);
            throw error;
        }
    }, []);

    const register = useCallback(async (userData) => {
        try {
            setError(null);
            setLoading(true);
            
            // Make sure we're sending the correct fields to the backend
            const sanitizedData = {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                phone: userData.phone || '',
                address: userData.address || {}
            };
            
            // Check for network connectivity first
            try {
                await axios.get('/api/auth/ping');
            } catch (networkError) {
                if (!networkError.response) {
                    setError('Unable to connect to the server. Please check your internet connection or try again later.');
                    setLoading(false);
                    throw new Error('Network Error - Cannot connect to server');
                }
            }
            
            // Proceed with registration if network is working
            const response = await axios.post('/api/auth/register', sanitizedData);
            
            if (!response.data || !response.data.token || !response.data.user) {
                throw new Error('Invalid response from server during registration');
            }
            
            const { token, user } = response.data;
            
            // Make sure the user object has a role
            if (!user.role) {
                user.role = 'user';
            }
            
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', user.role); // Store role separately for redundancy
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            setLoading(false);
            return user;
        } catch (error) {
            setLoading(false);
            // Handle specific errors
            if (error.response) {
                // The request was made and the server responded with a status code
                const errorMessage = error.response.data?.message || 'Registration failed';
                
                if (error.response.status === 400) {
                    // Client error - likely validation issue
                    setError(`Registration failed: ${errorMessage}`);
                } else if (error.response.status === 500) {
                    // Server error - likely database connection issue
                    setError('Server error: The database might be unavailable. Please try again later.');
                } else {
                    setError(`Registration failed: ${errorMessage}`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                setError('No response from server. Please check your internet connection and try again.');
            } else {
                // Something happened in setting up the request
                setError('Registration failed due to a client error. Please try again.');
            }
            
            console.error('Registration error:', error);
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    }, []);

    const updateProfile = useCallback(async (profileData) => {
        try {
            setError(null);
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await axios.patch('/api/users/profile', profileData);
            
            if (!response.data) {
                throw new Error('Invalid response from server during profile update');
            }
            
            // If the profileData contains a role update, update the stored userRole in localStorage
            if (profileData.role) {
                localStorage.setItem('userRole', profileData.role);
            }
            
            // Merge the updated profile data with the current user data
            const updatedUser = { ...user, ...response.data };
            setUser(updatedUser);
            
            return updatedUser;
        } catch (error) {
            setError(error.response?.data?.message || 'Profile update failed');
            throw error;
        }
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                register,
                logout,
                updateProfile,
                fetchUserProfile,
                setError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 