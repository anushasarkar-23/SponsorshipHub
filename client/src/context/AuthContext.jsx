import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check for existing session on page load
  useEffect(() => {
    const storedUser = localStorage.getItem('sponsorship_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. Login Function (Connects to your new Backend API)
  const login = async (employeeId, password) => {
    try {
      // We send the ID and Password to your server
      const res = await axios.post('http://localhost:5000/api/login', { 
        employeeId, 
        password 
      });

      if (res.data.success) {
        // Login Successful: Save user data
        const employeeData = res.data.user;
        setUser(employeeData);
        localStorage.setItem('sponsorship_user', JSON.stringify(employeeData));
        return { success: true };
      } else {
        // Login Failed (Wrong ID or Password)
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      console.error("Login API Error:", err);
      return { success: false, message: "Server connection failed" };
    }
  };

  // 3. Logout Function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('sponsorship_user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);