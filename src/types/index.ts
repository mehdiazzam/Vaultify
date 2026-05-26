import type { Timestamp } from 'firebase/firestore';

export type AccountType = 'bank' | 'cash' | 'e-wallet' | 'ledger';
export type AccountingType = 'expense' | 'income' | 'asset' | 'receivable' | 'payable' | 'liability';
export type RecurringPeriod = 'weekly' | 'monthly' | 'annual';
export type ThemeMode = 'dark' | 'light';

export interface Currency {
  id: string;
  iso: string;
  name: string;
  rateToUsd: number;
  icon?: string;
}

export interface User {
  id: string;
  name: string;
  totpCode?: string;
  totpRecoveryPins?: Array<{ pin: string; isUsed: boolean }>;
  email?: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Timestamp;
}

export interface Account {
  id: string;
  userId: string;
  type: AccountType | 'lent' | 'borrowed';
  currency: string;
  name: string;
  isSaving: boolean;
  accounting: AccountingType;
  disabled?: boolean;
  isHidden?: boolean;
  rateToUsd?: number;
  number?: string;
  parentId?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

export interface TransactionItem {
  accountId: string;
  credit: number;
  debit: number;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  description: string;
  date: string;
  items: TransactionItem[];
  exchangeRate?: number;
  relatedGoalId?: string;
  /** When set, this transaction is part of a loan lifecycle (opening, repayment) */
  relatedLoanId?: string;
  createdAt: Timestamp;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  recurring: RecurringPeriod;
  currency?: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  deadline: string;
  color: string;
  icon: string;
  amount: number;
  currency?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextBilling: string;
  categoryId: string;
  icon: string;
  color: string;
  active: boolean;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  icon: string;
  percentage: number;
}

export interface ChartDataPoint {
  name: string;
  /** Optional cumulative balance for balance-style charts */
  balance?: number;
  income: number;
  expense: number;
  savings: number;
}

export interface FinancialInsight {
  id: string;
  type: 'tip' | 'warning' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface HealthScore {
  overall: number;
  savings: number;
  spending: number;
  budgeting: number;
  consistency: number;
}

export interface FinanceData {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  subscriptions: Subscription[];
  accounts: Account[];
  categories: Category[];
  currencies: Currency[];
}


export type LoanType = 'borrowed' | 'lent';
export type LoanStatus = 'active' | 'partially_repaid' | 'settled';

export interface Loan {
  id: string;
  userId: string;
  type: LoanType;
  counterparty: string;
  amount: number;
  currency: string;
  description?: string;
  dueDate?: Timestamp | string;
  status: LoanStatus;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  // calculated fields, not stored in Firestore
  transactions?: Transaction[];
  amountRepaid?: number;
}

export interface LoanFormValues {
  type: LoanType;
  counterparty: string;
  amount: number;
  currency: string;
  assetAccountId: string;
  description?: string;
  dueDate?: Timestamp | string;
}

export interface RepaymentFormValues {
  loanId: string;
  assetAccountId: string;
  amount: number;
}

export interface LoanAccountReferences {
  loanPayableId: string;
  loanReceivableId: string;
}
