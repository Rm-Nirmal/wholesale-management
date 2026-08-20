import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Calendar, Search, Plus, CheckCircle2, AlertCircle, X, MapPin 
} from 'lucide-react';

export const Visits: React.FC = () => {
  const { visits, recordVisit, customers, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [visitForm, setVisitForm] = useState({
    customerId: '', purpose: '', notes: '', status: 'completed' as any, followUpDate: ''
  });

  if (!currentUser) return null;

  const myCustomers = customers.filter(c => c.salesmanId === currentUser.id);

  // Filter visits logged by this rep
  const myVisits = visits.filter(v => 
    v.salesmanId === currentUser.id &&
    (v.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     v.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!visitForm.customerId || !visitForm.notes || !visitForm.purpose) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    recordVisit({
      salesmanId: currentUser.id,
      customerId: visitForm.customerId,
      purpose: visitForm.purpose,
      notes: visitForm.notes,
      status: visitForm.status,
      followUpDate: visitForm.followUpDate || undefined,
      visitType: 'scheduled'
    });

    setMessage({ type: 'success', text: 'Customer route check-in visit logged successfully!' });
    setVisitForm({ customerId: '', purpose: '', notes: '', status: 'completed', followUpDate: '' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Route Visits & Check-ins</h2>
          <p className="text-xs text-gray-400">Record on-field retail visits, client feedback notes, and schedule follow-ups.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow hover:bg-indigo-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Shop Check-in</span>
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

      {/* Slide down route logger form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-1 border-b border-gray-100 dark:border-gray-800">
            Log Route Check-in Report
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Select Customer Shop *</label>
              <select 
                value={visitForm.customerId}
                onChange={e => setVisitForm({...visitForm, customerId: e.target.value})}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                required
              >
                <option value="">Choose Shop...</option>
                {myCustomers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.ownerName})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Route Visit Status</label>
              <select 
                value={visitForm.status}
                onChange={e => setVisitForm({...visitForm, status: e.target.value as any})}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              >
                <option value="completed">Completed Route Check</option>
                <option value="payment_collected">Payment Collected</option>
                <option value="no_order">No Orders Placed</option>
                <option value="follow_up_required">Follow-up Required</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Purpose of Visit *</label>
              <input 
                type="text" 
                value={visitForm.purpose}
                onChange={e => setVisitForm({...visitForm, purpose: e.target.value})}
                placeholder="e.g. Sales order review / invoice collections"
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Next Scheduled Follow-up</label>
              <input 
                type="date" 
                value={visitForm.followUpDate}
                onChange={e => setVisitForm({...visitForm, followUpDate: e.target.value})}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-gray-600 dark:text-gray-400">On-field Notes / Remarks *</label>
            <textarea 
              rows={3}
              value={visitForm.notes}
              onChange={e => setVisitForm({...visitForm, notes: e.target.value})}
              placeholder="Record feedback notes here..."
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none"
              required
            />
          </div>

          <div className="flex gap-2 text-xs">
            <button 
              type="submit"
              className="flex-1 p-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            >
              Post Route Check-in Report
            </button>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-850 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-850 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter / Search panel */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 w-full sm:w-80 rounded-lg bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700/60 text-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search shops or notes..."
            className="flex-1 bg-transparent border-0 outline-none text-gray-955 dark:text-white"
          />
        </div>
      </div>

      {/* History timelines list */}
      <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-800">
          My Check-in Route History
        </h4>

        {myVisits.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No route visits catalogued.</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-gray-150 dark:border-gray-800 space-y-6">
            {myVisits.map((v) => (
              <div key={v.id} className="relative text-xs">
                {/* dot */}
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-950 bg-indigo-650" />
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-850 dark:text-gray-200">{v.customerName}</span>
                    <span className="text-[10px] text-gray-400">{new Date(v.date).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-500 font-semibold italic text-[11px] shrink-0">"{v.notes}"</p>
                  
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      v.status === 'completed' ? 'bg-green-50 text-green-700 dark:bg-green-950/20' : 
                      v.status === 'payment_collected' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' : 
                      'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                    }`}>{v.status.replace('_', ' ')}</span>
                    <span className="text-[10px] text-gray-400">Purpose: {v.purpose}</span>
                    {v.followUpDate && (
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">
                        Follow-up: {v.followUpDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Visits;
