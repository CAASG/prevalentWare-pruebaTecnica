'use client';

import { useMutation } from '@apollo/client';
import { 
  CREATE_TRANSACTION, 
  UPDATE_TRANSACTION,
  GET_TRANSACTIONS,
  GET_FINANCIAL_SUMMARY
} from '@/lib/graphql/operations';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function formatDateForInput(dateValue: string | Date | undefined): string {
  try {
    if (!dateValue) {
      return new Date().toISOString().split('T')[0];
    }
    
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date, using current date instead');
      return new Date().toISOString().split('T')[0];
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toISOString().split('T')[0];
  }
}

type TransactionFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: {
    id?: string;
    amount?: number;
    concept?: string;
    date?: string;
    type?: 'INCOME' | 'EXPENSE';
  };
};

export function TransactionForm({ mode, defaultValues = {} }: TransactionFormProps) {
  const router = useRouter();
  
  // Form state
  const [amount, setAmount] = useState(defaultValues.amount?.toString() || '');
  const [concept, setConcept] = useState(defaultValues.concept || '');
  // Updated date state with robust formatter
  const [date, setDate] = useState(formatDateForInput(defaultValues.date));
  
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(
    defaultValues.type || 'INCOME'
  );
  
  // Create transaction mutation
  const [createTransaction, { loading: createLoading, error: createError }] = useMutation(
    CREATE_TRANSACTION,
    {
      refetchQueries: [
        { query: GET_TRANSACTIONS },
        { query: GET_FINANCIAL_SUMMARY }
      ],
      onCompleted: () => {
        router.push('/transactions');
      }
    }
  );
  
  // Update transaction mutation
  const [updateTransaction, { loading: updateLoading, error: updateError }] = useMutation(
    UPDATE_TRANSACTION,
    {
      refetchQueries: [
        { query: GET_TRANSACTIONS },
        { query: GET_FINANCIAL_SUMMARY }
      ],
      onCompleted: () => {
        router.push('/transactions');
      }
    }
  );
  
  const loading = createLoading || updateLoading;
  const error = createError || updateError;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (concept.trim() === '') {
      alert('Please enter a concept');
      return;
    }

    let validDate = date;
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date in submission, using current date');
        validDate = new Date().toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Error with date format:', error);
      validDate = new Date().toISOString().split('T')[0];
    }
    
    const variables = {
      amount: amountValue,
      concept,
      date,
      type
    };
    
    if (mode === 'create') {
      createTransaction({ variables });
    } else if (mode === 'edit' && defaultValues.id) {
      updateTransaction({ 
        variables: {
          id: defaultValues.id,
          ...variables
        }
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-500"
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="concept" className="block text-sm font-medium text-gray-700">
            Concept
          </label>
          <input
            type="text"
            id="concept"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            required
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(formatDateForInput(e.target.value))}
            required
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-500"
          />
        </div>
      </div>
      
      {error && (
        <div className="mt-4 text-sm text-red-600">
          {error.message}
        </div>
      )}
      
      <div className="mt-6 flex items-center justify-end">
        <button
          type="button"
          onClick={() => router.push('/transactions')}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
        </button>
      </div>
    </form>
  );
}