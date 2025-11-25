import React from 'react';
import AdminApp from './components/AdminApp';
import { StorageService } from './services/storage';
import { AppProvider } from './context/AppContext';

// Initialize Data Seeding
StorageService.init();

const App: React.FC = () => {
  return (
    <AppProvider>
      <AdminApp />
    </AppProvider>
  );
};

export default App;