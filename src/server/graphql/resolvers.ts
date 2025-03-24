import { prisma } from '../db/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/auth-options';
import { TransactionType, Role } from '@prisma/client';

interface TransactionQueryArgs {
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

interface TransactionMutationArgs {
  amount: number;
  concept: string;
  date: string;
  type: TransactionType;
}

interface UpdateTransactionArgs {
  id: string;
  amount?: number;
  concept?: string;
  date?: string;
  type?: TransactionType;
}

interface UpdateUserArgs {
  userId: string;
  name?: string;
  phone?: string;
  role?: Role;
}

// Helper function to check admin rights
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Not authenticated');
  
  return session.user.role === 'ADMIN';
}

// Helper function to get the current user
async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  
  return prisma.user.findUnique({
    where: { email: session.user.email }
  });
}

export const resolvers = {
  Query: {
    me: async () => {
      const user = await getCurrentUser();
      return user;
    },
    
    // Transaction queries
    transactions: async (_: unknown, args: TransactionQueryArgs) => {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // Check if admin for userId filter
      const isAdmin = currentUser.role === 'ADMIN';
      if (args.userId && !isAdmin) {
        throw new Error('Not authorized to view other users\' transactions');
      }
      
      // Build filter
      const filter: any = {};
      
      if (args.type) {
        filter.type = args.type;
      }
      
      if (args.startDate || args.endDate) {
        filter.date = {};
        if (args.startDate) {
          filter.date.gte = new Date(args.startDate);
        }
        if (args.endDate) {
          filter.date.lte = new Date(args.endDate);
        }
      }
      
      // If admin and userId is provided, filter by that user
      // Otherwise, filter by current user
      filter.userId = isAdmin && args.userId ? args.userId : currentUser.id;
      
      return prisma.transaction.findMany({
        where: filter,
        orderBy: { date: 'desc' },
        include: { user: true }
      });
    },
    
    transaction: async (_: unknown, { id }: { id: string }) => {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: { user: true }
      });
      
      if (!transaction) throw new Error('Transaction not found');
      
      // Check if admin or owner
      const isAdmin = currentUser.role === 'ADMIN';
      if (!isAdmin && transaction.userId !== currentUser.id) {
        throw new Error('Not authorized to view this transaction');
      }
      
      return transaction;
    },
    
    // Financial data queries
    financialSummary: async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const isAdmin = currentUser.role === 'ADMIN';
      
      // For admins, get all transactions; for users, get only their own
      const whereClause = isAdmin ? {} : { userId: currentUser.id };
      
      const incomeData = await prisma.transaction.aggregate({
        where: {
          ...whereClause,
          type: 'INCOME'
        },
        _sum: {
          amount: true
        },
        _count: true
      });
      
      const expenseData = await prisma.transaction.aggregate({
        where: {
          ...whereClause,
          type: 'EXPENSE'
        },
        _sum: {
          amount: true
        },
        _count: true
      });
      
      const totalIncome = incomeData._sum.amount || 0;
      const totalExpense = expenseData._sum.amount || 0;
      
      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        incomeCount: incomeData._count,
        expenseCount: expenseData._count
      };
    },
    
    monthlyStats: async (_: unknown, { year }: { year?: number }) => {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const isAdmin = currentUser.role === 'ADMIN';
      
      // Default to current year if not specified
      const targetYear = year || new Date().getFullYear();
      
      // Create date range for the specified year
      const startDate = new Date(`${targetYear}-01-01T00:00:00Z`);
      const endDate = new Date(`${targetYear}-12-31T23:59:59Z`);
      
      // For admins, get all transactions; for users, get only their own
      const whereClause = isAdmin ? {} : { userId: currentUser.id };
      
      const transactions = await prisma.transaction.findMany({
        where: {
          ...whereClause,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          amount: true,
          type: true,
          date: true
        }
      });
      
      // Initialize monthly stats
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const monthlyStats = months.map(month => ({
        month,
        income: 0,
        expense: 0,
        balance: 0
      }));
      
      // Aggregate transactions by month
      transactions.forEach(transaction => {
        const monthIndex = transaction.date.getMonth();
        
        if (transaction.type === 'INCOME') {
          monthlyStats[monthIndex].income += transaction.amount;
        } else {
          monthlyStats[monthIndex].expense += transaction.amount;
        }
      });
      
      // Calculate balance for each month
      monthlyStats.forEach(stats => {
        stats.balance = stats.income - stats.expense;
      });
      
      return monthlyStats;
    },
    
    // Admin only queries
    allUsers: async () => {
      const isAdmin = await checkAdmin();
      if (!isAdmin) throw new Error('Not authorized: Admin role required');
      
      return prisma.user.findMany({
        orderBy: { name: 'asc' }
      });
    }
  },
  
  Mutation: {
    // Transaction mutations
    createTransaction: async (_: unknown, args: TransactionMutationArgs) => {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // Only admins can create transactions
      if (currentUser.role !== 'ADMIN') {
        throw new Error('Not authorized: Admin role required');
      }
      
      return prisma.transaction.create({
        data: {
          amount: args.amount,
          concept: args.concept,
          date: new Date(args.date),
          type: args.type,
          userId: currentUser.id
        },
        include: { user: true }
      });
    },
    
    updateTransaction: async (_: unknown, args: UpdateTransactionArgs) => {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // Only admins can update transactions
      if (currentUser.role !== 'ADMIN') {
        throw new Error('Not authorized: Admin role required');
      }
      
      const transaction = await prisma.transaction.findUnique({
        where: { id: args.id }
      });
      
      if (!transaction) throw new Error('Transaction not found');
      
      return prisma.transaction.update({
        where: { id: args.id },
        data: {
          ...(args.amount !== undefined && { amount: args.amount }),
          ...(args.concept !== undefined && { concept: args.concept }),
          ...(args.date !== undefined && { date: new Date(args.date) }),
          ...(args.type !== undefined && { type: args.type })
        },
        include: { user: true }
      });
    },
    
    deleteTransaction: async (_: unknown, { id }: { id: string }) => {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // Only admins can delete transactions
      if (currentUser.role !== 'ADMIN') {
        throw new Error('Not authorized: Admin role required');
      }
      
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: { user: true }
      });
      
      if (!transaction) throw new Error('Transaction not found');
      
      return prisma.transaction.delete({
        where: { id },
        include: { user: true }
      });
    },
    
    // Admin only mutations
    updateUser: async (_: unknown, { userId, ...data }: UpdateUserArgs) => {
      const isAdmin = await checkAdmin();
      if (!isAdmin) throw new Error('Not authorized: Admin role required');
      
      return prisma.user.update({
        where: { id: userId },
        data
      });
    }
  },
  
  // Relationship resolvers
  User: {
    transactions: (parent: { id: string }) => 
      prisma.transaction.findMany({
        where: { userId: parent.id },
        orderBy: { date: 'desc' }
      })
  }
};