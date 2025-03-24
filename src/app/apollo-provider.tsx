'use client';

import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from '@/lib/apollo-client';
import { useState } from 'react';

export function ApolloProviderWrapper({ children }: { children: React.ReactNode }) {
  // Create the client once on component mount
  const [client] = useState(() => createApolloClient());

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}