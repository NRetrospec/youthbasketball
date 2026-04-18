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

export const getMyWallet = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const wallet = await ctx.db
      .query('wallets')
      .withIndex('by_user', (q: any) => q.eq('userId', user._id))
      .first();

    // Return zero-balance if no wallet yet
    return wallet ?? {
      _id:                 null,
      userId:              user._id,
      balanceCents:        0,
      totalEarnedCents:    0,
      totalWithdrawnCents: 0,
      kycVerified:         false,
      updatedAt:           Date.now(),
    };
  },
});

export const getMyTransactions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    return ctx.db
      .query('transactions')
      .withIndex('by_user', (q: any) => q.eq('userId', user._id))
      .order('desc')
      .collect();
  },
});

export const requestWithdrawal = mutation({
  args: { amountCents: v.number() },
  handler: async (ctx, { amountCents }) => {
    const user = await getAuthUser(ctx);

    if (amountCents < 500) throw new Error('Minimum withdrawal is $5.00');

    const wallet = await ctx.db
      .query('wallets')
      .withIndex('by_user', (q: any) => q.eq('userId', user._id))
      .first();

    if (!wallet || wallet.balanceCents < amountCents) {
      throw new Error('Insufficient balance');
    }

    // Deduct from balance immediately; mark as pending until processed
    await ctx.db.patch(wallet._id, {
      balanceCents:        wallet.balanceCents - amountCents,
      totalWithdrawnCents: wallet.totalWithdrawnCents + amountCents,
      updatedAt:           Date.now(),
    });

    await ctx.db.insert('transactions', {
      userId:      user._id,
      type:        'withdrawal',
      amountCents,
      status:      'pending',
      description: 'Withdrawal request — pending processing',
      createdAt:   Date.now(),
    });
  },
});
