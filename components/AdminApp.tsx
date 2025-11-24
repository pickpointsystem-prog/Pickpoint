import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Login from './Login';
import Dashboard from './Dashboard';
import Locations from './Locations';
import Users from './Users';
import Customers from './Customers';
import Settings from './Settings';
import Reports from './Reports';
import { LayoutDashboard, MapPin, Users as UsersIcon, Settings as SettingsIcon, LogOut, UserCircle, BarChart3 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type View = 'DASHBOARD' | 'LOCATIONS' | 'USERS' | 'CUSTOMERS' | 'SETTINGS' | 'REPORTS';

const AdminApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');

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
  
  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
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
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pickpoint</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-10 uppercase tracking-wider font-semibold">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Overview" />
          <NavItem view="REPORTS" icon={BarChart3} label="Analytics" />
          <NavItem view="CUSTOMERS" icon={UserCircle} label="Customers" />
          
          {isAdmin && (
            <>
              <div className="mt-6 mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</div>
              <NavItem view="LOCATIONS" icon={MapPin} label="Locations" />
              <NavItem view="USERS" icon={UsersIcon} label="Users" />
              <NavItem view="SETTINGS" icon={SettingsIcon} label="Settings" />
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
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            {currentView === 'REPORTS' ? 'Analytics & Reports' : currentView.toLowerCase().replace('_', ' ')}
          </h2>
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
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