'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useRole() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      // Check if user role is ADMIN directly from session
      setIsAdmin(session.user.role === 'ADMIN');
    }
    
    setLoading(false);
  }, [session, status]);

  return {
    role: session?.user?.role || 'USER',
    isAdmin,
    isAuthenticated: !!session?.user,
    loading,
  };
}