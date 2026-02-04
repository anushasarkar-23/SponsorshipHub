import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, PlusCircle, FileText, 
  LogOut, X 
} from 'lucide-react';

const Sidebar = ({ onClose }) => { 
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'New Entry', path: '/new-entry', icon: <PlusCircle size={20} /> },
    { name: 'Records', path: '/all-entries', icon: <FileText size={20} /> },
    { name: 'Vendor Master', path: '/vendor-master', icon: <Users size={20} /> },
  ];

  return (
    <div className="h-screen w-72 bg-[#0f172a] text-white flex flex-col fixed left-0 top-0 shadow-2xl border-r border-slate-800 z-50 transition-all duration-300 font-sans">
      
      {/* HEADER: Adjusted for larger logo */}
      <div className="px-5 py-6 flex items-center justify-between h-28 border-b border-slate-800/50">
        
        {/* Logo & Title Container */}
        <div className="flex items-center gap-3">
          
          {/* UPDATED: Larger White Box (h-16 w-16) with minimal padding */}
          <div className="bg-white p-0.5 rounded-xl shadow-lg shrink-0 flex items-center justify-center h-16 w-16 overflow-hidden">
            <img 
              src="/iocl-logo.png" 
              alt="IOCL Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          
          {/* Title */}
          <div>
            <h1 className="font-extrabold text-xl tracking-tight leading-none text-white">
              Sponsorship<span className="text-[#005CA9]">Hub</span>
            </h1>
          </div>
        </div>
        
        {/* CROSS BUTTON */}
        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors duration-200 p-1"
          title="Close Sidebar"
        >
          <X size={26} strokeWidth={2.5} />
        </button>
      </div>

      {/* NAV LINKS */}
      <div className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Main Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative text-sm ${
                isActive 
                  ? 'bg-[#005CA9] text-white font-bold shadow-lg shadow-blue-900/30 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-white hover:translate-x-1 font-medium'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
            {/* Active Indicator Dot */}
            {({ isActive }) => isActive && (
                <span className="absolute right-3 w-1.5 h-1.5 bg-white/40 rounded-full"></span>
            )}
          </NavLink>
        ))}
      </div>

      {/* USER PROFILE & LOGOUT */}
      <div className="p-4 border-t border-slate-800 bg-[#0b1120]">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60 mb-3 shadow-inner">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#005CA9] flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-slate-700 shrink-0">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate" title={user?.name}>{user?.name || 'Guest User'}</p>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider truncate">ID: {user?.id || '---'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-900/20 hover:border-red-800/50 text-slate-300 hover:text-red-400 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-700"
          >
            <LogOut size={14} /> Sign Out Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;