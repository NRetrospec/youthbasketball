'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

type EntryType = 'practice' | 'game' | 'scrimmage' | 'tournament';

const ENTRY_TYPES: EntryType[] = ['practice', 'game', 'scrimmage', 'tournament'];

const typeStyle: Record<EntryType, string> = {
  practice:   'bg-court-orange/15 text-court-orange border-court-orange/25',
  game:       'bg-green-500/15 text-green-400 border-green-500/25',
  scrimmage:  'bg-court-gold/15 text-court-gold border-court-gold/25',
  tournament: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
};

const emptyEntry = {
  teamId: '', title: '', date: '', startTime: '', endTime: '',
  location: '', type: 'practice' as EntryType, opponent: '', notes: '',
};

export default function SchedulePage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyEntry });
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);

  const teams    = useQuery(api.roster.listTeams);
  const schedule = useQuery(api.schedule.listSchedule, teamFilter !== 'all' ? { teamId: teamFilter as Id<'teams'> } : {});
  const addEntry    = useMutation(api.schedule.addScheduleEntry);
  const deleteEntry = useMutation(api.schedule.deleteScheduleEntry);

  const grouped = groupByMonth(schedule ?? []);

  function setField(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.teamId || !form.title || !form.date || !form.startTime || !form.endTime || !form.location) return;
    setSubmitting(true);
    try {
      await addEntry({
        teamId:    form.teamId as Id<'teams'>,
        title:     form.title,
        date:      form.date,
        startTime: form.startTime,
        endTime:   form.endTime,
        location:  form.location,
        type:      form.type,
        opponent:  form.opponent || undefined,
        notes:     form.notes || undefined,
      });
      setForm({ ...emptyEntry });
      setShowForm(false);
    } catch { /* noop */ }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wide">Schedule</h1>
          <p className="text-white/40 font-dm text-sm mt-1">Practices, games & tournaments</p>
        </div>
        <motion.button
          className="btn-court bg-court-orange text-white text-xs py-2.5 px-5"
          style={{ boxShadow: '0 0 20px rgba(255,69,0,0.3)' }}
          whileHover={{ scale: 1.04 }}
          onClick={() => setShowForm(v => !v)}
        >
          {showForm ? 'Cancel' : '+ Add Entry'}
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
          >
            <p className="font-bebas text-xl text-white">Add Schedule Entry</p>

            <div className="grid sm:grid-cols-2 gap-3">
              <select required value={form.teamId} onChange={e => setField('teamId', e.target.value)} className="input-court">
                <option value="">Select team *</option>
                {(teams ?? []).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
              <select value={form.type} onChange={e => setField('type', e.target.value)} className="input-court">
                {ENTRY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>

            <input placeholder="Title *" required value={form.title} onChange={e => setField('title', e.target.value)} className="input-court w-full" />

            <div className="grid sm:grid-cols-3 gap-3">
              <input type="date" required value={form.date} onChange={e => setField('date', e.target.value)} className="input-court" />
              <input type="time" required value={form.startTime} onChange={e => setField('startTime', e.target.value)} className="input-court" />
              <input type="time" required value={form.endTime} onChange={e => setField('endTime', e.target.value)} className="input-court" />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input placeholder="Location *" required value={form.location} onChange={e => setField('location', e.target.value)} className="input-court" />
              <input placeholder="Opponent (for games)" value={form.opponent} onChange={e => setField('opponent', e.target.value)} className="input-court" />
            </div>

            <textarea placeholder="Notes" rows={2} value={form.notes} onChange={e => setField('notes', e.target.value)} className="input-court w-full resize-none" />

            <button type="submit" disabled={submitting} className="btn-court bg-court-orange text-white w-full disabled:opacity-50">
              {submitting ? 'Adding…' : 'Add Entry'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Team filter */}
      {teams && teams.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTeamFilter('all')}
            className={`px-3.5 py-1.5 rounded-full font-barlow text-xs tracking-widest uppercase transition-all border
              ${teamFilter === 'all' ? 'bg-court-orange/20 text-court-orange border-court-orange/40' : 'text-white/40 border-white/10 hover:text-white'}`}
          >
            All Teams
          </button>
          {teams.map(t => (
            <button
              key={t._id}
              onClick={() => setTeamFilter(t._id)}
              className={`px-3.5 py-1.5 rounded-full font-barlow text-xs tracking-widest uppercase transition-all border
                ${teamFilter === t._id ? 'bg-court-orange/20 text-court-orange border-court-orange/40' : 'text-white/40 border-white/10 hover:text-white'}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Schedule grouped by month */}
      {schedule === undefined ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}</div>
      ) : (schedule ?? []).length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <p className="text-white/25 font-dm text-sm">No schedule entries yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ month, entries }) => (
            <div key={month}>
              <h3 className="font-bebas text-lg text-white/40 tracking-widest mb-3 uppercase">{month}</h3>
              <div className="space-y-2.5">
                {entries.map(entry => {
                  const team = (teams ?? []).find(t => t._id === entry.teamId);
                  return (
                    <motion.div
                      key={entry._id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {/* Date */}
                      <div className="text-center w-11 flex-shrink-0">
                        <div className="font-bebas text-xl text-court-orange leading-none">{new Date(entry.date).getDate()}</div>
                        <div className="font-barlow text-white/30 text-xs uppercase">{new Date(entry.date).toLocaleDateString('en', { weekday: 'short' })}</div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-barlow uppercase tracking-widest border ${typeStyle[entry.type as EntryType]}`}>
                            {entry.type}
                          </span>
                          {team && <span className="text-white/30 text-xs font-barlow uppercase tracking-widest">{team.name}</span>}
                          {entry.opponent && <span className="text-white/30 text-xs font-dm">vs {entry.opponent}</span>}
                        </div>
                        <p className="font-dm text-white text-sm font-medium">{entry.title}</p>
                        <p className="text-white/35 text-xs mt-0.5">{entry.startTime} – {entry.endTime} · {entry.location}</p>
                        {entry.notes && <p className="text-white/25 text-xs mt-0.5 italic">{entry.notes}</p>}
                      </div>

                      <button
                        onClick={() => deleteEntry({ id: entry._id })}
                        className="flex-shrink-0 text-red-400/40 hover:text-red-400 transition-colors"
                        aria-label="Delete entry"
                      >
                        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 4h10M6 4V3h4v1M5 4l1 9h4l1-9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        .input-court{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;color:#EDE8DD;font-family:'DM Sans',sans-serif;font-size:0.875rem;padding:0.65rem 0.9rem;outline:none;transition:border-color 0.2s;}
        .input-court:focus{border-color:rgba(255,69,0,0.5);}
        .input-court::placeholder{color:rgba(237,232,221,0.25);}
        .input-court option{background:#111;color:#EDE8DD;}
        .input-court[type="date"]::-webkit-calendar-picker-indicator,.input-court[type="time"]::-webkit-calendar-picker-indicator{filter:invert(1) opacity(0.3);}
      `}</style>
    </div>
  );
}

function groupByMonth(entries: { _id: string; date: string; [k: string]: unknown }[]) {
  const map = new Map<string, typeof entries>();
  entries.forEach(e => {
    const month = new Date(e.date).toLocaleDateString('en', { month: 'long', year: 'numeric' });
    if (!map.has(month)) map.set(month, []);
    map.get(month)!.push(e);
  });
  return Array.from(map.entries()).map(([month, entries]) => ({ month, entries }));
}
