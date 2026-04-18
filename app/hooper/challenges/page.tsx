'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { useState } from 'react';

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending_payment:             { label: 'Awaiting Payment',  color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  open:                        { label: 'Open',              color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  awaiting_challenger_payment: { label: 'Pending Opponent',  color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  active:                      { label: 'Active',            color: 'text-court-orange bg-court-orange/10 border-court-orange/20' },
  pending_result:              { label: 'Submit Score',      color: 'text-court-gold bg-court-gold/10 border-court-gold/20' },
  completed:                   { label: 'Completed',         color: 'text-white/40 bg-white/5 border-white/10' },
  disputed:                    { label: 'Disputed',          color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  cancelled:                   { label: 'Cancelled',         color: 'text-white/25 bg-white/5 border-white/8' },
};

function ChallengeCard({
  challenge,
  currentUserId,
}: {
  challenge: any;
  currentUserId: string | null;
}) {
  const isCreator    = challenge.creatorId    === currentUserId;
  const isChallenger = challenge.challengerId === currentUserId;
  const meta         = STATUS_META[challenge.status] ?? STATUS_META.cancelled;

  const opponent = isCreator
    ? challenge.challengerName ?? 'Open'
    : challenge.creatorName;

  const myLabel  = isCreator ? 'You' : isChallenger ? 'You' : challenge.creatorName;
  const vsLabel  = isCreator ? (challenge.challengerName ?? 'Open') : challenge.creatorName;

  return (
    <Link href={`/hooper/challenges/${challenge._id}`}>
      <div className="glass rounded-2xl p-4 hover:border-white/15 transition-all duration-200 active:scale-[0.99] cursor-pointer group">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF4500, #F0B52A)' }}>
              <svg viewBox="0 0 20 20" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="10" cy="10" r="8" />
                <path d="M10 2c0 0-3 4-3 8s3 8 3 8" />
                <path d="M2 10h16" />
              </svg>
            </div>
            <div>
              <p className="font-barlow font-semibold text-sm text-white tracking-wide">
                {myLabel} <span className="text-white/30">vs</span> {vsLabel}
              </p>
              <p className="text-white/40 text-xs font-dm mt-0.5">{challenge.location}</p>
            </div>
          </div>
          <span className={`flex-shrink-0 text-xs font-barlow font-semibold px-2.5 py-1 rounded-full border tracking-wide ${meta.color}`}>
            {meta.label}
          </span>
        </div>

        <div className="court-line my-3" />

        <div className="flex items-center justify-between text-xs font-dm">
          <div className="flex items-center gap-3 text-white/40">
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="2" y="2" width="12" height="11" rx="2" />
                <path d="M2 6h12M6 1v3M10 1v3" strokeLinecap="round" />
              </svg>
              {new Date(challenge.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              &nbsp;•&nbsp;{challenge.time}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40">Entry <span className="text-white/60 font-semibold">${challenge.entryFee}</span></span>
            <span className="text-court-gold font-semibold flex items-center gap-1">
              <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor"><path d="M8 1l2 4.5H15l-4 3.5 1.5 5L8 11.5 3.5 14 5 9 1 5.5h5z"/></svg>
              Prize ${challenge.prizeAmount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ChallengesPage() {
  const [tab, setTab] = useState<'open' | 'mine' | 'history'>('open');

  const openChallenges = useQuery(api.challenges.listOpenChallenges);
  const myChallenges   = useQuery(api.challenges.listMyChallenges);
  const stats          = useQuery(api.challenges.getMyStats);
  const currentUser    = useQuery(api.users.getCurrentUser);

  const historyItems = (myChallenges ?? []).filter(
    (c: any) => c.status === 'completed' || c.status === 'cancelled' || c.status === 'disputed',
  );

  const activeItems = (myChallenges ?? []).filter(
    (c: any) => !['completed', 'cancelled', 'disputed'].includes(c.status),
  );

  const displayList =
    tab === 'open'    ? (openChallenges ?? []) :
    tab === 'mine'    ? activeItems             :
                        historyItems;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-3xl text-white tracking-widest text-glow-orange">
            1v1 Challenges
          </h1>
          <p className="text-white/35 text-xs font-barlow tracking-widest uppercase mt-0.5">
            Skill-Based Competitions
          </p>
        </div>
        <Link
          href="/hooper/challenges/create"
          className="btn-court text-white text-xs px-5 py-2.5 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #FF4500, #F0B52A)' }}
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2v12M2 8h12" strokeLinecap="round" />
          </svg>
          Create
        </Link>
      </div>

      {/* ── Stats row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Games',  value: stats?.totalGames ?? 0 },
          { label: 'Wins',   value: stats?.wins       ?? 0 },
          { label: 'Losses', value: stats?.losses     ?? 0 },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-3 text-center">
            <p className="font-bebas text-2xl text-white">{s.value}</p>
            <p className="text-white/35 text-xs font-barlow tracking-widest uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Legal compliance notice ─────────────────────────────── */}
      <div className="glass rounded-xl px-4 py-3 flex items-start gap-3">
        <svg viewBox="0 0 20 20" className="w-4 h-4 text-court-gold flex-shrink-0 mt-0.5" fill="currentColor">
          <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm-.75 4.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 8a1 1 0 110-2 1 1 0 010 2z"/>
        </svg>
        <p className="text-white/40 text-xs font-dm leading-relaxed">
          All challenges are <strong className="text-white/60">skill-based competitions</strong> with
          platform-managed prizes. Entry fees fund prize pools administered by Hooper.
          This is not peer-to-peer wagering. 18+ only.
        </p>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div className="flex gap-1 glass rounded-xl p-1">
        {([
          { key: 'open',    label: 'Open Challenges' },
          { key: 'mine',    label: 'My Active' },
          { key: 'history', label: 'History' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg font-barlow text-xs tracking-widest uppercase transition-all duration-200
              ${tab === key
                ? 'bg-court-orange text-white'
                : 'text-white/35 hover:text-white/60'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Challenge list ───────────────────────────────────────── */}
      {displayList === undefined ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'rgba(255,69,0,0.1)' }}>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-court-orange" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2c0 0-4 5-4 10s4 10 4 10" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <p className="text-white/50 font-barlow tracking-widest uppercase text-sm">
            {tab === 'open' ? 'No open challenges right now' :
             tab === 'mine' ? 'No active challenges' :
             'No match history yet'}
          </p>
          {tab === 'open' && (
            <Link href="/hooper/challenges/create"
              className="mt-3 inline-block text-court-orange text-xs font-barlow tracking-widest uppercase hover:text-court-gold transition-colors">
              Create the first challenge →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((c: any) => (
            <ChallengeCard
              key={c._id}
              challenge={c}
              currentUserId={currentUser?._id ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
