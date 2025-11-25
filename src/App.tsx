
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminApp from './components/AdminApp';
import Landing from './components/Landing';
import Tracking from './components/Tracking';
import SelfRegistration from './components/SelfRegistration';
import { StorageService } from './services/storage';

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
  const [isAdminMode] = useState(isSubdomainAdmin);

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


    </>
  );
};

export default App;
