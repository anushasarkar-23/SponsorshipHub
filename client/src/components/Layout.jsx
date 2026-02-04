import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children }) => {
  // Load preference from local storage, default to 'sidebar' (true)
  const [isSidebarMode, setIsSidebarMode] = useState(() => {
    const saved = localStorage.getItem('layout_mode');
    return saved !== 'topbar'; // if 'topbar' found, return false, else true
  });

  // Save preference whenever it changes
  useEffect(() => {
    localStorage.setItem('layout_mode', isSidebarMode ? 'sidebar' : 'topbar');
  }, [isSidebarMode]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* CONDITIONAL NAVIGATION */}
      {isSidebarMode ? (
        // === VERTICAL SIDEBAR MODE ===
        <>
          <Sidebar onClose={() => setIsSidebarMode(false)} />
          {/* Main content pushed right to make space for sidebar */}
          <main className="ml-72 flex-1 p-8 transition-all duration-300">
            {children}
          </main>
        </>
      ) : (
        // === HORIZONTAL TOPBAR MODE ===
        <>
          <TopBar onSwitchToSidebar={() => setIsSidebarMode(true)} />
          {/* Main content centered */}
          <main className="flex-1 p-8 max-w-7xl mx-auto w-full transition-all duration-300">
            {children}
          </main>
        </>
      )}

    </div>
  );
};

export default Layout;