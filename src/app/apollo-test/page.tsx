// src/app/apollo-test/page.tsx
'use client';

import { useQuery, gql } from '@apollo/client';

// Simple query to test Apollo Client
const TEST_QUERY = gql`
  query TestQuery {
    me {
      id
      name
      email
      role
    }
  }
`;

export default function ApolloClientTest() {
  // This will execute the query using Apollo Client
  const { loading, error, data, refetch } = useQuery(TEST_QUERY);

  return (
    <div className="p-8 max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Apollo Client Test</h1>
      
      <div className="mb-4">
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Refetch Data
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-black-100 rounded">
          <h2 className="font-medium mb-2">Apollo Client Status:</h2>
          {loading ? (
            <p className="text-yellow-600">⏳ Loading data...</p>
          ) : error ? (
            <div className="text-red-600">
              <p>❌ Error: {error.message}</p>
            </div>
          ) : (
            <p className="text-green-600">✅ Apollo Client is working correctly!</p>
          )}
        </div>
        
        {data && (
          <div className="p-4 bg-black-100 rounded">
            <h2 className="font-medium mb-2">Query Result:</h2>
            <pre className="bg-gray-20 p-4 rounded overflow-auto max-h-96 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="p-4 bg-black-100 rounded">
          <h2 className="font-medium mb-2">How This Verifies Apollo Client:</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>If you see data above, Apollo Client successfully executed the query</li>
            <li>If you click "Refetch Data" and see loading indicators, Apollo's hook system is working</li>
            <li>Try refreshing the page - if data appears quickly, caching is working</li>
            <li>Check your browser's Network tab - you should see GraphQL requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}