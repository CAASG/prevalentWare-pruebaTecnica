// src/app/auth/signin/page.tsx
import { PageContainer } from '@/components/layout/page-container';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { redirect } from 'next/navigation';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  
  // If already signed in, redirect to home
  if (session) {
    redirect('/');
  }
  
  return (
    <PageContainer title="Sign In">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <div className="mt-6">
              <form className="space-y-6" action="/api/auth/signin/auth0" method="GET">
                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Sign in with Auth0
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}