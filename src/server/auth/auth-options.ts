import { PrismaAdapter } from "@auth/prisma-adapter";
import Auth0Provider from "next-auth/providers/auth0";
import { AuthOptions, DefaultSession } from "next-auth";
import { prisma } from "../db/client";
import { Role } from "@prisma/client";

// Type declaration
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
  
  // Add this to ensure proper typing for the user object
  interface User {
    role?: Role;
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
    strategy: "jwt", // Changed from "database" to "jwt"
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // Updated session callback for JWT strategy
    async session({ session, token }) {
      if (session.user) {
        // With JWT strategy, user info comes from token
        session.user.id = token.sub || '';
        session.user.role = (token.role as Role) || 'USER';
      }
      return session;
    },
    
    // New callback for JWT strategy
    async jwt({ token, user }) {
      // When signing in, add user role to the token
      if (user) {
        token.role = user.role || 'USER';
      }
      return token;
    },
    
    // Add a redirect callback for debugging
    async redirect({ url, baseUrl }) {
      // Ensure the URL is relative to the base URL
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    }
  },
  events: {
    createUser: async ({ user }) => {
      try {
        const isAdmin = user.email?.includes('admin@') || false;
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            role: isAdmin ? 'ADMIN' : 'USER',
            name: user.name || user.email?.split('@')[0] || 'User'
          }
        });
        console.log(`User created and role set: ${user.email}`);
      } catch (error) {
        console.error('Error in createUser event:', error);
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development', // Enable debugging
};