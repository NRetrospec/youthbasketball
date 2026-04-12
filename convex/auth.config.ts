/**
 * Tells Convex to trust JWTs issued by this Clerk instance.
 * After changing this file, run `npx convex dev` to push the config.
 *
 * In Clerk Dashboard → JWT Templates, create a template named "convex"
 * (leave all settings at their defaults — Convex needs no custom claims).
 */
export default {
  providers: [
    {
      domain:        'https://immune-wren-68.clerk.accounts.dev',
      applicationID: 'convex',
    },
  ],
};
