'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

type Doc<T extends string> = T extends 'events'
  ? { _id: string; title: string; date: string; time: string; location: string; type: string; registeredCount: number; maxPlayers?: number }
  : T extends 'posts'
  ? { _id: string; title: string; category: string; authorName: string; likes: number; commentCount: number; createdAt: number }
  : never;

export default function HooperPage() {
  const router  = useRouter();
  const profile = useQuery(api.profiles.getMyProfile);
  const events  = useQuery(api.events.listEvents, {});
  const posts   = useQuery(api.posts.listPosts, {});

  // Redirect new users to create their profile
  useEffect(() => {
    if (profile === null) router.push('/hooper/create-profile');
  }, [profile, router]);

  if (profile === undefined) return <Skeleton />;
  if (!profile) return null;

  const upcomingEvents = (events ?? []).slice(0, 3);
  const recentPosts    = (posts  ?? []).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* ── Welcome card ─────────────────────────────────────── */}
      <motion.div
        className="relative overflow-hidden rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, rgba(255,69,0,0.12) 0%, rgba(17,17,17,1) 65%)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 border border-court-orange/15 rounded-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-court-orange/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-court-orange/30"
            style={{ background: 'linear-gradient(135deg, #FF4500, #F0B52A)' }}
          >
            {profile.profilePhoto ? (
              <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-bebas text-3xl text-white">{profile.name[0]?.toUpperCase()}</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-barlow text-court-orange text-xs tracking-[0.35em] uppercase mb-1">Welcome back</p>
            <h1 className="font-bebas text-4xl text-white leading-none truncate">{profile.name}</h1>
            <p className="text-white/40 text-sm font-dm mt-1 truncate">
              {profile.city} &nbsp;&middot;&nbsp; {profile.heightFeet}&apos;{profile.heightInches}&quot; &nbsp;&middot;&nbsp; {profile.weight} lbs
            </p>
          </div>

          <Link
            href="/hooper/events"
            className="btn-court bg-court-orange text-white text-xs py-3 px-6 flex-shrink-0 self-start sm:self-auto"
            style={{ boxShadow: '0 0 20px rgba(255,69,0,0.3)' }}
          >
            Find Games
          </Link>
        </div>
      </motion.div>

      {/* ── Quick stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Events',   value: events?.length  ?? '—' },
          { label: 'Posts',    value: posts?.length   ?? '—' },
          { label: 'City',     value: profile.city          },
          { label: 'Age',      value: `${profile.age} yrs`  },
        ].map(({ label, value }, i) => (
          <motion.div
            key={label}
            className="glass rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
          >
            <div className="font-bebas text-2xl text-court-orange">{value}</div>
            <div className="font-barlow text-white/35 text-xs tracking-widest uppercase mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Two column ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming events */}
        <section>
          <SectionHeader title="Upcoming Events" href="/hooper/events" />
          {upcomingEvents.length === 0
            ? <EmptyState text="No events posted yet. Be the first!" />
            : <div className="space-y-2.5">{upcomingEvents.map(e => <EventCard key={e._id} event={e} />)}</div>
          }
        </section>

        {/* Community posts */}
        <section>
          <SectionHeader title="Community" href="/hooper/forum" />
          {recentPosts.length === 0
            ? <EmptyState text="No posts yet. Start the conversation!" />
            : <div className="space-y-2.5">{recentPosts.map(p => <PostCard key={p._id} post={p} />)}</div>
          }
        </section>
      </div>

      {/* ── Feature quicklinks ───────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <QuickLink
          href="/hooper/marketplace"
          title="Gear Marketplace"
          subtitle="Buy & sell basketball equipment"
          gradient="from-court-gold/15"
        />
        <QuickLink
          href="/hooper/stream"
          title="Live Streams"
          subtitle="Watch games & practices in real-time"
          gradient="from-purple-500/15"
        />
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-40 rounded-2xl bg-white/5" />
      {/* Match the real grid: 2 cols on mobile, 4 on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5" />)}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
      <p className="text-white/30 text-sm font-dm">{text}</p>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-bebas text-2xl text-white tracking-wide">{title}</h2>
      <Link href={href} className="text-court-orange text-xs font-barlow tracking-widest uppercase hover:text-court-amber transition-colors">
        View All →
      </Link>
    </div>
  );
}

const typeColors: Record<string, string> = {
  pickup:     'bg-court-orange/15 text-court-orange',
  tournament: 'bg-court-gold/15 text-court-gold',
  opengym:    'bg-green-500/15 text-green-400',
  camp:       'bg-blue-500/15 text-blue-400',
};

function EventCard({ event }: { event: Doc<'events'> }) {
  const d = new Date(event.date);
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-court-orange/20 transition-colors">
      <div className="text-center w-11 flex-shrink-0">
        <div className="font-bebas text-xl text-court-orange leading-none">{d.getDate()}</div>
        <div className="font-barlow text-white/30 text-xs uppercase">{d.toLocaleDateString('en', { month: 'short' })}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-dm text-white text-sm font-medium truncate">{event.title}</p>
        <p className="text-white/35 text-xs mt-0.5 truncate">{event.time} · {event.location}</p>
      </div>
      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-barlow uppercase tracking-widest ${typeColors[event.type] ?? 'bg-white/10 text-white/50'}`}>
        {event.type}
      </span>
    </div>
  );
}

function PostCard({ post }: { post: Doc<'posts'> }) {
  const ago = timeAgo(post.createdAt);
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors">
      <div className="w-8 h-8 rounded-full bg-court-orange/20 flex items-center justify-center flex-shrink-0">
        <span className="font-bebas text-sm text-court-orange">{post.authorName[0]?.toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-dm text-white/90 text-sm font-medium leading-snug">{post.title}</p>
        <div className="flex items-center gap-2.5 mt-1.5 text-xs text-white/30 font-dm">
          <span>{post.authorName}</span>
          <span>·</span>
          <span>{ago}</span>
          <span>·</span>
          <span>{post.likes} likes</span>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, title, subtitle, gradient }: { href: string; title: string; subtitle: string; gradient: string }) {
  return (
    <Link href={href}>
      <motion.div
        className={`relative overflow-hidden rounded-xl p-6 border border-white/[0.06] bg-gradient-to-br ${gradient} to-transparent cursor-pointer`}
        whileHover={{ scale: 1.02, borderColor: 'rgba(255,69,0,0.2)' }}
        whileTap={{ scale: 0.98 }}
      >
        <h3 className="font-bebas text-xl text-white tracking-wide">{title}</h3>
        <p className="text-white/35 text-sm font-dm mt-1">{subtitle}</p>
        <span className="absolute bottom-5 right-5 text-court-orange/40 font-barlow text-lg">→</span>
      </motion.div>
    </Link>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
