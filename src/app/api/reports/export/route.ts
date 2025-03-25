import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { prisma } from "@/server/db/client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and admin role
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build filter
    const filter: any = {};
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.lte = new Date(endDate);
      }
    }
    
    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: filter,
      orderBy: { date: 'desc' },
      include: { user: true }
    });
    
    // Create CSV content
    let csvContent = 'Type,Amount,Concept,Date,User\n';
    
    transactions.forEach(transaction => {
      const type = transaction.type;
      const amount = transaction.amount.toFixed(2);
      const concept = transaction.concept.replace(/,/g, ' ');
      const date = transaction.date.toISOString().split('T')[0];
      const user = transaction.user.name.replace(/,/g, ' ');
      
      csvContent += `${type},${amount},"${concept}",${date},"${user}"\n`;
    });
    
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="financial-report.csv"'
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error generating report:', error);
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}