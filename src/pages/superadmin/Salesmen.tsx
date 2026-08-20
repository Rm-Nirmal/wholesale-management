import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Users, Plus, Award, Briefcase, Target, Phone, Mail,
  MapPin, CheckCircle2, AlertTriangle, Eye, ShieldAlert, X
} from 'lucide-react';
import type { User } from '../../types';

export const Salesmen: React.FC = () => {
  const { 
    users, addUser, updateUserStatus, updateUserTargets, 
    customers, visits, sales, payments 
  } = useApp();
  
  const salesmen = users.filter(u => u.role === 'salesman');

  // Modal controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [selectedRep, setSelectedRep] = useState<User | null>(null);

  // Detailed Drawer Controls
  const [detailRep, setDetailRep] = useState<User | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'shops' | 'visits' | 'transactions'>('overview');

  // Form State: Onboard Rep
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-gray-400" /> {customers.filter(c => c.salesmanId === rep.id).length} Customer Shops</span>
                  </div>
                </div>
              </div>

              {/* Target Achievements Metrics */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3.5 space-y-3">
                {/* Sales achievement */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-gray-500 font-semibold">
                    <span>Monthly Sales Quota:</span>
                    <span className="text-indigo-650 dark:text-indigo-400 font-bold">{salesAch.toFixed(1)}% Achieved</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-850 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full animate-pulse-subtle" style={{ width: `${Math.min(100, salesAch)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>LKR {rep.currentSales?.toLocaleString()} Issued</span>
                    <span>Target: LKR {rep.salesTarget?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Collections achievement */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-gray-500 font-semibold">
                    <span>Cash Collections Quota:</span>
                    <span className="text-emerald-600 dark:text-emerald-450 font-bold">{collAch.toFixed(1)}% Achieved</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-850 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full animate-pulse-subtle" style={{ width: `${Math.min(100, collAch)}%` }} />
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
                    setDetailRep(rep);
                    setDetailTab('overview');
                  }}
                  className="mr-auto flex items-center gap-1 px-2.5 py-1.5 border border-indigo-250 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Rep</span>
                </button>
                <button 
                  onClick={() => {
                    setSelectedRep(rep);
                    setTargetForm({ sales: String(rep.salesTarget || 0), collections: String(rep.collectionsTarget || 0) });
                    setShowTargetModal(true);
                  }}
                  className="px-2.5 py-1.5 border border-gray-205 dark:border-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 transition"
                >
                  Configure Quota Targets
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
                    className="px-2.5 py-1.5 border border-green-205 text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition"
                  >
                    Reactivate Rep
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Salesman Detailed Drawer slide-over */}
      {detailRep && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-850 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img src={detailRep.avatar} alt={detailRep.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-gray-800" />
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    {detailRep.name}
                    <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      detailRep.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                    }`}>{detailRep.status}</span>
                  </h3>
                  <p className="text-[10px] text-gray-400">ID: {detailRep.employeeId} &bull; Area: {detailRep.assignedArea || 'Colombo'}</p>
                </div>
              </div>
              <button 
                onClick={() => setDetailRep(null)}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-850 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-850 px-6 bg-gray-50/20 dark:bg-gray-850/40">
              {(['overview', 'shops', 'visits', 'transactions'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`py-3.5 px-4 text-xs font-semibold border-b-2 -mb-px transition capitalize ${
                    detailTab === tab 
                      ? 'border-indigo-650 text-indigo-650 dark:border-indigo-400 dark:text-indigo-400 font-bold' 
                      : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  {tab === 'shops' ? 'Assigned Shops' : tab === 'visits' ? 'Field Visits' : tab === 'transactions' ? 'Ledger Logs' : 'Overview'}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              
              {/* Tab 1: Overview */}
              {detailTab === 'overview' && (
                <div className="space-y-6 text-xs">
                  
                  {/* Quota parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl space-y-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-indigo-500" /> Sales Progress
                      </span>
                      <p className="font-extrabold text-sm text-indigo-650 dark:text-indigo-400">
                        {((detailRep.currentSales || 0) / (detailRep.salesTarget || 1) * 100).toFixed(1)}% Achieved
                      </p>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-605 bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, ((detailRep.currentSales || 0) / (detailRep.salesTarget || 1) * 100))}%` }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                        <span>Issued: LKR {detailRep.currentSales?.toLocaleString()}</span>
                        <span>Goal: LKR {detailRep.salesTarget?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl space-y-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-500" /> Cash Collections
                      </span>
                      <p className="font-extrabold text-sm text-emerald-600 dark:text-emerald-450">
                        {((detailRep.currentCollections || 0) / (detailRep.collectionsTarget || 1) * 100).toFixed(1)}% Achieved
                      </p>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, ((detailRep.currentCollections || 0) / (detailRep.collectionsTarget || 1) * 100))}%` }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                        <span>Collected: LKR {detailRep.currentCollections?.toLocaleString()}</span>
                        <span>Goal: LKR {detailRep.collectionsTarget?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile data cards */}
                  <div className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Representative Contact Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="text-[9px] text-gray-400 block leading-tight">Email Address</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{detailRep.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="text-[9px] text-gray-400 block leading-tight">Mobile Hotline</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">+94 77 123 4567</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Commission panel */}
                  <div className="p-4 border border-indigo-100 dark:border-indigo-950/60 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-905 dark:text-white">Estimated Commissions</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Estimated at 2.0% of current monthly sales checkout volume.</p>
                    </div>
                    <span className="text-sm font-black text-indigo-650 dark:text-indigo-400">LKR {((detailRep.currentSales || 0) * 0.02).toLocaleString()}</span>
                  </div>

                </div>
              )}

              {/* Tab 2: Assigned Shops */}
              {detailTab === 'shops' && (
                <div className="space-y-4 text-xs">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Customer Shops</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-150 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="py-2">Shop Name</th>
                          <th className="py-2">Owner Name</th>
                          <th className="py-2">Outstanding Debt</th>
                          <th className="py-2 text-right">Credit Limit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-850/60">
                        {customers.filter(c => c.salesmanId === detailRep.id).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-gray-400">No shops assigned to this representative.</td>
                          </tr>
                        ) : (
                          customers.filter(c => c.salesmanId === detailRep.id).map(c => (
                            <tr key={c.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-850/10 transition">
                              <td className="py-2.5 font-bold text-indigo-600 dark:text-indigo-455">{c.name}</td>
                              <td className="py-2.5 text-gray-500">{c.ownerName}</td>
                              <td className="py-2.5 font-semibold text-rose-600">LKR {c.outstanding.toLocaleString()}</td>
                              <td className="py-2.5 font-semibold text-gray-700 dark:text-gray-300 text-right">LKR {c.creditLimit.toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Field Visits */}
              {detailTab === 'visits' && (
                <div className="space-y-4 text-xs">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-semibold">On-Field Route timeline</h4>
                  {visits.filter(v => v.salesmanId === detailRep.id).length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">No route visits catalogued for this salesman.</p>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-800 space-y-5">
                      {visits.filter(v => v.salesmanId === detailRep.id).map((v) => (
                        <div key={v.id} className="relative">
                          {/* timeline dot */}
                          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-905 bg-indigo-600" />
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-800 dark:text-gray-200">{v.customerName}</span>
                              <span className="text-[10px] text-gray-400">{new Date(v.date).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-500 font-semibold italic text-[11px]">"{v.notes}"</p>
                            <div className="flex gap-2">
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                v.status === 'completed' ? 'bg-green-50 text-green-700 dark:bg-green-950/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                              }`}>
                                {v.status.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-gray-400">Purpose: {v.purpose}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Ledger Logs */}
              {detailTab === 'transactions' && (
                <div className="space-y-6 text-xs">
                  {/* Sales Section */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Invoices Issued</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-150 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="py-2">Invoice ID</th>
                            <th className="py-2">Date</th>
                            <th className="py-2">Customer</th>
                            <th className="py-2 text-right">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-855/40">
                          {sales.filter(s => s.salesmanId === detailRep.id && s.paymentStatus !== 'cancelled').length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-gray-400">No active invoices issued.</td>
                            </tr>
                          ) : (
                            sales.filter(s => s.salesmanId === detailRep.id && s.paymentStatus !== 'cancelled').map(s => (
                              <tr key={s.id} className="hover:bg-gray-50/20 transition">
                                <td className="py-2 font-bold text-indigo-650 dark:text-indigo-400">{s.id}</td>
                                <td className="py-2 text-gray-500">{s.date}</td>
                                <td className="py-2 text-gray-700 dark:text-gray-300">{s.customerName}</td>
                                <td className="py-2 text-right font-semibold text-gray-950 dark:text-white">LKR {s.total.toLocaleString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payments Section */}
                  <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payments Collected</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-150 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="py-2">Receipt ID</th>
                            <th className="py-2">Date</th>
                            <th className="py-2">Method</th>
                            <th className="py-2 text-right">Collected Amt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-855/40">
                          {payments.filter(p => p.recordedBy === detailRep.name).length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-gray-400">No cash collections logged.</td>
                            </tr>
                          ) : (
                            payments.filter(p => p.recordedBy === detailRep.name).map(p => (
                              <tr key={p.id} className="hover:bg-gray-50/20 transition">
                                <td className="py-2 font-bold text-gray-700 dark:text-gray-300">{p.id}</td>
                                <td className="py-2 text-gray-500">{p.date}</td>
                                <td className="py-2 text-gray-500 capitalize">{p.method.replace('_', ' ')}</td>
                                <td className="py-2 text-right font-semibold text-emerald-600">LKR {p.amount.toLocaleString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

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
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-900 dark:text-white"
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
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Email Address *</label>
                  <input 
                    type="email" 
                    value={addForm.email}
                    onChange={e => setAddForm({...addForm, email: e.target.value})}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-900 dark:text-white"
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
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Sales Target (LKR)</label>
                  <input 
                    type="number" 
                    value={addForm.salesTarget}
                    onChange={e => setAddForm({...addForm, salesTarget: Number(e.target.value)})}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-900 dark:text-white"
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
                  className="w-full p-2 border border-gray-200 dark:border-gray-855 outline-none text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Monthly Collections Target (LKR)</label>
                <input 
                  type="number" 
                  value={targetForm.collections}
                  onChange={e => setTargetForm({...targetForm, collections: e.target.value})}
                  className="w-full p-2 border border-gray-205 outline-none text-gray-900 dark:text-white"
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
