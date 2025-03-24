'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useRole } from "@/lib/hooks/use-role";

export function AuthButton() {
  const { data: session, status } = useSession();
  const { isAdmin } = useRole();
  const loading = status === "loading";

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
          <span>Signed in as {session.user?.name}</span>
          {isAdmin && (
            <span className="ml-2 bg-red-500 text-white px-2 py-0.5 text-xs rounded">
              Admin
            </span>
          )}
        </div>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => signOut()}
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