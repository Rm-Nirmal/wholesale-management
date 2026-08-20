import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Shield, CreditCard, Compass, RotateCcw } from 'lucide-react';

export const Auth: React.FC = () => {
  const { users, setCurrentUser, resetToDemoData } = useApp();
  const navigate = useNavigate();

  const handleLogin = (role: 'super_admin' | 'accountant' | 'salesman') => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      if (role === 'super_admin') navigate('/admin/dashboard');
      else if (role === 'accountant') navigate('/accountant/dashboard');
      else if (role === 'salesman') navigate('/salesman/dashboard');
    }
  };

  const getRoleCardConfig = (role: string) => {
    switch (role) {
      case 'super_admin':
        return {
          title: 'Super Admin / Owner',
          icon: Shield,
          color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900',
          desc: 'Complete control center. Monitor profits, change credit limits, review employee performance, audit logs, and approve override requests.',
          badge: 'Ruwan Perera (Owner)'
        };
      case 'accountant':
        return {
          title: 'Financial Accountant',
          icon: CreditCard,
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900',
          desc: 'Financial operations. Manage invoicing, collections, cash books, expense vouchers, supplier payables, and outstanding receivable aging reports.',
          badge: 'Nimali Silva (Finance)'
        };
      case 'salesman':
        return {
          title: 'Sales Representative',
          icon: Compass,
          color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900',
          desc: 'Mobile-first field actions. Manage assigned retail stores, record check-in visits, collect payments, and build invoices with real-time credit checks.',
          badge: 'Kasun Jayawardena (Sales)'
        };
      default:
        return {
          title: 'User',
          icon: Shield,
          color: 'text-gray-600 bg-gray-50 border-gray-100',
          desc: 'Regular employee access.',
          badge: 'Staff'
        };
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 overflow-hidden bg-slate-900">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle" />
      <div className="absolute -bottom-10 right-4 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-subtle" style={{ animationDelay: '2s' }} />

      {/* Brand Header */}
      <div className="text-center mb-10 z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl shadow-xl shadow-indigo-950/50 mb-4">
          W
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          WHOLESALE & RETAIL
        </h1>
        <p className="mt-2.5 text-sm text-slate-400 max-w-md mx-auto">
          Centralized business control portal. Select a workspace profile below to log in and inspect customized employee actions.
        </p>
      </div>

      {/* Role Picker Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full z-10 px-2">
        {['super_admin', 'accountant', 'salesman'].map((role) => {
          const config = getRoleCardConfig(role);
          const Icon = config.icon;
          return (
            <button
              key={role}
              onClick={() => handleLogin(role as any)}
              className="flex flex-col text-left border border-slate-800 rounded-2xl bg-slate-950/60 backdrop-blur-md p-6 hover:border-slate-700 hover:bg-slate-950/80 transition-all duration-300 group shadow-lg cursor-pointer transform hover:-translate-y-1"
            >
              {/* Header Icon Block */}
              <div className={`p-3 rounded-xl border ${config.color} mb-5 self-start group-hover:scale-110 transition duration-300`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Title & Desc */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition">
                {config.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed flex-1 mb-5">
                {config.desc}
              </p>

              {/* Action footer */}
              <div className="flex items-center justify-between w-full pt-4 border-t border-slate-900 text-xs font-semibold">
                <span className="text-slate-500 font-normal">{config.badge}</span>
                <span className="text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                  Launch Workspace &rarr;
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* System Helper Actions */}
      <div className="mt-12 text-center z-10 flex gap-4">
        <button 
          onClick={() => {
            if (confirm('This will wipe all local storage changes and load default company products, customers, payments, and logs. Proceed?')) {
              resetToDemoData();
              alert('System data reset successfully!');
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-700 rounded-lg bg-slate-950/20 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset System Demo State</span>
        </button>
      </div>

      {/* Copyright Footer */}
      <span className="absolute bottom-4 text-[10px] text-slate-600 tracking-wide">
        WholesaleHub Enterprise Core. Responsive PWA.
      </span>
    </div>
  );
};
export default Auth;
