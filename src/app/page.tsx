'use client';

import React, { useState } from 'react';
import TransactionFormComponent from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import MonthlyExpensesChart from './components/MonthlyExpensesChart';
import CategoryChart from './components/CategoryChart';
import Dashboard from './components/Dashboard';
import BudgetManager from './components/BudgetManager';
import BudgetVsActualChart from './components/BudgetVsActualChart';
import AdvancedFilter from './components/AdvancedFilter';
import ExportData from './components/ExportData';
import { Transaction, TransactionForm, BudgetForm, FilterOptions } from '@/types/transaction';

export default function Home() {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<FilterOptions>({});

  const handleSubmitTransaction = async (formData: TransactionForm) => {
    try {
      const url = editingTransaction 
        ? `/api/transactions/${editingTransaction._id}`
        : '/api/transactions';
      
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save transaction');
      }

      // Reset editing state and trigger refresh
      setEditingTransaction(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = (id: string) => {
    // Trigger refresh after deletion
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleAddBudget = async (budgetData: BudgetForm) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create budget');
      }

      setRefreshTrigger(prev => prev + 1);
      alert('Budget created successfully!');
    } catch (error) {
      console.error('Error creating budget:', error);
      alert(error instanceof Error ? error.message : 'Failed to create budget');
    }
  };

  const handleUpdateBudget = async (id: string, budgetData: BudgetForm) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        throw new Error('Failed to update budget');
      }

      setRefreshTrigger(prev => prev + 1);
      alert('Budget updated successfully!');
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Failed to update budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      setRefreshTrigger(prev => prev + 1);
      alert('Budget deleted successfully!');
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget');
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters({});
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="content-grid-stage3">
            <div className="dashboard-section">
              <Dashboard refreshTrigger={refreshTrigger} />
            </div>

            <div className="form-section">
              <TransactionFormComponent
                onSubmit={handleSubmitTransaction}
                editingTransaction={editingTransaction}
                onCancel={handleCancelEdit}
              />
            </div>

            <div className="charts-section">
              <div className="charts-grid">
                <MonthlyExpensesChart refreshTrigger={refreshTrigger} />
                <CategoryChart refreshTrigger={refreshTrigger} />
              </div>
            </div>

            <div className="list-section">
              <AdvancedFilter
                onFilterChange={handleFilterChange}
                onReset={handleFilterReset}
              />
              <TransactionList
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        );

      case 'budgets':
        return (
          <div className="budget-content">
            <div className="budget-grid">
              <div className="budget-manager-section">
                <BudgetManager
                  onAddBudget={handleAddBudget}
                  onUpdateBudget={handleUpdateBudget}
                  onDeleteBudget={handleDeleteBudget}
                  refreshTrigger={refreshTrigger}
                />
              </div>
              <div className="budget-chart-section">
                <BudgetVsActualChart refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="analytics-content">
            <div className="analytics-grid">
              <MonthlyExpensesChart refreshTrigger={refreshTrigger} />
              <CategoryChart refreshTrigger={refreshTrigger} />
              <BudgetVsActualChart refreshTrigger={refreshTrigger} />
            </div>
          </div>
        );

      case 'export':
        return (
          <div className="export-content">
            <ExportData />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Personal Finance Visualizer</h1>
        <p>Track your expenses, manage budgets, and visualize your spending patterns</p>
      </header>

      <nav className="app-navigation">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`nav-tab ${activeTab === 'budgets' ? 'active' : ''}`}
            onClick={() => setActiveTab('budgets')}
          >
            💰 Budgets
          </button>
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
          <button
            className={`nav-tab ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            📥 Export
          </button>
        </div>
      </nav>

      <main className="app-main">
        {renderTabContent()}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Personal Finance Visualizer - Stage 3 Complete</p>
      </footer>
    </div>
  );
}
