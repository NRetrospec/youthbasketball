import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { MutationCtx } from './_generated/server';

async function getAuthedUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');

  let user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .first();

  if (!user) {
    // Race-condition guard: UserSync may not have completed yet.
    // Auto-create the user row from the Clerk JWT so mutations never fail.
    const id = await ctx.db.insert('users', {
      clerkId: identity.subject,
      email:   (identity.email as string | undefined) ?? '',
      role:    'user',
      createdAt: Date.now(),
    });
    user = await ctx.db.get(id);
  }

  if (!user) throw new Error('Failed to initialise user record');
  return user;
}

/** Returns a Convex upload URL for the client to POST a file directly to. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async ctx => {
    return ctx.storage.generateUploadUrl();
  },
});

/** Creates the Hooper profile for the current user (one per user). */
export const createProfile = mutation({
  args: {
    name:         v.string(),
    heightFeet:   v.number(),
    heightInches: v.number(),
    weight:       v.number(),
    age:          v.number(),
    dateOfBirth:  v.string(),
    city:         v.string(),
    storageId:    v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const user = await getAuthedUser(ctx);

    const existing = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', q => q.eq('userId', user._id))
      .first();
    if (existing) throw new Error('Profile already exists');

    let profilePhoto: string | undefined;
    if (args.storageId) {
      profilePhoto = (await ctx.storage.getUrl(args.storageId)) ?? undefined;
    }

    const now = Date.now();
    return ctx.db.insert('profiles', {
      userId:       user._id,
      name:         args.name.trim(),
      heightFeet:   args.heightFeet,
      heightInches: args.heightInches,
      weight:       args.weight,
      age:          args.age,
      dateOfBirth:  args.dateOfBirth,
      city:         args.city.trim(),
      profilePhoto,
      storageId:    args.storageId,
      createdAt:    now,
      updatedAt:    now,
    });
  },
});

/** Returns the Hooper profile for the currently authenticated user. */
export const getMyProfile = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .first();
    if (!user) return null;
    return ctx.db
      .query('profiles')
      .withIndex('by_user_id', q => q.eq('userId', user._id))
      .first();
  },
});

/** Updates the Hooper profile for the currently authenticated user. */
export const updateProfile = mutation({
  args: {
    name:         v.optional(v.string()),
    heightFeet:   v.optional(v.number()),
    heightInches: v.optional(v.number()),
    weight:       v.optional(v.number()),
    age:          v.optional(v.number()),
    dateOfBirth:  v.optional(v.string()),
    city:         v.optional(v.string()),
    storageId:    v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const user = await getAuthedUser(ctx);

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', q => q.eq('userId', user._id))
      .first();
    if (!profile) throw new Error('Profile not found');

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name         !== undefined) patch.name         = args.name.trim();
    if (args.heightFeet   !== undefined) patch.heightFeet   = args.heightFeet;
    if (args.heightInches !== undefined) patch.heightInches = args.heightInches;
    if (args.weight       !== undefined) patch.weight       = args.weight;
    if (args.age          !== undefined) patch.age          = args.age;
    if (args.dateOfBirth  !== undefined) patch.dateOfBirth  = args.dateOfBirth;
    if (args.city         !== undefined) patch.city         = args.city.trim();
    if (args.storageId    !== undefined) {
      patch.storageId    = args.storageId;
      patch.profilePhoto = (await ctx.storage.getUrl(args.storageId)) ?? undefined;
    }

    await ctx.db.patch(profile._id, patch);
    return profile._id;
  },
});
