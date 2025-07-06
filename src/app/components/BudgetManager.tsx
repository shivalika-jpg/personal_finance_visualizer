import React, { useState, useEffect } from 'react';
import { BudgetForm, Budget } from '@/types/transaction';

interface BudgetManagerProps {
  onAddBudget: (budget: BudgetForm) => void;
  onUpdateBudget: (id: string, budget: BudgetForm) => void;
  onDeleteBudget: (id: string) => void;
  refreshTrigger?: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Personal Care',
  'Other'
];

const BudgetManager: React.FC<BudgetManagerProps> = ({ onAddBudget, onUpdateBudget, onDeleteBudget, refreshTrigger }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [formData, setFormData] = useState<BudgetForm>({
    category: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7)
  });
  const [errors, setErrors] = useState<Partial<BudgetForm>>({});

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await fetch('/api/budgets');
        if (!response.ok) {
          throw new Error('Failed to fetch budgets');
        }
        const data = await response.json();
        setBudgets(data);
      } catch (error) {
        console.error('Error fetching budgets:', error);
      }
    };

    fetchBudgets();
  }, [refreshTrigger]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onAddBudget(formData);
    // Reset form after successful submission
    setFormData({
      category: '',
      amount: '',
      month: new Date().toISOString().slice(0, 7)
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Partial<BudgetForm> = {};
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.month) {
      newErrors.month = 'Month is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="budget-manager">
      <h2>Budget Manager</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <span className="error">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
          />
          {errors.amount && <span className="error">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="month">Month</label>
          <input
            type="month"
            id="month"
            name="month"
            value={formData.month}
            onChange={handleChange}
          />
          {errors.month && <span className="error">{errors.month}</span>}
        </div>

        <button type="submit" className="submit-btn">Add Budget</button>
      </form>

      <div className="budgets-list">
        <h3>Existing Budgets</h3>
        {budgets.length > 0 ? (
          <ul>
            {budgets.map(budget => (
              <li key={budget._id}>
                {budget.category} - ${budget.amount} for {MONTHS[parseInt(budget.month.split('-')[1], 10) - 1]} {budget.month.split('-')[0]}
                <button onClick={() => onDeleteBudget(budget._id!)}>Remove</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No budgets found</p>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;

