import React, { useState } from 'react';
import { FilterOptions } from '@/types/transaction';

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

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

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ onFilterChange, onReset }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: '',
    endDate: '',
    category: '',
    type: 'all',
    minAmount: undefined,
    maxAmount: undefined,
    searchTerm: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number | undefined = value;

    // Convert empty strings to undefined for number fields
    if ((name === 'minAmount' || name === 'maxAmount') && value === '') {
      processedValue = undefined;
    } else if (name === 'minAmount' || name === 'maxAmount') {
      processedValue = parseFloat(value);
    }

    const newFilters = {
      ...filters,
      [name]: processedValue
    };

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      startDate: '',
      endDate: '',
      category: '',
      type: 'all',
      minAmount: undefined,
      maxAmount: undefined,
      searchTerm: ''
    };
    setFilters(resetFilters);
    onReset();
  };

  const hasActiveFilters = () => {
    return filters.startDate !== '' ||
           filters.endDate !== '' ||
           filters.category !== '' ||
           filters.type !== 'all' ||
           filters.minAmount !== undefined ||
           filters.maxAmount !== undefined ||
           filters.searchTerm !== '';
  };

  return (
    <div className="advanced-filter">
      <div className="filter-header">
        <h3>Filters</h3>
        <div className="filter-actions">
          {hasActiveFilters() && (
            <span className="active-filters-indicator">
              Filters Active
            </span>
          )}
          <button
            type="button"
            className="toggle-filter-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </button>
          {hasActiveFilters() && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleReset}
            >
              Reset All
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="filter-content">
          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="searchTerm">Search</label>
              <input
                type="text"
                id="searchTerm"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleChange}
                placeholder="Search descriptions..."
              />
            </div>

            <div className="filter-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleChange}
              >
                <option value="all">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleChange}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="minAmount">Min Amount</label>
              <input
                type="number"
                id="minAmount"
                name="minAmount"
                value={filters.minAmount || ''}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="maxAmount">Max Amount</label>
              <input
                type="number"
                id="maxAmount"
                name="maxAmount"
                value={filters.maxAmount || ''}
                onChange={handleChange}
                placeholder="1000.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="filter-summary">
            {hasActiveFilters() && (
              <div className="active-filters">
                <h4>Active Filters:</h4>
                <div className="filter-tags">
                  {filters.searchTerm && (
                    <span className="filter-tag">
                      Search: &quot;{filters.searchTerm}&quot;
                    </span>
                  )}
                  {filters.type !== 'all' && (
                    <span className="filter-tag">
                      Type: {filters.type}
                    </span>
                  )}
                  {filters.category && (
                    <span className="filter-tag">
                      Category: {filters.category}
                    </span>
                  )}
                  {filters.startDate && (
                    <span className="filter-tag">
                      From: {filters.startDate}
                    </span>
                  )}
                  {filters.endDate && (
                    <span className="filter-tag">
                      To: {filters.endDate}
                    </span>
                  )}
                  {filters.minAmount !== undefined && (
                    <span className="filter-tag">
                      Min: ${filters.minAmount}
                    </span>
                  )}
                  {filters.maxAmount !== undefined && (
                    <span className="filter-tag">
                      Max: ${filters.maxAmount}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;
