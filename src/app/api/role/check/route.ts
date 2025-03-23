import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/server/auth/auth-options";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ 
      authenticated: false,
      isAdmin: false 
    });
  }
  
  return NextResponse.json({ 
    authenticated: true,
    isAdmin: session.user.role === 'ADMIN' 
  });
}