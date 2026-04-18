import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

async function getAuthUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .first();
  if (!user) throw new Error('User not found');
  return user;
}

export const createDispute = mutation({
  args: {
    challengeId: v.id('challenges'),
    reason:      v.string(),
  },
  handler: async (ctx, { challengeId, reason }) => {
    const user      = await getAuthUser(ctx);
    const challenge = await ctx.db.get(challengeId);

    if (!challenge) throw new Error('Challenge not found');
    if (challenge.creatorId !== user._id && challenge.challengerId !== user._id) {
      throw new Error('Not a participant');
    }

    const existing = await ctx.db
      .query('disputes')
      .withIndex('by_challenge', (q: any) => q.eq('challengeId', challengeId))
      .first();

    if (existing) throw new Error('A dispute already exists for this match');

    await ctx.db.patch(challengeId, { status: 'disputed', updatedAt: Date.now() });

    return ctx.db.insert('disputes', {
      challengeId,
      raisedBy:  user._id,
      reason:    reason.trim(),
      status:    'pending',
      createdAt: Date.now(),
    });
  },
});

export const getDisputeForChallenge = query({
  args: { challengeId: v.id('challenges') },
  handler: async (ctx, { challengeId }) => {
    return ctx.db
      .query('disputes')
      .withIndex('by_challenge', (q: any) => q.eq('challengeId', challengeId))
      .first();
  },
});

// Admin-only: list all pending disputes
export const listPendingDisputes = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (user.role !== 'coach') throw new Error('Admin access required');

    return ctx.db
      .query('disputes')
      .withIndex('by_status', (q: any) => q.eq('status', 'pending'))
      .order('desc')
      .collect();
  },
});

// Admin-only: resolve a dispute
export const resolveDispute = mutation({
  args: {
    disputeId:   v.id('disputes'),
    resolution:  v.string(),
    status:      v.union(v.literal('resolved'), v.literal('rejected')),
  },
  handler: async (ctx, { disputeId, resolution, status }) => {
    const user = await getAuthUser(ctx);
    if (user.role !== 'coach') throw new Error('Admin access required');

    await ctx.db.patch(disputeId, {
      resolution,
      status,
      resolvedBy: user._id,
    });
  },
});
