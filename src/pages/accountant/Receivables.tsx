import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  FileSpreadsheet, Search, Filter, AlertTriangle, Users 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Receivables: React.FC = () => {
  const { customers, sales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [agingTab, setAgingTab] = useState<'all' | 'current' | 'overdue' | '30' | '60' | '90'>('all');

  const today = new Date('2026-08-20');

  // Compute aging details for each customer
  const getCustomerAging = () => {
    return customers.map(c => {
      const activeSales = sales.filter(s => s.customerId === c.id && s.balance > 0 && s.paymentStatus !== 'cancelled');
      
      let current = 0;
      let overdue = 0;
      let overdue30 = 0;
      let overdue60 = 0;
      let overdue90 = 0;

      activeSales.forEach(s => {
        const invoiceDate = new Date(s.date);
        const diffTime = today.getTime() - invoiceDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          current += s.balance;
        } else if (diffDays < 30) {
          overdue += s.balance;
        } else if (diffDays < 60) {
          overdue30 += s.balance;
        } else if (diffDays < 90) {
          overdue60 += s.balance;
        } else {
          overdue90 += s.balance;
        }
      });

      return {
        ...c,
        aging: {
          current,
          overdue,
          overdue30,
          overdue60,
          overdue90,
          totalOverdue: overdue + overdue30 + overdue60 + overdue90
        }
      };
    });
  };

  const agingData = getCustomerAging();

  const filteredData = agingData.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ownerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAging = 
      agingTab === 'all' ? true :
      agingTab === 'current' ? item.aging.current > 0 :
      agingTab === 'overdue' ? item.aging.totalOverdue > 0 :
      agingTab === '30' ? item.aging.overdue30 > 0 :
      agingTab === '60' ? item.aging.overdue60 > 0 :
      item.aging.overdue90 > 0;

    return matchesSearch && matchesAging;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Accounts Receivable Ledger</h2>
        <p className="text-xs text-gray-400">Aging report showing chronological outstanding balances and billing periods.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Outstanding */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Outstanding Debt</span>
          <p className="text-lg font-black text-rose-600 dark:text-rose-500">
            LKR {agingData.reduce((sum, item) => sum + item.outstanding, 0).toLocaleString()}
          </p>
        </div>
        {/* Overdue (1-29 days) */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Overdue (1-30 Days)</span>
          <p className="text-lg font-black text-amber-500">
            LKR {agingData.reduce((sum, item) => sum + item.aging.overdue, 0).toLocaleString()}
          </p>
        </div>
        {/* Overdue 30+ days */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Overdue (30-60 Days)</span>
          <p className="text-lg font-black text-rose-500">
            LKR {agingData.reduce((sum, item) => sum + item.aging.overdue30, 0).toLocaleString()}
          </p>
        </div>
        {/* Critical overdue */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Critical (60+ Days)</span>
          <p className="text-lg font-black text-red-600">
            LKR {agingData.reduce((sum, item) => sum + (item.aging.overdue60 + item.aging.overdue90), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search and Aging tabs */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-1.5 w-full sm:w-80 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 text-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search shop, phone..."
              className="flex-1 bg-transparent border-0 outline-none text-gray-950 dark:text-white"
            />
          </div>

          {/* Tab List */}
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-850 p-1 rounded-xl w-full sm:w-auto text-[10px] font-bold uppercase overflow-x-auto whitespace-nowrap">
            {(['all', 'current', 'overdue', '30', '60', '90'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setAgingTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  agingTab === tab 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-gray-500 hover:text-gray-950 dark:hover:text-gray-200'
                }`}
              >
                {tab === 'all' ? 'All Invoices' : 
                 tab === 'current' ? 'Current' : 
                 tab === 'overdue' ? 'Overdue' : 
                 tab === '30' ? '30+ Days' : 
                 tab === '60' ? '60+ Days' : '90+ Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Aging Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-2">Shop Name</th>
                <th className="py-2 text-right">Current Bal</th>
                <th className="py-2 text-right">1 - 30 Days</th>
                <th className="py-2 text-right">31 - 60 Days</th>
                <th className="py-2 text-right">61 - 90 Days</th>
                <th className="py-2 text-right">91+ Days</th>
                <th className="py-2 text-right font-bold text-gray-950 dark:text-white">Aggregate Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">No overdue receivable ledger records matching filters.</td>
                </tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20">
                    <td className="py-3">
                      <span className="font-bold text-gray-900 dark:text-white">{item.name}</span>
                      <span className="text-[9px] text-gray-400 block">{item.ownerName}</span>
                    </td>
                    <td className="py-3 text-right text-gray-500 font-mono">
                      {item.aging.current > 0 ? `LKR ${item.aging.current.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 text-right font-medium text-amber-600 font-mono">
                      {item.aging.overdue > 0 ? `LKR ${item.aging.overdue.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 text-right font-medium text-rose-500 font-mono">
                      {item.aging.overdue30 > 0 ? `LKR ${item.aging.overdue30.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 text-right font-bold text-red-500 font-mono">
                      {item.aging.overdue60 > 0 ? `LKR ${item.aging.overdue60.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 text-right font-black text-red-700 font-mono">
                      {item.aging.overdue90 > 0 ? `LKR ${item.aging.overdue90.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 text-right font-bold text-gray-950 dark:text-white font-mono">
                      LKR {item.outstanding.toLocaleString()}
                    </td>
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
export default Receivables;
