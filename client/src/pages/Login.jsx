import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New state for field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    employeeId: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    // Clear specific field error when user types
    if (fieldErrors[e.target.name]) {
        setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
      const newErrors = {};
      if (!formData.employeeId.trim()) newErrors.employeeId = "Please enter your Employee ID";
      if (!formData.password) newErrors.password = "Please enter your password";
      
      setFieldErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Run custom validation first
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // NOTE: Ensure your AuthContext login function uses '/api/login' not 'http://localhost...'
      const result = await login(formData.employeeId, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIXED PAGE: h-screen and overflow-hidden prevent scrolling
    <div className="h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans overflow-hidden">
      
      {/* === LEFT PANEL: CORPORATE BRANDING === */}
      <div className="lg:w-[45%] bg-gradient-to-br from-[#005CA9] to-[#004884] relative flex flex-col justify-center px-12 lg:px-16 py-12 text-white shadow-2xl z-10">
        
        {/* Professional Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:30px_30px]" aria-hidden="true"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-center">
          {/* Logo Container */}
          <div className="bg-white p-3.5 rounded-xl inline-block mb-10 shadow-lg w-fit">
            <img 
              src="/iocl-logo.png" 
              alt="Indian Oil Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>
          
          {/* Titles */}
          <h2 className="text-sm font-semibold text-blue-200 uppercase tracking-[0.2em] mb-3">
            Indian Oil Corporation Limited
          </h2>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-8 text-white">
            Sponsorship <br />
            Management Portal
          </h1>
          
          {/* Accent Line */}
          <div className="h-1.5 w-20 bg-[#F37021] rounded-full mb-10"></div>
          
          {/* Description */}
          <p className="text-blue-100/90 text-sm lg:text-[15px] leading-relaxed max-w-[400px] font-medium">
            Centralized internal system for managing corporate sponsorships. Please authenticate with your official employee credentials to proceed.
          </p>
        </div>

        {/* Footer Copyright */}
        <div className="absolute bottom-8 left-12 lg:left-16 text-blue-300/60 text-[10px] font-medium tracking-wide uppercase">
          © Indian Oil Corp Ltd • Internal Use Only
        </div>
      </div>

      {/* === RIGHT PANEL: LOGIN FORM === */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-slate-50 relative">
        
        {/* Login Card - Adjusted padding to fit fixed height */}
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-200/70 p-8 lg:p-10">
          
          {/* Form Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Employee Sign In</h3>
            <p className="text-slate-500 text-sm mt-2">Enter your details to access the dashboard.</p>
          </div>

          {/* ADDED noValidate TO DISABLE BROWSER TOOLTIPS */}
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            
            {/* Global Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r flex items-start gap-3 text-sm font-medium animate-fadeIn">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Employee ID Input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Employee ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 transition-colors ${fieldErrors.employeeId ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#005CA9]'}`} />
                </div>
                <input 
                  type="text" 
                  name="employeeId" 
                  placeholder="Enter Employee ID" 
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-lg outline-none transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal
                    ${fieldErrors.employeeId 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200 text-red-900' 
                        : 'border-slate-300 focus:ring-2 focus:ring-[#005CA9] focus:border-[#005CA9] text-slate-800'
                    }`}
                  value={formData.employeeId} 
                  onChange={handleChange} 
                />
              </div>
              {/* Custom Error Message OR Helper Text */}
              {fieldErrors.employeeId ? (
                  <p className="text-[11px] text-red-500 font-bold mt-1.5 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle size={10} /> {fieldErrors.employeeId}
                  </p>
              ) : (
                  <p className="text-[11px] text-slate-400 font-medium mt-1.5 ml-1">
                    Example: 502318
                  </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#005CA9]'}`} />
                </div>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="••••••••" 
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-lg outline-none transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal
                    ${fieldErrors.password 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200 text-red-900' 
                        : 'border-slate-300 focus:ring-2 focus:ring-[#005CA9] focus:border-[#005CA9] text-slate-800'
                    }`}
                  value={formData.password} 
                  onChange={handleChange} 
                />
              </div>
              {/* Custom Error Message */}
              {fieldErrors.password && (
                  <p className="text-[11px] text-red-500 font-bold mt-1.5 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle size={10} /> {fieldErrors.password}
                  </p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#005CA9] hover:bg-[#004884] text-white font-bold py-3.5 rounded-lg shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 tracking-wide text-sm uppercase"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : "Secure Sign In"}
            </button>

            {/* Assistance Note */}
            <p className="text-center text-[10px] text-slate-400/80 font-medium mt-6">
              For assistance, please contact IS Department, Marketing Head Office
            </p>
          </form>
        </div>

        {/* Global Footer Text - Reduced margin for better fit */}
        <div className="mt-6 text-center max-w-sm">
           <div className="flex justify-center items-center gap-2 text-slate-400 mb-2">
              <Shield size={12} className="text-[#005CA9]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Authorized Access Only</span>
           </div>
           <p className="text-[10px] text-slate-400 font-medium leading-relaxed opacity-70">
              This system is restricted to authorized Indian Oil Corporation Limited personnel. 
              Unauthorized access attempts are monitored and logged.
           </p>
        </div>

      </div>
    </div>
  );
};

export default Login;