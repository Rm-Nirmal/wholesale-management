import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  CreditCard, Search, Plus, CheckCircle2, AlertCircle, X, DollarSign 
} from 'lucide-react';

export const Payments: React.FC = () => {
  const { payments, createPayment, customers, sales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [payForm, setPayForm] = useState({
    customerId: '', invoiceId: '', amount: '', method: 'cash' as any, referenceNumber: '', notes: ''
  });

  const filteredPayments = payments.filter(p => 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!payForm.customerId || !payForm.amount) {
      setMessage({ type: 'error', text: 'Select customer and provide payment amount.' });
      return;
    }

    const res = createPayment({
      customerId: payForm.customerId,
      invoiceId: payForm.invoiceId || undefined,
      amount: Number(payForm.amount),
      method: payForm.method,
      referenceNumber: payForm.referenceNumber || 'MOCK-REF-' + Date.now(),
      notes: payForm.notes
    });

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      setPayForm({ customerId: '', invoiceId: '', amount: '', method: 'cash', referenceNumber: '', notes: '' });
      setShowAddForm(false);
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Customer Collections & Receipts</h2>
          <p className="text-xs text-gray-400">Record customer bank transfers, clear cheques, log cash vouchers, and allocate to invoices.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow hover:bg-indigo-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Receipt Collection</span>
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-100 dark:border-green-900/60' 
            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/60'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-0.5 hover:bg-gray-100 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Slide down Recording Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-1 border-b border-gray-100 dark:border-gray-800">
            Record New Cash / Bank Collection
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Select Customer Shop *</label>
              <select 
                value={payForm.customerId}
                onChange={e => setPayForm({...payForm, customerId: e.target.value, invoiceId: ''})}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                required
              >
                <option value="">Choose Shop...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (Outstanding: LKR {c.outstanding.toLocaleString()})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Allocate to Invoice (Optional)</label>
              <select 
                value={payForm.invoiceId}
                disabled={!payForm.customerId}
                onChange={e => setPayForm({...payForm, invoiceId: e.target.value})}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none disabled:opacity-50"
              >
                <option value="">FIFO General Outstanding</option>
                {sales.filter(s => s.customerId === payForm.customerId && s.balance > 0 && s.paymentStatus !== 'cancelled').map(s => (
                  <option key={s.id} value={s.id}>{s.id} (Due: LKR {s.balance.toLocaleString()})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Amount Collected (LKR) *</label>
              <input 
                type="number" 
                value={payForm.amount}
                onChange={e => setPayForm({...payForm, amount: e.target.value})}
                placeholder="LKR amount"
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Payment Method</label>
              <select 
                value={payForm.method}
                onChange={e => setPayForm({...payForm, method: e.target.value as any})}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="card">Debit Card</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Tx Reference #</label>
              <input 
                type="text" 
                value={payForm.referenceNumber}
                onChange={e => setPayForm({...payForm, referenceNumber: e.target.value})}
                placeholder="Slip or cheque details"
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-gray-600 dark:text-gray-400">Remarks / Collector Notes</label>
            <input 
              type="text" 
              value={payForm.notes}
              onChange={e => setPayForm({...payForm, notes: e.target.value})}
              placeholder="e.g. Cleared commercial bank transfer receipt"
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 p-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition"
            >
              Post Collection Receipt
            </button>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-850 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search Filter bar */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 w-full sm:w-80 rounded-lg bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700/60 text-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search receipt ID, customer, reference #..."
            className="flex-1 bg-transparent border-0 outline-none text-gray-950 dark:text-white"
          />
        </div>
      </div>

      {/* Receipts Ledger Table */}
      <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Receipt ID</th>
                <th className="py-2.5">Customer Shop</th>
                <th className="py-2.5">Date Collected</th>
                <th className="py-2.5">Allocation</th>
                <th className="py-2.5">Method</th>
                <th className="py-2.5">Reference #</th>
                <th className="py-2.5">Cashier Staff</th>
                <th className="py-2.5 text-right">Amount Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20">
                  <td className="py-3 font-mono font-bold text-gray-800 dark:text-gray-200">{p.id}</td>
                  <td className="py-3 font-semibold text-gray-850 dark:text-gray-200">{p.customerName}</td>
                  <td className="py-3 text-gray-400">{p.date}</td>
                  <td className="py-3 font-semibold text-gray-600 dark:text-gray-300">
                    {p.invoiceId ? `Invoice: ${p.invoiceId}` : 'FIFO General Outstanding'}
                  </td>
                  <td className="py-3 text-gray-500 capitalize">{p.method.replace('_', ' ')}</td>
                  <td className="py-3 font-mono text-gray-400">{p.referenceNumber}</td>
                  <td className="py-3 text-gray-500">{p.recordedBy}</td>
                  <td className="py-3 font-bold text-emerald-600 dark:text-emerald-500 text-right font-mono">
                    LKR {p.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Payments;
