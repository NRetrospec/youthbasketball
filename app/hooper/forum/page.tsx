'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

type Category = 'forum' | 'news';
type Filter   = Category | 'all';

const CATS: { value: Filter; label: string }[] = [
  { value: 'all',   label: 'All'   },
  { value: 'forum', label: 'Forum' },
  { value: 'news',  label: 'News'  },
];

const catStyle: Record<string, string> = {
  forum: 'bg-court-orange/15 text-court-orange',
  news:  'bg-court-gold/15 text-court-gold',
};

export default function ForumPage() {
  const [filter,   setFilter]   = useState<Filter>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'forum' as Category });
  const [submitting, setSubmitting] = useState(false);

  const posts      = useQuery(api.posts.listPosts, {});
  const createPost = useMutation(api.posts.createPost);
  const likePost   = useMutation(api.posts.likePost);

  const filtered = (posts ?? []).filter(p => filter === 'all' || p.category === filter);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await createPost({ title: form.title, content: form.content, category: form.category });
      setForm({ title: '', content: '', category: 'forum' });
      setShowForm(false);
    } catch { /* noop */ }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wide">Community</h1>
          <p className="text-white/40 font-dm text-sm mt-1">Discussions, news & everything hoops</p>
        </div>
        <motion.button
          className="btn-court bg-court-orange text-white text-xs py-3 px-5 flex-shrink-0"
          style={{ boxShadow: '0 0 20px rgba(255,69,0,0.3)' }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(v => !v)}
        >
          {showForm ? 'Cancel' : '+ New Post'}
        </motion.button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleCreate}
            className="glass rounded-2xl p-6 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-bebas text-xl text-white">New Post</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                placeholder="Title *"
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-court"
              />
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                className="input-court"
              >
                <option value="forum">Forum</option>
                <option value="news">News</option>
              </select>
            </div>
            <textarea
              placeholder="What's on your mind? *"
              required
              rows={4}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="input-court w-full resize-none"
            />
            <button type="submit" disabled={submitting} className="btn-court bg-court-orange text-white w-full disabled:opacity-50">
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {CATS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-full font-barlow text-xs tracking-widest uppercase transition-all border
              ${filter === value
                ? 'bg-court-orange/20 text-court-orange border-court-orange/40'
                : 'text-white/40 border-white/10 hover:text-white hover:border-white/20'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {posts === undefined ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <p className="text-white/25 font-dm text-sm">No posts yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <motion.div
              key={post._id}
              className="glass rounded-xl p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-court-orange/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-bebas text-base text-court-orange">{post.authorName[0]?.toUpperCase()}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-barlow uppercase tracking-widest ${catStyle[post.category] ?? ''}`}>
                      {post.category}
                    </span>
                    <span className="text-white/25 text-xs font-dm">{post.authorName}</span>
                    <span className="text-white/15 text-xs">·</span>
                    <span className="text-white/25 text-xs font-dm">{timeAgo(post.createdAt)}</span>
                  </div>

                  <h3 className="font-dm text-white font-semibold text-base leading-snug">{post.title}</h3>
                  <p className="text-white/45 text-sm mt-1.5 leading-relaxed line-clamp-3">{post.content}</p>

                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => likePost({ postId: post._id })}
                      className="flex items-center gap-1.5 text-white/35 hover:text-court-orange transition-colors text-xs font-barlow tracking-wide"
                    >
                      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M8 13.5S2 10 2 5.5a3 3 0 016 0 3 3 0 016 0C14 10 8 13.5 8 13.5z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {post.likes}
                    </button>
                    <span className="flex items-center gap-1.5 text-white/25 text-xs font-barlow">
                      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H6l-4 3V3z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {post.commentCount}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style jsx global>{`
        .input-court{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;color:#EDE8DD;font-family:'DM Sans',sans-serif;font-size:0.875rem;padding:0.65rem 0.9rem;outline:none;transition:border-color 0.2s;}
        .input-court:focus{border-color:rgba(255,69,0,0.5);}
        .input-court::placeholder{color:rgba(237,232,221,0.25);}
        .input-court option{background:#111;color:#EDE8DD;}
      `}</style>
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
