import { ConvexReactClient } from 'convex/react';

// Singleton client for imperative calls (e.g., from SignUpModal without hooks)
let _client: ConvexReactClient | null = null;

const getClient = (): ConvexReactClient => {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
    _client = new ConvexReactClient(url);
  }
  return _client;
};

export default getClient();
