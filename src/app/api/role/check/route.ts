import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";

// Add dynamic configuration to prevent static optimization issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Create a simple handler function
const handler = async () => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return Response.json({ 
        authenticated: false,
        isAdmin: false 
      });
    }
    
    return Response.json({ 
      authenticated: true,
      isAdmin: session.user.role === 'ADMIN' 
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Role check error:', error);
    }
    return Response.json({ 
      authenticated: false,
      isAdmin: false,
      error: 'Internal Server Error'
    }, { status: 500 });
  }
};

// Export the handler
export { handler as GET };