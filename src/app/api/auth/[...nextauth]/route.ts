import NextAuth from "next-auth";
import { authOptions } from "./auth-config";

// Add runtime configuration
export const runtime = 'edge';

// Add dynamic configuration to prevent static optimization issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const handler = NextAuth(authOptions);

// Export the handler with proper error handling
export async function GET(request: Request) {
  try {
    return await handler(request);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('NextAuth GET error:', error);
    }
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: Request) {
  try {
    return await handler(request);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('NextAuth POST error:', error);
    }
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}