'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function CoachDashboard() {
  const teams    = useQuery(api.roster.listTeams);
  const players  = useQuery(api.roster.listPlayers, {});
  const schedule = useQuery(api.schedule.listSchedule, {});

  const now = new Date().toISOString().split('T')[0];
  const upcoming = (schedule ?? []).filter(s => s.date >= now).slice(0, 5);

  const totalWins   = (teams ?? []).reduce((a, t) => a + t.wins, 0);
  const totalLosses = (teams ?? []).reduce((a, t) => a + t.losses, 0);

  return (
    <div className="space-y-8">
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-barlow text-court-orange text-xs tracking-[0.35em] uppercase mb-1">Coach Portal</p>
          <h1 className="font-bebas text-4xl text-white tracking-wide">Dashboard</h1>
        </div>
        <Link
          href="/youth-program/roster"
          className="btn-court bg-court-orange text-white text-xs py-3 px-5"
          style={{ boxShadow: '0 0 20px rgba(255,69,0,0.3)' }}
        >
          Manage Roster
        </Link>
      </div>

      {/* ── Overview stats ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Teams',   value: teams?.length   ?? '—', link: '/youth-program/roster'   },
          { label: 'Players', value: players?.length ?? '—', link: '/youth-program/roster'   },
          { label: 'Season W', value: totalWins,              link: null                      },
          { label: 'Season L', value: totalLosses,            link: null                      },
        ].map(({ label, value, link }) => (
          <motion.div
            key={label}
            className="glass rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={link ? { scale: 1.02 } : {}}
          >
            {link ? (
              <Link href={link}>
                <div className="font-bebas text-3xl text-court-orange">{value}</div>
                <div className="font-barlow text-white/35 text-xs tracking-widest uppercase mt-0.5">{label}</div>
              </Link>
            ) : (
              <>
                <div className="font-bebas text-3xl text-court-orange">{value}</div>
                <div className="font-barlow text-white/35 text-xs tracking-widest uppercase mt-0.5">{label}</div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Two column ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming schedule */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bebas text-2xl text-white tracking-wide">Upcoming</h2>
            <Link href="/youth-program/schedule" className="text-court-orange text-xs font-barlow tracking-widest uppercase hover:text-court-amber transition-colors">
              Full Schedule →
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <EmptyCard text="No upcoming events. Add to the schedule." link="/youth-program/schedule" />
          ) : (
            <div className="space-y-2.5">
              {upcoming.map(entry => (
                <div key={entry._id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-center w-11 flex-shrink-0">
                    <div className="font-bebas text-xl text-court-orange leading-none">{new Date(entry.date).getDate()}</div>
                    <div className="font-barlow text-white/30 text-xs uppercase">{new Date(entry.date).toLocaleDateString('en', { month: 'short' })}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-dm text-white text-sm font-medium truncate">{entry.title}</p>
                    <p className="text-white/35 text-xs mt-0.5">{entry.startTime} – {entry.endTime} · {entry.location}</p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-barlow uppercase tracking-widest border ${scheduleTypeStyle[entry.type]}`}>
                    {entry.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Teams overview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bebas text-2xl text-white tracking-wide">Teams</h2>
            <Link href="/youth-program/roster" className="text-court-orange text-xs font-barlow tracking-widest uppercase hover:text-court-amber transition-colors">
              Manage →
            </Link>
          </div>

          {!teams || teams.length === 0 ? (
            <EmptyCard text="No teams created yet." link="/youth-program/roster" />
          ) : (
            <div className="space-y-2.5">
              {teams.map(team => (
                <div key={team._id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <p className="font-dm text-white text-sm font-medium">{team.name}</p>
                    <p className="text-white/35 text-xs mt-0.5">{team.ageGroup} · {team.season}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bebas text-xl text-court-orange">{team.wins}–{team.losses}</div>
                    <div className="text-white/25 text-xs font-barlow uppercase tracking-widest">W–L</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Quick nav cards ──────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <QuickLink href="/youth-program/roster"   title="Manage Roster"   desc="Add, edit & assign players to teams" />
        <QuickLink href="/youth-program/schedule" title="Edit Schedule"   desc="Set up practices, games & tournaments" />
      </div>
    </div>
  );
}

const scheduleTypeStyle: Record<string, string> = {
  practice:   'bg-court-orange/15 text-court-orange border-court-orange/20',
  game:       'bg-green-500/15 text-green-400 border-green-500/20',
  scrimmage:  'bg-court-gold/15 text-court-gold border-court-gold/20',
  tournament: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
};

function EmptyCard({ text, link }: { text: string; link: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
      <p className="text-white/25 font-dm text-sm mb-3">{text}</p>
      <Link href={link} className="text-court-orange text-xs font-barlow tracking-widest uppercase hover:text-court-amber transition-colors">
        Get started →
      </Link>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href}>
      <motion.div
        className="relative overflow-hidden rounded-xl p-6 border border-white/[0.06] bg-white/[0.02] cursor-pointer"
        whileHover={{ scale: 1.02, borderColor: 'rgba(255,69,0,0.25)' }}
        whileTap={{ scale: 0.98 }}
      >
        <h3 className="font-bebas text-xl text-white tracking-wide">{title}</h3>
        <p className="text-white/35 text-sm font-dm mt-1">{desc}</p>
        <span className="absolute bottom-5 right-5 text-court-orange/40 font-barlow text-lg">→</span>
      </motion.div>
    </Link>
  );
}
