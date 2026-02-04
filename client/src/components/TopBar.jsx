import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, PlusCircle, FileText, 
  LogOut, Menu 
} from 'lucide-react';

const TopBar = ({ onSwitchToSidebar }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'New Entry', path: '/new-entry', icon: <PlusCircle size={18} /> },
    { name: 'Records', path: '/all-entries', icon: <FileText size={18} /> },
    { name: 'Vendor Master', path: '/vendor-master', icon: <Users size={18} /> },
  ];

  return (
    <div className="bg-[#0f172a] text-white shadow-md sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* INCREASED HEIGHT HERE: h-20 instead of h-16 */}
        <div className="flex justify-between h-20 items-center">
          
          {/* LEFT: Logo & Toggle Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onSwitchToSidebar}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Open Sidebar"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center gap-3">
               {/* LARGER LOGO BOX: h-14 w-14 */}
               <div className="bg-white p-0.5 rounded-lg shadow-sm flex items-center justify-center h-14 w-14 overflow-hidden">
                 <img 
                   src="/iocl-logo.png" 
                   alt="IOCL Logo" 
                   className="w-full h-full object-contain" 
                 />
               </div>
               
               <span className="font-extrabold text-2xl tracking-tight text-white leading-none">
                 Sponsorship<span className="text-[#005CA9]">Hub</span>
               </span>
            </div>
          </div>

          {/* CENTER: Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-[#005CA9] text-white shadow-lg shadow-blue-900/50' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* RIGHT: Profile & Sign Out */}
          <div className="flex items-center gap-4 border-l border-slate-700 pl-4 ml-4">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#005CA9] flex items-center justify-center text-xs font-bold border border-slate-600">
                  {user?.name ? user.name.charAt(0) : 'U'}
               </div>
               <div className="hidden lg:block text-right">
                  <p className="text-xs font-bold text-white leading-tight">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {user?.id || '---'}</p>
               </div>
            </div>

            <button 
              onClick={logout}
              className="flex items-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-700"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TopBar;