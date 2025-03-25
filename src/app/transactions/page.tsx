import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { PageContainer } from '@/components/layout/page-container';
import { TransactionList } from '@/components/transactions/transaction-list';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TransactionsPage() {
  try {
    const session = await getServerSession(authOptions);
    
    // Redirect to sign in if not authenticated
    if (!session) {
      redirect('/api/auth/signin');
    }
    
    return (
      <PageContainer title="Transactions">
        <TransactionList />
      </PageContainer>
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Transactions page error:', error);
    }
    redirect('/api/auth/signin');
  }
}