import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const categoryType = v.union(v.literal('forum'), v.literal('news'));

export const listPosts = query({
  args: { category: v.optional(categoryType) },
  handler: async (ctx, { category }) => {
    const all = await ctx.db.query('posts').withIndex('by_date').order('desc').collect();
    if (category) return all.filter(p => p.category === category);
    return all;
  },
});

export const createPost = mutation({
  args: {
    title:    v.string(),
    content:  v.string(),
    category: categoryType,
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

    const authorName = profile?.name ?? user.email.split('@')[0];

    return ctx.db.insert('posts', {
      ...args,
      createdBy:    user._id,
      authorName,
      likes:        0,
      commentCount: 0,
      createdAt:    Date.now(),
    });
  },
});

export const likePost = mutation({
  args: { postId: v.id('posts') },
  handler: async (ctx, { postId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const post = await ctx.db.get(postId);
    if (!post) throw new Error('Post not found');
    await ctx.db.patch(postId, { likes: post.likes + 1 });
  },
});

export const deletePost = mutation({
  args: { postId: v.id('posts') },
  handler: async (ctx, { postId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .first();
    const post = await ctx.db.get(postId);
    if (!post) throw new Error('Post not found');

    if (post.createdBy !== user?._id && user?.role !== 'coach') {
      throw new Error('Unauthorized');
    }

    await ctx.db.delete(postId);
  },
});
