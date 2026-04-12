import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { MutationCtx, QueryCtx } from './_generated/server';

async function requireCoach(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .first();
  if (!user || user.role !== 'coach') throw new Error('Coach access required');
  return user;
}

const entryType = v.union(
  v.literal('practice'),
  v.literal('game'),
  v.literal('scrimmage'),
  v.literal('tournament'),
);

export const listSchedule = query({
  args: { teamId: v.optional(v.id('teams')) },
  handler: async (ctx, { teamId }) => {
    await requireCoach(ctx);
    const all = await ctx.db.query('scheduleEntries').withIndex('by_date').order('asc').collect();
    if (teamId) return all.filter(s => s.teamId === teamId);
    return all;
  },
});

export const addScheduleEntry = mutation({
  args: {
    teamId:    v.id('teams'),
    title:     v.string(),
    date:      v.string(),
    startTime: v.string(),
    endTime:   v.string(),
    location:  v.string(),
    type:      entryType,
    opponent:  v.optional(v.string()),
    notes:     v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCoach(ctx);
    return ctx.db.insert('scheduleEntries', { ...args, createdAt: Date.now() });
  },
});

export const updateScheduleEntry = mutation({
  args: {
    id:        v.id('scheduleEntries'),
    title:     v.optional(v.string()),
    date:      v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime:   v.optional(v.string()),
    location:  v.optional(v.string()),
    type:      v.optional(entryType),
    opponent:  v.optional(v.string()),
    notes:     v.optional(v.string()),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireCoach(ctx);
    const patch: Record<string, unknown> = {};
    (Object.keys(rest) as (keyof typeof rest)[]).forEach(k => {
      if (rest[k] !== undefined) patch[k] = rest[k];
    });
    await ctx.db.patch(id, patch);
  },
});

export const deleteScheduleEntry = mutation({
  args: { id: v.id('scheduleEntries') },
  handler: async (ctx, { id }) => {
    await requireCoach(ctx);
    await ctx.db.delete(id);
  },
});
