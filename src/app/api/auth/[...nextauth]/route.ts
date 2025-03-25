import NextAuth from "next-auth";
import { authOptions } from "@/server/auth/auth-options";

// Add dynamic configuration to prevent static optimization issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const handler = NextAuth(authOptions);

// Export the handler with proper error handling
export const GET = handler;
export const POST = handler;