import React, { useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';

interface DashboardStats {
  totalExpenses: number;
  totalIncome: number;
  netIncome: number;
  transactionCount: number;
  topCategory: string;
  topCategoryAmount: number;
  recentTransactions: Transaction[];
}

interface DashboardProps {
  refreshTrigger?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    totalIncome: 0,
    netIncome: 0,
    transactionCount: 0,
    topCategory: '',
    topCategoryAmount: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all transactions
        const transactionsResponse = await fetch('/api/transactions');
        if (!transactionsResponse.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const transactions: Transaction[] = await transactionsResponse.json();

        // Fetch category data
        const categoriesResponse = await fetch('/api/analytics?type=categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch category data');
        }
        const categories = await categoriesResponse.json();

        // Calculate stats
        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const netIncome = totalIncome - totalExpenses;

        const topCategory = categories.length > 0 ? categories[0] : null;

        const recentTransactions = transactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        setStats({
          totalExpenses,
          totalIncome,
          netIncome,
          transactionCount: transactions.length,
          topCategory: topCategory?.category || 'N/A',
          topCategoryAmount: topCategory?.total || 0,
          recentTransactions
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshTrigger]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">Error loading dashboard: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Financial Overview</h2>
      
      <div className="dashboard-cards">
        <div className="dashboard-card income">
          <div className="card-header">
            <h3>Total Income</h3>
            <span className="card-icon">📈</span>
          </div>
          <div className="card-value positive">
            {formatCurrency(stats.totalIncome)}
          </div>
          <div className="card-subtitle">
            This month
          </div>
        </div>

        <div className="dashboard-card expenses">
          <div className="card-header">
            <h3>Total Expenses</h3>
            <span className="card-icon">📉</span>
          </div>
          <div className="card-value negative">
            {formatCurrency(stats.totalExpenses)}
          </div>
          <div className="card-subtitle">
            This month
          </div>
        </div>

        <div className="dashboard-card net">
          <div className="card-header">
            <h3>Net Income</h3>
            <span className="card-icon">💰</span>
          </div>
          <div className={`card-value ${stats.netIncome >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(stats.netIncome)}
          </div>
          <div className="card-subtitle">
            Income - Expenses
          </div>
        </div>

        <div className="dashboard-card transactions">
          <div className="card-header">
            <h3>Transactions</h3>
            <span className="card-icon">📊</span>
          </div>
          <div className="card-value neutral">
            {stats.transactionCount}
          </div>
          <div className="card-subtitle">
            Total recorded
          </div>
        </div>

        <div className="dashboard-card top-category">
          <div className="card-header">
            <h3>Top Category</h3>
            <span className="card-icon">🏆</span>
          </div>
          <div className="card-value neutral">
            {stats.topCategory}
          </div>
          <div className="card-subtitle">
            {formatCurrency(stats.topCategoryAmount)}
          </div>
        </div>
      </div>

      <div className="recent-transactions-card">
        <h3>Recent Transactions</h3>
        {stats.recentTransactions.length === 0 ? (
          <div className="no-transactions">
            <p>No recent transactions found.</p>
          </div>
        ) : (
          <div className="recent-transactions-list">
            {stats.recentTransactions.map((transaction) => (
              <div key={transaction._id} className="recent-transaction">
                <div className="transaction-details">
                  <div className="transaction-description">
                    {transaction.description}
                  </div>
                  <div className="transaction-meta">
                    <span className="transaction-date">
                      {formatDate(transaction.date)}
                    </span>
                    <span className="transaction-category">
                      {transaction.category}
                    </span>
                  </div>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
