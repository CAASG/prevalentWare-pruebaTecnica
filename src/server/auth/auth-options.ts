// src/server/auth/auth-options.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import Auth0Provider from "next-auth/providers/auth0";
import { AuthOptions, DefaultSession } from "next-auth";
import { prisma } from "../db/client";

// Extend the session type to include user ID and role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER!
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        
        // Get user with role
        const userWithRole = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        });
        
        // Add role to session
        session.user.role = userWithRole?.role || 'USER';
      }
      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      // Set initial role when a user is created
      // For example, you might make specific emails admins
      const isAdmin = user.email?.includes('admin@') || false;
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          role: isAdmin ? 'ADMIN' : 'USER',
          // Ensure name is set (required in our schema)
          name: user.name || user.email?.split('@')[0] || 'User'
        }
      });
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};