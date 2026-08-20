import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  User, Customer, Product, StockMovement, Sale, Payment, Expense, 
  Supplier, Purchase, FinancialAccount, AccountTransaction, 
  ApprovalRequest, AuditLog, SalesmanVisit, AppSettings, CreditLimitHistory, UserRole
} from '../types';

interface AppContextType {
  // Authentication & Users
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  updateUserStatus: (id: string, status: 'active' | 'suspended' | 'disabled') => void;
  updateUserRole: (id: string, role: UserRole) => void;
  updateUserTargets: (id: string, sales: number, collections: number) => void;
  addUser: (user: Omit<User, 'id' | 'currentSales' | 'currentCollections' | 'joinedDate'>) => void;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'outstanding' | 'overdueAmount' | 'documents'>) => void;
  updateCustomer: (customer: Customer) => void;
  updateCreditLimit: (customerId: string, newLimit: number, reason: string) => { success: boolean; message: string };
  creditHistory: CreditLimitHistory[];
  uploadCustomerDocument: (customerId: string, docName: string) => void;

  // Products & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'status'>) => void;
  updateProduct: (product: Product) => void;
  adjustStock: (productId: string, quantity: number, type: 'purchase' | 'sale' | 'return' | 'adjustment', reference: string, reason: string) => void;
  stockMovements: StockMovement[];

  // Sales & Orders
  sales: Sale[];
  createSale: (sale: Omit<Sale, 'id' | 'date' | 'customerName' | 'salesmanName' | 'paymentStatus' | 'balance'>) => { success: boolean; message: string; sale?: Sale };
  cancelSale: (saleId: string) => { success: boolean; message: string };

  // Payments & Collections
  payments: Payment[];
  createPayment: (payment: Omit<Payment, 'id' | 'date' | 'customerName' | 'recordedBy'>) => { success: boolean; message: string; payment?: Payment };

  // Expenses
  expenses: Expense[];
  createExpense: (expense: Omit<Expense, 'id' | 'date' | 'createdBy' | 'status'>) => void;
  approveExpense: (expenseId: string) => void;
  rejectExpense: (expenseId: string) => void;

  // Financial Accounts & Transactions
  accounts: FinancialAccount[];
  accountTransactions: AccountTransaction[];
  transferFunds: (fromId: string, toId: string, amount: number, notes: string) => { success: boolean; message: string };

  // Salesman Visits
  visits: SalesmanVisit[];
  recordVisit: (visit: Omit<SalesmanVisit, 'id' | 'date' | 'salesmanName' | 'customerName'>) => void;

  // Approvals (Override Requests)
  approvals: ApprovalRequest[];
  createApprovalRequest: (type: 'credit_override' | 'large_expense' | 'cancel_transaction' | 'credit_increase', explanation: string, details: any) => void;
  resolveApprovalRequest: (id: string, status: 'approved' | 'rejected') => void;

  // Audit Logs
  auditLogs: AuditLog[];
  writeAuditLog: (action: string, record: string, prevValue: string, newValue: string) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;

  // System Utility
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper for unique ID generation
const genId = (prefix: string) => `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user state (starts with Super Admin as default fallback)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core Db States loaded from localStorage or initialized with realistic seed data
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [creditHistory, setCreditHistory] = useState<CreditLimitHistory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountTransactions, setAccountTransactions] = useState<AccountTransaction[]>([]);
  const [visits, setVisits] = useState<SalesmanVisit[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>({} as AppSettings);

  // Initial Seed Data
  const initializeDemoData = () => {
    const demoUsers: User[] = [
      {
        id: 'usr-1',
        name: 'Ruwan Perera',
        email: 'admin@wholesale.com',
        role: 'super_admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        employeeId: 'EMP-001',
        joinedDate: '2023-01-15',
        status: 'active',
        lastActive: new Date().toISOString()
      },
      {
        id: 'usr-2',
        name: 'Nimali Silva',
        email: 'finance@wholesale.com',
        role: 'accountant',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        employeeId: 'EMP-002',
        joinedDate: '2024-03-10',
        status: 'active',
        lastActive: new Date().toISOString()
      },
      {
        id: 'usr-3',
        name: 'Kasun Jayawardena',
        email: 'sales1@wholesale.com',
        role: 'salesman',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        employeeId: 'EMP-003',
        joinedDate: '2024-05-20',
        assignedArea: 'Colombo North',
        assignedCustomers: ['cust-1', 'cust-2', 'cust-5'],
        salesTarget: 2500000,
        currentSales: 1850000,
        collectionsTarget: 2000000,
        currentCollections: 1420000,
        status: 'active',
        lastActive: new Date().toISOString()
      },
      {
        id: 'usr-4',
        name: 'Samantha Wickrema',
        email: 'sales2@wholesale.com',
        role: 'salesman',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        employeeId: 'EMP-004',
        joinedDate: '2024-06-01',
        assignedArea: 'Colombo South',
        assignedCustomers: ['cust-3', 'cust-4'],
        salesTarget: 2000000,
        currentSales: 1620000,
        collectionsTarget: 1800000,
        currentCollections: 980000,
        status: 'active',
        lastActive: new Date().toISOString()
      }
    ];

    const demoCustomers: Customer[] = [
      {
        id: 'cust-1',
        name: 'ABC Traders',
        ownerName: 'Anura Bandaranaike',
        phone: '0771234567',
        email: 'abc@traders.lk',
        address: '24 Galle Road, Colombo 03',
        area: 'Colombo North',
        salesmanId: 'usr-3',
        creditLimit: 500000,
        outstanding: 320000,
        overdueAmount: 75000,
        status: 'active',
        risk: 'medium',
        lastPurchaseDate: '2026-08-18',
        lastPaymentDate: '2026-08-15',
        documents: [
          { id: 'doc-1', name: 'Business Registration.pdf', url: '#', uploadedAt: '2025-05-10' }
        ]
      },
      {
        id: 'cust-2',
        name: 'Siri Retailers',
        ownerName: 'Siripala Perera',
        phone: '0719876543',
        email: 'siri.retail@gmail.com',
        address: '142 Kandy Road, Gampaha',
        area: 'Colombo North',
        salesmanId: 'usr-3',
        creditLimit: 200000,
        outstanding: 185000,
        overdueAmount: 0,
        status: 'active',
        risk: 'high',
        lastPurchaseDate: '2026-08-20',
        lastPaymentDate: '2026-08-10',
        documents: []
      },
      {
        id: 'cust-3',
        name: 'Lanka Minimart',
        ownerName: 'Sunil Shantha',
        phone: '0723456789',
        email: 'sunil@lankaminimart.lk',
        address: '89 Peradeniya Road, Kandy',
        area: 'Colombo South',
        salesmanId: 'usr-4',
        creditLimit: 300000,
        outstanding: 50000,
        overdueAmount: 0,
        status: 'active',
        risk: 'low',
        lastPurchaseDate: '2026-08-15',
        lastPaymentDate: '2026-08-12',
        documents: []
      },
      {
        id: 'cust-4',
        name: 'Nalaka & Sons',
        ownerName: 'Nalaka De Silva',
        phone: '0751112223',
        email: 'nalakasons@negombo.lk',
        address: '12 Main Street, Negombo',
        area: 'Colombo South',
        salesmanId: 'usr-4',
        creditLimit: 150000,
        outstanding: 160000,
        overdueAmount: 20000,
        status: 'blocked',
        risk: 'high',
        lastPurchaseDate: '2026-08-10',
        lastPaymentDate: '2026-08-01',
        documents: [
          { id: 'doc-2', name: 'Identity Copy Owner.pdf', url: '#', uploadedAt: '2024-02-15' }
        ]
      },
      {
        id: 'cust-5',
        name: 'Metro Super',
        ownerName: 'Maithree Jayasinghe',
        phone: '0768889990',
        email: 'metro@kalutara.lk',
        address: '304 Galle Road, Kalutara',
        area: 'Colombo North',
        salesmanId: 'usr-3',
        creditLimit: 400000,
        outstanding: 0,
        overdueAmount: 0,
        status: 'active',
        risk: 'low',
        lastPurchaseDate: '2026-07-28',
        lastPaymentDate: '2026-07-28',
        documents: []
      }
    ];

    const demoProducts: Product[] = [
      {
        id: 'PRD-RIC-01',
        name: 'Premium Basmati Rice',
        category: 'Rice & Grains',
        brand: 'Araliya',
        description: 'Premium long grain basmati rice, aged 1 year.',
        unit: 'kg',
        purchasePrice: 150,
        wholesalePrice: 180,
        retailPrice: 200,
        minSellingPrice: 175,
        currentStock: 1500,
        minStock: 200,
        supplierId: 'spl-1',
        status: 'active'
      },
      {
        id: 'PRD-TEA-02',
        name: 'Ceylon Orange Pekoe Tea',
        category: 'Beverages',
        brand: 'Dilmah',
        description: 'Finest Ceylon black tea, loose leaves pack.',
        unit: 'box',
        purchasePrice: 800,
        wholesalePrice: 950,
        retailPrice: 1100,
        minSellingPrice: 900,
        currentStock: 25, // Low stock!
        minStock: 50,
        supplierId: 'spl-2',
        status: 'active'
      },
      {
        id: 'PRD-COIL-03',
        name: 'Pure Coconut Oil',
        category: 'Oils & Fats',
        brand: 'Baraka',
        description: '100% natural, cold-pressed culinary coconut oil.',
        unit: 'bottle',
        purchasePrice: 450,
        wholesalePrice: 520,
        retailPrice: 600,
        minSellingPrice: 500,
        currentStock: 400,
        minStock: 100,
        supplierId: 'spl-1',
        status: 'active'
      },
      {
        id: 'PRD-SPI-04',
        name: 'Mixed Spices Masala Pack',
        category: 'Spices',
        brand: 'McCurrie',
        description: 'Traditional Sri Lankan blend of selected roasted spices.',
        unit: 'pack',
        purchasePrice: 300,
        wholesalePrice: 360,
        retailPrice: 420,
        minSellingPrice: 340,
        currentStock: 75,
        minStock: 30,
        supplierId: 'spl-2',
        status: 'active'
      },
      {
        id: 'PRD-LEN-05',
        name: 'Red Lentils (Dhal)',
        category: 'Rice & Grains',
        brand: 'Lanka Grains',
        description: 'High grade polished red split lentils.',
        unit: 'kg',
        purchasePrice: 220,
        wholesalePrice: 260,
        retailPrice: 300,
        minSellingPrice: 250,
        currentStock: 2200,
        minStock: 500,
        supplierId: 'spl-1',
        status: 'active'
      }
    ];

    const todayStr = '2026-08-20';
    const yesterdayStr = '2026-08-19';
    const earlierMonthStr = '2026-08-10';

    const demoSales: Sale[] = [
      {
        id: 'INV-1001',
        customerId: 'cust-1',
        customerName: 'ABC Traders',
        salesmanId: 'usr-3',
        salesmanName: 'Kasun Jayawardena',
        date: earlierMonthStr,
        items: [
          { productId: 'PRD-RIC-01', productName: 'Premium Basmati Rice', quantity: 1000, unitPrice: 180, discount: 0, tax: 0, total: 180000 },
          { productId: 'PRD-COIL-03', productName: 'Pure Coconut Oil', quantity: 200, unitPrice: 520, discount: 10, tax: 0, total: 102000 }
        ],
        subtotal: 284000,
        discount: 2000,
        tax: 0,
        total: 282000,
        paid: 200000,
        balance: 82000,
        paymentStatus: 'partially_paid',
        paymentMethod: 'credit',
        notes: 'Initial monthly delivery.'
      },
      {
        id: 'INV-1002',
        customerId: 'cust-2',
        customerName: 'Siri Retailers',
        salesmanId: 'usr-3',
        salesmanName: 'Kasun Jayawardena',
        date: yesterdayStr,
        items: [
          { productId: 'PRD-TEA-02', productName: 'Ceylon Orange Pekoe Tea', quantity: 100, unitPrice: 950, discount: 0, tax: 0, total: 95000 },
          { productId: 'PRD-SPI-04', productName: 'Mixed Spices Masala Pack', quantity: 250, unitPrice: 360, discount: 0, tax: 0, total: 90000 }
        ],
        subtotal: 185000,
        discount: 0,
        tax: 0,
        total: 185000,
        paid: 0,
        balance: 185000,
        paymentStatus: 'unpaid',
        paymentMethod: 'credit',
        notes: 'Requested credit terms.'
      },
      {
        id: 'INV-1003',
        customerId: 'cust-1',
        customerName: 'ABC Traders',
        salesmanId: 'usr-3',
        salesmanName: 'Kasun Jayawardena',
        date: todayStr,
        items: [
          { productId: 'PRD-LEN-05', productName: 'Red Lentils (Dhal)', quantity: 800, unitPrice: 260, discount: 0, tax: 0, total: 208000 },
          { productId: 'PRD-COIL-03', productName: 'Pure Coconut Oil', quantity: 60, unitPrice: 520, discount: 0, tax: 0, total: 31200 }
        ],
        subtotal: 239200,
        discount: 1200,
        tax: 0,
        total: 238000,
        paid: 0,
        balance: 238000,
        paymentStatus: 'unpaid',
        paymentMethod: 'credit',
        notes: 'Delivered to central store.'
      },
      {
        id: 'INV-1004',
        customerId: 'cust-3',
        customerName: 'Lanka Minimart',
        salesmanId: 'usr-4',
        salesmanName: 'Samantha Wickrema',
        date: todayStr,
        items: [
          { productId: 'PRD-RIC-01', productName: 'Premium Basmati Rice', quantity: 250, unitPrice: 180, discount: 0, tax: 0, total: 45000 },
          { productId: 'PRD-SPI-04', productName: 'Mixed Spices Masala Pack', quantity: 15, unitPrice: 360, discount: 0, tax: 0, total: 5400 }
        ],
        subtotal: 50400,
        discount: 400,
        tax: 0,
        total: 50000,
        paid: 50000,
        balance: 0,
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        notes: 'Paid fully in cash on delivery.'
      }
    ];

    const demoPayments: Payment[] = [
      {
        id: 'PAY-1001',
        customerId: 'cust-1',
        customerName: 'ABC Traders',
        invoiceId: 'INV-1001',
        amount: 200000,
        date: '2026-08-15',
        method: 'bank_transfer',
        referenceNumber: 'BTX-982848-KOK',
        notes: 'Bank transfer receipt received.',
        recordedBy: 'Nimali Silva'
      }
    ];

    const demoStockMovements: StockMovement[] = [
      {
        id: 'SM-1',
        productId: 'PRD-RIC-01',
        quantity: -1000,
        type: 'sale',
        reference: 'INV-1001',
        user: 'Kasun Jayawardena',
        date: earlierMonthStr,
        prevStock: 2500,
        newStock: 1500
      },
      {
        id: 'SM-2',
        productId: 'PRD-COIL-03',
        quantity: -200,
        type: 'sale',
        reference: 'INV-1001',
        user: 'Kasun Jayawardena',
        date: earlierMonthStr,
        prevStock: 600,
        newStock: 400
      },
      {
        id: 'SM-3',
        productId: 'PRD-TEA-02',
        quantity: -100,
        type: 'sale',
        reference: 'INV-1002',
        user: 'Kasun Jayawardena',
        date: yesterdayStr,
        prevStock: 125,
        newStock: 25
      },
      {
        id: 'SM-4',
        productId: 'PRD-LEN-05',
        quantity: -800,
        type: 'sale',
        reference: 'INV-1003',
        user: 'Kasun Jayawardena',
        date: todayStr,
        prevStock: 3000,
        newStock: 2200
      }
    ];

    const demoExpenses: Expense[] = [
      {
        id: 'EXP-1001',
        title: 'Office Internet monthly bill',
        category: 'internet',
        amount: 6500,
        date: '2026-08-12',
        paymentMethod: 'card',
        description: 'SLT Fibre monthly bill payment.',
        notes: 'Receipt attached.',
        createdBy: 'Nimali Silva',
        status: 'approved'
      },
      {
        id: 'EXP-1002',
        title: 'Delivery lorry fuel',
        category: 'fuel',
        amount: 15000,
        date: todayStr,
        paymentMethod: 'cash',
        description: 'Ceypetco fuel collection for vehicle WP-SG-2023.',
        notes: 'Pending owner signoff.',
        createdBy: 'Nimali Silva',
        status: 'pending'
      }
    ];

    const demoAccounts: FinancialAccount[] = [
      { id: 'acc-1', name: 'Main Office Cash Vault', type: 'cash', balance: 145000 },
      { id: 'acc-2', name: 'Commercial Bank Current Account', type: 'bank', balance: 2480000, accountNumber: 'COM-0012948-28' },
      { id: 'acc-3', name: 'Sampath Bank Savings Account', type: 'bank', balance: 500000, accountNumber: 'SAMP-8827-22' }
    ];

    const demoVisits: SalesmanVisit[] = [
      {
        id: 'vis-1',
        salesmanId: 'usr-3',
        salesmanName: 'Kasun Jayawardena',
        customerId: 'cust-2',
        customerName: 'Siri Retailers',
        date: yesterdayStr + 'T10:15:00Z',
        visitType: 'scheduled',
        purpose: 'Monthly credit review and orders',
        notes: 'Negotiated new orders. Shop requested 185k limit override for bulk beverages.',
        status: 'completed'
      },
      {
        id: 'vis-2',
        salesmanId: 'usr-3',
        salesmanName: 'Kasun Jayawardena',
        customerId: 'cust-1',
        customerName: 'ABC Traders',
        date: todayStr + 'T09:30:00Z',
        visitType: 'scheduled',
        purpose: 'Lentils order collection',
        notes: 'Secured order for 800kg lentils. Paid balance via transfer tomorrow.',
        status: 'completed'
      }
    ];

    const demoApprovals: ApprovalRequest[] = [
      {
        id: 'APR-1001',
        type: 'credit_override',
        requestedBy: 'Kasun Jayawardena',
        requestedById: 'usr-3',
        requestDate: yesterdayStr + 'T11:00:00Z',
        status: 'approved',
        details: {
          customerId: 'cust-2',
          customerName: 'Siri Retailers',
          saleAmount: 185000,
          explanation: 'Requires bulk stock for local festival season.'
        },
        resolvedBy: 'Ruwan Perera',
        resolvedDate: yesterdayStr + 'T12:00:00Z'
      }
    ];

    const demoAuditLogs: AuditLog[] = [
      {
        id: 'AUD-1',
        user: 'Ruwan Perera',
        userId: 'usr-1',
        action: 'Approve Credit Override',
        record: 'Override request APR-1001',
        prevValue: 'Pending',
        newValue: 'Approved',
        date: yesterdayStr + 'T12:00:00Z'
      },
      {
        id: 'AUD-2',
        user: 'Ruwan Perera',
        userId: 'usr-1',
        action: 'System Initialized',
        record: 'System State',
        prevValue: 'Empty',
        newValue: 'Demo Data Loaded',
        date: '2026-08-20T10:00:00Z'
      }
    ];

    const demoCreditHistory: CreditLimitHistory[] = [
      {
        id: 'clh-1',
        customerId: 'cust-1',
        oldLimit: 300000,
        newLimit: 500000,
        changedBy: 'Ruwan Perera',
        date: '2026-08-15T09:00:00Z',
        reason: 'Increased purchasing volume & healthy repayment history.'
      }
    ];

    const defaultSettings: AppSettings = {
      companyName: 'Lanka Agro Distributors (Pvt) Ltd',
      logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&h=80&q=80',
      address: '42 Main Wholesale Terminal, Welisara, Sri Lanka',
      phone: '+94 11 234 5678',
      email: 'info@lankaagro.lk',
      website: 'www.lankaagro.lk',
      taxNumber: 'TIN-98724824A',
      invoicePrefix: 'INV',
      creditWarningThreshold: 80,
      lowStockThreshold: 50
    };

    setUsers(demoUsers);
    setCustomers(demoCustomers);
    setCreditHistory(demoCreditHistory);
    setProducts(demoProducts);
    setStockMovements(demoStockMovements);
    setSales(demoSales);
    setPayments(demoPayments);
    setExpenses(demoExpenses);
    setAccounts(demoAccounts);
    setAccountTransactions([]);
    setVisits(demoVisits);
    setApprovals(demoApprovals);
    setAuditLogs(demoAuditLogs);
    setSettings(defaultSettings);
    setCurrentUser(demoUsers[0]); // default to Super Admin
  };

  // Sync state with local storage or seed initial values on mount
  useEffect(() => {
    const hasData = localStorage.getItem('wholesale_db_initialized');
    if (hasData) {
      try {
        const loadedUsers = JSON.parse(localStorage.getItem('wholesale_users') || '[]');
        const loadedCustomers = JSON.parse(localStorage.getItem('wholesale_customers') || '[]');
        const loadedProducts = JSON.parse(localStorage.getItem('wholesale_products') || '[]');

        if (loadedUsers.length === 0 || loadedCustomers.length === 0 || loadedProducts.length === 0) {
          initializeDemoData();
          localStorage.setItem('wholesale_db_initialized', 'true');
          return;
        }

        setUsers(loadedUsers);
        setCustomers(loadedCustomers);
        setCreditHistory(JSON.parse(localStorage.getItem('wholesale_credithistory') || '[]'));
        setProducts(loadedProducts);
        setStockMovements(JSON.parse(localStorage.getItem('wholesale_stockmovements') || '[]'));
        setSales(JSON.parse(localStorage.getItem('wholesale_sales') || '[]'));
        setPayments(JSON.parse(localStorage.getItem('wholesale_payments') || '[]'));
        setExpenses(JSON.parse(localStorage.getItem('wholesale_expenses') || '[]'));
        setAccounts(JSON.parse(localStorage.getItem('wholesale_accounts') || '[]'));
        setAccountTransactions(JSON.parse(localStorage.getItem('wholesale_accounttransactions') || '[]'));
        setVisits(JSON.parse(localStorage.getItem('wholesale_visits') || '[]'));
        setApprovals(JSON.parse(localStorage.getItem('wholesale_approvals') || '[]'));
        setAuditLogs(JSON.parse(localStorage.getItem('wholesale_auditlogs') || '[]'));
        setSettings(JSON.parse(localStorage.getItem('wholesale_settings') || '{}'));
        
        const lastUser = localStorage.getItem('wholesale_current_user');
        if (lastUser) {
          setCurrentUser(JSON.parse(lastUser));
        } else {
          setCurrentUser(loadedUsers[0] || null);
        }
      } catch (err) {
        console.error("Failed to parse data from localStorage, initializing fresh", err);
        initializeDemoData();
        localStorage.setItem('wholesale_db_initialized', 'true');
      }
    } else {
      initializeDemoData();
      localStorage.setItem('wholesale_db_initialized', 'true');
    }
  }, []);

  // Save changes to localStorage helper
  const syncToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Whenever state variables modify, sync to local storage
  useEffect(() => {
    if (users.length > 0) syncToLocalStorage('wholesale_users', users);
  }, [users]);

  useEffect(() => {
    if (customers.length > 0) syncToLocalStorage('wholesale_customers', customers);
  }, [customers]);

  useEffect(() => {
    if (creditHistory.length > 0) syncToLocalStorage('wholesale_credithistory', creditHistory);
  }, [creditHistory]);

  useEffect(() => {
    if (products.length > 0) syncToLocalStorage('wholesale_products', products);
  }, [products]);

  useEffect(() => {
    if (stockMovements.length > 0) syncToLocalStorage('wholesale_stockmovements', stockMovements);
  }, [stockMovements]);

  useEffect(() => {
    if (sales.length > 0) syncToLocalStorage('wholesale_sales', sales);
  }, [sales]);

  useEffect(() => {
    if (payments.length > 0) syncToLocalStorage('wholesale_payments', payments);
  }, [payments]);

  useEffect(() => {
    if (expenses.length > 0) syncToLocalStorage('wholesale_expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    if (accounts.length > 0) syncToLocalStorage('wholesale_accounts', accounts);
  }, [accounts]);

  useEffect(() => {
    if (accountTransactions.length > 0) syncToLocalStorage('wholesale_accounttransactions', accountTransactions);
  }, [accountTransactions]);

  useEffect(() => {
    if (visits.length > 0) syncToLocalStorage('wholesale_visits', visits);
  }, [visits]);

  useEffect(() => {
    if (approvals.length > 0) syncToLocalStorage('wholesale_approvals', approvals);
  }, [approvals]);

  useEffect(() => {
    if (auditLogs.length > 0) syncToLocalStorage('wholesale_auditlogs', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    if (settings.companyName) syncToLocalStorage('wholesale_settings', settings);
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wholesale_current_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Audit logger core
  const writeAuditLog = (action: string, record: string, prevValue: string, newValue: string) => {
    const newLog: AuditLog = {
      id: genId('AUD'),
      user: currentUser ? currentUser.name : 'System',
      userId: currentUser ? currentUser.id : 'system',
      action,
      record,
      prevValue,
      newValue,
      date: new Date().toISOString()
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      syncToLocalStorage('wholesale_auditlogs', updated);
      return updated;
    });
  };

  // Dynamic values helper: update outstanding balance of a customer
  const updateCustomerOutstanding = (custId: string, amtChange: number) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === custId) {
        const newOutstanding = Math.max(0, c.outstanding + amtChange);
        // Recalculate risk rating based on utilization
        const utilization = c.creditLimit > 0 ? (newOutstanding / c.creditLimit) * 100 : 0;
        let risk: 'low' | 'medium' | 'high' = 'low';
        if (utilization >= 90 || c.overdueAmount > 0) risk = 'high';
        else if (utilization >= 75) risk = 'medium';

        return {
          ...c,
          outstanding: newOutstanding,
          risk
        };
      }
      return c;
    }));
  };

  // Auth/User management functions
  const updateUserStatus = (id: string, status: 'active' | 'suspended' | 'disabled') => {
    const oldUser = users.find(u => u.id === id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    writeAuditLog(
      'Modify User Status',
      `User ${oldUser?.name} (${oldUser?.employeeId})`,
      oldUser?.status || 'unknown',
      status
    );
  };

  const updateUserRole = (id: string, role: UserRole) => {
    const oldUser = users.find(u => u.id === id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    writeAuditLog(
      'Modify User Role',
      `User ${oldUser?.name} (${oldUser?.employeeId})`,
      oldUser?.role || 'unknown',
      role
    );
  };

  const updateUserTargets = (id: string, sales: number, collections: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, salesTarget: sales, collectionsTarget: collections } : u));
    writeAuditLog(
      'Update Employee Performance Targets',
      `User ID: ${id}`,
      'N/A',
      `Sales: LKR ${sales}, Collection: LKR ${collections}`
    );
  };

  const addUser = (userData: Omit<User, 'id' | 'currentSales' | 'currentCollections' | 'joinedDate'>) => {
    const newUser: User = {
      ...userData,
      id: genId('usr'),
      joinedDate: new Date().toISOString().split('T')[0],
      currentSales: 0,
      currentCollections: 0
    };
    setUsers(prev => [...prev, newUser]);
    writeAuditLog('Create User Account', `User ${newUser.name} (${newUser.employeeId})`, 'None', 'Created');
  };

  // Customer modifications
  const addCustomer = (customerData: Omit<Customer, 'id' | 'outstanding' | 'overdueAmount' | 'documents'>) => {
    const newCust: Customer = {
      ...customerData,
      id: genId('cust'),
      outstanding: 0,
      overdueAmount: 0,
      documents: []
    };
    setCustomers(prev => [...prev, newCust]);
    writeAuditLog('Create Customer Profile', `Shop: ${newCust.name}`, 'None', 'Created');
    
    // Assign to salesman
    if (newCust.salesmanId) {
      setUsers(prev => prev.map(u => {
        if (u.id === newCust.salesmanId) {
          const custs = u.assignedCustomers || [];
          return { ...u, assignedCustomers: [...custs, newCust.id] };
        }
        return u;
      }));
    }
  };

  const updateCustomer = (updatedCust: Customer) => {
    const oldCust = customers.find(c => c.id === updatedCust.id);
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
    writeAuditLog(
      'Edit Customer Details', 
      `Shop: ${updatedCust.name}`, 
      JSON.stringify(oldCust), 
      JSON.stringify(updatedCust)
    );
  };

  const updateCreditLimit = (customerId: string, newLimit: number, reason: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return { success: false, message: 'Customer not found' };

    const oldLimit = customer.creditLimit;
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, creditLimit: newLimit } : c));
    
    const changeLog: CreditLimitHistory = {
      id: genId('clh'),
      customerId,
      oldLimit,
      newLimit,
      changedBy: currentUser?.name || 'Authorized Override',
      date: new Date().toISOString(),
      reason
    };
    setCreditHistory(prev => [changeLog, ...prev]);

    writeAuditLog(
      'Modify Customer Credit Limit',
      `Shop: ${customer.name}`,
      `LKR ${oldLimit.toLocaleString()}`,
      `LKR ${newLimit.toLocaleString()} (Reason: ${reason})`
    );

    return { success: true, message: `Credit limit updated successfully for ${customer.name}.` };
  };

  const uploadCustomerDocument = (customerId: string, docName: string) => {
    const newDoc = {
      id: genId('doc'),
      name: docName,
      url: '#',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          documents: [...c.documents, newDoc]
        };
      }
      return c;
    }));
    writeAuditLog('Upload Customer Document', `Customer ID: ${customerId}`, 'N/A', `Document: ${docName}`);
  };

  // Product management
  const addProduct = (productData: Omit<Product, 'id' | 'status'>) => {
    const newProduct: Product = {
      ...productData,
      id: genId('PRD'),
      status: 'active'
    };
    setProducts(prev => [...prev, newProduct]);
    writeAuditLog('Create Product Catalog Item', `Product: ${newProduct.name} (${newProduct.id})`, 'None', 'Created');
  };

  const updateProduct = (updatedProduct: Product) => {
    const oldProduct = products.find(p => p.id === updatedProduct.id);
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    writeAuditLog(
      'Update Product Details', 
      `Product SKU: ${updatedProduct.id}`, 
      JSON.stringify(oldProduct), 
      JSON.stringify(updatedProduct)
    );
  };

  const adjustStock = (productId: string, quantity: number, type: 'purchase' | 'sale' | 'return' | 'adjustment', reference: string, reason: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const prevStock = product.currentStock;
    const newStock = prevStock + quantity;

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, currentStock: newStock } : p));

    const movement: StockMovement = {
      id: genId('SM'),
      productId,
      quantity,
      type,
      reference,
      user: currentUser?.name || 'System',
      date: new Date().toISOString(),
      prevStock,
      newStock
    };

    setStockMovements(prev => [movement, ...prev]);

    writeAuditLog(
      'Inventory Stock Adjustment',
      `Product: ${product.name} (SKU: ${productId})`,
      `${prevStock} ${product.unit}`,
      `${newStock} ${product.unit} (Type: ${type}, Ref: ${reference}, Reason: ${reason})`
    );
  };

  // Sales Orders Creation with business rules
  const createSale = (saleData: Omit<Sale, 'id' | 'date' | 'customerName' | 'salesmanName' | 'paymentStatus' | 'balance'>) => {
    const customer = customers.find(c => c.id === saleData.customerId);
    const salesman = users.find(u => u.id === saleData.salesmanId);

    if (!customer) return { success: false, message: 'Invalid customer selected.' };
    if (!salesman) return { success: false, message: 'Invalid salesman selected.' };

    const total = saleData.total;
    const isCreditSale = saleData.paymentMethod === 'credit';

    // Credit Sale Rule Validation: Current Outstanding + New Invoice Total <= Credit Limit
    if (isCreditSale) {
      if (customer.status === 'blocked') {
        return { success: false, message: `Cannot process sale: ${customer.name} is currently BLOCKED from credit purchases.` };
      }

      const availableCredit = customer.creditLimit - customer.outstanding;
      if (total > availableCredit) {
        // Check if there is an approved override request for this customer/amount
        const override = approvals.find(a => 
          a.type === 'credit_override' && 
          a.details.customerId === customer.id && 
          a.status === 'approved' &&
          (a.details.saleAmount || 0) >= total
        );

        if (!override) {
          return { 
            success: false, 
            message: `Credit limit exceeded! Customer has LKR ${availableCredit.toLocaleString()} available credit, but this sale requires LKR ${total.toLocaleString()}.` 
          };
        } else {
          // Remove or flag this override as utilized so it can't be reused
          setApprovals(prev => prev.map(a => a.id === override.id ? { ...a, status: 'approved' } : a)); // or archive it
          writeAuditLog(
            'Utilize Credit Override Approval',
            `Approved Request ID: ${override.id}`,
            'Available',
            'Utilized'
          );
        }
      }
    }

    // Verify stock availability
    for (const item of saleData.items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod || prod.currentStock < item.quantity) {
        return { 
          success: false, 
          message: `Insufficient stock for product ${item.productName}. Available: ${prod?.currentStock || 0}, requested: ${item.quantity}.` 
        };
      }
    }

    // Determine payment status
    let paymentStatus: 'paid' | 'partially_paid' | 'unpaid' = 'unpaid';
    const balance = total - saleData.paid;
    if (saleData.paid >= total) {
      paymentStatus = 'paid';
    } else if (saleData.paid > 0) {
      paymentStatus = 'partially_paid';
    }

    // Generate Invoice Number
    const invoiceId = genId('INV');
    const newSale: Sale = {
      ...saleData,
      id: invoiceId,
      customerName: customer.name,
      salesmanName: salesman.name,
      date: new Date().toISOString().split('T')[0],
      paymentStatus,
      balance
    };

    // Commit Transaction - Update stocks, record stock movement
    setSales(prev => [newSale, ...prev]);

    newSale.items.forEach(item => {
      adjustStock(
        item.productId, 
        -item.quantity, 
        'sale', 
        invoiceId, 
        `Sale Invoice Delivery to ${customer.name}`
      );
    });

    // Update Customer Financial Account
    // Increment outstanding by the credit/unpaid portion of the sale
    if (balance > 0) {
      updateCustomerOutstanding(customer.id, balance);
    }

    // Update Cash/Bank account balances if payment made immediately
    if (saleData.paid > 0) {
      const defaultAccount = saleData.paymentMethod === 'cash' ? 'acc-1' : 'acc-2';
      setAccounts(prev => prev.map(acc => {
        if (acc.id === defaultAccount) {
          return { ...acc, balance: acc.balance + saleData.paid };
        }
        return acc;
      }));

      // Log transaction
      const newTx: AccountTransaction = {
        id: genId('TX'),
        type: 'collection',
        toAccountId: defaultAccount,
        amount: saleData.paid,
        date: new Date().toISOString(),
        reference: invoiceId,
        user: currentUser?.name || 'System'
      };
      setAccountTransactions(prev => [newTx, ...prev]);
    }

    // Update Salesman metrics for performance target checks
    if (salesman.role === 'salesman') {
      setUsers(prev => prev.map(u => {
        if (u.id === salesman.id) {
          return {
            ...u,
            currentSales: (u.currentSales || 0) + total
          };
        }
        return u;
      }));
    }

    writeAuditLog(
      'Create Sales Invoice',
      `Invoice: ${invoiceId} (Shop: ${customer.name}, Total: LKR ${total.toLocaleString()})`,
      'None',
      `Issued (Method: ${saleData.paymentMethod})`
    );

    // Dynamic customer updates: set last purchase date
    setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, lastPurchaseDate: newSale.date } : c));

    return { success: true, message: `Invoice ${invoiceId} created successfully.`, sale: newSale };
  };

  // Void/Cancel invoice and reverse inventory + balances
  const cancelSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return { success: false, message: 'Sale not found.' };
    if (sale.paymentStatus === 'cancelled') return { success: false, message: 'Invoice is already cancelled.' };

    // Mark sale as cancelled
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, paymentStatus: 'cancelled', balance: 0 } : s));

    // Reverse Inventory Stocks
    sale.items.forEach(item => {
      adjustStock(
        item.productId, 
        item.quantity, // positive to restore stock
        'return', 
        saleId, 
        `Cancelled Sales Invoice - Stocks Reverted`
      );
    });

    // Reverse customer outstanding balance
    if (sale.balance > 0) {
      updateCustomerOutstanding(sale.customerId, -sale.balance);
    }

    // If payments were already allocated, cash accounts remain but need adjusting transaction or manual refund
    if (sale.paid > 0) {
      const refundAccId = sale.paymentMethod === 'cash' ? 'acc-1' : 'acc-2';
      setAccounts(prev => prev.map(acc => {
        if (acc.id === refundAccId) {
          return { ...acc, balance: Math.max(0, acc.balance - sale.paid) };
        }
        return acc;
      }));

      // Log transaction refund
      const newTx: AccountTransaction = {
        id: genId('TX'),
        type: 'withdrawal',
        fromAccountId: refundAccId,
        amount: sale.paid,
        date: new Date().toISOString(),
        reference: `VOID-${saleId}`,
        user: currentUser?.name || 'System'
      };
      setAccountTransactions(prev => [newTx, ...prev]);
    }

    // Deduct from salesman totals
    const salesman = users.find(u => u.id === sale.salesmanId);
    if (salesman && salesman.role === 'salesman') {
      setUsers(prev => prev.map(u => {
        if (u.id === salesman.id) {
          return {
            ...u,
            currentSales: Math.max(0, (u.currentSales || 0) - sale.total)
          };
        }
        return u;
      }));
    }

    writeAuditLog(
      'Cancel Sales Invoice',
      `Invoice: ${saleId} (Shop: ${sale.customerName}, Amount: LKR ${sale.total.toLocaleString()})`,
      'Active',
      'Cancelled & Reversed'
    );

    return { success: true, message: `Invoice ${saleId} has been successfully cancelled and outstanding balances reversed.` };
  };

  // Payments / Receipts Recording
  const createPayment = (payData: Omit<Payment, 'id' | 'date' | 'customerName' | 'recordedBy'>) => {
    const customer = customers.find(c => c.id === payData.customerId);
    if (!customer) return { success: false, message: 'Invalid customer selected.' };

    const payId = genId('PAY');
    const newPayment: Payment = {
      ...payData,
      id: payId,
      customerName: customer.name,
      date: new Date().toISOString().split('T')[0],
      recordedBy: currentUser?.name || 'Cashier'
    };

    setPayments(prev => [newPayment, ...prev]);

    // Apply financial changes: Reduce customer outstanding balance
    updateCustomerOutstanding(customer.id, -payData.amount);

    // If invoice specified, allocate payment to reduce balance of that invoice
    if (payData.invoiceId) {
      setSales(prev => prev.map(s => {
        if (s.id === payData.invoiceId) {
          const newPaid = s.paid + payData.amount;
          const newBal = Math.max(0, s.total - newPaid);
          let pStatus: 'paid' | 'partially_paid' | 'unpaid' = 'unpaid';
          if (newPaid >= s.total) pStatus = 'paid';
          else if (newPaid > 0) pStatus = 'partially_paid';

          return {
            ...s,
            paid: newPaid,
            balance: newBal,
            paymentStatus: pStatus
          };
        }
        return s;
      }));
    } else {
      // Allocate payment general across customer's unpaid invoices starting oldest (First In, First Out)
      // Simulating database invoice aging payment allocations
      setSales(prev => {
        let remainingPayment = payData.amount;
        // Sort sales ascending by date (oldest first)
        const sortedSales = [...prev].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return prev.map(s => {
          if (s.customerId === customer.id && s.balance > 0 && s.paymentStatus !== 'cancelled') {
            const alloc = Math.min(s.balance, remainingPayment);
            if (alloc > 0) {
              remainingPayment -= alloc;
              const newPaid = s.paid + alloc;
              const newBal = s.balance - alloc;
              let pStatus: 'paid' | 'partially_paid' | 'unpaid' = 'unpaid';
              if (newPaid >= s.total) pStatus = 'paid';
              else if (newPaid > 0) pStatus = 'partially_paid';

              return {
                ...s,
                paid: newPaid,
                balance: newBal,
                paymentStatus: pStatus
              };
            }
          }
          return s;
        });
      });
    }

    // Route cash to correct office account
    const accId = payData.method === 'cash' ? 'acc-1' : 'acc-2';
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accId) {
        return { ...acc, balance: acc.balance + payData.amount };
      }
      return acc;
    }));

    // Register transaction log
    const newTx: AccountTransaction = {
      id: genId('TX'),
      type: 'collection',
      toAccountId: accId,
      amount: payData.amount,
      date: new Date().toISOString(),
      reference: payId,
      user: currentUser?.name || 'System'
    };
    setAccountTransactions(prev => [newTx, ...prev]);

    // Record to Salesman collections tracker if assigned
    const assignedSalesman = users.find(u => u.id === customer.salesmanId);
    if (assignedSalesman && assignedSalesman.role === 'salesman') {
      setUsers(prev => prev.map(u => {
        if (u.id === assignedSalesman.id) {
          return {
            ...u,
            currentCollections: (u.currentCollections || 0) + payData.amount
          };
        }
        return u;
      }));
    }

    // Dynamic customer updates: set last payment date
    setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, lastPaymentDate: newPayment.date } : c));

    writeAuditLog(
      'Record Customer Payment Receipt',
      `Payment: ${payId} (Shop: ${customer.name}, Amount: LKR ${payData.amount.toLocaleString()})`,
      'Pending',
      `Receipt Logged (Method: ${payData.method})`
    );

    return { success: true, message: `Payment of LKR ${payData.amount.toLocaleString()} recorded.`, payment: newPayment };
  };

  // Expenses management
  const createExpense = (expData: Omit<Expense, 'id' | 'date' | 'createdBy' | 'status'>) => {
    const expId = genId('EXP');
    const newExpense: Expense = {
      ...expData,
      id: expId,
      date: new Date().toISOString().split('T')[0],
      createdBy: currentUser?.name || 'Employee',
      status: currentUser?.role === 'super_admin' ? 'approved' : 'pending' // Super Admin approvals are automatic
    };

    setExpenses(prev => [newExpense, ...prev]);
    writeAuditLog('Create Expense Entry', `Expense: ${newExpense.title} (${expId})`, 'None', `Created (Status: ${newExpense.status})`);

    // If created by Super Admin (approved), deduct balance immediately
    if (newExpense.status === 'approved') {
      deductExpenseCashFlow(newExpense);
    } else {
      // Create owner approval workflow trigger
      createApprovalRequest('large_expense', `Expense approval requested: ${newExpense.title}`, { expenseId: expId, amount: newExpense.amount });
    }
  };

  const deductExpenseCashFlow = (expense: Expense) => {
    const accId = expense.paymentMethod === 'cash' ? 'acc-1' : 'acc-2';
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accId) {
        return { ...acc, balance: Math.max(0, acc.balance - expense.amount) };
      }
      return acc;
    }));

    const newTx: AccountTransaction = {
      id: genId('TX'),
      type: 'expense',
      fromAccountId: accId,
      amount: expense.amount,
      date: new Date().toISOString(),
      reference: expense.id,
      user: expense.createdBy
    };
    setAccountTransactions(prev => [newTx, ...prev]);
  };

  const approveExpense = (expenseId: string) => {
    const exp = expenses.find(e => e.id === expenseId);
    if (!exp || exp.status !== 'pending') return;

    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status: 'approved' } : e));
    deductExpenseCashFlow({ ...exp, status: 'approved' });

    // Mark relevant approval request as approved
    setApprovals(prev => prev.map(req => 
      req.type === 'large_expense' && req.details.expenseId === expenseId 
        ? { ...req, status: 'approved', resolvedBy: currentUser?.name, resolvedDate: new Date().toISOString() } 
        : req
    ));

    writeAuditLog(
      'Approve Expense Log',
      `Expense ID: ${expenseId} (${exp.title})`,
      'Pending',
      'Approved & Cash Deducted'
    );
  };

  const rejectExpense = (expenseId: string) => {
    const exp = expenses.find(e => e.id === expenseId);
    if (!exp || exp.status !== 'pending') return;

    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status: 'rejected' } : e));

    // Reject relevant approval request
    setApprovals(prev => prev.map(req => 
      req.type === 'large_expense' && req.details.expenseId === expenseId 
        ? { ...req, status: 'rejected', resolvedBy: currentUser?.name, resolvedDate: new Date().toISOString() } 
        : req
    ));

    writeAuditLog(
      'Reject Expense Log',
      `Expense ID: ${expenseId} (${exp.title})`,
      'Pending',
      'Rejected'
    );
  };

  // Transfer funds between office accounts
  const transferFunds = (fromId: string, toId: string, amount: number, notes: string) => {
    const sourceAcc = accounts.find(a => a.id === fromId);
    const destAcc = accounts.find(a => a.id === toId);

    if (!sourceAcc || !destAcc) return { success: false, message: 'Invalid accounts selected.' };
    if (sourceAcc.balance < amount) {
      return { success: false, message: `Insufficient funds in ${sourceAcc.name}. Available: LKR ${sourceAcc.balance.toLocaleString()}.` };
    }

    setAccounts(prev => prev.map(acc => {
      if (acc.id === fromId) return { ...acc, balance: acc.balance - amount };
      if (acc.id === toId) return { ...acc, balance: acc.balance + amount };
      return acc;
    }));

    const txId = genId('TX');
    const newTx: AccountTransaction = {
      id: txId,
      type: 'transfer',
      fromAccountId: fromId,
      toAccountId: toId,
      amount,
      date: new Date().toISOString(),
      reference: `TRF-${txId}`,
      user: currentUser?.name || 'System'
    };
    setAccountTransactions(prev => [newTx, ...prev]);

    writeAuditLog(
      'Transfer Financial Account Funds',
      `From: ${sourceAcc.name} to ${destAcc.name}`,
      `Amt: LKR ${amount.toLocaleString()}`,
      `Notes: ${notes}`
    );

    return { success: true, message: `LKR ${amount.toLocaleString()} transferred successfully.` };
  };

  // Log salesman customer visits
  const recordVisit = (visitData: Omit<SalesmanVisit, 'id' | 'date' | 'salesmanName' | 'customerName'>) => {
    const salesman = users.find(u => u.id === visitData.salesmanId);
    const customer = customers.find(c => c.id === visitData.customerId);
    
    if (!salesman || !customer) return;

    const visitId = genId('vis');
    const newVisit: SalesmanVisit = {
      ...visitData,
      id: visitId,
      salesmanName: salesman.name,
      customerName: customer.name,
      date: new Date().toISOString()
    };

    setVisits(prev => [newVisit, ...prev]);

    writeAuditLog(
      'Log Salesman Customer Visit',
      `Customer: ${customer.name} (Visited by: ${salesman.name})`,
      'None',
      `Visit logged: ${visitData.status} (Notes: ${visitData.notes})`
    );
  };

  // Approval requests drawer
  const createApprovalRequest = (type: 'credit_override' | 'large_expense' | 'cancel_transaction' | 'credit_increase', explanation: string, details: any) => {
    const newReq: ApprovalRequest = {
      id: genId('APR'),
      type,
      requestedBy: currentUser?.name || 'Employee',
      requestedById: currentUser?.id || 'system',
      requestDate: new Date().toISOString(),
      status: 'pending',
      details: {
        ...details,
        explanation
      }
    };
    setApprovals(prev => [newReq, ...prev]);
    writeAuditLog('Submit Authorization Request', `Type: ${type}`, 'Pending', `Requested by ${newReq.requestedBy}`);
  };

  const resolveApprovalRequest = (id: string, status: 'approved' | 'rejected') => {
    const request = approvals.find(r => r.id === id);
    if (!request || request.status !== 'pending') return;

    setApprovals(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status,
          resolvedBy: currentUser?.name || 'Owner',
          resolvedDate: new Date().toISOString()
        };
      }
      return req;
    }));

    // If it's a large expense approval, trigger the actual expense hooks
    if (request.type === 'large_expense' && request.details.expenseId) {
      if (status === 'approved') {
        const exp = expenses.find(e => e.id === request.details.expenseId);
        if (exp) {
          setExpenses(prev => prev.map(e => e.id === request.details.expenseId ? { ...e, status: 'approved' } : e));
          deductExpenseCashFlow({ ...exp, status: 'approved' });
        }
      } else {
        setExpenses(prev => prev.map(e => e.id === request.details.expenseId ? { ...e, status: 'rejected' } : e));
      }
    }

    writeAuditLog(
      'Resolve Authorization Request',
      `Request ID: ${id} (${request.type})`,
      'Pending',
      `${status} by ${currentUser?.name || 'Owner'}`
    );
  };

  const updateSettings = (updatedSettings: AppSettings) => {
    const oldSettings = settings;
    setSettings(updatedSettings);
    writeAuditLog(
      'Modify System Configuration Settings', 
      'Global AppSettings', 
      JSON.stringify(oldSettings), 
      JSON.stringify(updatedSettings)
    );
  };

  const resetToDemoData = () => {
    localStorage.removeItem('wholesale_db_initialized');
    localStorage.removeItem('wholesale_users');
    localStorage.removeItem('wholesale_customers');
    localStorage.removeItem('wholesale_products');
    localStorage.removeItem('wholesale_stockmovements');
    localStorage.removeItem('wholesale_sales');
    localStorage.removeItem('wholesale_payments');
    localStorage.removeItem('wholesale_expenses');
    localStorage.removeItem('wholesale_accounts');
    localStorage.removeItem('wholesale_accounttransactions');
    localStorage.removeItem('wholesale_visits');
    localStorage.removeItem('wholesale_approvals');
    localStorage.removeItem('wholesale_auditlogs');
    localStorage.removeItem('wholesale_credithistory');
    localStorage.removeItem('wholesale_settings');
    localStorage.removeItem('wholesale_current_user');
    initializeDemoData();
    writeAuditLog('Reset System Data', 'System Database', 'Modified State', 'Reinitialized Default Seed Data');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      users,
      updateUserStatus,
      updateUserRole,
      updateUserTargets,
      addUser,
      
      customers,
      addCustomer,
      updateCustomer,
      updateCreditLimit,
      creditHistory,
      uploadCustomerDocument,

      products,
      addProduct,
      updateProduct,
      adjustStock,
      stockMovements,

      sales,
      createSale,
      cancelSale,

      payments,
      createPayment,

      expenses,
      createExpense,
      approveExpense,
      rejectExpense,

      accounts,
      accountTransactions,
      transferFunds,

      visits,
      recordVisit,

      approvals,
      createApprovalRequest,
      resolveApprovalRequest,

      auditLogs,
      writeAuditLog,

      settings,
      updateSettings,

      resetToDemoData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
