import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Users, Plus, Award, Briefcase, Target, Phone, 
  MapPin, CheckCircle2, AlertTriangle, Eye, ShieldAlert, X
} from 'lucide-react';
import type { User } from '../../types';

export const Salesmen: React.FC = () => {
  const { users, addUser, updateUserStatus, updateUserTargets } = useApp();
  const salesmen = users.filter(u => u.role === 'salesman');

  // Modal controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [selectedRep, setSelectedRep] = useState<User | null>(null);

  // Form State: Add Rep
  const [addForm, setAddForm] = useState({
    name: '', email: '', employeeId: '', assignedArea: '', salesTarget: 2000000, collectionsTarget: 1800000
  });

  // Form State: Target Edit
  const [targetForm, setTargetForm] = useState({
    sales: '', collections: ''
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.employeeId || !addForm.email) return;
    addUser({
      name: addForm.name,
      email: addForm.email,
      role: 'salesman',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      employeeId: addForm.employeeId,
      assignedArea: addForm.assignedArea || 'Colombo Central',
      salesTarget: Number(addForm.salesTarget),
      collectionsTarget: Number(addForm.collectionsTarget),
      status: 'active'
    });
    setShowAddModal(false);
    setAddForm({ name: '', email: '', employeeId: '', assignedArea: '', salesTarget: 2000000, collectionsTarget: 1800000 });
  };

  const handleTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRep) return;
    updateUserTargets(selectedRep.id, Number(targetForm.sales), Number(targetForm.collections));
    setShowTargetModal(false);
    setSelectedRep(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Sales Force Management</h2>
          <p className="text-xs text-gray-400">Audit sales targets, cash collection performances, region allocations, and accounts activity.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow hover:bg-indigo-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Onboard Sales Rep</span>
        </button>
      </div>

      {/* Grid: Salesmen profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {salesmen.map((rep) => {
          const salesAch = rep.salesTarget && rep.salesTarget > 0 ? ((rep.currentSales || 0) / rep.salesTarget) * 100 : 0;
          const collAch = rep.collectionsTarget && rep.collectionsTarget > 0 ? ((rep.currentCollections || 0) / rep.collectionsTarget) * 100 : 0;

          return (
            <div key={rep.id} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
              
              {/* Header profile block */}
              <div className="flex items-start gap-4">
                <img src={rep.avatar} alt={rep.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-gray-800" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">{rep.name}</h3>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      rep.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
                      rep.status === 'suspended' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20' : 'bg-gray-50 text-gray-700 dark:bg-gray-950/20'
                    }`}>{rep.status}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">ID: {rep.employeeId} &bull; Joined: {rep.joinedDate}</p>
                  
                  <div className="flex gap-4 mt-2 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> {rep.assignedArea || 'Not Assigned'}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-gray-400" /> {rep.assignedCustomers?.length || 0} Customer Shops</span>
                  </div>
                </div>
              </div>

              {/* Target Achievements Metrics */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3.5 space-y-3">
                {/* Sales achievement */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-gray-500 font-semibold">
                    <span>Monthly Sales Quota:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{salesAch.toFixed(1)}% Achieved</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-850 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, salesAch)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>LKR {rep.currentSales?.toLocaleString()} Collected</span>
                    <span>Target: LKR {rep.salesTarget?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Collections achievement */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-gray-500 font-semibold">
                    <span>Cash Collections Quota:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{collAch.toFixed(1)}% Achieved</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-850 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, collAch)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>LKR {rep.currentCollections?.toLocaleString()} Collected</span>
                    <span>Target: LKR {rep.collectionsTarget?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Control Action Toolbar */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px] font-bold">
                <button 
                  onClick={() => {
                    setSelectedRep(rep);
                    setTargetForm({ sales: String(rep.salesTarget || 0), collections: String(rep.collectionsTarget || 0) });
                    setShowTargetModal(true);
                  }}
                  className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 transition"
                >
                  Configure Quota Quotas
                </button>
                {rep.status === 'active' ? (
                  <button 
                    onClick={() => updateUserStatus(rep.id, 'suspended')}
                    className="px-2.5 py-1.5 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                  >
                    Suspend Rep
                  </button>
                ) : (
                  <button 
                    onClick={() => updateUserStatus(rep.id, 'active')}
                    className="px-2.5 py-1.5 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition"
                  >
                    Reactivate Rep
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL 1: Onboard Rep */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Onboard Sales Rep</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Employee Full Name *</label>
                <input 
                  type="text" 
                  value={addForm.name}
                  onChange={e => setAddForm({...addForm, name: e.target.value})}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Employee ID *</label>
                  <input 
                    type="text" 
                    value={addForm.employeeId}
                    onChange={e => setAddForm({...addForm, employeeId: e.target.value})}
                    placeholder="e.g. EMP-005"
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Email Address *</label>
                  <input 
                    type="email" 
                    value={addForm.email}
                    onChange={e => setAddForm({...addForm, email: e.target.value})}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Assigned Area</label>
                  <input 
                    type="text" 
                    value={addForm.assignedArea}
                    onChange={e => setAddForm({...addForm, assignedArea: e.target.value})}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Sales Target (LKR)</label>
                  <input 
                    type="number" 
                    value={addForm.salesTarget}
                    onChange={e => setAddForm({...addForm, salesTarget: Number(e.target.value)})}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                  />
                </div>
              </div>

              <button type="submit" className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
                Register New Sales Rep
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Target Quotas */}
      {showTargetModal && selectedRep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Configure Quota Targets</h3>
              <button onClick={() => { setShowTargetModal(false); setSelectedRep(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTargetSubmit} className="space-y-4 text-xs">
              <p className="text-gray-500 font-semibold mb-2">Adjust targets for: {selectedRep.name}</p>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Monthly Sales Target (LKR)</label>
                <input 
                  type="number" 
                  value={targetForm.sales}
                  onChange={e => setTargetForm({...targetForm, sales: e.target.value})}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Monthly Collections Target (LKR)</label>
                <input 
                  type="number" 
                  value={targetForm.collections}
                  onChange={e => setTargetForm({...targetForm, collections: e.target.value})}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                  required
                />
              </div>

              <button type="submit" className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
                Apply Performance Quotas
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Salesmen;
