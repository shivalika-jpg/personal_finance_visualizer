import { Transaction, Budget, CategorySummary } from '@/types/transaction';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const BUDGETS_FILE = path.join(DATA_DIR, 'budgets.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize files if they don't exist
async function initializeFiles() {
  await ensureDataDir();
  
  try {
    await fs.access(TRANSACTIONS_FILE);
  } catch {
    await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify([]));
  }
  
  try {
    await fs.access(BUDGETS_FILE);
  } catch {
    await fs.writeFile(BUDGETS_FILE, JSON.stringify([]));
  }
}

// Transaction operations
export async function getTransactions(): Promise<Transaction[]> {
  await initializeFiles();
  const data = await fs.readFile(TRANSACTIONS_FILE, 'utf-8');
  const transactions = JSON.parse(data);
  return transactions.map((t: Record<string, unknown>) => ({
    ...t,
    date: new Date(t.date as string),
    createdAt: t.createdAt ? new Date(t.createdAt as string) : undefined,
    updatedAt: t.updatedAt ? new Date(t.updatedAt as string) : undefined,
  }));
}

export async function createTransaction(transaction: Omit<Transaction, '_id'>): Promise<Transaction> {
  await initializeFiles();
  const transactions = await getTransactions();
  
  const newTransaction: Transaction = {
    ...transaction,
    _id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  transactions.push(newTransaction);
  await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
  
  return newTransaction;
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
  await initializeFiles();
  const transactions = await getTransactions();
  const index = transactions.findIndex(t => t._id === id);
  
  if (index === -1) return null;
  
  transactions[index] = {
    ...transactions[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
  return transactions[index];
}

export async function deleteTransaction(id: string): Promise<boolean> {
  await initializeFiles();
  const transactions = await getTransactions();
  const filteredTransactions = transactions.filter(t => t._id !== id);
  
  if (filteredTransactions.length === transactions.length) return false;
  
  await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify(filteredTransactions, null, 2));
  return true;
}

// Budget operations
export async function getBudgets(): Promise<Budget[]> {
  await initializeFiles();
  const data = await fs.readFile(BUDGETS_FILE, 'utf-8');
  const budgets = JSON.parse(data);
  return budgets.map((b: Record<string, unknown>) => ({
    ...b,
    createdAt: b.createdAt ? new Date(b.createdAt as string) : undefined,
    updatedAt: b.updatedAt ? new Date(b.updatedAt as string) : undefined,
  }));
}

export async function createBudget(budget: Omit<Budget, '_id'>): Promise<Budget> {
  await initializeFiles();
  const budgets = await getBudgets();
  
  const newBudget: Budget = {
    ...budget,
    _id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  budgets.push(newBudget);
  await fs.writeFile(BUDGETS_FILE, JSON.stringify(budgets, null, 2));
  
  return newBudget;
}

export async function updateBudget(id: string, updates: Partial<Budget>): Promise<Budget | null> {
  await initializeFiles();
  const budgets = await getBudgets();
  const index = budgets.findIndex(b => b._id === id);
  
  if (index === -1) return null;
  
  budgets[index] = {
    ...budgets[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  await fs.writeFile(BUDGETS_FILE, JSON.stringify(budgets, null, 2));
  return budgets[index];
}

export async function deleteBudget(id: string): Promise<boolean> {
  await initializeFiles();
  const budgets = await getBudgets();
  const filteredBudgets = budgets.filter(b => b._id !== id);
  
  if (filteredBudgets.length === budgets.length) return false;
  
  await fs.writeFile(BUDGETS_FILE, JSON.stringify(filteredBudgets, null, 2));
  return true;
}

// Analytics operations
export async function getCategoryAnalytics(): Promise<CategorySummary[]> {
  const transactions = await getTransactions();
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  const categoryMap = new Map<string, { total: number; count: number }>();
  
  expenseTransactions.forEach(transaction => {
    const category = transaction.category || 'Uncategorized';
    const current = categoryMap.get(category) || { total: 0, count: 0 };
    categoryMap.set(category, {
      total: current.total + transaction.amount,
      count: current.count + 1
    });
  });
  
  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    total: data.total,
    count: data.count
  }));
}
