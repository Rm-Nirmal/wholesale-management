import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Search, Plus, CreditCard, DollarSign, Boxes, ShoppingCart, 
  Users, UserPlus, X, Check, AlertCircle, Trash2, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ isOpen, onClose }) => {
  const { 
    customers, sales, products, users, currentUser,
    addCustomer, createSale, createPayment, createExpense, adjustStock, accounts
  } = useApp();

  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'customer' | 'payment' | 'expense' | 'stock' | 'sale'>('search');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modals on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Listen for external command triggers to switch tabs
  useEffect(() => {
    const handleOpenCommand = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tab) {
        setActiveTab(customEvent.detail.tab);
      }
    };
    window.addEventListener('open-command-center', handleOpenCommand);
    return () => window.removeEventListener('open-command-center', handleOpenCommand);
  }, []);

  // Autocomplete search
  const filteredCustomers = query ? customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.ownerName.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query) ||
    c.area.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4) : [];

  const filteredInvoices = query ? sales.filter(s => 
    s.id.toLowerCase().includes(query.toLowerCase()) || 
    s.customerName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4) : [];

  const filteredProducts = query ? products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.id.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4) : [];

  const filteredSalesmen = query ? users.filter(u => 
    u.role === 'salesman' && u.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4) : [];

  // Reset form messages when tab changes
  useEffect(() => {
    setMessage(null);
  }, [activeTab]);

  // Form State 1: New Customer
  const [custForm, setCustForm] = useState({
    name: '', ownerName: '', phone: '', email: '', address: '', area: 'Colombo North', salesmanId: '', creditLimit: 200000
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.name || !custForm.phone || !custForm.ownerName) {
      setMessage({ type: 'error', text: 'Shop name, owner name, and phone are required.' });
      return;
    }
    addCustomer({
      name: custForm.name,
      ownerName: custForm.ownerName,
      phone: custForm.phone,
      email: custForm.email,
      address: custForm.address,
      area: custForm.area,
      salesmanId: custForm.salesmanId || users.filter(u => u.role === 'salesman')[0]?.id || '',
      creditLimit: Number(custForm.creditLimit),
      status: 'active',
      risk: 'low'
    });
    setMessage({ type: 'success', text: `Shop '${custForm.name}' registered successfully!` });
    setCustForm({ name: '', ownerName: '', phone: '', email: '', address: '', area: 'Colombo North', salesmanId: '', creditLimit: 200000 });
  };

  // Form State 2: Record Payment
  const [payForm, setPayForm] = useState({
    customerId: '', invoiceId: '', amount: '', method: 'cash' as any, referenceNumber: '', notes: ''
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
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
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  // Form State 3: Add Expense
  const [expForm, setExpForm] = useState({
    title: '', category: 'office' as any, amount: '', paymentMethod: 'cash' as any, description: '', notes: ''
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.title || !expForm.amount) {
      setMessage({ type: 'error', text: 'Title and amount are required.' });
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
    setMessage({ type: 'success', text: `Expense logged successfully! Status: ${currentUser?.role === 'super_admin' ? 'Approved' : 'Pending Sign-off'}` });
    setExpForm({ title: '', category: 'office', amount: '', paymentMethod: 'cash', description: '', notes: '' });
  };

  // Form State 4: Stock Adjustment
  const [stockForm, setStockForm] = useState({
    productId: '', quantity: '', type: 'adjustment' as any, reason: ''
  });

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockForm.productId || !stockForm.quantity || !stockForm.reason) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    adjustStock(
      stockForm.productId,
      Number(stockForm.quantity),
      stockForm.type,
      'ADJ-' + Math.floor(1000 + Math.random() * 9000),
      stockForm.reason
    );
    setMessage({ type: 'success', text: 'Inventory stock adjusted successfully!' });
    setStockForm({ productId: '', quantity: '', type: 'adjustment', reason: '' });
  };

  // Form State 5: Quick Cash Sale Builder
  const [saleForm, setSaleForm] = useState<{
    customerId: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
    paymentMethod: 'cash' | 'credit';
    notes: string;
  }>({
    customerId: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0 }],
    paymentMethod: 'cash',
    notes: ''
  });

  const handleAddSaleItem = () => {
    setSaleForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleRemoveSaleItem = (idx: number) => {
    if (saleForm.items.length === 1) return;
    setSaleForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const handleSaleItemChange = (idx: number, field: string, val: any) => {
    setSaleForm(prev => {
      const copy = [...prev.items];
      if (field === 'productId') {
        const prod = products.find(p => p.id === val);
        copy[idx] = {
          productId: val,
          quantity: copy[idx].quantity,
          unitPrice: prod ? prod.wholesalePrice : 0
        };
      } else {
        copy[idx] = {
          ...copy[idx],
          [field]: val
        };
      }
      return { ...prev, items: copy };
    });
  };

  const handleQuickSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForm.customerId) {
      setMessage({ type: 'error', text: 'Please select a customer.' });
      return;
    }

    const saleItems = saleForm.items
      .filter(item => item.productId !== '')
      .map(item => {
        const prod = products.find(p => p.id === item.productId)!;
        return {
          productId: item.productId,
          productName: prod.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: 0,
          tax: 0,
          total: Number(item.quantity) * Number(item.unitPrice)
        };
      });

    if (saleItems.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one product.' });
      return;
    }

    const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal;

    // Call state engine createSale
    const res = createSale({
      customerId: saleForm.customerId,
      salesmanId: currentUser?.id || users.filter(u => u.role === 'salesman')[0]?.id || '',
      items: saleItems,
      subtotal,
      discount: 0,
      tax: 0,
      total,
      paid: saleForm.paymentMethod === 'cash' ? total : 0,
      paymentMethod: saleForm.paymentMethod,
      notes: saleForm.notes
    });

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      setSaleForm({ customerId: '', items: [{ productId: '', quantity: 1, unitPrice: 0 }], paymentMethod: 'cash', notes: '' });
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
      <div 
        ref={modalRef}
        className="w-full max-w-2xl border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden max-h-[75vh] flex flex-col transition-all transform scale-100"
      >
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 pt-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <button 
            onClick={() => setActiveTab('search')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
              activeTab === 'search' 
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Search DB
          </button>
          <button 
            onClick={() => setActiveTab('sale')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
              activeTab === 'sale' 
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            + Quick Sale
          </button>
          <button 
            onClick={() => setActiveTab('customer')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
              activeTab === 'customer' 
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            + New Shop
          </button>
          <button 
            onClick={() => setActiveTab('payment')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
              activeTab === 'payment' 
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Record Pay
          </button>
          <button 
            onClick={() => setActiveTab('expense')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
              activeTab === 'expense' 
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Add Expense
          </button>
          <button 
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
              activeTab === 'stock' 
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Adjust Stock
          </button>
          
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-auto mb-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {message && (
          <div className={`flex items-center gap-2.5 p-3 text-xs font-medium border-b ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/60' 
              : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/60'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)} className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* TAB 1: DB SEARCH PANEL */}
        {activeTab === 'search' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <Search className="w-4.5 h-4.5 text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type shop name, owner, area, invoice #, product SKU..."
                className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* Suggestions & Search results */}
            <div className="flex-1 p-4 space-y-5">
              {!query ? (
                <div className="text-center py-8 text-xs text-gray-400 dark:text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                  Search products, shops, invoices, and staff.
                  <p className="mt-1 font-mono text-[10px] text-gray-300 dark:text-gray-600">Quickly locate records instantly</p>
                </div>
              ) : (
                <>
                  {/* Retail Shops Results */}
                  {filteredCustomers.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block px-1">
                        Retail Shops
                      </span>
                      <div className="space-y-0.5">
                        {filteredCustomers.map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => {
                              onClose();
                              // Route based on active role
                              const rolePrefix = currentUser?.role === 'super_admin' ? '/admin' : currentUser?.role === 'accountant' ? '/accountant' : '/salesman';
                              navigate(`${rolePrefix}/customers/${c.id}`);
                            }}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-xs transition cursor-pointer"
                          >
                            <div>
                              <p className="font-bold text-gray-800 dark:text-gray-200">{c.name}</p>
                              <span className="text-[10px] text-gray-400">{c.ownerName} &bull; {c.area}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-white">LKR {c.outstanding.toLocaleString()}</p>
                              <span className="text-[9px] text-gray-400">Credit limit: LKR {c.creditLimit.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Invoices Results */}
                  {filteredInvoices.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block px-1">
                        Invoices
                      </span>
                      <div className="space-y-0.5">
                        {filteredInvoices.map(s => (
                          <div 
                            key={s.id}
                            onClick={() => {
                              onClose();
                              const rolePrefix = currentUser?.role === 'super_admin' ? '/admin' : currentUser?.role === 'accountant' ? '/accountant' : '/salesman';
                              navigate(`${rolePrefix}/sales`);
                            }}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-xs transition cursor-pointer"
                          >
                            <div>
                              <p className="font-bold text-gray-800 dark:text-gray-200">{s.id}</p>
                              <span className="text-[10px] text-gray-400">{s.customerName} &bull; {s.date}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-white">LKR {s.total.toLocaleString()}</p>
                              <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                                s.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
                                s.paymentStatus === 'partially_paid' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                                'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                              }`}>{s.paymentStatus.replace('_', ' ')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Catalog Results */}
                  {filteredProducts.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block px-1">
                        Inventory Products
                      </span>
                      <div className="space-y-0.5">
                        {filteredProducts.map(p => (
                          <div 
                            key={p.id}
                            onClick={() => {
                              onClose();
                              const rPrefix = currentUser?.role === 'super_admin' ? '/admin' : '/accountant';
                              navigate(`${rPrefix}/products`);
                            }}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-xs transition cursor-pointer"
                          >
                            <div>
                              <p className="font-bold text-gray-800 dark:text-gray-200">{p.name}</p>
                              <span className="text-[10px] text-gray-400">SKU: {p.id} &bull; {p.category}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-white">{p.currentStock} {p.unit}</p>
                              <span className="text-[9px] text-gray-400">WS Price: LKR {p.wholesalePrice}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Salesmen Staff Results */}
                  {filteredSalesmen.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block px-1">
                        Sales Representatives
                      </span>
                      <div className="space-y-0.5">
                        {filteredSalesmen.map(u => (
                          <div 
                            key={u.id}
                            onClick={() => {
                              onClose();
                              if (currentUser?.role === 'super_admin') navigate('/admin/salesmen');
                            }}
                            className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-xs transition cursor-pointer"
                          >
                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                            <div className="flex-1">
                              <p className="font-bold text-gray-800 dark:text-gray-200">{u.name}</p>
                              <span className="text-[10px] text-gray-400">Area: {u.assignedArea} &bull; EmpID: {u.employeeId}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {filteredCustomers.length === 0 && filteredInvoices.length === 0 && filteredProducts.length === 0 && filteredSalesmen.length === 0 && (
                    <div className="text-center py-6 text-xs text-gray-400">
                      No matching records found. Try typing another search criteria.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: NEW SHOP CUSTOMER FORM */}
        {activeTab === 'customer' && (
          <form onSubmit={handleCreateCustomer} className="flex-1 overflow-y-auto p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-1 border-b border-gray-100 dark:border-gray-800">
              Register New Retail Shop
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Shop Name *</label>
                <input 
                  type="text" 
                  value={custForm.name}
                  onChange={e => setCustForm({...custForm, name: e.target.value})}
                  placeholder="e.g. Ruwan Retailers"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Owner Name *</label>
                <input 
                  type="text" 
                  value={custForm.ownerName}
                  onChange={e => setCustForm({...custForm, ownerName: e.target.value})}
                  placeholder="e.g. Ruwan Perera"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Phone Contact *</label>
                <input 
                  type="text" 
                  value={custForm.phone}
                  onChange={e => setCustForm({...custForm, phone: e.target.value})}
                  placeholder="077XXXXXXX"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Email Address</label>
                <input 
                  type="email" 
                  value={custForm.email}
                  onChange={e => setCustForm({...custForm, email: e.target.value})}
                  placeholder="shop@domain.lk"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Street Address</label>
              <textarea 
                rows={2}
                value={custForm.address}
                onChange={e => setCustForm({...custForm, address: e.target.value})}
                placeholder="Shop address details..."
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Region Area</label>
                <select 
                  value={custForm.area}
                  onChange={e => setCustForm({...custForm, area: e.target.value})}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value="Colombo North">Colombo North</option>
                  <option value="Colombo South">Colombo South</option>
                  <option value="Negombo">Negombo</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Kandy">Kandy</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Credit Limit (LKR)</label>
                <input 
                  type="number" 
                  value={custForm.creditLimit}
                  onChange={e => setCustForm({...custForm, creditLimit: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Salesman Assigned</label>
                <select 
                  value={custForm.salesmanId}
                  onChange={e => setCustForm({...custForm, salesmanId: e.target.value})}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value="">Select Rep...</option>
                  {users.filter(u => u.role === 'salesman').map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow hover:bg-indigo-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Retail Shop</span>
            </button>
          </form>
        )}

        {/* TAB 3: RECORD CUSTOMER PAYMENT */}
        {activeTab === 'payment' && (
          <form onSubmit={handleRecordPayment} className="flex-1 overflow-y-auto p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-1 border-b border-gray-100 dark:border-gray-800">
              Record Customer Receipt Payment
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
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
                    <option key={c.id} value={c.id}>{c.name} (Bal: LKR {c.outstanding.toLocaleString()})</option>
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

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Amount Paid (LKR) *</label>
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
                  placeholder="Bank Slip # or Cheque #"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Notes / Remarks</label>
              <textarea 
                rows={2}
                value={payForm.notes}
                onChange={e => setPayForm({...payForm, notes: e.target.value})}
                placeholder="Details of collection visit..."
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs shadow hover:bg-emerald-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Record Customer Payment</span>
            </button>
          </form>
        )}

        {/* TAB 4: ADD BUSINESS EXPENSE */}
        {activeTab === 'expense' && (
          <form onSubmit={handleCreateExpense} className="flex-1 overflow-y-auto p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-1 border-b border-gray-100 dark:border-gray-800">
              Log Business Expense Voucher
            </h3>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Expense Title *</label>
                <input 
                  type="text" 
                  value={expForm.title}
                  onChange={e => setExpForm({...expForm, title: e.target.value})}
                  placeholder="e.g. Office electricity bill"
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

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Expense Category</label>
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
                <label className="font-semibold text-gray-600 dark:text-gray-400">Payment Out Account</label>
                <select 
                  value={expForm.paymentMethod}
                  onChange={e => setExpForm({...expForm, paymentMethod: e.target.value as any})}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value="cash">Office Cash Vault</option>
                  <option value="bank_transfer">Bank Current Account</option>
                  <option value="card">Card (Transit Account)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Description</label>
              <textarea 
                rows={2}
                value={expForm.description}
                onChange={e => setExpForm({...expForm, description: e.target.value})}
                placeholder="Reason or breakdown details of expense..."
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-rose-600 text-white font-semibold text-xs shadow hover:bg-rose-700 transition"
            >
              <DollarSign className="w-4 h-4" />
              <span>Log Expense Voucher</span>
            </button>
          </form>
        )}

        {/* TAB 5: ADJUST PRODUCT INVENTORY */}
        {activeTab === 'stock' && (
          <form onSubmit={handleAdjustStock} className="flex-1 overflow-y-auto p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-1 border-b border-gray-100 dark:border-gray-800">
              Adjust Catalog Stock Level
            </h3>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Select Product Item *</label>
                <select 
                  value={stockForm.productId}
                  onChange={e => setStockForm({...stockForm, productId: e.target.value})}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  required
                >
                  <option value="">Select Item...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock} {p.unit})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Adj Qty (+/-) *</label>
                <input 
                  type="number" 
                  value={stockForm.quantity}
                  onChange={e => setStockForm({...stockForm, quantity: e.target.value})}
                  placeholder="e.g. -10 or +50"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Adjustment Action</label>
                <select 
                  value={stockForm.type}
                  onChange={e => setStockForm({...stockForm, type: e.target.value as any})}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value="adjustment">General Correction</option>
                  <option value="purchase">Stock Intake Purchase</option>
                  <option value="return">Customer Goods Return</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Adjustment Reason *</label>
                <input 
                  type="text" 
                  value={stockForm.reason}
                  onChange={e => setStockForm({...stockForm, reason: e.target.value})}
                  placeholder="e.g. Broken packaging / count mistake"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-amber-600 text-white font-semibold text-xs shadow hover:bg-amber-700 transition"
            >
              <Boxes className="w-4 h-4" />
              <span>Correct Inventory Stock</span>
            </button>
          </form>
        )}

        {/* TAB 6: QUICK SALE / INVOICE CREATION */}
        {activeTab === 'sale' && (
          <form onSubmit={handleQuickSaleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-1 border-b border-gray-100 dark:border-gray-800">
              Create Direct Sale Invoice
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Customer Shop *</label>
                <select 
                  value={saleForm.customerId}
                  onChange={e => setSaleForm({...saleForm, customerId: e.target.value})}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  required
                >
                  <option value="">Select Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Credit: LKR {(c.creditLimit - c.outstanding).toLocaleString()} Avail)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Payment Terms</label>
                <select 
                  value={saleForm.paymentMethod}
                  onChange={e => setSaleForm({...saleForm, paymentMethod: e.target.value as any})}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value="cash">Cash (Immediate Collection)</option>
                  <option value="credit">Credit Purchase (Against Limits)</option>
                </select>
              </div>
            </div>

            {/* Sales Invoice Lines Builder */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                <span className="font-semibold text-gray-600 dark:text-gray-400">Invoice Items</span>
                <button 
                  type="button" 
                  onClick={handleAddSaleItem}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  + Add Line Item
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {saleForm.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select 
                      value={item.productId}
                      onChange={e => handleSaleItemChange(idx, 'productId', e.target.value)}
                      className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none truncate"
                      required
                    >
                      <option value="">Choose Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
                      ))}
                    </select>
                    
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      placeholder="Qty"
                      onChange={e => handleSaleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="w-16 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                      required
                    />

                    <input 
                      type="number" 
                      value={item.unitPrice}
                      placeholder="Price"
                      onChange={e => handleSaleItemChange(idx, 'unitPrice', Number(e.target.value))}
                      className="w-24 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                      required
                    />

                    <button 
                      type="button" 
                      onClick={() => handleRemoveSaleItem(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Total invoice block */}
            <div className="flex justify-between items-center text-xs font-semibold bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Aggregate Net Amount:</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                LKR {saleForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Delivery Notes</label>
              <input 
                type="text" 
                value={saleForm.notes}
                onChange={e => setSaleForm({...saleForm, notes: e.target.value})}
                placeholder="e.g. Deliver before noon"
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow hover:bg-indigo-700 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Checkout Sales Invoice</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default CommandCenter;
