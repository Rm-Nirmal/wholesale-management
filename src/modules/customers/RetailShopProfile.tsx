import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { 
  ArrowLeft, Phone, MapPin, Mail, User, ShieldAlert, 
  CreditCard, Calendar, Plus, FileText, CheckCircle2, 
  AlertCircle, Upload, Send, Printer, Edit3, X
} from 'lucide-react';
import type { Customer, Sale, Payment } from '../../types';

export const RetailShopProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    customers, sales, payments, creditHistory, visits, approvals, currentUser,
    updateCreditLimit, createApprovalRequest, createPayment, createSale, uploadCustomerDocument
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'payments' | 'credit' | 'statement' | 'activity' | 'documents'>('overview');
  
  // Modals inside profile
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const [limitReason, setLimitReason] = useState('');
  const [limitError, setLimitError] = useState('');
  const [limitSuccess, setLimitSuccess] = useState('');

  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState('');

  // Find customer
  const customer = customers.find(c => c.id === id);

  if (!customer) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Customer Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">The retail shop profile you are looking for does not exist or has been archived.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  // Filter transaction histories for this customer
  const customerSales = sales.filter(s => s.customerId === customer.id && s.paymentStatus !== 'cancelled');
  const customerPayments = payments.filter(p => p.customerId === customer.id);
  const customerCreditHistory = creditHistory.filter(h => h.customerId === customer.id);
  const customerVisits = visits.filter(v => v.customerId === customer.id);

  // Financial calculations
  const totalPurchases = customerSales.reduce((sum, s) => sum + s.total, 0);
  const totalPayments = customerPayments.reduce((sum, p) => sum + p.amount, 0);
  const availableCredit = customer.creditLimit - customer.outstanding;
  const utilizationRate = customer.creditLimit > 0 ? (customer.outstanding / customer.creditLimit) * 100 : 0;

  // Compile Running Ledger Statement
  //opening balance: 0. chronological merging of invoices and payments.
  const getStatementLines = () => {
    interface StatementLine {
      date: string;
      reference: string;
      description: string;
      debit: number; // Invoices increase outstanding
      credit: number; // Payments reduce outstanding
      balance: number;
    }

    const lines: StatementLine[] = [];
    
    // Convert Invoices
    customerSales.forEach(s => {
      lines.push({
        date: s.date,
        reference: s.id,
        description: `Invoice: ${s.items.map(i => `${i.productName} (x${i.quantity})`).slice(0, 2).join(', ')}`,
        debit: s.total,
        credit: 0,
        balance: 0
      });
    });

    // Convert Payments
    customerPayments.forEach(p => {
      lines.push({
        date: p.date,
        reference: p.id,
        description: `Payment: ${p.method.replace('_', ' ').toUpperCase()} ref ${p.referenceNumber}`,
        debit: 0,
        credit: p.amount,
        balance: 0
      });
    });

    // Sort chronologically
    lines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balances
    let runningBal = 0;
    const finalLines = lines.map(line => {
      runningBal = runningBal + line.debit - line.credit;
      return {
        ...line,
        balance: runningBal
      };
    });

    return finalLines;
  };

  const statementLines = getStatementLines();

  // Handle Credit Limit adjustments with role checks
  const handleLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLimitError('');
    setLimitSuccess('');

    const targetLimitVal = Number(newLimit);
    if (isNaN(targetLimitVal) || targetLimitVal <= 0) {
      setLimitError('Please enter a valid credit limit amount.');
      return;
    }

    if (!limitReason) {
      setLimitError('A business justification reason is required.');
      return;
    }

    if (currentUser?.role === 'super_admin') {
      // Direct update
      const res = updateCreditLimit(customer.id, targetLimitVal, limitReason);
      if (res.success) {
        setLimitSuccess(`Credit limit updated to LKR ${targetLimitVal.toLocaleString()}!`);
        setTimeout(() => {
          setShowLimitModal(false);
          setNewLimit('');
          setLimitReason('');
          setLimitSuccess('');
        }, 1500);
      } else {
        setLimitError(res.message);
      }
    } else {
      // Salesman or Accountant: Create authorization override request
      createApprovalRequest(
        'credit_increase', 
        `Request to adjust ${customer.name} credit limit from LKR ${customer.creditLimit.toLocaleString()} to LKR ${targetLimitVal.toLocaleString()}`,
        {
          customerId: customer.id,
          customerName: customer.name,
          limitRequested: targetLimitVal,
          explanation: limitReason
        }
      );
      setLimitSuccess('Override request submitted to Super Admin for authorization.');
      setTimeout(() => {
        setShowLimitModal(false);
        setNewLimit('');
        setLimitReason('');
        setLimitSuccess('');
      }, 1500);
    }
  };

  // Upload Document Simulation
  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;
    uploadCustomerDocument(customer.id, docName);
    setDocName('');
    setShowDocModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{customer.name}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                customer.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
                customer.status === 'inactive' ? 'bg-gray-50 text-gray-700 dark:bg-gray-950/20 dark:text-gray-400' :
                'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
              }`}>
                {customer.status.toUpperCase()}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                customer.risk === 'low' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400' :
                customer.risk === 'medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
              }`}>
                {customer.risk.toUpperCase()} RISK
              </span>
            </div>
            <p className="text-xs text-gray-400">ID: {customer.id} &bull; Area: {customer.area}</p>
          </div>
        </div>

        {/* Profile Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setShowLimitModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Adjust credit</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Grid: 360 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Outstanding Balance */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Outstanding Debt</span>
          <p className="text-lg font-black text-rose-600 dark:text-rose-500">LKR {customer.outstanding.toLocaleString()}</p>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
            <span>Overdue Amount:</span>
            <span className="font-bold text-rose-500">LKR {customer.overdueAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Available Credit limit */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Available Credit</span>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-500">LKR {availableCredit.toLocaleString()}</p>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
            <span>Limit Threshold:</span>
            <span className="font-bold">LKR {customer.creditLimit.toLocaleString()}</span>
          </div>
        </div>

        {/* Total Purchasing Volume */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sales Volume</span>
          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">LKR {totalPurchases.toLocaleString()}</p>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
            <span>Sales Orders:</span>
            <span className="font-bold">{customerSales.length} Invoices</span>
          </div>
        </div>

        {/* Total Payments Collected */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Collections</span>
          <p className="text-lg font-black text-sky-600 dark:text-sky-500">LKR {totalPayments.toLocaleString()}</p>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
            <span>Receipts:</span>
            <span className="font-bold">{customerPayments.length} Payments</span>
          </div>
        </div>
      </div>

      {/* Credit limit utilization bar */}
      <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-gray-500">Credit utilization status</span>
          <span className={`font-bold ${
            utilizationRate >= 90 ? 'text-rose-500' : utilizationRate >= 75 ? 'text-amber-500' : 'text-emerald-500'
          }`}>{utilizationRate.toFixed(1)}% Credit Used</span>
        </div>
        
        {/* Progress rail */}
        <div className="w-full h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
          <div 
            className={`h-full transition-all duration-500 ${
              utilizationRate >= 90 ? 'bg-rose-500' : utilizationRate >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, utilizationRate)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
          <span>Outstanding balance: LKR {customer.outstanding.toLocaleString()}</span>
          <span>Approved limit: LKR {customer.creditLimit.toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Contact Sidebar Drawer Card */}
        <div className="w-full md:w-80 shrink-0 space-y-4">
          <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 pb-1 border-b border-gray-50 dark:border-gray-800">
              Shop Dossier Profile
            </h4>
            
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-gray-400 block leading-tight">Proprietor Name</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{customer.ownerName}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-gray-400 block leading-tight">Mobile Contact</span>
                  <a href={`tel:${customer.phone}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">{customer.phone}</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-gray-400 block leading-tight">Email Address</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 truncate block max-w-[180px]">{customer.email || 'N/A'}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-gray-400 block leading-tight">Delivery Address</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{customer.address || 'N/A'}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-gray-400 block leading-tight">Last Invoice Delivery</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{customer.lastPurchaseDate || 'Never'}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-gray-400 block leading-tight">Last Payment Cleared</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{customer.lastPaymentDate || 'Never'}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Tab Details content */}
        <div className="flex-1 min-w-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col">
          {/* Tab Navigation header */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 overflow-x-auto whitespace-nowrap bg-gray-50/20 dark:bg-gray-900/20 rounded-t-2xl">
            {(['overview', 'sales', 'payments', 'credit', 'statement', 'activity', 'documents'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 px-4 text-xs font-semibold border-b-2 -mb-px transition capitalize ${
                  activeTab === tab 
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Body */}
          <div className="p-6 flex-1 overflow-y-auto">
            
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 border border-indigo-100 dark:border-indigo-950 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/20 text-xs">
                  <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white mb-0.5">360° Financial Diagnostics</h5>
                    <p className="text-gray-500">Shop utilization is currently rated as <span className="font-bold uppercase">{customer.risk} risk</span>. Repayment window averages 12 days post invoice dispatch.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Quick Actions & Workflows</h4>
                  <p className="text-[11px] text-gray-400 mb-4">Launch customer actions directly linked to this shop profile.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/40 dark:bg-gray-900/40 space-y-2 text-xs">
                      <p className="font-bold text-gray-800 dark:text-gray-200">Register Credit Overrides</p>
                      <p className="text-[10px] text-gray-400">If customer credit limits are blocked or exceeded, file a Super Admin approval override request.</p>
                      <button 
                        onClick={() => setShowLimitModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-[10px] hover:bg-indigo-700 transition"
                      >
                        Adjust Credit Limit
                      </button>
                    </div>

                    <div className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/40 dark:bg-gray-900/40 space-y-2 text-xs">
                      <p className="font-bold text-gray-800 dark:text-gray-200">Submit Customer KYC Document</p>
                      <p className="text-[10px] text-gray-400">Upload business registry forms, identification documents, and financial certificates.</p>
                      <button 
                        onClick={() => setShowDocModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-[10px] hover:bg-indigo-700 transition"
                      >
                        Upload Documents
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SALES TAB */}
            {activeTab === 'sales' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5">Invoice ID</th>
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Items</th>
                        <th className="py-2.5">Invoice Amt</th>
                        <th className="py-2.5">Balance</th>
                        <th className="py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
                      {customerSales.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400">No active invoices linked to this customer.</td>
                        </tr>
                      ) : (
                        customerSales.map(s => (
                          <tr key={s.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition-colors">
                            <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">{s.id}</td>
                            <td className="py-3 text-gray-500">{s.date}</td>
                            <td className="py-3 text-gray-600 dark:text-gray-300 max-w-[150px] truncate">
                              {s.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                            </td>
                            <td className="py-3 font-semibold text-gray-800 dark:text-gray-200">LKR {s.total.toLocaleString()}</td>
                            <td className="py-3 font-semibold text-gray-800 dark:text-gray-200">LKR {s.balance.toLocaleString()}</td>
                            <td className="py-3">
                              <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                s.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
                                s.paymentStatus === 'partially_paid' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                                'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                              }`}>{s.paymentStatus.replace('_', ' ').toUpperCase()}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5">Receipt ID</th>
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Allocation</th>
                        <th className="py-2.5">Method</th>
                        <th className="py-2.5">Reference</th>
                        <th className="py-2.5 text-right">Amount Collected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
                      {customerPayments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400">No payment receipts catalogued.</td>
                        </tr>
                      ) : (
                        customerPayments.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition-colors">
                            <td className="py-3 font-bold text-gray-800 dark:text-gray-200">{p.id}</td>
                            <td className="py-3 text-gray-500">{p.date}</td>
                            <td className="py-3 text-gray-600 dark:text-gray-300 font-medium">
                              {p.invoiceId ? `Invoice: ${p.invoiceId}` : 'FIFO General Outstanding'}
                            </td>
                            <td className="py-3 text-gray-500 capitalize">{p.method.replace('_', ' ')}</td>
                            <td className="py-3 text-gray-500 font-mono">{p.referenceNumber}</td>
                            <td className="py-3 font-bold text-emerald-600 dark:text-emerald-500 text-right">LKR {p.amount.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CREDIT HISTORY TAB */}
            {activeTab === 'credit' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5">Authorized User</th>
                        <th className="py-2.5">Adjustment Date</th>
                        <th className="py-2.5 text-right">Previous Limit</th>
                        <th className="py-2.5 text-right">Modified Limit</th>
                        <th className="py-2.5 pl-6">Justification Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
                      {customerCreditHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-400">No credit limits modifications logged.</td>
                        </tr>
                      ) : (
                        customerCreditHistory.map(h => (
                          <tr key={h.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition-colors">
                            <td className="py-3 font-bold text-gray-800 dark:text-gray-200">{h.changedBy}</td>
                            <td className="py-3 text-gray-500">{new Date(h.date).toLocaleDateString()}</td>
                            <td className="py-3 text-right font-medium text-gray-500">LKR {h.oldLimit.toLocaleString()}</td>
                            <td className="py-3 text-right font-bold text-gray-900 dark:text-white">LKR {h.newLimit.toLocaleString()}</td>
                            <td className="py-3 pl-6 text-gray-600 dark:text-gray-400 max-w-sm truncate">{h.reason}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ledger Running STATEMENT TAB */}
            {activeTab === 'statement' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">Ledger Statement Sheet</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">Calculated from dynamic invoice debit entries and receipt payment credits.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Running Balance</span>
                    <span className="text-sm font-black text-rose-600 dark:text-rose-500">LKR {customer.outstanding.toLocaleString()}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Reference ID</th>
                        <th className="py-2.5">Description</th>
                        <th className="py-2.5 text-right">Debit (+)</th>
                        <th className="py-2.5 text-right">Credit (-)</th>
                        <th className="py-2.5 text-right font-bold text-gray-900 dark:text-white">Ledger Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
                      {statementLines.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400">Statement is currently blank. No posted transactions.</td>
                        </tr>
                      ) : (
                        statementLines.map((line, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition-colors font-mono">
                            <td className="py-3 text-gray-500">{line.date}</td>
                            <td className="py-3 font-semibold text-gray-700 dark:text-gray-300">{line.reference}</td>
                            <td className="py-3 text-gray-600 dark:text-gray-400 font-sans max-w-[200px] truncate">{line.description}</td>
                            <td className="py-3 text-right font-medium text-rose-600">{line.debit > 0 ? `LKR ${line.debit.toLocaleString()}` : '-'}</td>
                            <td className="py-3 text-right font-medium text-emerald-600">{line.credit > 0 ? `LKR ${line.credit.toLocaleString()}` : '-'}</td>
                            <td className="py-3 text-right font-bold text-gray-900 dark:text-white">LKR {line.balance.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ACTIVITY VISITS TAB */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Salesman Check-in Timeline</h4>
                
                {customerVisits.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-400">No field activities recorded for this retail store.</div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-800 space-y-6">
                    {customerVisits.map((visit, idx) => (
                      <div key={visit.id} className="relative">
                        {/* Timeline Node dot */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-950 bg-indigo-600" />
                        
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-800 dark:text-gray-200">Visited by {visit.salesmanName}</span>
                            <span className="text-[10px] text-gray-400">{new Date(visit.date).toLocaleString()}</span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 italic">"{visit.notes}"</p>
                          
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                              visit.status === 'completed' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
                              visit.status === 'payment_collected' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                              'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                            }`}>{visit.status.replace('_', ' ').toUpperCase()}</span>

                            {visit.followUpDate && (
                              <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">
                                Follow up due: {visit.followUpDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Customer KYC files</h4>
                  <button 
                    onClick={() => setShowDocModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold shadow hover:bg-indigo-700 transition"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Document</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {customer.documents.length === 0 ? (
                    <div className="col-span-2 text-center py-6 text-xs text-gray-400">No files uploaded. Submit BR certificate copies above.</div>
                  ) : (
                    customer.documents.map(doc => (
                      <div key={doc.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/40 dark:bg-gray-900/40 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{doc.name}</p>
                            <span className="text-[9px] text-gray-400">Uploaded {doc.uploadedAt}</span>
                          </div>
                        </div>
                        <a href="#" onClick={(e) => { e.preventDefault(); alert(`Downloading simulated ${doc.name}`); }} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                          Download
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* MODAL 1: Adjust Credit limit */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Adjust Shop Credit Limit
              </h3>
              <button onClick={() => setShowLimitModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {limitError && (
              <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-600 text-xs font-medium border border-rose-100 dark:border-rose-900/50 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{limitError}</span>
              </div>
            )}

            {limitSuccess && (
              <div className="p-2.5 rounded bg-green-50 dark:bg-green-950/20 text-green-600 text-xs font-medium border border-green-100 dark:border-green-900/50 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{limitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleLimitSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-850">
                <p className="text-gray-500">Current Credit Limit: <span className="font-bold text-gray-900 dark:text-white">LKR {customer.creditLimit.toLocaleString()}</span></p>
                <p className="text-gray-500">Outstanding Balance: <span className="font-bold text-gray-900 dark:text-white">LKR {customer.outstanding.toLocaleString()}</span></p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Target Credit Limit (LKR)</label>
                <input 
                  type="number" 
                  value={newLimit}
                  onChange={e => setNewLimit(e.target.value)}
                  placeholder="e.g. 600000"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Business Justification Reason</label>
                <textarea 
                  rows={3}
                  value={limitReason}
                  onChange={e => setLimitReason(e.target.value)}
                  placeholder="e.g. Increased purchasing capacity due to festival orders."
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full p-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
              >
                {currentUser?.role === 'super_admin' ? 'Commit Credit Limit Change' : 'File Authorization Override Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Upload Documents */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Upload KYC Documents
              </h3>
              <button onClick={() => setShowDocModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDocSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Document Type / Name</label>
                <input 
                  type="text" 
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  placeholder="e.g. Trade License 2026.pdf"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>

              <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center text-gray-400 cursor-pointer hover:border-indigo-400 hover:text-indigo-400 dark:hover:border-indigo-600 transition flex flex-col items-center gap-2">
                <Upload className="w-8 h-8" />
                <span className="font-semibold text-xs">Select business document file to upload</span>
                <span className="text-[10px] text-gray-500">PDF, PNG, JPEG up to 10MB supported</span>
              </div>

              <button 
                type="submit"
                className="w-full p-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
              >
                Upload Document Log
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default RetailShopProfile;
