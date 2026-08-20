import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  ShieldAlert, Check, X, AlertTriangle, AlertCircle, 
  Trash2, UserCheck, ShieldCheck, TrendingUp, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ControlCenter: React.FC = () => {
  const { 
    approvals, resolveApprovalRequest, customers, products, auditLogs, 
    updateCustomer, updateCreditLimit 
  } = useApp();

  const pendingApprovals = approvals.filter(a => a.status === 'pending');

  // Customer Credit Risk list
  const riskShops = customers.filter(c => {
    const utilization = c.creditLimit > 0 ? (c.outstanding / c.creditLimit) * 100 : 0;
    return c.status === 'blocked' || utilization >= 80 || c.overdueAmount > 0;
  });

  // Low stock products
  const lowStockItems = products.filter(p => p.currentStock <= p.minStock);

  // Recent timeline logs
  const recentLogs = auditLogs.slice(0, 6);

  // Quick Action block customer
  const toggleCustomerBlock = (customerId: string, block: boolean) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      updateCustomer({
        ...customer,
        status: block ? 'blocked' : 'active'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Business Control Desk</h2>
        <p className="text-xs text-gray-400">Owner operations room. Review authorizations, risk thresholds, alerts, and access logs.</p>
      </div>

      {/* Grid: Main control panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Center Column: Approvals and Alerts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Pending Authorizations */}
          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Pending Authorizations</h4>
                <p className="text-[10px] text-gray-400">Action items requiring explicit owner override approvals.</p>
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  No authorization requests pending. All transactions approved.
                </div>
              ) : (
                pendingApprovals.map(req => (
                  <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {req.type === 'credit_override' ? 'Credit Override Limit Override' : 
                           req.type === 'credit_increase' ? 'Credit Threshold Adjustment' : 
                           'Expense Sign-off Request'}
                        </span>
                        <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full uppercase">
                          {req.id}
                        </span>
                      </div>
                      <p className="text-gray-500">{req.details.explanation}</p>
                      <span className="text-[10px] text-gray-400 block">Requested by: {req.requestedBy} &bull; {new Date(req.requestDate).toLocaleString()}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => resolveApprovalRequest(req.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button 
                        onClick={() => resolveApprovalRequest(req.id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: High Credit Risk Indicators */}
          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Credit Risk Controls</h4>
                <p className="text-[10px] text-gray-400">Stores near/exceeding credit boundaries or carrying overdue debt.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2">Shop Name</th>
                    <th className="py-2">Utilization</th>
                    <th className="py-2">Overdue Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
                  {riskShops.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400">All customer portfolios reside inside safety parameters.</td>
                    </tr>
                  ) : (
                    riskShops.map(c => {
                      const util = c.creditLimit > 0 ? (c.outstanding / c.creditLimit) * 100 : 0;
                      return (
                        <tr key={c.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20">
                          <td className="py-3">
                            <Link to={`/admin/customers/${c.id}`} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">{c.name}</Link>
                            <span className="text-[9px] text-gray-400 block">{c.ownerName} &bull; {c.area}</span>
                          </td>
                          <td className="py-3">
                            <span className={`font-semibold ${util >= 90 ? 'text-rose-600' : 'text-amber-500'}`}>
                              {util.toFixed(1)}% Used
                            </span>
                            <span className="text-[9px] text-gray-400 block">Bal: LKR {c.outstanding.toLocaleString()}</span>
                          </td>
                          <td className="py-3 font-semibold text-rose-500">LKR {c.overdueAmount.toLocaleString()}</td>
                          <td className="py-3">
                            <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              c.status === 'blocked' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                            }`}>{c.status}</span>
                          </td>
                          <td className="py-3 text-right">
                            {c.status === 'blocked' ? (
                              <button 
                                onClick={() => toggleCustomerBlock(c.id, false)}
                                className="px-2.5 py-1 text-[10px] font-semibold border border-green-200 text-green-600 dark:border-green-900 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition"
                              >
                                Enable Credit
                              </button>
                            ) : (
                              <button 
                                onClick={() => toggleCustomerBlock(c.id, true)}
                                className="px-2.5 py-1 text-[10px] font-semibold border border-rose-200 text-rose-600 dark:border-rose-900 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                              >
                                Block Account
                              </button>
                            )}
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

        {/* Right Column: Alerts & Audit Timelines */}
        <div className="space-y-6">
          
          {/* Low Stock alarms */}
          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Low Stock Inventory</h4>
            </div>

            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">All product quantities reside above minimum thresholds.</p>
              ) : (
                lowStockItems.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-250">{p.name}</p>
                      <span className="text-[10px] text-gray-400">SKU: {p.id}</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20">
                        {p.currentStock} {p.unit}
                      </span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">Min threshold: {p.minStock}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Audit Logs Quick Feed */}
          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Security Timeline feed</h4>
            </div>

            <div className="relative pl-4 border-l border-gray-100 dark:border-gray-800 space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="relative text-xs">
                  {/* dot */}
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-white dark:border-gray-950 bg-indigo-500" />
                  
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-700 dark:text-gray-300">{log.action}</p>
                    <p className="text-[10px] text-gray-500">{log.record}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
                      <span>By: {log.user}</span>
                      <span>&bull;</span>
                      <span>{new Date(log.date).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link 
              to="/admin/audit-logs" 
              className="block text-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-2 border-t border-gray-100 dark:border-gray-800"
            >
              View Full Security Audit Logs &rarr;
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
export default ControlCenter;
