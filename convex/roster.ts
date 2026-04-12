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

const positionType = v.union(
  v.literal('PG'), v.literal('SG'), v.literal('SF'), v.literal('PF'), v.literal('C'),
);

// ── Teams ─────────────────────────────────────────────────────────────────

export const listTeams = query({
  args: {},
  handler: async ctx => {
    await requireCoach(ctx);
    return ctx.db.query('teams').order('asc').collect();
  },
});

export const createTeam = mutation({
  args: {
    name:     v.string(),
    ageGroup: v.string(),
    season:   v.string(),
  },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    return ctx.db.insert('teams', {
      ...args,
      coachId:   coach._id,
      wins:      0,
      losses:    0,
      createdAt: Date.now(),
    });
  },
});

export const updateTeamRecord = mutation({
  args: {
    teamId: v.id('teams'),
    wins:   v.number(),
    losses: v.number(),
  },
  handler: async (ctx, { teamId, wins, losses }) => {
    await requireCoach(ctx);
    await ctx.db.patch(teamId, { wins, losses });
  },
});

export const deleteTeam = mutation({
  args: { teamId: v.id('teams') },
  handler: async (ctx, { teamId }) => {
    await requireCoach(ctx);
    await ctx.db.delete(teamId);
  },
});

// ── Players ───────────────────────────────────────────────────────────────

export const listPlayers = query({
  args: { teamId: v.optional(v.id('teams')) },
  handler: async (ctx, { teamId }) => {
    await requireCoach(ctx);
    if (teamId) {
      return ctx.db
        .query('players')
        .withIndex('by_team', q => q.eq('teamId', teamId))
        .collect();
    }
    return ctx.db.query('players').order('asc').collect();
  },
});

export const addPlayer = mutation({
  args: {
    name:          v.string(),
    age:           v.number(),
    dateOfBirth:   v.string(),
    position:      positionType,
    teamId:        v.optional(v.id('teams')),
    jerseyNumber:  v.optional(v.number()),
    guardianName:  v.string(),
    guardianEmail: v.string(),
    guardianPhone: v.string(),
    notes:         v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCoach(ctx);
    const now = Date.now();
    return ctx.db.insert('players', { ...args, createdAt: now, updatedAt: now });
  },
});

export const updatePlayer = mutation({
  args: {
    id:            v.id('players'),
    name:          v.optional(v.string()),
    age:           v.optional(v.number()),
    position:      v.optional(positionType),
    teamId:        v.optional(v.id('teams')),
    jerseyNumber:  v.optional(v.number()),
    guardianName:  v.optional(v.string()),
    guardianEmail: v.optional(v.string()),
    guardianPhone: v.optional(v.string()),
    notes:         v.optional(v.string()),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireCoach(ctx);
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    (Object.keys(rest) as (keyof typeof rest)[]).forEach(k => {
      if (rest[k] !== undefined) patch[k] = rest[k];
    });
    await ctx.db.patch(id, patch);
  },
});

export const deletePlayer = mutation({
  args: { id: v.id('players') },
  handler: async (ctx, { id }) => {
    await requireCoach(ctx);
    await ctx.db.delete(id);
  },
});
