'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function GraphQLTestPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [variables, setVariables] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const executeQuery = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: variables ? JSON.parse(variables) : undefined,
        }),
      });

      const data = await response.json();

      if (data.errors) {
        setError(JSON.stringify(data.errors, null, 2));
      } else {
        setResult(JSON.stringify(data.data, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          GraphQL API Test Page
        </h1>
        
        {!session ? (
          <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 rounded-md mb-6">
            Please log in to test the GraphQL API
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Query:
              </label>
              <textarea
                className="w-full h-48 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your GraphQL query here..."
              />
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Variables (JSON):
              </label>
              <textarea
                className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                placeholder='{"variable": "value"}'
              />
            </div>

            <button
              onClick={executeQuery}
              disabled={loading || !query}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md shadow-sm transition-colors duration-200"
            >
              {loading ? 'Executing...' : 'Execute Query'}
            </button>

            {error && (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <h2 className="text-red-600 dark:text-red-400 font-medium mb-3">Error:</h2>
                <pre className="bg-red-50 dark:bg-red-900/50 p-4 rounded-md overflow-auto text-sm text-red-900 dark:text-red-200">
                  {error}
                </pre>
              </div>
            )}

            {result && (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <h2 className="text-green-600 dark:text-green-400 font-medium mb-3">Result:</h2>
                <pre className="bg-green-50 dark:bg-green-900/50 p-4 rounded-md overflow-auto text-sm text-green-900 dark:text-green-200">
                  {result}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 