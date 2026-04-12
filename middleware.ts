import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublic = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/booking(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublic(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next (Next.js internals)
     *   - Any path with a file extension (static files in /public, including .MP4, .json, etc.)
     */
    '/((?!_next|.*\\..*).*)',
    '/(api|trpc)(.*)',
  ],
};
