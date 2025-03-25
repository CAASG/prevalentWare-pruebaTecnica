import { PageContainer } from '@/components/layout/page-container';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/auth-options";
import { redirect } from 'next/navigation';
import { SignInButton } from '@/components/auth/signin-button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SignInPage() {
  try {
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
                <SignInButton />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Sign in page error:', error);
    }
    redirect('/');
  }
}