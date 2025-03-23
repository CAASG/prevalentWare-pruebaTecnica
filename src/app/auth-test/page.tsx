// src/app/auth-test/page.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AuthTestPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  
  // Get user from database when session is available
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData();
    }
  }, [session]);
  
  async function fetchUserData() {
    try {
      // Simple API endpoint to get user data from Prisma
      const res = await fetch('/api/auth-test/user');
      const data = await res.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
  
  return (
    <div className="p-8 max-w-lg mx-auto mt-10 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Auth Integration Test</h1>
      
      <div className="mb-8 p-4 border rounded">
        <h2 className="font-semibold mb-2">Authentication Status:</h2>
        <div className="text-sm">
          {status === 'loading' ? (
            <p>Loading session...</p>
          ) : session ? (
            <div>
              <p className="text-green-600 font-medium">✅ Authenticated</p>
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                <pre>{JSON.stringify(session, null, 2)}</pre>
              </div>
              <button 
                onClick={() => signOut()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div>
              <p className="text-red-600 mb-4">❌ Not authenticated</p>
              <button 
                onClick={() => signIn('auth0')}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Sign In with Auth0
              </button>
            </div>
          )}
        </div>
      </div>
      
      {session && (
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Database User (from Prisma):</h2>
          {userData ? (
            <div className="text-sm mt-4 p-3 bg-gray-50 rounded text-xs">
              <pre>{JSON.stringify(userData, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-sm">Loading database user data...</p>
          )}
        </div>
      )}
    </div>
  );
}