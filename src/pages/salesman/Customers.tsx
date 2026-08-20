import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Phone, MapPin, CreditCard } from 'lucide-react';

export const Customers: React.FC = () => {
  const { customers, currentUser } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  if (!currentUser) return null;

  // Filter only customers assigned to this salesman
  const myCustomers = customers.filter(c => 
    c.salesmanId === currentUser.id &&
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.ownerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">My Assigned Retail Shops</h2>
          <p className="text-xs text-gray-400">View and manage stores, check available credit limit thresholds, and log route activities.</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 w-full sm:w-80 rounded-lg bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700/60 text-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search shop title, owner..."
            className="flex-1 bg-transparent border-0 outline-none text-gray-950 dark:text-white"
          />
        </div>
      </div>

      {/* My Customers Grid List (Mobile-friendly Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {myCustomers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-xs text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            No assigned retail shops match search criteria.
          </div>
        ) : (
          myCustomers.map(c => {
            const utilization = c.creditLimit > 0 ? (c.outstanding / c.creditLimit) * 100 : 0;
            return (
              <div 
                key={c.id}
                onClick={() => navigate(`/salesman/customers/${c.id}`)}
                className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4 hover:border-indigo-400 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white hover:text-indigo-650 transition">{c.name}</h3>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">{c.ownerName}</span>
                  </div>
                  <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    c.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-950/20' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20'
                  }`}>{c.status}</span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {c.address}</div>
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {c.phone}</div>
                </div>

                {/* Credit gauge */}
                <div className="space-y-1 text-[11px] pt-2 border-t border-gray-100 dark:border-gray-850">
                  <div className="flex justify-between items-center text-gray-500">
                    <span className="font-semibold">Credit Utilization:</span>
                    <span className={`font-bold ${utilization >= 80 ? 'text-rose-500' : 'text-emerald-500'}`}>{utilization.toFixed(0)}% Used</span>
                  </div>
                  <div className="w-full h-2 bg-gray-150 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full animate-pulse-subtle" style={{ width: `${Math.min(100, utilization)}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                    <span>Due: LKR {c.outstanding.toLocaleString()}</span>
                    <span>Limit: LKR {c.creditLimit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default Customers;
