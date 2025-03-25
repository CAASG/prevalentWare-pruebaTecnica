'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn('auth0', { 
        callbackUrl: window.location.origin,
        redirect: true
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign in with Auth0'}
      </button>
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}