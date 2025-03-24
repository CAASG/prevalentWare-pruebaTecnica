'use client';

import { SessionProvider } from "next-auth/react";
import { ApolloProviderWrapper } from "./apollo-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ApolloProviderWrapper>
        {children}
      </ApolloProviderWrapper>
    </SessionProvider>
  );
}