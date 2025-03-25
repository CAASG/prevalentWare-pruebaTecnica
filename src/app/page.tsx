import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { PageContainer } from '@/components/layout/page-container';
import { FinancialSummary } from '@/components/reports/financial-summary';
import { TransactionList } from '@/components/transactions/transaction-list';
import { AuthDebug } from '@/components/debug/auth-debug';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // Redirect to sign in if not authenticated
  if (!session) {
    redirect('/api/auth/signin');
  }

  console.log('Server: Session found, rendering dashboard');
  
  return (
    <PageContainer title="Dashboard">
      <div className="space-y-8">
        <FinancialSummary />
        
        <TransactionList />
      </div>
    </PageContainer>
  );
}
