// src/app/api/auth-test/user/route.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/server/auth/auth-options";
import { prisma } from "@/server/db/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        _count: {
          select: { 
            transactions: true 
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User found in session but not in database' },
        { status: 404 }
      );
    }
    
    // Strip sensitive information
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      transactionCount: user._count.transactions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
}