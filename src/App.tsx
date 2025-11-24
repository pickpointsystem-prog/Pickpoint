
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminApp from './components/AdminApp';
import Landing from './components/Landing';
import Tracking from './components/Tracking';
import SelfRegistration from './components/SelfRegistration';
import { StorageService } from './services/storage';
import { Monitor, Globe } from 'lucide-react';

// Initialize Data Seeding
StorageService.init();

const App: React.FC = () => {
  // --- PRODUCTION DOMAIN LOGIC ---
  // In production, we check the subdomain to switch views automatically.
  // admin.pickpoint.my.id -> AdminApp
  // pickpoint.my.id -> Landing / Public Routes
  
  const hostname = window.location.hostname;
  const isSubdomainAdmin = hostname.startsWith('admin.');

  // For Demo/Testing purposes, we still keep the toggle state
  // If we are on localhost, allow toggling. If on production, respect domain unless toggled.
  const [isAdminMode, setIsAdminMode] = useState(isSubdomainAdmin);

  return (
    <>
      {isAdminMode ? (
        <AdminApp />
      ) : (
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/form" element={<SelfRegistration />} />
            
            {/* Admin Route fallback (in case someone accesses /admin directly on main domain) */}
            <Route path="/admin" element={<AdminApp />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      )}

      {/* --- DEV TOOL: VIEW SWITCHER --- */}
      {/* Only show this floating button if we are NOT on the specific admin subdomain to allow testing */}
      <div className="fixed bottom-6 right-6 z-[9999] opacity-50 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setIsAdminMode(!isAdminMode)}
          className="flex items-center gap-2 bg-black/80 backdrop-blur text-white px-3 py-2 rounded-full shadow-xl hover:scale-105 transition-transform font-bold text-[10px] uppercase tracking-wider border border-white/20"
        >
          {isAdminMode ? (
            <>
              <Globe className="w-3 h-3 text-blue-400" /> Public View
            </>
          ) : (
            <>
              <Monitor className="w-3 h-3 text-green-400" /> Admin View
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default App;
