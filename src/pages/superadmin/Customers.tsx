import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, Filter, AlertCircle } from 'lucide-react';

export const Customers: React.FC = () => {
  const { customers, users, addCustomer } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const uniqueAreas = Array.from(new Set(customers.map(c => c.area)));

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
      
    const matchesArea = filterArea ? c.area === filterArea : true;
    const matchesStatus = filterStatus 
      ? (filterStatus === 'overdue' ? c.overdueAmount > 0 
         : filterStatus === 'blocked' ? c.status === 'blocked' 
         : c.status === filterStatus) 
      : true;

    return matchesSearch && matchesArea && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Retail Customer Accounts</h2>
          <p className="text-xs text-gray-400">Manage client shop records, regional assignments, outstanding debts, and risk thresholds.</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 w-full sm:w-80 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 text-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search shop title, contact owner, phone..."
            className="flex-1 bg-transparent border-0 outline-none text-gray-950 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto text-xs flex-wrap">
          <select 
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
          >
            <option value="">All Regions</option>
            {uniqueAreas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
          >
            <option value="">All Credit Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="overdue">Overdue Balances</option>
          </select>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Shop Name</th>
                <th className="py-2.5">Owner Name</th>
                <th className="py-2.5">Region Area</th>
                <th className="py-2.5 text-right">Credit Used</th>
                <th className="py-2.5 text-right">Credit Limit</th>
                <th className="py-2.5 text-right">Overdue</th>
                <th className="py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">No matching customer retail profiles found.</td>
                </tr>
              ) : (
                filteredCustomers.map(c => {
                  const utilization = c.creditLimit > 0 ? (c.outstanding / c.creditLimit) * 100 : 0;
                  return (
                    <tr 
                      key={c.id} 
                      onClick={() => navigate(`/admin/customers/${c.id}`)}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 font-bold text-indigo-600 dark:text-indigo-400 hover:underline">{c.name}</td>
                      <td className="py-3.5 text-gray-700 dark:text-gray-300 font-medium">{c.ownerName}</td>
                      <td className="py-3.5 text-gray-400">{c.area}</td>
                      <td className="py-3.5 text-right font-bold text-gray-900 dark:text-white">LKR {c.outstanding.toLocaleString()}</td>
                      <td className="py-3.5 text-right text-gray-500">LKR {c.creditLimit.toLocaleString()}</td>
                      <td className="py-3.5 text-right text-rose-500 font-bold">LKR {c.overdueAmount.toLocaleString()}</td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          c.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-950/20' :
                          c.status === 'inactive' ? 'bg-gray-50 text-gray-700 dark:bg-gray-950/20' :
                          'bg-rose-50 text-rose-700 dark:bg-rose-950/20'
                        }`}>{c.status}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Customers;
