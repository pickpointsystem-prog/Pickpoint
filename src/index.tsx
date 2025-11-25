import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Import CSS wajib agar Tailwind jalan
import { StorageService } from './services/storage';
import { AppProvider } from './context/AppContext';

// Initialize Data Seeding
StorageService.init();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);