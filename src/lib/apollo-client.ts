'use client';

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { signIn } from 'next-auth/react';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Only log authentication errors, don't try to handle them here
      // as they will be handled by the useAuthSession hook
      console.error(
        `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`
      );
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
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
        fetchPolicy: 'cache-and-network'
      },
    },
  });
};