// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 

// 1. IMPORT SCROLL TO TOP COMPONENT
import ScrollToTop from './components/ScrollToTop';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewEntry from './pages/NewEntry';
import AllEntries from './pages/AllEntries'; 
import VendorMaster from './pages/VendorMaster'; 

// === PROTECTED ROUTE COMPONENT ===
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Loading Session...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Forces window to scroll to top on navigation */}
        <ScrollToTop />

        <Routes>
          {/* === PUBLIC ROUTE === */}
          <Route path="/login" element={<Login />} />
          
          {/* === PROTECTED ROUTES === */}
          <Route path="/dashboard" element={
            <ProtectedRoute> <Dashboard /> </ProtectedRoute>
          } />
          
          <Route path="/new-entry" element={
            <ProtectedRoute> <NewEntry /> </ProtectedRoute>
          } />
          
          {/* REMOVED ViewEntry ROUTE SINCE YOU DELETED THE FILE */}
          
          <Route path="/all-entries" element={
            <ProtectedRoute> <AllEntries /> </ProtectedRoute>
          } />

          <Route path="/vendor-master" element={
            <ProtectedRoute> <VendorMaster /> </ProtectedRoute>
          } />
          
          {/* === ROOT REDIRECT === */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all 404s */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;