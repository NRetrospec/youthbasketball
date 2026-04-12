'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

type EventType = 'pickup' | 'tournament' | 'opengym' | 'camp';

const TYPES: { value: EventType | 'all'; label: string }[] = [
  { value: 'all',        label: 'All' },
  { value: 'pickup',     label: 'Pickup' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'opengym',    label: 'Open Gym' },
  { value: 'camp',       label: 'Camp' },
];

const typeStyle: Record<string, string> = {
  pickup:     'bg-court-orange/15 text-court-orange border-court-orange/25',
  tournament: 'bg-court-gold/15 text-court-gold border-court-gold/25',
  opengym:    'bg-green-500/15 text-green-400 border-green-500/25',
  camp:       'bg-blue-500/15 text-blue-400 border-blue-500/25',
};

export default function EventsPage() {
  const [filter,   setFilter]   = useState<EventType | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  const events      = useQuery(api.events.listEvents, {});
  const createEvent = useMutation(api.events.createEvent);
  const register    = useMutation(api.events.registerForEvent);

  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', location: '', type: 'pickup' as EventType, maxPlayers: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const filtered = (events ?? []).filter(e => filter === 'all' || e.type === filter);

  function setField(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createEvent({
        title:       form.title,
        description: form.description,
        date:        form.date,
        time:        form.time,
        location:    form.location,
        type:        form.type,
        maxPlayers:  form.maxPlayers ? parseInt(form.maxPlayers) : undefined,
      });
      setForm({ title: '', description: '', date: '', time: '', location: '', type: 'pickup', maxPlayers: '' });
      setShowForm(false);
    } catch {
      /* noop */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wide">Events</h1>
          <p className="text-white/40 font-dm text-sm mt-1">Pickup games, tournaments & open gym sessions</p>
        </div>
        <motion.button
          className="btn-court bg-court-orange text-white text-xs py-3 px-5 flex-shrink-0"
          style={{ boxShadow: '0 0 20px rgba(255,69,0,0.3)' }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(v => !v)}
        >
          {showForm ? 'Cancel' : '+ Post Event'}
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
            <p className="font-bebas text-xl text-white tracking-wide">Post an Event</p>

            <div className="grid sm:grid-cols-2 gap-3">
              <input placeholder="Event title *" required value={form.title} onChange={e => setField('title', e.target.value)} className="input-court" />
              <select value={form.type} onChange={e => setField('type', e.target.value)} className="input-court">
                {TYPES.filter(t => t.value !== 'all').map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <textarea
              placeholder="Description *"
              required
              rows={2}
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              className="input-court w-full resize-none"
            />

            <div className="grid sm:grid-cols-3 gap-3">
              <input type="date" required value={form.date} onChange={e => setField('date', e.target.value)} className="input-court" />
              <input type="time" required value={form.time} onChange={e => setField('time', e.target.value)} className="input-court" />
              <input placeholder="Max players" type="number" value={form.maxPlayers} onChange={e => setField('maxPlayers', e.target.value)} className="input-court" />
            </div>

            <input placeholder="Location *" required value={form.location} onChange={e => setField('location', e.target.value)} className="input-court w-full" />

            <button
              type="submit"
              disabled={submitting}
              className="btn-court bg-court-orange text-white w-full disabled:opacity-50"
            >
              {submitting ? 'Posting…' : 'Post Event'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(({ value, label }) => (
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

      {/* Events list */}
      {events === undefined ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <p className="text-white/25 font-dm text-sm">No {filter === 'all' ? '' : filter + ' '}events posted yet.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-court-orange text-xs font-barlow tracking-widest uppercase hover:text-court-amber transition-colors">
            Post the first one →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(event => (
            <motion.div
              key={event._id}
              className="glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Date block */}
              <div className="flex-shrink-0 text-center w-14">
                <div className="font-bebas text-3xl text-court-orange leading-none">
                  {new Date(event.date).getDate()}
                </div>
                <div className="font-barlow text-white/30 text-xs uppercase">
                  {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-barlow uppercase tracking-widest border ${typeStyle[event.type] ?? ''}`}>
                    {event.type}
                  </span>
                </div>
                <h3 className="font-dm text-white font-medium text-base mt-1">{event.title}</h3>
                <p className="text-white/35 text-sm mt-0.5">{event.time} · {event.location}</p>
                <p className="text-white/25 text-xs mt-1 line-clamp-1">{event.description}</p>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 text-right">
                <div className="text-white/30 text-xs font-dm mb-2">
                  {event.registeredCount}{event.maxPlayers ? `/${event.maxPlayers}` : ''} going
                </div>
                <button
                  onClick={() => register({ eventId: event._id })}
                  className="btn-court bg-court-orange/15 text-court-orange border border-court-orange/30 text-xs py-2 px-4 hover:bg-court-orange hover:text-white transition-colors"
                >
                  Join
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style jsx global>{`
        .input-court { background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;color:#EDE8DD;font-family:'DM Sans',sans-serif;font-size:0.875rem;padding:0.65rem 0.9rem;outline:none;transition:border-color 0.2s; }
        .input-court:focus { border-color:rgba(255,69,0,0.5); }
        .input-court::placeholder { color:rgba(237,232,221,0.25); }
        .input-court option { background:#111;color:#EDE8DD; }
        .input-court[type="date"]::-webkit-calendar-picker-indicator,.input-court[type="time"]::-webkit-calendar-picker-indicator { filter:invert(1) opacity(0.3); }
      `}</style>
    </div>
  );
}
