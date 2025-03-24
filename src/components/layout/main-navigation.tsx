'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthButton } from '@/components/auth/auth-button';
import { useRole } from '@/lib/hooks/use-role';

export function MainNavigation() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useRole();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                Finance Manager
              </Link>
            </div>
            <nav className="ml-6 flex items-center space-x-4">
              <Link 
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Dashboard
              </Link>
              
              <Link 
                href="/transactions"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname.startsWith('/transactions') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Transactions
              </Link>
              
              {isAdmin && (
                <>
                  <Link 
                    href="/admin/users"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname.startsWith('/admin/users') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Users
                  </Link>
                  
                  <Link 
                    href="/admin/reports"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname.startsWith('/admin/reports') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Reports
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}