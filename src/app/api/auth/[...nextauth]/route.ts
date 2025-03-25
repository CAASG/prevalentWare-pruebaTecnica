import NextAuth from "next-auth";
import { authOptions } from "@/server/auth/auth-options";

const handler = NextAuth(authOptions);

// Export the handler with proper error handling
export const GET = handler;
export const POST = handler;