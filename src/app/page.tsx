import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { PageContainer } from '@/components/layout/page-container';
import { FinancialSummary } from '@/components/reports/financial-summary';
import { TransactionList } from '@/components/transactions/transaction-list';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  try {
    const session = await getServerSession(authOptions);
    
    // Redirect to sign in if not authenticated
    if (!session) {
      redirect('/api/auth/signin');
    }
    
    return (
      <PageContainer title="Dashboard">
        <div className="space-y-8">
          <FinancialSummary />
          <TransactionList />
        </div>
      </PageContainer>
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Home page error:', error);
    }
    redirect('/api/auth/signin');
  }
}
