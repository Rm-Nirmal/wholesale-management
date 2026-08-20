import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  FileText, Search, Printer, Trash2, X, CheckCircle2, AlertCircle, ShoppingCart 
} from 'lucide-react';

export const Invoices: React.FC = () => {
  const { sales, cancelSale, products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const filteredSales = sales.filter(s => {
    const matchesSearch = 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.salesmanName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? s.paymentStatus === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const handleCancelClick = (saleId: string) => {
    if (confirm(`CRITICAL WARNING: Are you sure you want to void invoice ${saleId}? This will reverse the customer outstanding debt, restore product stocks, and log a permanent audit trail. This action is irreversible.`)) {
      const res = cancelSale(saleId);
      if (res.success) {
        setMessage({ type: 'success', text: res.message });
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Billing & Invoices</h2>
          <p className="text-xs text-gray-400">Review sales invoices, payment allocations, print invoices, or void transactions.</p>
        </div>
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

      {/* Filter panel */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 w-full sm:w-80 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 text-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice ID, shop name, salesman..."
            className="flex-1 bg-transparent border-0 outline-none text-gray-950 dark:text-white"
          />
        </div>

        {/* Status filter */}
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-xs w-full sm:w-auto"
        >
          <option value="">All Payment Statuses</option>
          <option value="paid">Paid</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="cancelled">Void / Cancelled</option>
        </select>
      </div>

      {/* Invoice Ledger Table */}
      <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Invoice ID</th>
                <th className="py-2.5">Customer Shop</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Salesman Rep</th>
                <th className="py-2.5 text-right">Invoice Total</th>
                <th className="py-2.5 text-right">Balance Due</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20">
                  <td className="py-3 font-mono font-bold text-gray-800 dark:text-gray-200">{s.id}</td>
                  <td className="py-3 font-semibold text-gray-850 dark:text-gray-200">{s.customerName}</td>
                  <td className="py-3 text-gray-400">{s.date}</td>
                  <td className="py-3 text-gray-500">{s.salesmanName}</td>
                  <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">LKR {s.total.toLocaleString()}</td>
                  <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">LKR {s.balance.toLocaleString()}</td>
                  <td className="py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      s.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 dark:bg-green-950/20' :
                      s.paymentStatus === 'partially_paid' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20' :
                      s.paymentStatus === 'cancelled' ? 'bg-gray-50 text-gray-700 dark:bg-gray-950/20' :
                      'bg-rose-50 text-rose-700 dark:bg-rose-950/20'
                    }`}>{s.paymentStatus.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 text-right space-x-1 whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedInvoice(s)}
                      className="p-1 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-lg"
                      title="Print Preview / Details"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    {s.paymentStatus !== 'cancelled' && (
                      <button 
                        onClick={() => handleCancelClick(s.id)}
                        className="p-1 border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
                        title="Void Invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF PRINT PREVIEW INVOICE DRAWER OVERLAY */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-8 space-y-6 print:p-0 print:border-none print:shadow-none">
            
            {/* Action buttons (hidden on print) */}
            <div className="flex justify-end gap-2 print:hidden pb-4 border-b border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow hover:bg-indigo-700 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Invoice Design */}
            <div className="space-y-6">
              {/* Header: Company + Invoice details */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">W</div>
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">Lanka Agro Distributors</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-xs">
                    42 Main Wholesale Terminal, Welisara, Sri Lanka<br />
                    Phone: +94 11 234 5678 &bull; TIN-98724824A
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Sales Invoice</h3>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{selectedInvoice.id}</p>
                  <span className="text-[10px] text-gray-400 block mt-1">Date Issued: {selectedInvoice.date}</span>
                </div>
              </div>

              {/* Client Address vs Salesman rep */}
              <div className="grid grid-cols-2 gap-4 text-[11px] p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                  <span className="font-bold text-gray-400 uppercase tracking-wide text-[9px] block">Bill To:</span>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{selectedInvoice.customerName}</p>
                  <p className="text-gray-400 leading-snug">Retail client account &bull; Colombo Area</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-gray-400 uppercase tracking-wide text-[9px] block">Sales Representative:</span>
                  <p className="font-bold text-gray-850 dark:text-gray-250">{selectedInvoice.salesmanName}</p>
                  <p className="text-gray-400">Immediate checkout</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-right">Quantity</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {selectedInvoice.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-3 font-semibold text-gray-800 dark:text-gray-200">{item.productName}</td>
                        <td className="py-3 text-right">{item.quantity} units</td>
                        <td className="py-3 text-right">LKR {item.unitPrice.toLocaleString()}</td>
                        <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">LKR {item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Payments summary */}
              <div className="flex flex-col items-end gap-1.5 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
                <div className="flex gap-8 justify-between w-64 text-gray-500 font-medium">
                  <span>Subtotal:</span>
                  <span>LKR {selectedInvoice.subtotal.toLocaleString()}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex gap-8 justify-between w-64 text-rose-500 font-medium">
                    <span>Discount:</span>
                    <span>- LKR {selectedInvoice.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex gap-8 justify-between w-64 text-gray-900 dark:text-white font-bold text-sm border-t border-gray-100 dark:border-gray-800 pt-1.5">
                  <span>Invoice Total:</span>
                  <span>LKR {selectedInvoice.total.toLocaleString()}</span>
                </div>
                <div className="flex gap-8 justify-between w-64 text-emerald-600 font-bold">
                  <span>Amount Cleared:</span>
                  <span>LKR {selectedInvoice.paid.toLocaleString()}</span>
                </div>
                <div className="flex gap-8 justify-between w-64 text-rose-600 font-bold border-t border-dashed border-gray-200 dark:border-gray-800 pt-1">
                  <span>Balance Due:</span>
                  <span>LKR {selectedInvoice.balance.toLocaleString()}</span>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="text-[10px] text-gray-400 text-center pt-8 border-t border-gray-100 dark:border-gray-800">
                Thank you for your business. Terms of payment: 30 days outstanding credit bounds limit. Voided invoices reverse ledger entries immediately.
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
export default Invoices;
