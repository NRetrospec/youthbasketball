import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/** Submit a new registration/booking */
export const createBooking = mutation({
  args: {
    name:          v.string(),
    age:           v.number(),
    email:         v.string(),
    preferredTime: v.string(),
  },
  handler: async (ctx, { name, age, email, preferredTime }) => {
    // Normalise email
    const normalised = email.trim().toLowerCase();

    const id = await ctx.db.insert('bookings', {
      name:          name.trim(),
      age,
      email:         normalised,
      preferredTime,
      status:        'pending',
      createdAt:     Date.now(),
    });

    return id;
  },
});

/** Admin: fetch all bookings, newest first */
export const getBookings = query({
  args: {},
  handler: async ctx => {
    return ctx.db
      .query('bookings')
      .withIndex('by_date')
      .order('desc')
      .collect();
  },
});

/** Admin: update booking status */
export const updateStatus = mutation({
  args: {
    id:     v.id('bookings'),
    status: v.union(
      v.literal('confirmed'),
      v.literal('pending'),
      v.literal('cancelled'),
    ),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});
