// src/server/db/transaction-helpers.ts
import { prisma } from '@/server/db/client';
import { TransactionType } from '@prisma/client';

type WhereClause = {
  userId?: string;
  type?: TransactionType;
  date?: {
    gte?: Date;
    lte?: Date;
  };
};

// Wrap the aggregate function with error handling and retry logic
export async function safeAggregate(whereClause: WhereClause, retries = 2) {
  let attempt = 0;
  
  while (attempt <= retries) {
    try {
      const incomeData = await prisma.transaction.aggregate({
        where: {
          ...whereClause,
          type: 'INCOME',
        },
        _sum: {
          amount: true,
        },
        _count: true,
      });
      
      const expenseData = await prisma.transaction.aggregate({
        where: {
          ...whereClause,
          type: 'EXPENSE',
        },
        _sum: {
          amount: true,
        },
        _count: true,
      });
      
      return {
        incomeData,
        expenseData,
      };
    } catch (error) {
      attempt++;
      console.error(`Transaction aggregate error (attempt ${attempt}):`, error);
      
      if (attempt > retries) throw error;
      
      // Small delay before retry
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // If we're on the last retry, create a new Prisma client to force reconnection
      if (attempt === retries) {
        try {
          await prisma.$disconnect();
          await prisma.$connect();
        } catch (err) {
          console.error("Failed to reconnect:", err);
        }
      }
    }
  }
  
  throw new Error("Failed to perform transaction aggregate after retries");
}