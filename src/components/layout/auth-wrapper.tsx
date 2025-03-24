'use client';

import { useAuthSession } from '@/lib/hooks/use-auth-session';
import { AuthError } from '@/components/auth/auth-error';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { error, refreshSession } = useAuthSession();

  if (error) {
    return <AuthError error={error} onRetry={refreshSession} />;
  }

  return <>{children}</>;
} 