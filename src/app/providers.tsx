'use client';

import { SessionProvider } from "next-auth/react";
import { ApolloProviderWrapper } from "./apollo-provider";
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
      >
        Try again
      </button>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
        <ApolloProviderWrapper>
          {children}
        </ApolloProviderWrapper>
      </SessionProvider>
    </ErrorBoundary>
  );
}