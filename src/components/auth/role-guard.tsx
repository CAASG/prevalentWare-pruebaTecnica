'use client';

import { useRole } from "@/lib/hooks/use-role";
import { redirect } from "next/navigation";
import { useEffect } from "react";

type RoleGuardProps = {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
  fallback?: React.ReactNode;
  redirectTo?: string;
};

export function RoleGuard({ 
  children, 
  requiredRole = 'USER',
  fallback = null,
  redirectTo,
}: RoleGuardProps) {
  const { role, loading } = useRole();
  
  // Determine if user has required role
  const hasRequiredRole = requiredRole === 'ADMIN' 
    ? role === 'ADMIN'
    : true; // Any authenticated user can access USER resources
  
  useEffect(() => {
    // Only handle redirect after loading is complete
    if (!loading && !hasRequiredRole && redirectTo) {
      redirect(redirectTo);
    }
  }, [loading, hasRequiredRole, redirectTo]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasRequiredRole) {
    return fallback;
  }

  return <>{children}</>;
}