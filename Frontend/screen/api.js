import axios from 'axios';

const API_URL = 'http://10.0.2.2:3000';

// Signup API
export const signup = async (username, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/signup`, { username, email, password });
        return response.data;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

// Login API
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Forgot Password API
export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/forgot-password`, { email });
        return response.data;
    } catch (error) {
        console.error('Forgot Password error:', error);
        throw error;
    }
};

// Reset Password API
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password`, { token, newPassword });
        return response.data;
    } catch (error) {
        console.error('Reset Password error:', error);
        throw error;
    }
};
