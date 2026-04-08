'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../Modal';

interface Props { onClose: () => void }

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface FormData {
  name:          string;
  age:           string;
  email:         string;
  preferredTime: string;
  division:      string;
}

const timeSlots = [
  'Monday 4:00 PM (Ages 8–11)',
  'Tuesday 5:00 PM (Ages 12–15)',
  'Wednesday 4:30 PM (Ages 12–15)',
  'Thursday 5:00 PM (Ages 8–11)',
  'Saturday 9:00 AM (All Ages)',
  'Sunday 10:00 AM (Open Gym)',
];

const inputClass =
  'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white ' +
  'placeholder-white/25 focus:outline-none focus:border-court-orange/60 focus:bg-white/[0.06] ' +
  'transition-all duration-200';

const labelClass = 'block text-white/50 text-xs font-barlow tracking-widest uppercase mb-1.5';

export default function SignUpModal({ onClose }: Props) {
  const [form, setForm]       = useState<FormData>({ name: '', age: '', email: '', preferredTime: '', division: '' });
  const [status, setStatus]   = useState<FormState>('idle');
  const [fieldErrors, setFE]  = useState<Partial<FormData>>({});

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.name.trim())                          errs.name          = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email  = 'Valid email required';
    const age = parseInt(form.age, 10);
    if (!form.age || isNaN(age) || age < 5 || age > 18) errs.age     = 'Age must be 5–18';
    if (!form.preferredTime)                        errs.preferredTime = 'Select a time slot';
    setFE(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/booking', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:          form.name.trim(),
          age:           parseInt(form.age, 10),
          email:         form.email.trim().toLowerCase(),
          preferredTime: form.preferredTime,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const field = (
    id:          keyof FormData,
    label:       string,
    type:        string,
    placeholder: string,
    extra?:      React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={form[id]}
        onChange={e => setForm(v => ({ ...v, [id]: e.target.value }))}
        className={`${inputClass} ${fieldErrors[id] ? 'border-red-500/50' : ''}`}
        disabled={status === 'loading' || status === 'success'}
        {...extra}
      />
      {fieldErrors[id] && (
        <p className="text-red-400/80 text-xs mt-1">{fieldErrors[id]}</p>
      )}
    </div>
  );

  return (
    <Modal onClose={onClose} title="Sign Up" maxWidth="max-w-lg">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          /* ── Success state ─────────────────────────────────────── */
          <motion.div
            key="success"
            className="flex flex-col items-center justify-center py-10 text-center gap-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-court-orange/15 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-court-orange" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 12l6 6 10-10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
            <div>
              <h3 className="font-bebas text-2xl text-white mb-1">You're In!</h3>
              <p className="text-white/50 text-sm">
                Welcome to Youth Basketball, <span className="text-court-orange">{form.name}</span>.
                We'll reach out to <span className="text-court-gold">{form.email}</span> within 24 hours.
              </p>
            </div>
            <button
              className="btn-court bg-white/[0.06] border border-white/10 text-court-cream/70 hover:text-white text-xs"
              onClick={onClose}
            >
              Close
            </button>
          </motion.div>
        ) : (
          /* ── Form ──────────────────────────────────────────────── */
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-white/40 text-sm leading-relaxed">
              Reserve your spot for the upcoming season. We'll confirm your placement within 24 hours.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {field('name',  'Full Name', 'text',   'Jordan Smith')}
              {field('age',   'Age',       'number', '12', { min: '5', max: '18' })}
            </div>

            {field('email', 'Email Address', 'email', 'email@example.com')}

            <div>
              <label htmlFor="preferredTime" className={labelClass}>Preferred Time Slot</label>
              <select
                id="preferredTime"
                value={form.preferredTime}
                onChange={e => setForm(v => ({ ...v, preferredTime: e.target.value }))}
                className={`${inputClass} ${fieldErrors.preferredTime ? 'border-red-500/50' : ''} appearance-none cursor-pointer`}
                disabled={status === 'loading'}
              >
                <option value="" disabled>Select a session…</option>
                {timeSlots.map(s => <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>)}
              </select>
              {fieldErrors.preferredTime && (
                <p className="text-red-400/80 text-xs mt-1">{fieldErrors.preferredTime}</p>
              )}
            </div>

            {status === 'error' && (
              <p className="text-red-400/80 text-xs text-center">
                Something went wrong. Please try again or contact us directly.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-court w-full bg-court-orange text-white hover:bg-court-amber shadow-[0_0_30px_rgba(255,69,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {status === 'loading' ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  />
                  Submitting…
                </>
              ) : 'Reserve My Spot'}
            </button>

            <p className="text-white/20 text-xs text-center">
              No payment required now · We'll contact you to confirm
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}
