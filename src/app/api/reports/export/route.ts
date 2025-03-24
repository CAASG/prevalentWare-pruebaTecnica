import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/server/auth/auth-options";
import { prisma } from "@/server/db/client";

export async function GET(request: Request) {
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
    const concept = transaction.concept.replace(/,/g, ' '); // Remove commas to avoid CSV issues
    const date = transaction.date.toISOString().split('T')[0];
    const user = transaction.user.name.replace(/,/g, ' ');
    
    csvContent += `${type},${amount},"${concept}",${date},"${user}"\n`;
  });
  
  // Set headers for CSV download
  const headers = new Headers();
  headers.set('Content-Type', 'text/csv');
  headers.set('Content-Disposition', 'attachment; filename="financial-report.csv"');
  
  return new Response(csvContent, {
    headers,
  });
}