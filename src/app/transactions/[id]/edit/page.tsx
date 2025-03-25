import { redirect, notFound } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { PageContainer } from '@/components/layout/page-container';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { prisma } from '@/server/db/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditTransactionPage({ params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Redirect to sign in if not authenticated
    if (!session) {
      redirect('/api/auth/signin');
    }
    
    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      redirect('/transactions');
    }
    
    // Fetch transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id }
    });
    
    // If transaction not found, show 404
    if (!transaction) {
      notFound();
    }
    
    return (
      <PageContainer title="Edit Transaction">
        <TransactionForm 
          mode="edit" 
          defaultValues={{
            id: transaction.id,
            amount: transaction.amount,
            concept: transaction.concept,
            date: transaction.date.toISOString(),
            type: transaction.type as 'INCOME' | 'EXPENSE'
          }} 
        />
      </PageContainer>
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Edit transaction page error:', error);
    }
    redirect('/transactions');
  }
}