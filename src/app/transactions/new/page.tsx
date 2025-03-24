import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { PageContainer } from '@/components/layout/page-container';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { prisma } from '@/server/db/client';

export default async function NewTransactionPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect to sign in if not authenticated
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  // Check if user is admin
  if (session.user.role !== 'ADMIN') {
    redirect('/transactions');
  }
  
  return (
    <PageContainer title="New Transaction">
      <TransactionForm mode="create" />
    </PageContainer>
  );
}