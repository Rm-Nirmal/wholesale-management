import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Users, MapPin, Calendar, Compass, Phone, 
  ShoppingCart, DollarSign, Award, ArrowUpRight, Plus, Eye 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { currentUser, customers, visits } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  // Filter customer shops assigned to this rep
  const myCustomers = customers.filter(c => c.salesmanId === currentUser.id);

  // Filter visits logged by this rep today
  const todayStr = new Date().toISOString().split('T')[0];
  const myVisitsToday = visits.filter(v => 
    v.salesmanId === currentUser.id && 
    v.date.startsWith(todayStr)
  );

  // Calculate target progress metrics
  const salesAch = currentUser.salesTarget && currentUser.salesTarget > 0 
    ? ((currentUser.currentSales || 0) / currentUser.salesTarget) * 100 
    : 0;

  const collAch = currentUser.collectionsTarget && currentUser.collectionsTarget > 0 
    ? ((currentUser.currentCollections || 0) / currentUser.collectionsTarget) * 100 
    : 0;

  // Triggers for opening CommandCenter tabs via custom events
  const triggerQuickAction = (tabName: 'sale' | 'payment' | 'customer' | 'stock') => {
    window.dispatchEvent(new CustomEvent('open-command-center', { detail: { tab: tabName } }));
  };

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Welcome back, {currentUser.name}</h2>
        <p className="text-xs text-gray-400">Sales Area: {currentUser.assignedArea || 'Not Assigned'} &bull; Representative Dashboard.</p>
      </div>

      {/* Grid: Mobile Touch Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={() => triggerQuickAction('sale')}
          className="flex flex-col items-center justify-center p-4 border border-indigo-100 dark:border-indigo-950 rounded-2xl bg-white dark:bg-gray-900 hover:bg-indigo-50/20 text-center cursor-pointer transition shadow-sm"
        >
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-gray-800 dark:text-gray-250 uppercase tracking-wide">New Order</span>
        </button>

        <button 
          onClick={() => triggerQuickAction('payment')}
          className="flex flex-col items-center justify-center p-4 border border-emerald-100 dark:border-emerald-950 rounded-2xl bg-white dark:bg-gray-900 hover:bg-emerald-50/20 text-center cursor-pointer transition shadow-sm"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-gray-800 dark:text-gray-250 uppercase tracking-wide">Collect Pay</span>
        </button>

        <button 
          onClick={() => navigate('/salesman/visits')}
          className="flex flex-col items-center justify-center p-4 border border-amber-100 dark:border-amber-950 rounded-2xl bg-white dark:bg-gray-900 hover:bg-amber-50/20 text-center cursor-pointer transition shadow-sm"
        >
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-2">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-gray-800 dark:text-gray-250 uppercase tracking-wide">Log Visit</span>
        </button>
      </div>

      {/* Quotas Target indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Sales target progress */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-500">Sales target progress</span>
            <span className="text-indigo-600 dark:text-indigo-400">{salesAch.toFixed(1)}% Achieved</span>
          </div>
          <div className="w-full h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, salesAch)}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Collected: LKR {currentUser.currentSales?.toLocaleString()}</span>
            <span>Target: LKR {currentUser.salesTarget?.toLocaleString()}</span>
          </div>
        </div>

        {/* Collection target progress */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-500">Collections target progress</span>
            <span className="text-emerald-600 dark:text-emerald-400">{collAch.toFixed(1)}% Achieved</span>
          </div>
          <div className="w-full h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, collAch)}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Collected: LKR {currentUser.currentCollections?.toLocaleString()}</span>
            <span>Target: LKR {currentUser.collectionsTarget?.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* Grid: Lower listings details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: My Customers list */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">My Assigned Shops</h4>
              <p className="text-[10px] text-gray-400">Select customer shop profile to log visits or adjustments.</p>
            </div>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">
              {myCustomers.length} Shops
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {myCustomers.map((c) => {
              const util = c.creditLimit > 0 ? (c.outstanding / c.creditLimit) * 100 : 0;
              return (
                <div 
                  key={c.id}
                  className="p-3 border border-gray-100 dark:border-gray-850 rounded-xl hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <Link to={`/salesman/customers/${c.id}`} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                      {c.name}
                    </Link>
                    <span className="text-[10px] text-gray-400 block">{c.ownerName} &bull; {c.area}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">LKR {c.outstanding.toLocaleString()}</p>
                    <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      util >= 90 ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20' : 
                      util >= 75 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20' : 
                      'bg-green-50 text-green-700 dark:bg-green-950/20'
                    }`}>
                      {util.toFixed(0)}% limit
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Today's visits logged */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Today's visits logged</h4>
          </div>

          <div className="relative pl-4 border-l border-gray-100 dark:border-gray-800 space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {myVisitsToday.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No shop visits logged today. Tap "Log Visit" to record route checks.</p>
            ) : (
              myVisitsToday.map((v) => (
                <div key={v.id} className="relative text-xs">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-white dark:border-gray-950 bg-indigo-500" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-700 dark:text-gray-300">{v.customerName}</p>
                    <p className="text-[10px] text-gray-500 italic">"{v.notes}"</p>
                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">{v.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default Dashboard;
