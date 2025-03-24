import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { PageContainer } from '@/components/layout/page-container';
import { TransactionList } from '@/components/transactions/transaction-list';

export default async function TransactionsPage() {
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
}