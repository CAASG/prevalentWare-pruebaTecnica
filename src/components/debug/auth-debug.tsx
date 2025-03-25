'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function AuthDebug() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('Auth Status:', status);
    console.log('Session Data:', session);
  }, [session, status]);

  // Don't render anything server-side
  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 right-0 p-4 bg-gray-800 text-white text-xs rounded-tl-lg opacity-70 hover:opacity-100">
      Status: {status} | 
      User: {session?.user?.name || 'Not signed in'} | 
      Role: {session?.user?.role || 'None'}
    </div>
  );
}