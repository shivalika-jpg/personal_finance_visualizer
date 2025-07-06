import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyExpense } from '@/types/transaction';

interface MonthlyExpensesChartProps {
  refreshTrigger?: number;
}

const MonthlyExpensesChart: React.FC<MonthlyExpensesChartProps> = ({ refreshTrigger }) => {
  const [data, setData] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/analytics?type=monthly');
        if (!response.ok) {
          throw new Error('Failed to fetch monthly data');
        }
        const monthlyData = await response.json();
        
        // Fill in missing months with zero values
        const months = [];
        const currentDate = new Date();
        for (let i = 11; i >= 0; i--) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          const existingData = monthlyData.find((item: MonthlyExpense) => item.month === monthKey);
          months.push({
            month: monthKey,
            total: existingData ? existingData.total : 0,
            displayMonth: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          });
        }
        
        setData(months);
      } catch (error) {
        console.error('Error fetching monthly data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const formatTooltip = (value: number) => {
    return [`$${value.toFixed(2)}`, 'Total Expenses'];
  };

  const formatYAxisTick = (value: number) => {
    return `$${value}`;
  };

  if (loading) {
    return (
      <div className="chart-container">
        <div className="loading">Loading chart data...</div>
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

  return (
    <div className="chart-container">
      <h2>Monthly Expenses (Last 12 Months)</h2>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="displayMonth" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
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
            <Bar 
              dataKey="total" 
              fill="#dc3545" 
              radius={[4, 4, 0, 0]}
              name="Total Expenses"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyExpensesChart;
