import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/server/graphql/schema';
import { resolvers } from '@/server/graphql/resolvers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/server/auth/auth-options';
import type { Context } from '@/server/graphql/resolvers';
import type { Role } from '@prisma/client';

// Add dynamic configuration to prevent static optimization issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Create Apollo Server with proper error handling
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('GraphQL Error:', error);
    }
    return error;
  },
});

// Create the Next.js API handler with session context
const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => {
    try {
      const session = await getServerSession(authOptions);
      return {
        session: session ? {
          user: {
            id: session.user?.id as string,
            role: session.user?.role as Role
          }
        } : undefined
      };
    } catch (error) {
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Context Error:', error);
      }
      return { session: undefined };
    }
  },
});

// Export the handler with proper error handling
export { handler as GET, handler as POST };