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
import LanguageThemeToggle from './LanguageThemeToggle';
import { LayoutDashboard, MapPin, Users as UsersIcon, Settings as SettingsIcon, LogOut, UserCircle, BarChart3 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type View = 'DASHBOARD' | 'LOCATIONS' | 'USERS' | 'CUSTOMERS' | 'SETTINGS' | 'REPORTS';

const AdminApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
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
      onClick={() => setCurrentView(view)}
      className={twMerge(
        "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1",
        currentView === view
          ? "bg-blue-600 text-white shadow-md"
          : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pickpoint</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-10 uppercase tracking-wider font-semibold">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
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

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center w-full px-2 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            {t('common.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative">
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
            {t(viewTitles[currentView])}
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <LanguageThemeToggle />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto dark:bg-slate-950">
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
