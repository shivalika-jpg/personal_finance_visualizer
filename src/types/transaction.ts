export interface Transaction {
  _id?: string;
  amount: number;
  date: Date;
  description: string;
  category?: string;
  type: 'income' | 'expense';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionForm {
  amount: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
}

export interface Budget {
  _id?: string;
  category: string;
  amount: number;
  month: string; // Format: YYYY-MM
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  budget?: number;
}

export interface MonthlyExpense {
  month: string;
  total: number;
}

export interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  difference: number;
  percentage: number;
}

export interface BudgetForm {
  category: string;
  amount: string;
  month: string;
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: 'income' | 'expense' | 'all';
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}
