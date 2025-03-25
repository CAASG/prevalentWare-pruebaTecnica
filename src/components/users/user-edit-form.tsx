'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_USERS, UPDATE_USER } from '@/lib/graphql/operations';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
}

type UserEditFormProps = {
  userId: string;
};

export function UserEditForm({ userId }: UserEditFormProps) {
  const router = useRouter();
  
  const { loading: userLoading, error: userError, data } = useQuery(GET_ALL_USERS);
  const [updateUser, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_ALL_USERS }],
    onCompleted: () => {
      router.push('/admin/users');
    }
  });
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  
  // Find user and populate form
  useEffect(() => {
    if (data?.allUsers) {
      const user = data.allUsers.find((u: User) => u.id === userId);
      if (user) {
        setName(user.name || '');
        setPhone(user.phone || '');
        setRole(user.role as 'USER' | 'ADMIN');
      }
    }
  }, [data, userId]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateUser({
      variables: {
        userId,
        name,
        phone: phone || undefined,
        role
      }
    });
  };
  
  if (userLoading) return <div className="text-center">Loading user...</div>;
  if (userError) return <div className="text-center text-red-500">{userError.message}</div>;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-600"
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-600"
        />
      </div>
      
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'USER' | 'ADMIN')}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-600"
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      
      {updateError && (
        <div className="text-sm text-red-600">
          {updateError.message}
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push('/admin/users')}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={updateLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {updateLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}