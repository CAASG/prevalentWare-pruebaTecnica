'use client';

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { signIn } from 'next-auth/react';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Handle authentication errors
      if (err.message.includes('Not authenticated') || err.message.includes('Not authorized')) {
        // Attempt to refresh the session
        return forward(operation);
      }
      console.error(
        `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`
      );
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // Handle network errors that might be related to authentication
    if (networkError.message.includes('401') || networkError.message.includes('403')) {
      signIn('auth0', { callbackUrl: window.location.href });
    }
  }

  return forward(operation);
});

// HTTP connection to the API
const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin'  // Important for auth cookies
});

// Create the Apollo Client instance
export const createApolloClient = () => {
  return new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        retry: 1, // Only retry once for failed requests
      },
    },
  });
};