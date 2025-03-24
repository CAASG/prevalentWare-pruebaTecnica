'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthSession() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      setError("You are not authenticated");
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (!response.ok) {
        throw new Error('Failed to refresh session');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh session');
    }
  };

  return {
    session,
    status,
    error,
    refreshSession,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
} 