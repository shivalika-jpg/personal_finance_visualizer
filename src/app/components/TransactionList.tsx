import React, { useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';

interface TransactionListProps {
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  refreshTrigger: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ onEdit, onDelete, refreshTrigger }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/transactions');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete transaction');
        }
        onDelete(id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction');
      }
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = Math.abs(amount).toFixed(2);
    return type === 'expense' ? `-$${formatted}` : `+$${formatted}`;
  };

  if (loading) {
    return (
      <div className="transaction-list">
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-list">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <h2>Recent Transactions</h2>
      {transactions.length === 0 ? (
        <div className="no-transactions">
          <p>No transactions found. Add your first transaction to get started!</p>
        </div>
      ) : (
        <div className="transactions">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-date">{formatDate(transaction.date)}</div>
                <div className="transaction-description">{transaction.description}</div>
                <div className="transaction-category">{transaction.category}</div>
              </div>
              <div className="transaction-amount">
                <span className={`amount ${transaction.type}`}>
                  {formatAmount(transaction.amount, transaction.type)}
                </span>
              </div>
              <div className="transaction-actions">
                <button 
                  onClick={() => onEdit(transaction)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(transaction._id!)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
