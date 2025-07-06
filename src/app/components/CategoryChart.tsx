import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategorySummary } from '@/types/transaction';

const COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
  '#43e97b', '#38f9d7', '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
];

interface CategoryChartProps {
  refreshTrigger?: number;
}

const CategoryChart: React.FC<CategoryChartProps> = ({ refreshTrigger }) => {
  const [data, setData] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/analytics?type=categories');
        if (!response.ok) {
          throw new Error('Failed to fetch category data');
        }
        const categoryData = await response.json();
        setData(categoryData);
      } catch (error) {
        console.error('Error fetching category data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const formatTooltip = (value: number, name: string) => {
    return [`$${value.toFixed(2)}`, name];
  };

  const renderCustomizedLabel = (entry: { percent?: number }) => {
    const percent = entry.percent;
    if (!percent || percent < 0.05) return ''; // Don't show label for slices smaller than 5%
    return `${(percent * 100).toFixed(0)}%`;
  };

  if (loading) {
    return (
      <div className="chart-container">
        <div className="loading">Loading category data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="error">Error loading chart: {error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <h2>Spending by Category</h2>
        <div className="no-data">
          <p>No expense data available. Add some transactions to see the breakdown!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h2>Spending by Category</h2>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="total"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltip} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => {
                const payload = entry.payload as CategorySummary;
                return (
                  <span style={{ color: entry.color }}>
                    {value} (${payload?.total?.toFixed(2)})
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="category-details">
        <h3>Category Breakdown</h3>
        <div className="category-list">
          {data.map((category, index) => (
            <div key={category.category} className="category-item">
              <div 
                className="category-color" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <div className="category-info">
                <span className="category-name">{category.category}</span>
                <span className="category-amount">${category.total.toFixed(2)}</span>
                <span className="category-count">({category.count} transactions)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;
