import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  bookings: defineTable({
    name:          v.string(),
    age:           v.number(),
    email:         v.string(),
    preferredTime: v.string(),
    status:        v.union(
      v.literal('pending'),
      v.literal('confirmed'),
      v.literal('cancelled'),
    ),
    createdAt:     v.number(),
  })
    .index('by_email',  ['email'])
    .index('by_status', ['status'])
    .index('by_date',   ['createdAt']),
});
