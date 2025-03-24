import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/server/graphql/schema';
import { resolvers } from '@/server/graphql/resolvers';

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Enable introspection for GraphQL Playground
});

// Create the Next.js API handler
const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => {
    return { req };
  },
});

export { handler as GET, handler as POST };