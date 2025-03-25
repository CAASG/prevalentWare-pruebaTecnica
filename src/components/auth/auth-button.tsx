'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useRole } from "@/lib/hooks/use-role";
import { useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client";

export function AuthButton() {
  const { data: session, status } = useSession();
  const { isAdmin } = useRole();
  const loading = status === "loading";
  const router = useRouter();
  const client = useApolloClient();

  const handleSignOut = async () => {
    // Clear Apollo cache
    await client.clearStore();
    // Sign out and redirect to home
    await signOut({ 
      redirect: true,
      callbackUrl: '/' 
    });
  };

  if (loading) return <div>Loading...</div>;

  if (session) {
    return (
      <div className="flex items-center gap-4">
        {session.user?.image && (
          <img 
            src={session.user.image} 
            alt="User avatar" 
            className="w-8 h-8 rounded-full"
          />
        )}
        <div>
          <span className="text-gray-500">Signed in as {session.user?.name}</span>
          {isAdmin && (
            <span className="ml-2 bg-red-500 text-white px-2 py-0.5 text-xs rounded">
              Admin
            </span>
          )}
        </div>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded"
      onClick={() => signIn("auth0")}
    >
      Sign in with Auth0
    </button>
  );
}