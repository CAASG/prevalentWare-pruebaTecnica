'use client';

import { useQuery } from '@apollo/client';
import { GET_ALL_USERS } from '@/lib/graphql/operations';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export function UserList() {
  const { loading, error, data } = useQuery(GET_ALL_USERS);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Users
        </h3>
      </div>
      
      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading users...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error.message}</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {data.allUsers.map((user: User) => (
            <li key={user.id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <div className="flex text-sm">
                      <p className="font-medium text-indigo-600 truncate">{user.name}</p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                        {user.role === 'ADMIN' && (
                          <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <p>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}