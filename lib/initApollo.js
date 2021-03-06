import { ApolloClient, createNetworkInterface } from 'react-apollo';
import fetch from 'isomorphic-fetch';

let apolloClient = null;

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) { // eslint-disable-line
  global.fetch = fetch; // eslint-disable-line
}

function create (host: string) {
  return new ApolloClient({
    ssrMode: !process.browser, // eslint-disable-line
    networkInterface: createNetworkInterface({
      uri: `${host || ''}/graphql`, // Server URL (must be absolute)
      opts: { // Additional fetch() options like `credentials` or `headers`
        credentials: 'same-origin'
      }
    })
  });
}

export default function initApollo (req: Object) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    if (req) {
      return process.env.NODE_ENV === 'production'
        ? create(`https://${req.headers.host}`)
        : create(`http://${req.headers.host}`);
    } else {
      return create();
    }
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create();
  }

  return apolloClient;
}