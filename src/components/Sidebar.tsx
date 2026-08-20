import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { 
  LayoutDashboard, ShieldAlert, ShoppingCart, ShoppingBag, Users, 
  Boxes, FileText, CreditCard, DollarSign, BarChart2, Bell, 
  History, Settings, ShieldCheck, HelpCircle, Truck, 
  Calendar, Award, Briefcase, FileDown, FileSpreadsheet
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  // Navigation schema for each role
  const getNavItems = () => {
    switch (currentUser.role) {
      case 'super_admin':
        return [
          { section: 'Workspace', items: [
            { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Control Center', path: '/admin/control-center', icon: ShieldAlert },
          ]},
          { section: 'Sales & CRM', items: [
            { name: 'Sales Overview', path: '/admin/sales', icon: ShoppingCart },
            { name: 'Retail Shops', path: '/admin/customers', icon: Users },
            { name: 'Accounts Receivable', path: '/admin/receivables', icon: FileSpreadsheet },
          ]},
          { section: 'Inventory & Purchasing', items: [
            { name: 'Products Catalog', path: '/admin/products', icon: Boxes },
            { name: 'Supplier Management', path: '/admin/suppliers', icon: Truck },
          ]},
          { section: 'Financial Operations', items: [
            { name: 'Payments Collection', path: '/admin/payments', icon: CreditCard },
            { name: 'Business Expenses', path: '/admin/expenses', icon: DollarSign },
            { name: 'Cash & Bank Vaults', path: '/admin/cash-bank', icon: DollarSign },
          ]},
          { section: 'Human Capital', items: [
            { name: 'Salesmen Accounts', path: '/admin/salesmen', icon: Briefcase },
          ]},
          { section: 'Intelligence & Admin', items: [
            { name: 'Performance Reports', path: '/admin/reports', icon: BarChart2 },
            { name: 'System Settings', path: '/admin/settings', icon: Settings },
            { name: 'Security Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
          ]}
        ];
      case 'accountant':
        return [
          { section: 'Workspace', items: [
            { name: 'Financial Dashboard', path: '/accountant/dashboard', icon: LayoutDashboard }
          ]},
          { section: 'Ledgers & Accounts', items: [
            { name: 'Invoices & Billing', path: '/accountant/invoices', icon: FileText },
            { name: 'Customer Receivables', path: '/accountant/receivables', icon: FileSpreadsheet },
            { name: 'General Collections', path: '/accountant/payments', icon: CreditCard },
            { name: 'Supplier Payables', path: '/accountant/payables', icon: Truck },
            { name: 'Business Expenses', path: '/accountant/expenses', icon: DollarSign },
            { name: 'Cash & Bank Books', path: '/accountant/cash-bank', icon: DollarSign },
          ]},
          { section: 'Reports & Exports', items: [
            { name: 'Financial Statements', path: '/accountant/reports', icon: BarChart2 },
          ]}
        ];
      case 'salesman':
        return [
          { section: 'Workspace', items: [
            { name: 'Salesman Dashboard', path: '/salesman/dashboard', icon: LayoutDashboard }
          ]},
          { section: 'Field Sales', items: [
            { name: 'Assigned Shops', path: '/salesman/customers', icon: Users },
            { name: 'Shop Visits Logger', path: '/salesman/visits', icon: Calendar },
            { name: 'Invoice History', path: '/salesman/sales-history', icon: FileText },
          ]},
          { section: 'My Target Card', items: [
            { name: 'My Performance', path: '/salesman/performance', icon: Award }
          ]}
        ];
      default:
        return [];
    }
  };

  const navSections = getNavItems();

  const handleLinkClick = () => {
    // Close sidebar on mobile after clicking link
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Shell */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-200 dark:shadow-none">
            W
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Wholesale Hub</h1>
            <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Core Management</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="p-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="px-3 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                {section.section}
              </span>
              <ul className="space-y-0.5">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <li key={itemIdx}>
                      <NavLink
                        to={item.path}
                        onClick={handleLinkClick}
                        className={({ isActive }) => 
                          `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                            isActive 
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-600 dark:border-indigo-400' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

// CSS variables helper to export file structure
export default Sidebar;
