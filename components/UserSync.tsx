'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useConvexAuth } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Silently syncs the authenticated Clerk user into the Convex `users` table.
 * Renders nothing — mount it once inside any authenticated route.
 * Waits for BOTH Clerk (user loaded) AND Convex (token accepted) before
 * firing the mutation, so it never runs before the WebSocket is authed.
 */
export default function UserSync() {
  const { user, isLoaded } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    if (!isLoaded || !user || !isAuthenticated) return;
    ensureUser({
      clerkId: user.id,
      email:   user.primaryEmailAddress?.emailAddress ?? '',
    }).catch(console.error);
  }, [isLoaded, user, isAuthenticated, ensureUser]);

  return null;
}
