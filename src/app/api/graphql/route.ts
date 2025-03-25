import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/server/graphql/schema';
import { resolvers } from '@/server/graphql/resolvers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/server/auth/auth-options';
import type { Context } from '@/server/graphql/resolvers';
import type { Role } from '@prisma/client';

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create the Next.js API handler with session context
const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => {
    const session = await getServerSession(authOptions);
    return {
      session: session ? {
        user: {
          id: session.user?.id as string,
          role: session.user?.role as Role
        }
      } : undefined
    };
  },
});

export { handler as GET, handler as POST };