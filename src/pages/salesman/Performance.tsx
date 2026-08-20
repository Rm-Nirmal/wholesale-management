import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Award, Target, TrendingUp, Users } from 'lucide-react';

export const Performance: React.FC = () => {
  const { currentUser, customers, sales } = useApp();

  if (!currentUser) return null;

  const myCustomers = customers.filter(c => c.salesmanId === currentUser.id);

  // Targets calculations
  const salesAch = currentUser.salesTarget && currentUser.salesTarget > 0 
    ? ((currentUser.currentSales || 0) / currentUser.salesTarget) * 100 
    : 0;

  const collAch = currentUser.collectionsTarget && currentUser.collectionsTarget > 0 
    ? ((currentUser.currentCollections || 0) / currentUser.collectionsTarget) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">My Sales Performance Quota</h2>
        <p className="text-xs text-gray-400">Track targets achieved, region statistics, and outstanding portfolios.</p>
      </div>

      {/* Target Achievement Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sales Card */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Monthly Sales Target</h4>
              <p className="text-[10px] text-gray-400">Commission criteria based on net checkout values.</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-500">Sales Achievement Ratio:</span>
              <span className="text-indigo-650 dark:text-indigo-400 font-bold">{salesAch.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, salesAch)}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Current Sales: LKR {currentUser.currentSales?.toLocaleString()}</span>
              <span>Quota Target: LKR {currentUser.salesTarget?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Collection Card */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Monthly Cash Collections</h4>
              <p className="text-[10px] text-gray-400">Liquidity clearance criteria from assigned retailers.</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-500">Collection Achievement Ratio:</span>
              <span className="text-emerald-650 dark:text-emerald-400 font-bold">{collAch.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, collAch)}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Collected: LKR {currentUser.currentCollections?.toLocaleString()}</span>
              <span>Quota Target: LKR {currentUser.collectionsTarget?.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Assigned Shops Portfolio */}
      <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-800">
          Regional Portfolio Analytics
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 border border-gray-100 dark:border-gray-850 rounded-xl space-y-1">
            <span className="text-gray-400 font-medium">Assigned Area</span>
            <p className="font-bold text-gray-800 dark:text-gray-250 text-sm">{currentUser.assignedArea || 'N/A'}</p>
          </div>
          <div className="p-4 border border-gray-100 dark:border-gray-850 rounded-xl space-y-1">
            <span className="text-gray-400 font-medium">Assigned Customers</span>
            <p className="font-bold text-gray-800 dark:text-gray-250 text-sm">{myCustomers.length} Retail Shops</p>
          </div>
          <div className="p-4 border border-gray-100 dark:border-gray-850 rounded-xl space-y-1">
            <span className="text-gray-400 font-medium">Outstanding Portfolio Debt</span>
            <p className="font-bold text-rose-600 dark:text-rose-450 text-sm">
              LKR {myCustomers.reduce((sum, c) => sum + c.outstanding, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Performance;
