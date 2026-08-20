export type UserRole = 'super_admin' | 'accountant' | 'salesman';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  employeeId: string;
  joinedDate: string;
  assignedArea?: string;
  assignedCustomers?: string[]; // Customer IDs
  salesTarget?: number; // LKR monthly target
  currentSales?: number; // LKR current month sales
  collectionsTarget?: number; // LKR monthly collections target
  currentCollections?: number; // LKR current month collections
  status: 'active' | 'suspended' | 'disabled';
  lastActive?: string;
}

export interface CustomerDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  salesmanId: string; // assigned salesman ID
  creditLimit: number;
  outstanding: number; // dynamically computed in helper, stored as reference
  overdueAmount: number;
  status: 'active' | 'inactive' | 'blocked';
  risk: 'low' | 'medium' | 'high';
  lastPurchaseDate?: string;
  lastPaymentDate?: string;
  documents: CustomerDocument[];
}

export interface CreditLimitHistory {
  id: string;
  customerId: string;
  oldLimit: number;
  newLimit: number;
  changedBy: string;
  date: string;
  reason: string;
}

export interface Product {
  id: string; // SKU
  name: string;
  category: string;
  brand: string;
  description: string;
  unit: string; // e.g. "Pack", "Bottle", "Box"
  purchasePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  minSellingPrice: number;
  currentStock: number;
  minStock: number;
  supplierId: string;
  productImage?: string;
  status: 'active' | 'inactive';
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number; // positive for addition, negative for deduction
  type: 'purchase' | 'sale' | 'return' | 'adjustment';
  reference: string; // INV-1001, PRCH-1002, ADJ-1003
  user: string;
  date: string;
  prevStock: number;
  newStock: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number; // LKR amount per unit
  tax: number; // LKR amount per unit
  total: number;
}

export interface Sale {
  id: string; // INV-XXXX
  customerId: string;
  customerName: string;
  salesmanId: string;
  salesmanName: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discount: number; // total invoice discount
  tax: number; // total invoice tax
  total: number;
  paid: number;
  balance: number;
  paymentStatus: 'paid' | 'partially_paid' | 'unpaid' | 'cancelled';
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'credit';
  notes: string;
}

export interface Payment {
  id: string; // PAY-XXXX
  customerId: string;
  customerName: string;
  invoiceId?: string; // empty if general collection
  amount: number;
  date: string;
  method: 'cash' | 'bank_transfer' | 'cheque' | 'card';
  referenceNumber: string;
  notes: string;
  attachment?: string;
  recordedBy: string; // user name
}

export interface Expense {
  id: string; // EXP-XXXX
  title: string;
  category: 'rent' | 'electricity' | 'water' | 'internet' | 'salaries' | 'transport' | 'fuel' | 'equipment' | 'maintenance' | 'marketing' | 'office' | 'other';
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'card';
  description: string;
  receipt?: string;
  notes: string;
  createdBy: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  outstandingPayable: number;
}

export interface Purchase {
  id: string; // PRCH-XXXX
  supplierId: string;
  supplierName: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    costPrice: number;
    total: number;
  }[];
  total: number;
  paymentStatus: 'paid' | 'partially_paid' | 'unpaid' | 'cancelled';
  notes: string;
}

export interface FinancialAccount {
  id: string; // 'cash' | 'bank1' | 'bank2'
  name: string;
  type: 'cash' | 'bank';
  balance: number;
  accountNumber?: string;
}

export interface AccountTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'collection' | 'expense';
  fromAccountId?: string;
  toAccountId?: string;
  amount: number;
  date: string;
  reference: string;
  user: string;
}

export interface ApprovalRequest {
  id: string; // APR-XXXX
  type: 'credit_override' | 'large_expense' | 'cancel_transaction' | 'credit_increase';
  requestedBy: string;
  requestedById: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  details: {
    customerId?: string;
    customerName?: string;
    saleAmount?: number;
    limitRequested?: number;
    expenseId?: string;
    invoiceId?: string;
    explanation: string;
  };
  resolvedBy?: string;
  resolvedDate?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  userId: string;
  action: string;
  record: string;
  prevValue: string;
  newValue: string;
  date: string;
}

export interface SalesmanVisit {
  id: string;
  salesmanId: string;
  salesmanName: string;
  customerId: string;
  customerName: string;
  date: string;
  visitType: 'scheduled' | 'ad_hoc';
  purpose: string;
  notes: string;
  status: 'completed' | 'follow_up_required' | 'no_order' | 'payment_collected';
  followUpDate?: string;
}

export interface AppSettings {
  companyName: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
  invoicePrefix: string;
  creditWarningThreshold: number; // e.g. 80 for 80%
  lowStockThreshold: number;
}
