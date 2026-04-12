import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const conditionType = v.union(
  v.literal('new'),
  v.literal('like-new'),
  v.literal('good'),
  v.literal('fair'),
);

export const listListings = query({
  args: {},
  handler: async ctx => {
    return ctx.db
      .query('listings')
      .withIndex('by_status', q => q.eq('status', 'active'))
      .order('desc')
      .collect();
  },
});

export const createListing = mutation({
  args: {
    title:       v.string(),
    description: v.string(),
    price:       v.number(),
    condition:   conditionType,
    category:    v.string(),
    imageUrl:    v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .first();
    if (!user) throw new Error('User not found');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', q => q.eq('userId', user._id))
      .first();

    const sellerName = profile?.name ?? user.email.split('@')[0];

    return ctx.db.insert('listings', {
      ...args,
      sellerId:  user._id,
      sellerName,
      status:    'active',
      createdAt: Date.now(),
    });
  },
});

export const markSold = mutation({
  args: { listingId: v.id('listings') },
  handler: async (ctx, { listingId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .first();
    if (!user) throw new Error('User not found');

    const listing = await ctx.db.get(listingId);
    if (!listing) throw new Error('Listing not found');
    if (listing.sellerId !== user._id) throw new Error('Not your listing');

    await ctx.db.patch(listingId, { status: 'sold' });
  },
});

export const deleteListing = mutation({
  args: { listingId: v.id('listings') },
  handler: async (ctx, { listingId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .first();
    if (!user) throw new Error('User not found');

    const listing = await ctx.db.get(listingId);
    if (!listing) throw new Error('Listing not found');
    if (listing.sellerId !== user._id && user.role !== 'coach') throw new Error('Unauthorized');

    await ctx.db.delete(listingId);
  },
});
