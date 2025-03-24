'use client';

import { useQuery } from '@apollo/client';
import { GET_FINANCIAL_SUMMARY } from '@/lib/graphql/operations';

export function FinancialSummary() {
  const { loading, error, data } = useQuery(GET_FINANCIAL_SUMMARY, {
    fetchPolicy: 'cache-and-network'
  });

  if (loading) return <div className="text-center p-4">Loading summary...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error.message}</div>;

  const { totalIncome, totalExpense, balance, incomeCount, expenseCount } = data.financialSummary;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Financial Summary</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-green-50 px-4 py-5 sm:p-6 rounded-lg overflow-hidden">
            <dt className="text-sm font-medium text-green-800 truncate">Total Income</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(totalIncome)}
            </dd>
            <dd className="mt-2 text-sm text-green-700">
              {incomeCount} entries
            </dd>
          </div>

          <div className="bg-red-50 px-4 py-5 sm:p-6 rounded-lg overflow-hidden">
            <dt className="text-sm font-medium text-red-800 truncate">Total Expenses</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(totalExpense)}
            </dd>
            <dd className="mt-2 text-sm text-red-700">
              {expenseCount} entries
            </dd>
          </div>

          <div className={`${
            balance >= 0 ? 'bg-blue-50' : 'bg-yellow-50'
          } px-4 py-5 sm:p-6 rounded-lg overflow-hidden`}>
            <dt className="text-sm font-medium text-gray-800 truncate">Current Balance</dt>
            <dd className={`mt-1 text-3xl font-semibold ${
              balance >= 0 ? 'text-blue-900' : 'text-yellow-900'
            }`}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(balance)}
            </dd>
            <dd className={`mt-2 text-sm ${
              balance >= 0 ? 'text-blue-700' : 'text-yellow-700'
            }`}>
              {balance >= 0 ? 'Positive balance' : 'Negative balance'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}