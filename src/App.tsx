import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { CommandCenter } from './components/CommandCenter';
import DashboardLayout from './layouts/DashboardLayout';
import Auth from './pages/Auth';

// Super Admin
import AdminDashboard from './pages/superadmin/Dashboard';
import AdminControlCenter from './pages/superadmin/ControlCenter';
import AdminCustomers from './pages/superadmin/Customers';
import AdminSalesmen from './pages/superadmin/Salesmen';
import AdminProducts from './pages/superadmin/Products';
import AdminAuditLogs from './pages/superadmin/AuditLogs';

// Accountant
import AccountantDashboard from './pages/accountant/Dashboard';
import AccountantInvoices from './pages/accountant/Invoices';
import AccountantReceivables from './pages/accountant/Receivables';
import AccountantPayments from './pages/accountant/Payments';
import AccountantExpenses from './pages/accountant/Expenses';

// Salesman
import SalesmanDashboard from './pages/salesman/Dashboard';
import SalesmanCustomers from './pages/salesman/Customers';
import SalesmanVisits from './pages/salesman/Visits';
import SalesmanPerformance from './pages/salesman/Performance';

// Shared Detail View
import RetailShopProfile from './modules/customers/RetailShopProfile';

function AppContent() {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Global Ctrl + K key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleOpenCommand = () => {
      setIsCommandOpen(true);
    };
    window.addEventListener('open-command-center', handleOpenCommand);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-center', handleOpenCommand);
    };
  }, []);

  return (
    <>
      <HashRouter>
        <Routes>
          {/* Landing / Gateway switcher */}
          <Route path="/" element={<Auth />} />

          {/* Super Admin Workspace */}
          <Route path="/admin" element={<DashboardLayout onOpenCommand={() => setIsCommandOpen(true)} />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="control-center" element={<AdminControlCenter />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id" element={<RetailShopProfile />} />
            <Route path="sales" element={<AccountantInvoices />} />
            <Route path="receivables" element={<AccountantReceivables />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="payments" element={<AccountantPayments />} />
            <Route path="expenses" element={<AccountantExpenses />} />
            <Route path="cash-bank" element={<AccountantDashboard />} />
            <Route path="salesmen" element={<AdminSalesmen />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="settings" element={<AdminControlCenter />} />
          </Route>

          {/* Financial Accountant Workspace */}
          <Route path="/accountant" element={<DashboardLayout onOpenCommand={() => setIsCommandOpen(true)} />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AccountantDashboard />} />
            <Route path="invoices" element={<AccountantInvoices />} />
            <Route path="receivables" element={<AccountantReceivables />} />
            <Route path="payables" element={<AccountantReceivables />} />
            <Route path="payments" element={<AccountantPayments />} />
            <Route path="expenses" element={<AccountantExpenses />} />
            <Route path="cash-bank" element={<AccountantDashboard />} />
            <Route path="reports" element={<AccountantReceivables />} />
            <Route path="customers/:id" element={<RetailShopProfile />} />
          </Route>

          {/* Salesman Representative Workspace */}
          <Route path="/salesman" element={<DashboardLayout onOpenCommand={() => setIsCommandOpen(true)} />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<SalesmanDashboard />} />
            <Route path="customers" element={<SalesmanCustomers />} />
            <Route path="customers/:id" element={<RetailShopProfile />} />
            <Route path="visits" element={<SalesmanVisits />} />
            <Route path="sales-history" element={<AccountantInvoices />} />
            <Route path="performance" element={<SalesmanPerformance />} />
          </Route>

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Global Command Center modal */}
        <CommandCenter 
          isOpen={isCommandOpen} 
          onClose={() => setIsCommandOpen(false)} 
        />
      </HashRouter>
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
