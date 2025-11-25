import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useApp } from '../context/AppContext';
import Login from './Login';
import Dashboard from './Dashboard';
import Locations from './Locations';
import Users from './Users';
import Customers from './Customers';
import Settings from './Settings';
import Reports from './Reports';
import { LayoutDashboard, MapPin, Users as UsersIcon, Settings as SettingsIcon, LogOut, UserCircle, BarChart3, Menu, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type View = 'DASHBOARD' | 'LOCATIONS' | 'USERS' | 'CUSTOMERS' | 'SETTINGS' | 'REPORTS';

const AdminApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useApp();

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('pp_session');
    if (sessionUser) {
      setUser(JSON.parse(sessionUser));
    }
  }, []);

  const handleLogin = (u: User) => {
    sessionStorage.setItem('pp_session', JSON.stringify(u));
    setUser(u);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pp_session');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = user.role === 'ADMIN';

  const NavItem = ({ view, icon: Icon, label, translationKey }: { view: View; icon: any; label: string, translationKey: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setSidebarOpen(false); // Close sidebar on navigation
      }}
      className={twMerge(
        "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1",
        currentView === view
          ? "bg-blue-600 text-white shadow-md"
          : "text-slate-600 hover:bg-blue-50"
      )}
    >
      <Icon className="w-5 h-5 mr-3" />
      {t(translationKey) || label}
    </button>
  );

  const viewTitles: { [key in View]: string } = {
    DASHBOARD: 'dashboard.title',
    REPORTS: 'reports.title',
    CUSTOMERS: 'customer.title',
    LOCATIONS: 'location.title',
    USERS: 'users.title',
    SETTINGS: 'settings.title',
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Overlay - for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={twMerge(
        "w-64 bg-white border-r border-slate-200 flex-col z-40 transform transition-transform duration-300 ease-in-out md:flex md:translate-x-0",
        isSidebarOpen ? "translate-x-0 fixed h-full" : "-translate-x-full absolute"
      )}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pickpoint</h1>
          </div>
          <button className="md:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6"/>
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1 pl-[3.25rem] -mt-6 uppercase tracking-wider font-semibold">{t('sidebar.adminPanel')}</p>

        <nav className="flex-1 p-4 overflow-y-auto mt-6">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Overview" translationKey="dashboard.title" />
          <NavItem view="REPORTS" icon={BarChart3} label="Analytics" translationKey="reports.title" />
          <NavItem view="CUSTOMERS" icon={UserCircle} label="Customers" translationKey="customer.title" />
          
          {isAdmin && (
            <>
              <div className="mt-6 mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</div>
              <NavItem view="LOCATIONS" icon={MapPin} label="Locations" translationKey="location.title" />
              <NavItem view="USERS" icon={UsersIcon} label="Users" translationKey="users.title" />
              <NavItem view="SETTINGS" icon={SettingsIcon} label="Settings" translationKey="settings.title" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center w-full px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            {t('common.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-600" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6"/>
            </button>
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {t(viewTitles[currentView])}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm text-slate-500 hidden md:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {currentView === 'DASHBOARD' && <Dashboard user={user} />}
          {currentView === 'REPORTS' && <Reports />}
          {currentView === 'LOCATIONS' && isAdmin && <Locations />}
          {currentView === 'USERS' && isAdmin && <Users />}
          {currentView === 'CUSTOMERS' && <Customers user={user} />}
          {currentView === 'SETTINGS' && isAdmin && <Settings />}
        </div>
      </main>
    </div>
  );
};

export default AdminApp;

