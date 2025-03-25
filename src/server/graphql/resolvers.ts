import { prisma } from '../db/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/auth-options';
import { TransactionType, Role } from '@prisma/client';
import { safeAggregate } from '@/components/transactions/transaction-helpers';

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

export interface Context {
  session?: {
    user?: {
      id: string;
      role: Role;
    };
  };
}

// Helper function to check admin rights
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Not authenticated');

  return session.user.role === 'ADMIN';
}

// Helper function with improved error handling specifically for the prepared statement error
async function getCurrentUser(context?: Context, retries = 3) {
  // Try to get user from context first
  if (context?.session?.user?.id) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await prisma.user.findUnique({
          where: { id: context.session.user.id }
        });
      } catch (error: any) {
        const errorMessage = error.message || '';
        
        // Check if this is the specific prepared statement error
        const isPreparedStatementError = 
          errorMessage.includes('prepared statement') && 
          errorMessage.includes('does not exist');
          
        console.error(`Error in getCurrentUser (attempt ${attempt + 1}):`, 
          isPreparedStatementError ? 'Prepared statement error' : error);
        
        // For prepared statement errors, disconnect and reconnect immediately
        if (isPreparedStatementError) {
          try {
            console.log('Reconnecting due to prepared statement error...');
            await prisma.$disconnect();
            // Add a small delay before reconnecting
            await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
            await prisma.$connect();
          } catch (reconnectError) {
            console.error('Failed to reconnect:', reconnectError);
          }
        }
        
        if (attempt === retries) {
          console.error('Max retries reached for getCurrentUser');
          // For financial summary, better to return null than throw an error
          return null;
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, 100 * Math.pow(2, attempt))
        );
      }
    }
  }

  // Fallback to getServerSession
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

    transactions: async (_parent: unknown, args: TransactionQueryArgs, context: Context) => {
      // First verify authentication
      if (!context.session?.user) {
        throw new Error('Not authenticated');
      }

      // At this point we've verified user exists, but TypeScript doesn't know that
      // Store a reference with proper typing to avoid repeated null checks
      const currentUser = context.session.user;

      // Build query filter
      const buildFilter = () => {
        const filter: any = {};

        // Only apply userId filter if explicitly requested by an admin
        if (args.userId && currentUser.role === 'ADMIN') {
          filter.userId = args.userId;
        }

        if (args.type) {
          filter.type = args.type;
        }

        if (args.startDate || args.endDate) {
          filter.date = {};

          if (args.startDate) {
            try {
              const startDate = new Date(args.startDate);
              if (!isNaN(startDate.getTime())) {
                filter.date.gte = startDate;
              } else {
                console.warn('Invalid startDate format, ignoring this filter');
              }
            } catch (error) {
              console.warn('Error parsing startDate, ignoring this filter');
            }
          }

          if (args.endDate) {
            try {
              const endDate = new Date(args.endDate);
              if (!isNaN(endDate.getTime())) {
                filter.date.lte = endDate;
              } else {
                console.warn('Invalid endDate format, ignoring this filter');
              }
            } catch (error) {
              console.warn('Error parsing endDate, ignoring this filter');
            }
          }

          // If we failed to set either date filter, check if we need to remove the empty date object
          if (Object.keys(filter.date).length === 0) {
            delete filter.date;
          }
        }

        return filter;
      };

      // Add retry functionality
      const fetchWithRetry = async (retries = 2) => {
        const filter = buildFilter();

        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            // Use Prisma transaction for atomicity
            const transactions = await prisma.$transaction(async (tx) => {
              return tx.transaction.findMany({
                where: filter,
                orderBy: { date: 'desc' },
                include: {
                  user: true,
                },
              });
            });

            return transactions;
          } catch (error) {
            console.error(`Error fetching transactions (attempt ${attempt + 1}):`, error);

            // If we've reached max retries, throw error
            if (attempt === retries) {
              console.error('Max retries reached for transactions query');
              throw new Error('Failed to fetch transactions. Please try again.');
            }

            // Try to reconnect before next retry
            if (attempt === retries - 1) {
              try {
                console.log('Attempting database reconnection for transactions...');
                await prisma.$disconnect();
                await prisma.$connect();
              } catch (reconnectError) {
                console.error('Reconnection failed:', reconnectError);
              }
            }

            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
          }
        }

        // TypeScript needs this but it should never be reached
        return [];
      };

      // Execute the retry logic
      try {
        return await fetchWithRetry();
      } catch (error) {
        console.error('Failed after all transaction fetch retries:', error);
        throw new Error('Failed to fetch transactions. Please try again.');
      }
    },

    transaction: async (_: unknown, { id }: { id: string }, context: Context) => {
      // Add retry functionality for single transaction
      const fetchWithRetry = async (retries = 2) => {
        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            // First get current user
            const currentUser = await getCurrentUser(context);
            if (!currentUser) throw new Error('Not authenticated');

            // Fetch transaction
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
          } catch (error: any) {
            // If it's an authorization error or "not found" error, just throw it immediately
            if (error.message === 'Not authenticated' ||
              error.message === 'Transaction not found' ||
              error.message === 'Not authorized to view this transaction') {
              throw error;
            }

            console.error(`Error fetching transaction (attempt ${attempt + 1}):`, error);

            // If we've reached max retries, throw the error
            if (attempt === retries) {
              throw new Error('Failed to fetch transaction details. Please try again.');
            }

            // Try to reconnect before final retry
            if (attempt === retries - 1) {
              try {
                console.log('Attempting database reconnection for single transaction...');
                await prisma.$disconnect();
                await prisma.$connect();
              } catch (reconnectError) {
                console.error('Reconnection failed:', reconnectError);
              }
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
          }
        }

        // TypeScript needs this but it should never be reached
        throw new Error('Failed to fetch transaction details');
      };

      // Execute the retry logic
      return await fetchWithRetry();
    },

    // Financial data queries
    financialSummary: async (_parent: unknown, _args: {}, context: Context) => {
      const currentUser = await getCurrentUser(context);
      if (!currentUser) throw new Error('Not authenticated');

      const whereClause = {};

      // Add retry functionality directly in the resolver
      const fetchWithRetry = async (retries = 2) => {
        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
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
          } catch (error) {
            console.error(`Error in financial summary (attempt ${attempt + 1}):`, error);

            // If we've reached max retries, either throw or return defaults
            if (attempt === retries) {
              if (process.env.NODE_ENV === 'production') {
                // In production, return defaults instead of failing
                console.error('Max retries reached, returning default values');
                return {
                  totalIncome: 0,
                  totalExpense: 0,
                  balance: 0,
                  incomeCount: 0,
                  expenseCount: 0
                };
              } else {
                // In development, rethrow to help identify issues
                throw error;
              }
            }

            // Try to reconnect before retrying
            if (attempt === retries - 1) {
              try {
                console.log('Attempting database reconnection...');
                await prisma.$disconnect();
                await prisma.$connect();
              } catch (reconnectError) {
                console.error('Reconnection failed:', reconnectError);
              }
            }

            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
          }
        }

        // This should never be reached due to the return in the final retry
        // but TypeScript needs it for type completeness
        return {
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          incomeCount: 0,
          expenseCount: 0
        };
      };

      // Execute the retry logic
      return await fetchWithRetry();
    },

    monthlyStats: async (_: unknown, { year }: { year?: number }) => {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');

      const whereClause = {};

      // Default to current year if not specified
      const targetYear = year || new Date().getFullYear();

      // Create date range for the specified year
      const startDate = new Date(`${targetYear}-01-01T00:00:00Z`);
      const endDate = new Date(`${targetYear}-12-31T23:59:59Z`);

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

      // Ensure date is properly parsed
      let transactionDate: Date;
      try {
        // Handle both string formats and invalid dates
        transactionDate = new Date(args.date);
        if (isNaN(transactionDate.getTime())) {
          // If invalid, default to today
          console.warn('Invalid date provided, defaulting to current date');
          transactionDate = new Date();
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        transactionDate = new Date(); // Default to current date
      }

      return prisma.transaction.create({
        data: {
          amount: args.amount,
          concept: args.concept,
          date: transactionDate,
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