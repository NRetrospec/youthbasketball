'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ENTRY_FEES = [
  { amount: 10, prize: 16, fee: 4 },
  { amount: 20, prize: 32, fee: 8 },
  { amount: 50, prize: 80, fee: 20 },
];

export default function CreateChallengePage() {
  const router      = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const createChallenge = useMutation(api.challenges.createChallenge);

  const [location,    setLocation]    = useState('');
  const [date,        setDate]        = useState('');
  const [time,        setTime]        = useState('');
  const [selectedFee, setSelectedFee] = useState(20);
  const [notes,       setNotes]       = useState('');
  const [ageVerified, setAgeVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error,   setError]           = useState('');

  const selectedTier = ENTRY_FEES.find(f => f.amount === selectedFee)!;

  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!ageVerified)    return setError('You must confirm you are 18 or older.');
    if (!termsAccepted)  return setError('You must accept the competition terms.');
    if (!location.trim()) return setError('Please enter a location.');
    if (!date)           return setError('Please select a date.');
    if (!time)           return setError('Please select a time.');

    if (!currentUser) return setError('Not signed in.');

    setLoading(true);

    try {
      const challengeId = await createChallenge({
        location: location.trim(),
        date,
        time,
        entryFee: selectedFee,
        notes:    notes.trim() || undefined,
      });

      // Redirect to Stripe checkout
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          role:      'creator',
          entryFee:  selectedFee,
          userId:    currentUser._id,
          userEmail: currentUser.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Failed to start checkout');

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Back */}
      <Link href="/hooper/challenges"
        className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors font-barlow text-xs tracking-widest uppercase mb-6">
        <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Challenges
      </Link>

      <h1 className="font-bebas text-3xl text-white tracking-widest mb-1">Create Challenge</h1>
      <p className="text-white/35 text-xs font-barlow tracking-widest uppercase mb-6">
        Skill-Based 1v1 Competition
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Location ─────────────────────────────────────────── */}
        <div className="glass rounded-2xl p-4 space-y-4">
          <h2 className="font-barlow font-semibold text-xs tracking-widest uppercase text-white/60">
            Match Details
          </h2>

          <div>
            <label className="block text-xs text-white/50 font-barlow tracking-widest uppercase mb-1.5">
              Location *
            </label>
            <input
              className="input-court w-full"
              placeholder="e.g. Bayfront Park Courts, Miami"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/50 font-barlow tracking-widest uppercase mb-1.5">
                Date *
              </label>
              <input
                type="date"
                className="input-court w-full"
                min={today}
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 font-barlow tracking-widest uppercase mb-1.5">
                Time *
              </label>
              <input
                type="time"
                className="input-court w-full"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 font-barlow tracking-widest uppercase mb-1.5">
              Notes (optional)
            </label>
            <textarea
              className="input-court w-full"
              placeholder="Game format, rules, court details..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* ── Entry Fee Selection ───────────────────────────────── */}
        <div className="glass rounded-2xl p-4 space-y-4">
          <h2 className="font-barlow font-semibold text-xs tracking-widest uppercase text-white/60">
            Prize Structure
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {ENTRY_FEES.map(({ amount, prize }) => (
              <button
                key={amount}
                type="button"
                onClick={() => setSelectedFee(amount)}
                className={`rounded-xl p-3 border transition-all duration-200 text-center
                  ${selectedFee === amount
                    ? 'border-court-orange bg-court-orange/10 text-white'
                    : 'border-white/8 bg-white/3 text-white/50 hover:border-white/20'}`}
              >
                <p className="font-bebas text-xl">${amount}</p>
                <p className="text-xs font-barlow tracking-wide opacity-70">entry</p>
                <p className="text-court-gold text-xs font-barlow font-semibold mt-1">
                  Win ${prize}
                </p>
              </button>
            ))}
          </div>

          {/* Prize breakdown */}
          <div className="rounded-xl bg-white/3 border border-white/8 p-4 space-y-2">
            <div className="flex justify-between text-xs font-dm">
              <span className="text-white/40">Your entry fee</span>
              <span className="text-white/70">${selectedTier.amount}</span>
            </div>
            <div className="flex justify-between text-xs font-dm">
              <span className="text-white/40">Opponent entry fee</span>
              <span className="text-white/70">${selectedTier.amount}</span>
            </div>
            <div className="flex justify-between text-xs font-dm">
              <span className="text-white/40">Total competition pool</span>
              <span className="text-white/70">${selectedTier.amount * 2}</span>
            </div>
            <div className="flex justify-between text-xs font-dm">
              <span className="text-white/40">Platform service fee (20%)</span>
              <span className="text-white/40">−${selectedTier.fee}</span>
            </div>
            <div className="court-line" />
            <div className="flex justify-between text-sm font-dm font-semibold">
              <span className="text-court-gold">Winner prize</span>
              <span className="text-court-gold">${selectedTier.prize}</span>
            </div>
          </div>

          <p className="text-white/30 text-xs font-dm leading-relaxed">
            The platform determines and controls all prize amounts before competition begins.
            Prizes are not peer-to-peer wagers. This is a skill-based competition.
          </p>
        </div>

        {/* ── Compliance checkboxes ─────────────────────────────── */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <h2 className="font-barlow font-semibold text-xs tracking-widest uppercase text-white/60">
            Eligibility & Terms
          </h2>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center transition-all mt-0.5
              ${ageVerified ? 'border-court-orange bg-court-orange' : 'border-white/20 group-hover:border-white/40'}`}
              onClick={() => setAgeVerified(v => !v)}
            >
              {ageVerified && (
                <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-xs font-dm text-white/50 leading-relaxed">
              I confirm that I am <strong className="text-white/70">18 years of age or older</strong> and
              legally eligible to participate in skill-based competitions in my jurisdiction.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center transition-all mt-0.5
              ${termsAccepted ? 'border-court-orange bg-court-orange' : 'border-white/20 group-hover:border-white/40'}`}
              onClick={() => setTermsAccepted(v => !v)}
            >
              {termsAccepted && (
                <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-xs font-dm text-white/50 leading-relaxed">
              I understand this is a <strong className="text-white/70">skill-based competition</strong>.
              Entry fees fund a platform-managed prize pool. Prizes are awarded by Hooper,
              not directly by the opponent. All results are subject to verification.
            </span>
          </label>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-xs font-dm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-court text-white py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: loading ? 'rgba(255,69,0,0.4)' : 'linear-gradient(135deg, #FF4500, #F0B52A)' }}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Redirecting to Payment...
            </>
          ) : (
            <>
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="14" height="9" rx="2" />
                <path d="M1 7h14" strokeLinecap="round" />
              </svg>
              Create & Pay ${selectedFee} Entry Fee
            </>
          )}
        </button>

        <p className="text-center text-white/20 text-xs font-dm">
          Secured by Stripe · No gambling · Skill-based only
        </p>
      </form>
    </div>
  );
}
