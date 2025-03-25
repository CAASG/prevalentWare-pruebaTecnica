'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useAuthSession() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only handle unauthenticated state if not already on auth pages
    if (status === "unauthenticated" && 
        !pathname.includes('/auth/signin') && 
        !pathname.includes('/api/auth')) {
      setError("You are not authenticated");
      router.push('/api/auth/signin');
    } else {
      // Clear error when authenticated or on auth pages
      setError(null);
    }
  }, [status, router, pathname]);

  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (!response.ok) {
        throw new Error('Failed to refresh session');
      }
      router.refresh();
      setError(null);
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