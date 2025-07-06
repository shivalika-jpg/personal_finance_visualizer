import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BudgetComparison } from '@/types/transaction';

interface BudgetVsActualChartProps {
  selectedMonth?: string;
  refreshTrigger?: number;
}

const BudgetVsActualChart: React.FC<BudgetVsActualChartProps> = ({ selectedMonth, refreshTrigger }) => {
  const [data, setData] = useState<BudgetComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(selectedMonth || new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/analytics?type=budget-comparison&month=${month}`);
        if (!response.ok) {
          throw new Error('Failed to fetch budget comparison data');
        }
        const comparisonData = await response.json();
        setData(comparisonData);
      } catch (error) {
        console.error('Error fetching budget comparison data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, refreshTrigger]);

  const formatTooltip = (value: number, name: string) => {
    return [`$${value.toFixed(2)}`, name === 'budgeted' ? 'Budgeted' : 'Actual Spending'];
  };

  const formatYAxisTick = (value: number) => {
    return `$${value}`;
  };

  const getBarColor = (entry: BudgetComparison) => {
    if (entry.actual > entry.budgeted) {
      return '#dc3545'; // Red for over budget
    } else if (entry.actual > entry.budgeted * 0.8) {
      return '#ffc107'; // Yellow for near budget
    } else {
      return '#28a745'; // Green for under budget
    }
  };

  if (loading) {
    return (
      <div className="chart-container">
        <div className="loading">Loading budget comparison...</div>
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
        <h2>Budget vs Actual Spending</h2>
        <div className="month-selector">
          <label htmlFor="month-select">Select Month: </label>
          <input
            id="month-select"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="no-data">
          <p>No budget data available for this month. Set up budgets to see comparisons!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h2>Budget vs Actual Spending</h2>
      <div className="month-selector">
        <label htmlFor="month-select">Select Month: </label>
        <input
          id="month-select"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickFormatter={formatYAxisTick}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelStyle={{ color: '#333' }}
              contentStyle={{ 
                backgroundColor: '#f8f9fa', 
                border: '1px solid #dee2e6',
                borderRadius: '4px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="budgeted" 
              fill="#667eea" 
              name="Budgeted"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="actual" 
              fill="#dc3545" 
              name="Actual"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="budget-summary">
        <h3>Budget Summary</h3>
        <div className="summary-cards">
          {data.map((item) => (
            <div key={item.category} className={`budget-card ${item.actual > item.budgeted ? 'over-budget' : 'under-budget'}`}>
              <div className="budget-card-header">
                <h4>{item.category}</h4>
                <span className={`status-indicator ${item.actual > item.budgeted ? 'over' : 'under'}`}>
                  {item.actual > item.budgeted ? '⚠️' : '✅'}
                </span>
              </div>
              <div className="budget-amounts">
                <div className="budget-amount">
                  <span className="label">Budgeted:</span>
                  <span className="value">${item.budgeted.toFixed(2)}</span>
                </div>
                <div className="actual-amount">
                  <span className="label">Actual:</span>
                  <span className="value">${item.actual.toFixed(2)}</span>
                </div>
                <div className="difference">
                  <span className="label">Difference:</span>
                  <span className={`value ${item.difference >= 0 ? 'positive' : 'negative'}`}>
                    {item.difference >= 0 ? '+' : ''}${item.difference.toFixed(2)}
                  </span>
                </div>
                <div className="percentage">
                  <span className="label">Used:</span>
                  <span className="value">{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetVsActualChart;
