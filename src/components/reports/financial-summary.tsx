'use client';

import { useQuery } from '@apollo/client';
import { GET_FINANCIAL_SUMMARY } from '@/lib/graphql/operations';
import { useState, useEffect } from 'react';

export function FinancialSummary() {
  const [retryCount, setRetryCount] = useState(0);
  
  const { loading, error, data, refetch } = useQuery(GET_FINANCIAL_SUMMARY, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error('Financial Summary Error:', error);
    }
  });
  
  // Auto-retry logic for the "prepared statement" error
  useEffect(() => {
    if (error && 
        error.message.includes('prepared statement') && 
        retryCount < 3) {
      
      // Retry with increasing delay
      const timeout = setTimeout(() => {
        console.log(`Auto-retrying financial summary (attempt ${retryCount + 1})...`);
        setRetryCount(prev => prev + 1);
        refetch();
      }, 500 * Math.pow(2, retryCount));
      
      return () => clearTimeout(timeout);
    }
  }, [error, retryCount, refetch]);
  
  // If still loading after multiple retries, show a fallback
  const isStillLoading = loading && retryCount > 0;
  
  // If error persists after retries, show a fallback with default values
  const shouldShowFallback = (error && retryCount >= 3) || isStillLoading;
  
  if (shouldShowFallback) {
    // Use a fallback UI instead of error message
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Financial Summary</h3>
          <p className="mt-1 text-sm text-gray-500">
            Unable to fetch latest data. Showing placeholder values.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-green-50 px-4 py-5 sm:p-6 rounded-lg overflow-hidden">
              <dt className="text-sm font-medium text-green-800 truncate">Total Income</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(0)}
              </dd>
              <dd className="mt-2 text-sm text-green-700">
                0 entries
              </dd>
            </div>

            <div className="bg-red-50 px-4 py-5 sm:p-6 rounded-lg overflow-hidden">
              <dt className="text-sm font-medium text-red-800 truncate">Total Expenses</dt>
              <dd className="mt-1 text-3xl font-semibold text-red-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(0)}
              </dd>
              <dd className="mt-2 text-sm text-red-700">
                0 entries
              </dd>
            </div>

            <div className="bg-blue-50 px-4 py-5 sm:p-6 rounded-lg overflow-hidden">
              <dt className="text-sm font-medium text-gray-800 truncate">Current Balance</dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(0)}
              </dd>
              <dd className="mt-2 text-sm text-blue-700">
                Calculating...
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }
  
  // Initial loading state
  if (loading && retryCount === 0) return <div className="text-center p-4">Loading summary...</div>;
  
  // Normal error handling for non-connection errors
  if (error && !error.message.includes('prepared statement')) {
    return <div className="text-center p-4 text-red-500">{error.message}</div>;
  }

  // Destructure with fallback default values in case data is undefined
  const { 
    totalIncome = 0, 
    totalExpense = 0, 
    balance = 0, 
    incomeCount = 0, 
    expenseCount = 0 
  } = data?.financialSummary || {};

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