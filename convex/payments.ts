import { action } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

/**
 * Called client-side after Stripe redirects back with ?session_id=XXX.
 * Verifies with Stripe, then updates challenge + wallet via internal mutation.
 */
export const verifyStripePayment = action({
  args: {
    challengeId: v.id('challenges'),
    sessionId:   v.string(),
    role:        v.union(v.literal('creator'), v.literal('challenger')),
    userId:      v.id('users'),
  },
  handler: async (ctx, { challengeId, sessionId, role, userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Verify the Stripe session via REST API
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      },
    );

    if (!res.ok) throw new Error('Failed to reach Stripe API');
    const session = await res.json();

    if (session.payment_status !== 'paid') {
      throw new Error('Payment has not been completed');
    }

    // Guard: session must match the expected challenge
    if (session.metadata?.challengeId !== challengeId) {
      throw new Error('Session does not match this challenge');
    }

    const amountCents: number = session.amount_total ?? 0;

    await ctx.runMutation(internal.challenges.confirmPaymentInternal, {
      challengeId,
      userId,
      role,
      sessionId,
      amountCents,
    });

    return { success: true };
  },
});
