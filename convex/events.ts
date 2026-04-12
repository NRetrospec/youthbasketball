import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const eventType = v.union(
  v.literal('pickup'),
  v.literal('tournament'),
  v.literal('opengym'),
  v.literal('camp'),
);

export const listEvents = query({
  args: { type: v.optional(eventType) },
  handler: async (ctx, { type }) => {
    const all = await ctx.db.query('events').withIndex('by_date').order('asc').collect();
    if (type) return all.filter(e => e.type === type);
    return all;
  },
});

export const createEvent = mutation({
  args: {
    title:       v.string(),
    description: v.string(),
    date:        v.string(),
    time:        v.string(),
    location:    v.string(),
    type:        eventType,
    maxPlayers:  v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .first();
    if (!user) throw new Error('User not found');

    return ctx.db.insert('events', {
      ...args,
      registeredCount: 0,
      createdBy:  user._id,
      createdAt:  Date.now(),
    });
  },
});

export const registerForEvent = mutation({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const event = await ctx.db.get(eventId);
    if (!event) throw new Error('Event not found');
    if (event.maxPlayers && event.registeredCount >= event.maxPlayers) {
      throw new Error('Event is full');
    }

    await ctx.db.patch(eventId, { registeredCount: event.registeredCount + 1 });
  },
});

export const deleteEvent = mutation({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .first();
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error('Event not found');

    if (event.createdBy !== user?._id && user?.role !== 'coach') {
      throw new Error('Unauthorized');
    }

    await ctx.db.delete(eventId);
  },
});
