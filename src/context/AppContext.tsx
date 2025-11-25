import React, { createContext, useContext, useEffect, ReactNode } from 'react';

type Language = 'id' | 'en';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  id: {
    'sidebar.adminPanel': 'Panel Admin',
    // Common
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.edit': 'Edit',
    'common.add': 'Tambah',
    'common.search': 'Cari',
    'common.logout': 'Keluar',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.packagesIn': 'Paket Masuk',
    'dashboard.packagesOut': 'Paket Keluar',
    'dashboard.totalPackages': 'Total Paket',
    'dashboard.activeMembers': 'Member Aktif',
    'dashboard.deliveryRevenue': 'Rev. Pengantaran',
    'dashboard.membershipRevenue': 'Rev. Membership',
    'dashboard.packageRevenue': 'Rev. Paket',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.receivePackage': 'Terima Paket',
    'dashboard.timeFilter.today': 'Hari Ini',
    'dashboard.timeFilter.week': 'Minggu Ini',
    'dashboard.timeFilter.month': 'Bulan Ini',
    'dashboard.timeFilter.all': 'Semua',
    
    // Package Management
    'package.tracking': 'No. Resi',
    'package.recipient': 'Penerima',
    'package.unit': 'Unit',
    'package.phone': 'No. WhatsApp',
    'package.courier': 'Kurir',
    'package.size': 'Ukuran',
    'package.location': 'Lokasi',
    'package.status': 'Status',
    'package.arrived': 'Tiba',
    'package.picked': 'Diambil',
    'package.destroyed': 'Hilang/Rusak',
    'package.pickup': 'Ambil Paket',
    'package.destroy': 'Tandai Hilang',
    'package.photo': 'Foto Paket',
    
    // Customers
    'customer.title': 'Pelanggan & Member',
    'customer.addNew': 'Tambah Pelanggan',
    'customer.name': 'Nama Lengkap',
    'customer.unitNumber': 'Nomor Unit',
    'customer.phoneNumber': 'Nomor WhatsApp',
    'customer.status': 'Status',
    'customer.membership': 'Keanggotaan',
    'customer.activeMembers': 'Member Aktif',
    'customer.regularCustomer': 'Pelanggan Biasa',
    'customer.manageMembership': 'Kelola Keanggotaan',
    'customer.activateMembership': 'Aktifkan Member',
    'customer.membershipExpiry': 'Berlaku Hingga',
    
    // Locations
    'location.title': 'Lokasi & Tarif',
    'location.addNew': 'Tambah Lokasi',
    'location.name': 'Nama Lokasi',
    'location.pricing': 'Skema Harga',
    'location.gracePeriod': 'Grace Period (Hari)',
    'location.delivery': 'Pengantaran',
    'location.membership': 'Keanggotaan',
    'location.enableDelivery': 'Aktifkan Pengantaran',
    'location.enableMembership': 'Aktifkan Member',
    'location.dailyRate': 'Tarif Harian (Rp)',
    
    // Reports
    'reports.title': 'Laporan',

    // Users
    'users.title': 'Pengguna',
    
    // Settings
    'settings.title': 'Pengaturan Sistem',
    'settings.waGateway': 'Gateway WhatsApp',
    'settings.apiKey': 'API Key',
    'settings.sender': 'ID Pengirim',
    'settings.endpoint': 'URL Endpoint',
    'settings.testConnection': 'Uji Koneksi',
    'settings.notificationTemplates': 'Template Notifikasi',
    'settings.language': 'Bahasa',
    'settings.darkMode': 'Mode Gelap',
    'settings.saveChanges': 'Simpan Perubahan',
  },
  en: {
    'sidebar.adminPanel': 'Admin Panel',
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.logout': 'Sign Out',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.packagesIn': 'Packages In',
    'dashboard.packagesOut': 'Packages Out',
    'dashboard.totalPackages': 'Total Packages',
    'dashboard.activeMembers': 'Active Members',
    'dashboard.deliveryRevenue': 'Delivery Revenue',
    'dashboard.membershipRevenue': 'Membership Revenue',
    'dashboard.packageRevenue': 'Package Revenue',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.receivePackage': 'Receive Package',
    'dashboard.timeFilter.today': 'Today',
    'dashboard.timeFilter.week': 'This Week',
    'dashboard.timeFilter.month': 'This Month',
    'dashboard.timeFilter.all': 'All',
    
    // Package Management
    'package.tracking': 'Tracking Number',
    'package.recipient': 'Recipient',
    'package.unit': 'Unit',
    'package.phone': 'WhatsApp Number',
    'package.courier': 'Courier',
    'package.size': 'Size',
    'package.location': 'Location',
    'package.status': 'Status',
    'package.arrived': 'Arrived',
    'package.picked': 'Picked',
    'package.destroyed': 'Lost/Destroyed',
    'package.pickup': 'Pickup Package',
    'package.destroy': 'Mark as Lost',
    'package.photo': 'Package Photo',
    
    // Customers
    'customer.title': 'Customers',
    'customer.addNew': 'Add Customer',
    'customer.name': 'Full Name',
    'customer.unitNumber': 'Unit Number',
    'customer.phoneNumber': 'WhatsApp Number',
    'customer.status': 'Status',
    'customer.membership': 'Membership',
    'customer.activeMembers': 'Active Members',
    'customer.regularCustomer': 'Regular Customer',
    'customer.manageMembership': 'Manage Membership',
    'customer.activateMembership': 'Activate Membership',
    'customer.membershipExpiry': 'Valid Until',
    
    // Locations
    'location.title': 'Locations',
    'location.addNew': 'Add Location',
    'location.name': 'Location Name',
    'location.pricing': 'Pricing Scheme',
    'location.gracePeriod': 'Grace Period (Days)',
    'location.delivery': 'Delivery',
    'location.membership': 'Membership',
    'location.enableDelivery': 'Enable Delivery',
    'location.enableMembership': 'Enable Membership',
    'location.dailyRate': 'Daily Rate (Rp)',
    
    // Reports
    'reports.title': 'Reports',

    // Users
    'users.title': 'Users',

    // Settings
    'settings.title': 'Settings',
    'settings.waGateway': 'WhatsApp Gateway',
    'settings.apiKey': 'API Key',
    'settings.sender': 'Sender ID',
    'settings.endpoint': 'Endpoint URL',
    'settings.testConnection': 'Test Connection',
    'settings.notificationTemplates': 'Notification Templates',
    'settings.language': 'Language',
    'settings.darkMode': 'Dark Mode',
    'settings.saveChanges': 'Save Changes',
  }
};

interface AppContextType {
  language: Language;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const language = 'en';

  useEffect(() => {
    // One-time cleanup of theme settings
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('pp_theme');
    // Set language to english and remove old setting
    localStorage.setItem('pp_language', 'en');
  }, []);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <AppContext.Provider value={{ language, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
