import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ShieldCheck, Search, Filter } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');

  // Get unique users for filter
  const uniqueUsers = Array.from(new Set(auditLogs.map(l => l.user)));

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.record.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.prevValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.newValue.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesUser = filterUser ? log.user === filterUser : true;

    return matchesSearch && matchesUser;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Security Audit Trail Ledger</h2>
        <p className="text-xs text-gray-400">Complete historical timeline records of security configurations, user access, limits, and transactions.</p>
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
            placeholder="Search action, records, old/new value..."
            className="flex-1 bg-transparent border-0 outline-none text-gray-950 dark:text-white"
          />
        </div>

        {/* User filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select 
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
          >
            <option value="">Filter by Employee...</option>
            {uniqueUsers.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Audit Log Table */}
      <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Date & Time</th>
                <th className="py-2.5">System User</th>
                <th className="py-2.5">Action Code</th>
                <th className="py-2.5">Affected Record</th>
                <th className="py-2.5">Previous Value</th>
                <th className="py-2.5">Modified Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No matching audit events catalogued in database.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20 font-mono text-[11px]">
                    <td className="py-3 text-gray-400">{new Date(log.date).toLocaleString()}</td>
                    <td className="py-3 font-semibold text-gray-700 dark:text-gray-300 font-sans">{log.user}</td>
                    <td className="py-3 text-indigo-600 dark:text-indigo-400 font-sans font-bold">{log.action}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400 font-sans max-w-xs truncate">{log.record}</td>
                    <td className="py-3 text-rose-600 truncate max-w-[120px]">{log.prevValue || 'Empty'}</td>
                    <td className="py-3 text-emerald-600 truncate max-w-[120px]">{log.newValue || 'Empty'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AuditLogs;
