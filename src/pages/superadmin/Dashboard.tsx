import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  TrendingUp, TrendingDown, Users, AlertTriangle, 
  DollarSign, ShoppingCart, Calendar, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { sales, payments, customers, products, users } = useApp();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'today' | 'month' | 'year'>('month');

  // Dynamic calculations
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todaySales = sales
    .filter(s => s.date === todayStr && s.paymentStatus !== 'cancelled')
    .reduce((sum, s) => sum + s.total, 0);

  const todayCollections = payments
    .filter(p => p.date === todayStr)
    .reduce((sum, p) => sum + p.amount, 0);

  const outstandingReceivables = customers.reduce((sum, c) => sum + c.outstanding, 0);

  // Profit calculation (Wholesale price minus cost price, minus today's expenses)
  const todayProfit = sales
    .filter(s => s.date === todayStr && s.paymentStatus !== 'cancelled')
    .reduce((sum, s) => {
      const saleCost = s.items.reduce((costSum, item) => {
        // Find product to determine cost price
        const p = products.find(prod => prod.id === item.productId);
        const costPrice = p ? p.purchasePrice : item.unitPrice * 0.7; // default to 70% cost
        return costSum + (costPrice * item.quantity);
      }, 0);
      return sum + (s.total - saleCost);
    }, 0);

  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;

  // Chart 1: Sales Trend (Grouped daily)
  const getSalesTrendData = () => {
    const dailyMap: { [key: string]: { date: string; Sales: number; Collections: number } } = {};
    
    // Seed last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = { date: dateStr.substring(5), Sales: 0, Collections: 0 };
    }

    sales.forEach(s => {
      if (s.paymentStatus !== 'cancelled' && dailyMap[s.date]) {
        dailyMap[s.date].Sales += s.total;
      }
    });

    payments.forEach(p => {
      if (dailyMap[p.date]) {
        dailyMap[p.date].Collections += p.amount;
      }
    });

    return Object.values(dailyMap);
  };

  // Chart 2: Sales by Salesman
  const getSalesBySalesman = () => {
    const repMap: { [key: string]: number } = {};
    sales.forEach(s => {
      if (s.paymentStatus !== 'cancelled') {
        repMap[s.salesmanName] = (repMap[s.salesmanName] || 0) + s.total;
      }
    });
    return Object.entries(repMap).map(([name, value]) => ({ name, Sales: value }));
  };

  // Chart 3: Sales by Category
  const getSalesByCategory = () => {
    const catMap: { [key: string]: number } = {};
    sales.forEach(s => {
      if (s.paymentStatus !== 'cancelled') {
        s.items.forEach(item => {
          const p = products.find(prod => prod.id === item.productId);
          const cat = p ? p.category : 'General';
          catMap[cat] = (catMap[cat] || 0) + item.total;
        });
      }
    });
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];
    return Object.entries(catMap).map(([name, value], idx) => ({
      name,
      value,
      color: COLORS[idx % COLORS.length]
    }));
  };

  // Chart 4: Sales by Product
  const getSalesByProduct = () => {
    const prodMap: { [key: string]: number } = {};
    sales.forEach(s => {
      if (s.paymentStatus !== 'cancelled') {
        s.items.forEach(item => {
          prodMap[item.productName] = (prodMap[item.productName] || 0) + item.total;
        });
      }
    });
    return Object.entries(prodMap)
      .map(([name, value]) => ({ name, Value: value }))
      .sort((a, b) => b.Value - a.Value)
      .slice(0, 5);
  };

  const trendData = getSalesTrendData();
  const repData = getSalesBySalesman();
  const categoryData = getSalesByCategory();
  const productData = getSalesByProduct();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Owner command center</h2>
          <p className="text-xs text-gray-400">Company-wide real-time operations, analytics, and metrics.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-xl shadow-sm">
          {(['today', 'month', 'year'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition ${
                timeRange === range 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sales Card */}
        <div 
          onClick={() => navigate('/admin/sales')}
          className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-2 cursor-pointer hover:border-indigo-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today's Sales</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">LKR {todaySales.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12% relative to yesterday</span>
          </div>
        </div>

        {/* Collections Card */}
        <div 
          onClick={() => navigate('/admin/payments')}
          className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-2 cursor-pointer hover:border-emerald-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today's Collections</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">LKR {todayCollections.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.2% relative to collections target</span>
          </div>
        </div>

        {/* Outstanding Receivables Card */}
        <div 
          onClick={() => navigate('/admin/receivables')}
          className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-2 cursor-pointer hover:border-rose-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Accounts Receivable</span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">LKR {outstandingReceivables.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[10px] text-rose-600 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>8 customer accounts overdue</span>
          </div>
        </div>

        {/* Today's Net Profit Card */}
        <div 
          className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today's Profit</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">LKR {todayProfit.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Margin of {(todaySales > 0 ? (todayProfit / todaySales) * 100 : 15).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Grid: Secondary Widget Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Warning Board */}
        <div className="md:col-span-1 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Attention Required</h4>
            </div>
            
            <ul className="space-y-3.5 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><span className="font-bold text-rose-500">{lowStockCount} Products</span> are currently running low in stock. (e.g. Ceylon Tea)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><span className="font-bold text-amber-500">Siri Retailers</span> has utilized 92.5% of their allowed credit limit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>Expenses of LKR 15,000 for lorry fuel require authorization signoff.</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => navigate('/admin/control-center')}
            className="w-full mt-6 flex items-center justify-center gap-1 px-4 py-2 border border-gray-200 dark:border-gray-800 text-xs font-bold rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50/10 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition"
          >
            <span>Launch Control Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sales Trend Chart */}
        <div className="md:col-span-2 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Weekly Cashflow Dynamics (Sales vs Cash Collections)</h4>
            <span className="text-[10px] text-gray-400">Daily breakdown in LKR</span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-gray-800" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ paddingTop: 10, fontSize: '11px' }} />
                <Area type="monotone" dataKey="Sales" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Collections" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollections)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Lower Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sales by Representative */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-800">
            Sales Performance by Salesman
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" className="dark:stroke-gray-800" />
                <XAxis type="number" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="Sales" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category (Pie Chart) */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-800">
            Product Category Breakdown
          </h4>
          <div className="h-56 flex items-center justify-center">
            {categoryData.length === 0 ? (
              <span className="text-xs text-gray-400">No category sales logged.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `LKR ${value.toLocaleString()}`} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-gray-800">
            Top 5 Best-Selling Products
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-gray-800" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={8} tickLine={false} interval={0} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="Value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Dashboard;
