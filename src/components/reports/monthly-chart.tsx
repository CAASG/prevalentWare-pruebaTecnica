'use client';

import { useQuery } from '@apollo/client';
import { GET_MONTHLY_STATS } from '@/lib/graphql/operations';
import { useState, useEffect } from 'react';

// Is requtired to install @types/recharts and recharts for the component below: npm install recharts @types/recharts


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export function MonthlyChart() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState<any[]>([]);
  
  const { loading, error, data } = useQuery(GET_MONTHLY_STATS, {
    variables: { year },
    fetchPolicy: 'cache-and-network'
  });
  
  useEffect(() => {
    if (data?.monthlyStats) {
      // Format data for chart
      setChartData(data.monthlyStats.map((stat: any) => ({
        name: stat.month.substring(0, 3), // First 3 letters of month
        Income: parseFloat(stat.income.toFixed(2)),
        Expenses: parseFloat(stat.expense.toFixed(2)),
        Balance: parseFloat(stat.balance.toFixed(2))
      })));
    }
  }, [data]);
  
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 5; y <= currentYear; y++) {
    years.push(y);
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-black">Monthly Financial Overview</h2>
        
        <div>
          <label htmlFor="year" className="mr-2 text-sm">
            Year:
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="h-80 flex items-center justify-center">
          Loading chart...
        </div>
      ) : error ? (
        <div className="h-80 flex items-center justify-center text-red-500">
          {error.message}
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(value as number),
              ]} />
              <Legend />
              <Bar dataKey="Income" fill="#4ade80" />
              <Bar dataKey="Expenses" fill="#f87171" />
              <Bar dataKey="Balance" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}