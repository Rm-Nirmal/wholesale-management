import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  DollarSign, CreditCard, Landmark, ArrowRightLeft, 
  TrendingUp, TrendingDown, RefreshCw, CheckCircle2, AlertCircle, X
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    accounts, accountTransactions, sales, payments, expenses, transferFunds, customers 
  } = useApp();

  const [fromAcc, setFromAcc] = useState('');
  const [toAcc, setToAcc] = useState('');
  const [trfAmount, setTrfAmount] = useState('');
  const [trfNotes, setTrfNotes] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Financial status calculations
  const totalCash = accounts.find(a => a.id === 'acc-1')?.balance || 0;
  const bankCurrent = accounts.find(a => a.id === 'acc-2')?.balance || 0;
  const bankSavings = accounts.find(a => a.id === 'acc-3')?.balance || 0;
  const totalLiquidity = totalCash + bankCurrent + bankSavings;

  const totalReceivables = customers.reduce((sum, c) => sum + c.outstanding, 0);
  const totalPayables = 1450000; // Simulated constant supplier accounts payable
  
  // Collections and expenses today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCollections = payments
    .filter(p => p.date === todayStr)
    .reduce((sum, p) => sum + p.amount, 0);

  const todayApprovedExpenses = expenses
    .filter(e => e.date === todayStr && e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!fromAcc || !toAcc || !trfAmount) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    if (fromAcc === toAcc) {
      setMessage({ type: 'error', text: 'Source and destination accounts must be different.' });
      return;
    }

    const amt = Number(trfAmount);
    if (isNaN(amt) || amt <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount.' });
      return;
    }

    const res = transferFunds(fromAcc, toAcc, amt, trfNotes || 'Internal vault balance shift');
    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      setFromAcc('');
      setToAcc('');
      setTrfAmount('');
      setTrfNotes('');
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Financial Dashboard</h2>
        <p className="text-xs text-gray-400">Cash books, bank ledgers, accounts liquidity, and vault adjustments.</p>
      </div>

      {/* Grid: Financial Accounts cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Cash Vault */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Office Cash Vault</span>
            <p className="text-xl font-black text-gray-900 dark:text-white">LKR {totalCash.toLocaleString()}</p>
            <span className="text-[9px] text-gray-400 block">Immediate liquid cash</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Commercial Bank Current Account */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Commercial Bank Current</span>
            <p className="text-xl font-black text-gray-900 dark:text-white">LKR {bankCurrent.toLocaleString()}</p>
            <span className="text-[9px] text-gray-400 block">A/C: COM-0012948-28</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Sampath Bank Savings Account */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sampath Bank Savings</span>
            <p className="text-xl font-black text-gray-900 dark:text-white">LKR {bankSavings.toLocaleString()}</p>
            <span className="text-[9px] text-gray-400 block">A/C: SAMP-8827-22</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/60">
            <Landmark className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Lower operational widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Fund Transfer Desk */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Fund Transfer Desk</h4>
              <p className="text-[10px] text-gray-400">Transfer liquidity balances between office accounts.</p>
            </div>
          </div>

          {message && (
            <div className={`p-2.5 rounded text-xs font-medium border flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-100 dark:border-green-900/60' 
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/60'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span className="flex-1">{message.text}</span>
              <button onClick={() => setMessage(null)} className="p-0.5 hover:bg-gray-100 rounded">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">From Source Account *</label>
              <select 
                value={fromAcc} 
                onChange={(e) => setFromAcc(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-905 dark:text-white outline-none"
                required
              >
                <option value="">Select Account...</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} (Bal: LKR {a.balance.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">To Destination Account *</label>
              <select 
                value={toAcc} 
                onChange={(e) => setToAcc(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-905 dark:text-white outline-none"
                required
              >
                <option value="">Select Account...</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} (Bal: LKR {a.balance.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Transfer Amount (LKR) *</label>
              <input 
                type="number" 
                value={trfAmount}
                onChange={(e) => setTrfAmount(e.target.value)}
                placeholder="LKR amount"
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-white outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Transfer Notes</label>
              <input 
                type="text" 
                value={trfNotes}
                onChange={(e) => setTrfNotes(e.target.value)}
                placeholder="Remarks e.g. Petty cash deposit"
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-white outline-none"
              />
            </div>

            <button type="submit" className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition">
              Apply Fund Transfer
            </button>
          </form>
        </div>

        {/* Center/Right Columns: Accounts ledger summary table */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Liquidity Transaction Feed</h4>
              <p className="text-[10px] text-gray-400">Chronological list of ledger adjustments and bank deposits.</p>
            </div>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">
              Total Assets: LKR {totalLiquidity.toLocaleString()}
            </span>
          </div>

          <div className="overflow-y-auto max-h-[300px]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2">Date</th>
                  <th className="py-2">Ref ID</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">User</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
                {accountTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">No transactions recorded. Create a transfer or collect a payment.</td>
                  </tr>
                ) : (
                  accountTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20 font-mono text-[11px]">
                      <td className="py-2.5 text-gray-400">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="py-2.5 font-bold text-gray-700 dark:text-gray-300">{tx.reference}</td>
                      <td className="py-2.5 capitalize font-sans">{tx.type}</td>
                      <td className="py-2.5 text-gray-400 font-sans">{tx.user}</td>
                      <td className={`py-2.5 text-right font-bold ${
                        ['deposit', 'collection'].includes(tx.type) ? 'text-green-600' : 
                        ['withdrawal', 'expense'].includes(tx.type) ? 'text-rose-600' : 'text-gray-500'
                      }`}>
                        {['deposit', 'collection'].includes(tx.type) ? '+' : '-'} LKR {tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Dashboard;
