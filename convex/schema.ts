import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // ── Legacy bookings (landing-page youth program sign-ups) ────────
  bookings: defineTable({
    name:          v.string(),
    age:           v.number(),
    email:         v.string(),
    preferredTime: v.string(),
    status:        v.union(v.literal('pending'), v.literal('confirmed'), v.literal('cancelled')),
    createdAt:     v.number(),
  })
    .index('by_email',  ['email'])
    .index('by_status', ['status'])
    .index('by_date',   ['createdAt']),

  // ── Auth: Clerk-synced user records ─────────────────────────────
  users: defineTable({
    clerkId:   v.string(),
    email:     v.string(),
    role:      v.union(v.literal('user'), v.literal('coach')),
    createdAt: v.number(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_role',     ['role']),

  // ── Hooper social profiles ───────────────────────────────────────
  profiles: defineTable({
    userId:       v.id('users'),
    name:         v.string(),
    heightFeet:   v.number(),
    heightInches: v.number(),
    weight:       v.number(),
    age:          v.number(),
    dateOfBirth:  v.string(),
    city:         v.string(),
    profilePhoto: v.optional(v.string()),
    storageId:    v.optional(v.id('_storage')),
    createdAt:    v.number(),
    updatedAt:    v.number(),
  })
    .index('by_user_id', ['userId']),

  // ── Public community events ──────────────────────────────────────
  events: defineTable({
    title:           v.string(),
    description:     v.string(),
    date:            v.string(),
    time:            v.string(),
    location:        v.string(),
    type:            v.union(
      v.literal('pickup'),
      v.literal('tournament'),
      v.literal('opengym'),
      v.literal('camp'),
    ),
    maxPlayers:      v.optional(v.number()),
    registeredCount: v.number(),
    createdBy:       v.id('users'),
    createdAt:       v.number(),
  })
    .index('by_date', ['date'])
    .index('by_type', ['type']),

  // ── Forum & news posts ───────────────────────────────────────────
  posts: defineTable({
    title:        v.string(),
    content:      v.string(),
    category:     v.union(v.literal('forum'), v.literal('news')),
    createdBy:    v.id('users'),
    authorName:   v.string(),
    likes:        v.number(),
    commentCount: v.number(),
    createdAt:    v.number(),
  })
    .index('by_category', ['category'])
    .index('by_date',     ['createdAt']),

  // ── Gear marketplace listings ────────────────────────────────────
  listings: defineTable({
    title:       v.string(),
    description: v.string(),
    price:       v.number(),
    condition:   v.union(
      v.literal('new'),
      v.literal('like-new'),
      v.literal('good'),
      v.literal('fair'),
    ),
    category:    v.string(),
    imageUrl:    v.optional(v.string()),
    sellerId:    v.id('users'),
    sellerName:  v.string(),
    status:      v.union(v.literal('active'), v.literal('sold')),
    createdAt:   v.number(),
  })
    .index('by_status', ['status'])
    .index('by_seller', ['sellerId'])
    .index('by_date',   ['createdAt']),

  // ── Youth Program: Teams ─────────────────────────────────────────
  teams: defineTable({
    name:      v.string(),
    ageGroup:  v.string(),
    coachId:   v.id('users'),
    season:    v.string(),
    wins:      v.number(),
    losses:    v.number(),
    createdAt: v.number(),
  })
    .index('by_coach', ['coachId']),

  // ── Youth Program: Players (roster) ─────────────────────────────
  players: defineTable({
    name:          v.string(),
    age:           v.number(),
    dateOfBirth:   v.string(),
    position:      v.union(
      v.literal('PG'), v.literal('SG'), v.literal('SF'),
      v.literal('PF'), v.literal('C'),
    ),
    teamId:        v.optional(v.id('teams')),
    jerseyNumber:  v.optional(v.number()),
    guardianName:  v.string(),
    guardianEmail: v.string(),
    guardianPhone: v.string(),
    notes:         v.optional(v.string()),
    createdAt:     v.number(),
    updatedAt:     v.number(),
  })
    .index('by_team', ['teamId'])
    .index('by_name', ['name']),

  // ── Youth Program: Schedule entries ─────────────────────────────
  scheduleEntries: defineTable({
    teamId:    v.id('teams'),
    title:     v.string(),
    date:      v.string(),
    startTime: v.string(),
    endTime:   v.string(),
    location:  v.string(),
    type:      v.union(
      v.literal('practice'),
      v.literal('game'),
      v.literal('scrimmage'),
      v.literal('tournament'),
    ),
    opponent:  v.optional(v.string()),
    notes:     v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_team', ['teamId'])
    .index('by_date', ['date']),
});
