import { mutation, query, internalMutation } from './_generated/server';
import { v } from 'convex/values';

const PLATFORM_FEE_RATE = 0.2;

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

// ── Queries ────────────────────────────────────────────────────────

export const listOpenChallenges = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
      .first();

    const all = await ctx.db
      .query('challenges')
      .withIndex('by_status', (q: any) => q.eq('status', 'open'))
      .order('desc')
      .collect();

    return all.filter(c => c.creatorId !== user?._id);
  },
});

export const listMyChallenges = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);

    const asCreator = await ctx.db
      .query('challenges')
      .withIndex('by_creator', (q: any) => q.eq('creatorId', user._id))
      .collect();

    const asChallenger = await ctx.db
      .query('challenges')
      .withIndex('by_challenger', (q: any) => q.eq('challengerId', user._id))
      .collect();

    return [...asCreator, ...asChallenger].sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getChallenge = query({
  args: { challengeId: v.id('challenges') },
  handler: async (ctx, { challengeId }) => {
    return ctx.db.get(challengeId);
  },
});

export const getMyStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);

    const asCreator = await ctx.db
      .query('challenges')
      .withIndex('by_creator', (q: any) => q.eq('creatorId', user._id))
      .collect();

    const asChallenger = await ctx.db
      .query('challenges')
      .withIndex('by_challenger', (q: any) => q.eq('challengerId', user._id))
      .collect();

    const all = [...asCreator, ...asChallenger];
    const completed = all.filter(c => c.status === 'completed');
    const wins = completed.filter(c => c.winnerId === user._id).length;

    return {
      totalGames: completed.length,
      wins,
      losses: completed.length - wins,
    };
  },
});

// ── Mutations ──────────────────────────────────────────────────────

export const createChallenge = mutation({
  args: {
    location: v.string(),
    date:     v.string(),
    time:     v.string(),
    entryFee: v.number(),
    notes:    v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', (q: any) => q.eq('userId', user._id))
      .first();

    const pool       = args.entryFee * 2;
    const prizeAmount = pool * (1 - PLATFORM_FEE_RATE);
    const platformFee = pool * PLATFORM_FEE_RATE;

    return ctx.db.insert('challenges', {
      creatorId:   user._id,
      creatorName: profile?.name ?? user.email,
      location:    args.location,
      date:        args.date,
      time:        args.time,
      entryFee:    args.entryFee,
      prizeAmount,
      platformFee,
      status:                  'pending_payment',
      creatorPaid:             false,
      challengerPaid:          false,
      creatorScoreSubmitted:   false,
      challengerScoreSubmitted: false,
      notes:     args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Challenger reserves the challenge slot before being redirected to Stripe
export const acceptChallenge = mutation({
  args: { challengeId: v.id('challenges') },
  handler: async (ctx, { challengeId }) => {
    const user      = await getAuthUser(ctx);
    const challenge = await ctx.db.get(challengeId);

    if (!challenge) throw new Error('Challenge not found');
    if (challenge.status !== 'open') throw new Error('Challenge is not available');
    if (challenge.creatorId === user._id) throw new Error('Cannot accept your own challenge');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', (q: any) => q.eq('userId', user._id))
      .first();

    await ctx.db.patch(challengeId, {
      challengerId:   user._id,
      challengerName: profile?.name ?? user.email,
      status:         'awaiting_challenger_payment',
      updatedAt:      Date.now(),
    });
  },
});

// Submit score after the match
export const submitScore = mutation({
  args: {
    challengeId:       v.id('challenges'),
    creatorPoints:     v.number(),
    challengerPoints:  v.number(),
  },
  handler: async (ctx, { challengeId, creatorPoints, challengerPoints }) => {
    const user      = await getAuthUser(ctx);
    const challenge = await ctx.db.get(challengeId);

    if (!challenge) throw new Error('Challenge not found');
    if (challenge.status !== 'active' && challenge.status !== 'pending_result') {
      throw new Error('Match is not in progress');
    }

    const isCreator     = challenge.creatorId === user._id;
    const isChallenger  = challenge.challengerId === user._id;
    if (!isCreator && !isChallenger) throw new Error('Not a participant in this match');

    const update: any = { updatedAt: Date.now(), status: 'pending_result' };

    if (isCreator) {
      if (challenge.creatorScoreSubmitted) throw new Error('You already submitted your score');
      update.creatorScoreReport    = { creatorPoints, challengerPoints };
      update.creatorScoreSubmitted = true;
    } else {
      if (challenge.challengerScoreSubmitted) throw new Error('You already submitted your score');
      update.challengerScoreReport    = { creatorPoints, challengerPoints };
      update.challengerScoreSubmitted = true;
    }

    await ctx.db.patch(challengeId, update);

    // Re-fetch to check if both sides have submitted
    const fresh = await ctx.db.get(challengeId);
    if (!fresh) return;
    if (!fresh.creatorScoreSubmitted || !fresh.challengerScoreSubmitted) return;

    const cr = fresh.creatorScoreReport;
    const ch = fresh.challengerScoreReport;

    if (cr && ch &&
        cr.creatorPoints    === ch.creatorPoints &&
        cr.challengerPoints === ch.challengerPoints) {
      // Both agree — determine winner
      const winnerId = cr.creatorPoints > cr.challengerPoints
        ? fresh.creatorId
        : fresh.challengerId!;

      await ctx.db.patch(challengeId, {
        status:    'completed',
        winnerId,
        updatedAt: Date.now(),
      });

      // Credit prize to winner's wallet
      const prizeInCents = Math.round(fresh.prizeAmount * 100);
      const wallet = await ctx.db
        .query('wallets')
        .withIndex('by_user', (q: any) => q.eq('userId', winnerId))
        .first();

      if (wallet) {
        await ctx.db.patch(wallet._id, {
          balanceCents:     wallet.balanceCents     + prizeInCents,
          totalEarnedCents: wallet.totalEarnedCents + prizeInCents,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert('wallets', {
          userId:              winnerId,
          balanceCents:        prizeInCents,
          totalEarnedCents:    prizeInCents,
          totalWithdrawnCents: 0,
          kycVerified:         false,
          updatedAt:           Date.now(),
        });
      }

      await ctx.db.insert('transactions', {
        userId:      winnerId,
        type:        'prize',
        amountCents: prizeInCents,
        challengeId,
        status:      'completed',
        description: `Prize — won 1v1 challenge`,
        createdAt:   Date.now(),
      });
    } else {
      // Scores differ — flag for dispute
      await ctx.db.patch(challengeId, {
        status:    'disputed',
        updatedAt: Date.now(),
      });

      // Auto-create dispute record
      await ctx.db.insert('disputes', {
        challengeId,
        raisedBy:  user._id,
        reason:    'Score submissions do not match',
        status:    'pending',
        createdAt: Date.now(),
      });
    }
  },
});

export const cancelChallenge = mutation({
  args: { challengeId: v.id('challenges') },
  handler: async (ctx, { challengeId }) => {
    const user      = await getAuthUser(ctx);
    const challenge = await ctx.db.get(challengeId);

    if (!challenge) throw new Error('Challenge not found');
    if (challenge.creatorId !== user._id) throw new Error('Only the creator can cancel');
    if (challenge.status === 'active' || challenge.status === 'completed') {
      throw new Error('Cannot cancel an active or completed match');
    }

    await ctx.db.patch(challengeId, { status: 'cancelled', updatedAt: Date.now() });
  },
});

// ── Internal (called by payments action after Stripe verification) ─

export const confirmPaymentInternal = internalMutation({
  args: {
    challengeId:  v.id('challenges'),
    userId:       v.id('users'),
    role:         v.union(v.literal('creator'), v.literal('challenger')),
    sessionId:    v.string(),
    amountCents:  v.number(),
  },
  handler: async (ctx, { challengeId, userId, role, sessionId, amountCents }) => {
    const challenge = await ctx.db.get(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const update: any = { updatedAt: Date.now() };

    if (role === 'creator') {
      update.creatorPaid            = true;
      update.creatorStripeSessionId = sessionId;
      update.status = challenge.challengerPaid ? 'active' : 'open';
    } else {
      update.challengerPaid            = true;
      update.challengerStripeSessionId = sessionId;
      update.status = challenge.creatorPaid ? 'active' : 'awaiting_challenger_payment';
    }

    await ctx.db.patch(challengeId, update);

    // Record the entry fee transaction
    await ctx.db.insert('transactions', {
      userId,
      type:            'entry_fee',
      amountCents,
      challengeId,
      stripeSessionId: sessionId,
      status:          'completed',
      description:     'Entry fee — 1v1 skill-based competition',
      createdAt:       Date.now(),
    });

    // Ensure wallet exists for this user
    const existing = await ctx.db
      .query('wallets')
      .withIndex('by_user', (q: any) => q.eq('userId', userId))
      .first();

    if (!existing) {
      await ctx.db.insert('wallets', {
        userId,
        balanceCents:        0,
        totalEarnedCents:    0,
        totalWithdrawnCents: 0,
        kycVerified:         false,
        updatedAt:           Date.now(),
      });
    }
  },
});

// Admin: force-resolve a disputed match
export const adminResolveChallenge = internalMutation({
  args: {
    challengeId: v.id('challenges'),
    winnerId:    v.id('users'),
    adminNote:   v.string(),
  },
  handler: async (ctx, { challengeId, winnerId, adminNote: _adminNote }) => {
    const challenge = await ctx.db.get(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    await ctx.db.patch(challengeId, {
      status:    'completed',
      winnerId,
      updatedAt: Date.now(),
    });

    const prizeInCents = Math.round(challenge.prizeAmount * 100);
    const wallet = await ctx.db
      .query('wallets')
      .withIndex('by_user', (q: any) => q.eq('userId', winnerId))
      .first();

    if (wallet) {
      await ctx.db.patch(wallet._id, {
        balanceCents:     wallet.balanceCents     + prizeInCents,
        totalEarnedCents: wallet.totalEarnedCents + prizeInCents,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('wallets', {
        userId:              winnerId,
        balanceCents:        prizeInCents,
        totalEarnedCents:    prizeInCents,
        totalWithdrawnCents: 0,
        kycVerified:         false,
        updatedAt:           Date.now(),
      });
    }

    await ctx.db.insert('transactions', {
      userId:      winnerId,
      type:        'prize',
      amountCents: prizeInCents,
      challengeId,
      status:      'completed',
      description: 'Prize — admin-resolved dispute',
      createdAt:   Date.now(),
    });
  },
});
