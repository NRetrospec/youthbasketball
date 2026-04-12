import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/** Idempotent: creates a Convex user record for the Clerk user if one does not exist yet. */
export const ensureUser = mutation({
  args: {
    clerkId: v.string(),
    email:   v.string(),
  },
  handler: async (ctx, { clerkId, email }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', clerkId))
      .first();

    if (existing) return existing._id;

    return ctx.db.insert('users', {
      clerkId,
      email: email.trim().toLowerCase(),
      role:  'user',
      createdAt: Date.now(),
    });
  },
});

/** Returns the full user record for the currently authenticated Clerk user. */
export const getCurrentUser = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .first();
  },
});

/** Lightweight role check — used by the split-screen splash. */
export const getUserRole = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .first();
    return user?.role ?? null;
  },
});

/** Coach-only: promote or demote a user's role. */
export const setUserRole = mutation({
  args: {
    userId: v.id('users'),
    role:   v.union(v.literal('user'), v.literal('coach')),
  },
  handler: async (ctx, { userId, role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const caller = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .first();

    if (!caller || caller.role !== 'coach') throw new Error('Unauthorized');

    await ctx.db.patch(userId, { role });
  },
});

/** Coach-only: list all platform users. */
export const listAllUsers = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const caller = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .first();

    if (!caller || caller.role !== 'coach') throw new Error('Unauthorized');

    return ctx.db.query('users').order('desc').collect();
  },
});
