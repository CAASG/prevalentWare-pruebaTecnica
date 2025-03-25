'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Create a client component that uses the hook
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h1>
      <p className="mb-4">An error occurred during authentication:</p>
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        {error || "Unknown error"}
      </div>
      <div className="mt-6">
        <a href="/" className="text-blue-600 hover:underline">Return to home page</a>
      </div>
    </div>
  );
}

// Main page component with suspense boundary
export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading error details...</div>}>
      <ErrorContent />
    </Suspense>
  );
}