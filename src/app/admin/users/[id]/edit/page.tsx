import { redirect, notFound } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { PageContainer } from '@/components/layout/page-container';
import { UserEditForm } from '@/components/users/user-edit-form';
import { prisma } from '@/server/db/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditUserPage({ params }: { params: { id: string } }) {
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
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });
    
    if (!user) {
      notFound();
    }
    
    return (
      <PageContainer title={`Edit User: ${user.name}`}>
        <UserEditForm userId={params.id} />
      </PageContainer>
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Edit user page error:', error);
    }
    redirect('/admin/users');
  }
}