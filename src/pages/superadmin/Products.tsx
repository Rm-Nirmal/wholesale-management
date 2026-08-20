import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Boxes, Plus, AlertCircle, TrendingUp, DollarSign, 
  Settings, ArrowDown, Edit3, X, RefreshCw
} from 'lucide-react';

export const Products: React.FC = () => {
  const { products, addProduct, updateProduct, adjustStock, stockMovements } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Form State: Add Product
  const [addForm, setAddForm] = useState({
    name: '', category: 'Rice & Grains', brand: '', description: '', unit: 'kg',
    purchasePrice: '', wholesalePrice: '', retailPrice: '', minSellingPrice: '', minStock: '100'
  });

  // Form State: Adjust stock
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('');

  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? p.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.purchasePrice || !addForm.wholesalePrice) return;
    addProduct({
      name: addForm.name,
      category: addForm.category,
      brand: addForm.brand,
      description: addForm.description,
      unit: addForm.unit,
      purchasePrice: Number(addForm.purchasePrice),
      wholesalePrice: Number(addForm.wholesalePrice),
      retailPrice: Number(addForm.retailPrice || addForm.wholesalePrice),
      minSellingPrice: Number(addForm.minSellingPrice || addForm.wholesalePrice),
      currentStock: 0, // initially 0
      minStock: Number(addForm.minStock),
      supplierId: 'spl-1'
    });
    setShowAddModal(false);
    setAddForm({
      name: '', category: 'Rice & Grains', brand: '', description: '', unit: 'kg',
      purchasePrice: '', wholesalePrice: '', retailPrice: '', minSellingPrice: '', minStock: '100'
    });
  };

  const handleAdjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !adjQty || !adjReason) return;
    adjustStock(
      selectedProduct.id,
      Number(adjQty),
      'adjustment',
      'ADJ-' + Math.floor(1000 + Math.random() * 9000),
      adjReason
    );
    setShowAdjModal(false);
    setAdjQty('');
    setAdjReason('');
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Product Catalog & Inventory</h2>
          <p className="text-xs text-gray-400">Track and manage inventory items, margins, pricing levels, and low-stock conditions.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow hover:bg-indigo-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 w-full sm:w-80 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 text-xs">
          <Boxes className="w-4 h-4 text-gray-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SKU, item name, brand..."
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
          {uniqueCategories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Catalog Table */}
      <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">SKU ID</th>
                <th className="py-2.5">Product Name</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5 text-right">Cost Price</th>
                <th className="py-2.5 text-right">Wholesale Price</th>
                <th className="py-2.5 text-right">Current Stock</th>
                <th className="py-2.5 text-right">Min Limit</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
              {filteredProducts.map(p => {
                const isLow = p.currentStock <= p.minStock;
                return (
                  <tr key={p.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20">
                    <td className="py-3 font-mono font-bold text-gray-500">{p.id}</td>
                    <td className="py-3 font-semibold text-gray-850 dark:text-gray-205">{p.name}</td>
                    <td className="py-3 text-gray-400">{p.category}</td>
                    <td className="py-3 text-right font-medium text-gray-500">LKR {p.purchasePrice}</td>
                    <td className="py-3 text-right font-bold text-gray-900 dark:text-white">LKR {p.wholesalePrice}</td>
                    <td className="py-3 text-right font-bold">
                      <span className={`px-2 py-0.5 rounded-full font-black ${
                        isLow ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20' : 'bg-green-50 text-green-700 dark:bg-green-950/20'
                      }`}>
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-400">{p.minStock} {p.unit}</td>
                    <td className="py-3 text-right space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedProduct(p);
                          setShowAdjModal(true);
                        }}
                        className="px-2 py-1 text-[10px] border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20 transition"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add Product */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Catalog New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Product Title *</label>
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
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Category</label>
                  <select 
                    value={addForm.category}
                    onChange={e => setAddForm({...addForm, category: e.target.value})}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                  >
                    <option value="Rice & Grains">Rice & Grains</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Oils & Fats">Oils & Fats</option>
                    <option value="Spices">Spices</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Unit Label</label>
                  <input 
                    type="text" 
                    value={addForm.unit}
                    onChange={e => setAddForm({...addForm, unit: e.target.value})}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Cost Price</label>
                  <input 
                    type="number" 
                    value={addForm.purchasePrice}
                    onChange={e => setAddForm({...addForm, purchasePrice: e.target.value})}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Wholesale</label>
                  <input 
                    type="number" 
                    value={addForm.wholesalePrice}
                    onChange={e => setAddForm({...addForm, wholesalePrice: e.target.value})}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Min Stock</label>
                  <input 
                    type="number" 
                    value={addForm.minStock}
                    onChange={e => setAddForm({...addForm, minStock: e.target.value})}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                  />
                </div>
              </div>

              <button type="submit" className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
                Add Catalog Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Adjust Stock levels */}
      {showAdjModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Correct stock level</h3>
              <button onClick={() => { setShowAdjModal(false); setSelectedProduct(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjSubmit} className="space-y-4 text-xs">
              <p className="text-gray-500 font-semibold mb-2">Item: {selectedProduct.name} (Stock: {selectedProduct.currentStock} {selectedProduct.unit})</p>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Quantity Change (+ / -)</label>
                <input 
                  type="number" 
                  value={adjQty}
                  onChange={e => setAdjQty(e.target.value)}
                  placeholder="e.g. +100 or -20"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Justification Comment</label>
                <input 
                  type="text" 
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  placeholder="e.g. Received shipment / Waste shrinkage"
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 outline-none text-gray-905 dark:text-white"
                  required
                />
              </div>

              <button type="submit" className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
                Log Stock Correct Action
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Products;
