import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminApp from './components/AdminApp';
import MobileStaffApp from './components/MobileStaffApp';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Landing from './components/Landing';
import Tracking from './components/Tracking';
import SelfRegistration from './components/SelfRegistration';
import PaymentPage from './components/PaymentPage';
import config, { logConfig } from './config/environment';

logConfig();

if (config.enableDebugMode) {
  console.log(
    `%c🚀 Pickpoint Dashboard %c${config.env.toUpperCase()}`,
    'background: #3B82F6; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
    'background: #10B981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; margin-left: 8px;'
  );
}

const isDashboardDomain = window.location.hostname === config.dashboardDomain || window.location.hostname === 'localhost';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={isDashboardDomain ? <Navigate to="/admin" replace /> : <Landing />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/form" element={<SelfRegistration />} />
            <Route path="/payment" element={<PaymentPage />} />
            {isDashboardDomain && <Route path="/admin/*" element={<AdminApp />} />}
            {isDashboardDomain && <Route path="/mobile" element={<MobileStaffApp />} />}
            <Route path="*" element={<Navigate to={isDashboardDomain ? "/admin" : "/"} replace />} />
          </Routes>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;