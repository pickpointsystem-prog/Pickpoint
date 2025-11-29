import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminApp from './components/AdminApp';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Landing from './components/Landing';
import Tracking from './components/Tracking';
import SelfRegistration from './components/SelfRegistration';
import config, { logConfig } from './config/environment';

logConfig();

if (config.enableDebugMode) {
  console.log(
    `%c🚀 Pickpoint Dashboard %c${config.env.toUpperCase()}`,
    'background: #3B82F6; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
    'background: #10B981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; margin-left: 8px;'
  );
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/form" element={<SelfRegistration />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;