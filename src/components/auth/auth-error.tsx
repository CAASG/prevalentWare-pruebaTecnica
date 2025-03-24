'use client';

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthErrorProps {
  error?: string;
  onRetry?: () => void;
}

export function AuthError({ error, onRetry }: AuthErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // If there's an error, redirect to sign in after a short delay
    if (error) {
      const timer = setTimeout(() => {
        signIn("auth0", { callbackUrl: window.location.href });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error || "Your session has expired or is invalid"}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Redirecting to sign in...
            </p>
          </div>
          {onRetry && (
            <div className="text-center">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 