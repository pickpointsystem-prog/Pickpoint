import React from 'react';
import AdminApp from './components/AdminApp';
import { StorageService } from './services/storage';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import config, { logConfig } from './config/environment';

// Initialize environment and log configuration
logConfig();

// Initialize Data Seeding
StorageService.init();

// Display environment banner
if (config.enableDebugMode) {
  console.log(
    `%c🚀 Pickpoint Dashboard %c${config.env.toUpperCase()}`,
    'background: #3B82F6; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
    'background: #10B981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; margin-left: 8px;'
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <ToastProvider>
        <AdminApp />
      </ToastProvider>
    </AppProvider>
  );
};

export default App;