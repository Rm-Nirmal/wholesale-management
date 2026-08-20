import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  DollarSign, Search, Plus, CheckCircle2, AlertTriangle, 
  X, AlertCircle, FileText, Upload 
} from 'lucide-react';

export const Expenses: React.FC = () => {
  const { expenses, createExpense, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [expForm, setExpForm] = useState({
    title: '', category: 'office' as any, amount: '', paymentMethod: 'cash' as any, description: '', notes: ''
  });

  const [receiptSim, setReceiptSim] = useState<string | null>(null);

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory ? e.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!expForm.title || !expForm.amount) {
      setMessage({ type: 'error', text: 'Please fill in required fields.' });
      return;
    }

    createExpense({
      title: expForm.title,
      category: expForm.category,
      amount: Number(expForm.amount),
      paymentMethod: expForm.paymentMethod,
      description: expForm.description,
      notes: expForm.notes
    });

    setMessage({ 
      type: 'success', 
      text: currentUser?.role === 'super_admin' 
        ? 'Expense recorded and approved automatically.' 
        : 'Expense voucher logged. Filed to Super Admin approval desk.'
    });

    setExpForm({ title: '', category: 'office', amount: '', paymentMethod: 'cash', description: '', notes: '' });
    setReceiptSim(null);
    setShowAddForm(false);
  };

  const handleSimulateFile = () => {
    setReceiptSim('receipt_log_image_simulation.jpg');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Business Expenses Ledger</h2>
          <p className="text-xs text-gray-400">Log operation expenses, transport costs, staff salaries, and submit for owner signoffs.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow hover:bg-indigo-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Expense Voucher</span>
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

      {/* Slide down voucher creator */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-1 border-b border-gray-100 dark:border-gray-800">
            Log New Expense Voucher
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Expense Title *</label>
              <input 
                type="text" 
                value={expForm.title}
                onChange={e => setExpForm({...expForm, title: e.target.value})}
                placeholder="e.g. Delivery vehicle repairs"
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Amount (LKR) *</label>
              <input 
                type="number" 
                value={expForm.amount}
                onChange={e => setExpForm({...expForm, amount: e.target.value})}
                placeholder="LKR"
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Category</label>
              <select 
                value={expForm.category}
                onChange={e => setExpForm({...expForm, category: e.target.value as any})}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              >
                <option value="rent">Rent</option>
                <option value="electricity">Electricity</option>
                <option value="water">Water</option>
                <option value="internet">Internet</option>
                <option value="salaries">Salaries</option>
                <option value="transport">Transport</option>
                <option value="fuel">Fuel</option>
                <option value="equipment">Equipment</option>
                <option value="maintenance">Maintenance</option>
                <option value="office">Office Supplies</option>
                <option value="other">Other Operations</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Payment Source</label>
              <select 
                value={expForm.paymentMethod}
                onChange={e => setExpForm({...expForm, paymentMethod: e.target.value as any})}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              >
                <option value="cash">Office Cash Vault</option>
                <option value="bank_transfer">Bank Current Account</option>
                <option value="card">Business Debit Card</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-gray-600 dark:text-gray-400">Detailed Description</label>
            <textarea 
              rows={2}
              value={expForm.description}
              onChange={e => setExpForm({...expForm, description: e.target.value})}
              placeholder="Breakdown of expenses, repair shop receipts..."
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none"
            />
          </div>

          {/* Receipt simulator */}
          <div className="space-y-1 text-xs">
            <label className="font-semibold text-gray-600 dark:text-gray-400">Receipt Attachment</label>
            <div 
              onClick={handleSimulateFile}
              className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              {receiptSim ? (
                <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <FileText className="w-4 h-4" />
                  <span>{receiptSim} attached</span>
                </div>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Click to mock upload receipt image file</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 p-2 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition"
            >
              Post Expense Voucher
            </button>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-850 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-850 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List panel */}
      <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-1.5 w-full sm:w-80 rounded-lg bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700/60 text-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, details..."
              className="flex-1 bg-transparent border-0 outline-none text-gray-950 dark:text-white"
            />
          </div>

          {/* Categories filter */}
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-xs w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            <option value="rent">Rent</option>
            <option value="electricity">Electricity</option>
            <option value="internet">Internet</option>
            <option value="salaries">Salaries</option>
            <option value="fuel">Fuel</option>
            <option value="maintenance">Maintenance</option>
            <option value="office">Office Supplies</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Expense ID</th>
                <th className="py-2.5">Title</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Date Logged</th>
                <th className="py-2.5">Payment Source</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Amount Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20">
                  <td className="py-3 font-mono font-bold text-gray-800 dark:text-gray-205">{e.id}</td>
                  <td className="py-3 font-semibold text-gray-850 dark:text-gray-200">
                    <p>{e.title}</p>
                    <span className="text-[10px] text-gray-400 block font-normal">{e.description}</span>
                  </td>
                  <td className="py-3 text-gray-400 capitalize">{e.category}</td>
                  <td className="py-3 text-gray-400">{e.date}</td>
                  <td className="py-3 text-gray-500 capitalize">{e.paymentMethod.replace('_', ' ')}</td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      e.status === 'approved' ? 'bg-green-50 text-green-700 dark:bg-green-950/20' :
                      e.status === 'rejected' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20' :
                      'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                    }`}>
                      {e.status === 'pending' ? 'Pending signoff' : e.status}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-rose-600 dark:text-rose-450 text-right font-mono">
                    LKR {e.amount.toLocaleString()}
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
export default Expenses;
