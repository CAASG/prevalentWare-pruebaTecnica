import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { PageContainer } from '@/components/layout/page-container';
import { UserList } from '@/components/users/user-list';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function UsersPage() {
  try {
    const session = await getServerSession(authOptions);
    
    // Redirect to sign in if not authenticated
    if (!session) {
      redirect('/api/auth/signin');
    }
    
    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      redirect('/');
    }
    
    return (
      <PageContainer title="User Management">
        <UserList />
      </PageContainer>
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Users page error:', error);
    }
    redirect('/');
  }
}