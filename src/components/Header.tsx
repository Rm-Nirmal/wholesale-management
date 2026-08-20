import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Menu, Bell, Sun, Moon, Search, Plus, 
  ChevronDown, ShieldAlert, PackageCheck, HeartHandshake, LogOut, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenCommand: () => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen, onOpenCommand }) => {
  const { currentUser, setCurrentUser, users, approvals, products, customers } = useApp();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme as 'light' | 'dark');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Compile active alerts/notifications
  const getNotifications = () => {
    const alerts: { id: string; title: string; type: 'info' | 'warning' | 'critical'; time: string }[] = [];

    // Low stock alerts
    products.forEach(p => {
      if (p.currentStock <= p.minStock) {
        alerts.push({
          id: `low-${p.id}`,
          title: `Low Stock: ${p.name} (Only ${p.currentStock} ${p.unit} remaining)`,
          type: 'warning',
          time: 'Today'
        });
      }
    });

    // Credit warning and blocks
    customers.forEach(c => {
      const utilization = c.creditLimit > 0 ? (c.outstanding / c.creditLimit) * 100 : 0;
      if (c.status === 'blocked') {
        alerts.push({
          id: `block-${c.id}`,
          title: `Account Blocked: ${c.name} has exceeded limits or is flagged`,
          type: 'critical',
          time: '1d ago'
        });
      } else if (utilization >= 90) {
        alerts.push({
          id: `crit-cred-${c.id}`,
          title: `Critical Credit: ${c.name} used ${utilization.toFixed(1)}% limit`,
          type: 'critical',
          time: 'Today'
        });
      } else if (utilization >= 80) {
        alerts.push({
          id: `warn-cred-${c.id}`,
          title: `Credit Warning: ${c.name} used ${utilization.toFixed(1)}% limit`,
          type: 'warning',
          time: 'Yesterday'
        });
      }
    });

    // Pending approvals (only relevant for super admin or accountant depending on view)
    approvals.forEach(a => {
      if (a.status === 'pending') {
        alerts.push({
          id: `apr-${a.id}`,
          title: `Approval Request: ${a.requestedBy} requested override for ${a.details.customerName || 'Expense'}`,
          type: 'info',
          time: 'Pending'
        });
      }
    });

    return alerts;
  };

  const notifications = getNotifications();

  // Fast-switching login roles for developer testing ease
  const handleUserSwitch = (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      setProfileOpen(false);
      // Route to correct dashboard path
      if (selected.role === 'super_admin') navigate('/admin/dashboard');
      else if (selected.role === 'accountant') navigate('/accountant/dashboard');
      else if (selected.role === 'salesman') navigate('/salesman/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-16 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md">
      {/* Left side: Hamburger + Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 lg:hidden text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button */}
        <button 
          onClick={onOpenCommand}
          className="hidden md:flex items-center gap-3 px-3 py-1.5 w-64 text-left rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 text-xs text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition"
        >
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <span className="flex-1">Search or action...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-950 font-mono text-[9px] text-gray-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right side: Actions, Notifications, Theme, Profile */}
      <div className="flex items-center gap-3">
        {/* Mobile Search Icon */}
        <button 
          onClick={onOpenCommand}
          className="p-2 rounded-full md:hidden text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Action Trigger */}
        <button 
          onClick={onOpenCommand}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs shadow hover:bg-indigo-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Action</span>
        </button>

        {/* Theme Switcher */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 rounded-full transition"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications Icon and Panel */}
        <div className="relative">
          <button 
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className={`p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition relative ${
              notifOpen ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 border border-white dark:border-gray-900 rounded-full" />
            )}
          </button>

          {/* Notifications Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950 shadow-lg z-50">
              <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-semibold text-gray-900 dark:text-white">Alerts Center</span>
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full">
                  {notifications.length} Issues
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500">
                    <PackageCheck className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-80" />
                    No system alerts. Everything running smoothly!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-900 transition flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {n.type === 'critical' && <ShieldAlert className="w-4 h-4 text-rose-500" />}
                        {n.type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-500" />}
                        {n.type === 'info' && <HeartHandshake className="w-4 h-4 text-sky-500" />}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="font-medium text-gray-700 dark:text-gray-300 leading-tight">{n.title}</p>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown & Fast Workspace Switcher */}
        <div className="relative">
          <button 
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-1.5 p-1 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <img 
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80'} 
              alt={currentUser?.name} 
              className="w-6.5 h-6.5 rounded-full object-cover"
            />
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 mr-1 hidden sm:inline" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950 shadow-lg p-2 z-50">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1.5">
                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">{currentUser?.name}</p>
                <span className="text-[10px] text-gray-400 font-medium capitalize">
                  {currentUser?.role.replace('_', ' ')} workspace
                </span>
              </div>

              {/* Developer Fast Role Switcher */}
              <div className="px-3 py-1">
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Developer Role Switcher
                </span>
                <div className="space-y-0.5">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleUserSwitch(u.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left text-[11px] rounded-lg transition ${
                        currentUser?.id === u.id 
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <span className="truncate">{u.name} ({u.role.split('_')[0]})</span>
                      {currentUser?.id === u.id && <RefreshCw className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-1.5">
                <button 
                  onClick={() => {
                    setCurrentUser(null);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
