import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { PageContainer } from '@/components/layout/page-container';
import { FinancialSummary } from '@/components/reports/financial-summary';
import { MonthlyChart } from '@/components/reports/monthly-chart';
import { ExportReports } from '@/components/reports/export-reports';

export default async function ReportsPage() {
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
    <PageContainer title="Financial Reports">
      <div className="space-y-8">
        <FinancialSummary />
        
        <MonthlyChart />
        
        <ExportReports />
      </div>
    </PageContainer>
  );
}