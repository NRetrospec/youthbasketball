'use client';

import { useEffect, useState, use } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_META: Record<string, { label: string; description: string; color: string }> = {
  pending_payment:             { label: 'Awaiting Payment',  description: 'Pay your entry fee to publish this challenge.',         color: 'text-yellow-400' },
  open:                        { label: 'Open',              description: 'Waiting for an opponent to accept.',                    color: 'text-emerald-400' },
  awaiting_challenger_payment: { label: 'Pending Payment',   description: 'Opponent accepted — waiting for their entry fee.',      color: 'text-blue-400' },
  active:                      { label: 'Match Active',      description: 'Both players paid. Play the match and submit scores.',  color: 'text-court-orange' },
  pending_result:              { label: 'Submit Score',      description: 'Match done — both players must submit the scoreline.',  color: 'text-court-gold' },
  completed:                   { label: 'Completed',         description: 'Match complete. Prize has been awarded.',               color: 'text-white/50' },
  disputed:                    { label: 'Under Review',      description: 'Score conflict — admin is reviewing this match.',       color: 'text-red-400' },
  cancelled:                   { label: 'Cancelled',         description: 'This challenge has been cancelled.',                    color: 'text-white/30' },
};

export default function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: challengeId } = use(params);
  const router              = useRouter();
  const searchParams        = useSearchParams();

  const challenge   = useQuery(api.challenges.getChallenge, { challengeId: challengeId as any });
  const currentUser = useQuery(api.users.getCurrentUser);
  const dispute     = useQuery(api.disputes.getDisputeForChallenge, { challengeId: challengeId as any });

  const acceptChallenge  = useMutation(api.challenges.acceptChallenge);
  const submitScore      = useMutation(api.challenges.submitScore);
  const cancelChallenge  = useMutation(api.challenges.cancelChallenge);
  const createDispute    = useMutation(api.disputes.createDispute);
  const verifyPayment    = useAction(api.payments.verifyStripePayment);

  const [scoreForm, setScoreForm] = useState({ creatorPoints: '', challengerPoints: '' });
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [loading,  setLoading]  = useState('');
  const [toast,    setToast]    = useState('');
  const [verifying, setVerifying] = useState(false);

  // Handle Stripe redirect back
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const role      = searchParams.get('role') as 'creator' | 'challenger' | null;
    const payment   = searchParams.get('payment');

    if (sessionId && role && payment === 'success' && currentUser && challenge) {
      setVerifying(true);
      verifyPayment({
        challengeId: challengeId as any,
        sessionId,
        role,
        userId: currentUser._id,
      })
        .then(() => {
          showToast('Payment confirmed! ✓');
          // Clean up query params
          router.replace(`/hooper/challenges/${challengeId}`);
        })
        .catch(err => {
          showToast(`Payment verification failed: ${err.message}`);
        })
        .finally(() => setVerifying(false));
    }

    if (payment === 'cancelled') {
      showToast('Payment cancelled. You can try again.');
      router.replace(`/hooper/challenges/${challengeId}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentUser, challenge]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  async function handleAcceptAndPay() {
    if (!currentUser || !challenge) return;
    setLoading('accept');
    try {
      await acceptChallenge({ challengeId: challengeId as any });

      const res = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          role:      'challenger',
          entryFee:  challenge.entryFee,
          userId:    currentUser._id,
          userEmail: currentUser.email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Checkout failed');
      window.location.href = data.url;
    } catch (err: any) {
      showToast(err.message);
      setLoading('');
    }
  }

  async function handlePayEntryFee() {
    if (!currentUser || !challenge) return;
    setLoading('pay');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          role:      'creator',
          entryFee:  challenge.entryFee,
          userId:    currentUser._id,
          userEmail: currentUser.email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Checkout failed');
      window.location.href = data.url;
    } catch (err: any) {
      showToast(err.message);
      setLoading('');
    }
  }

  async function handleSubmitScore() {
    const cp = parseInt(scoreForm.creatorPoints);
    const chp = parseInt(scoreForm.challengerPoints);
    if (isNaN(cp) || isNaN(chp)) return showToast('Please enter valid scores.');
    if (cp === chp) return showToast('There must be a winner — scores cannot be tied.');

    setLoading('score');
    try {
      await submitScore({ challengeId: challengeId as any, creatorPoints: cp, challengerPoints: chp });
      showToast('Score submitted!');
      setScoreForm({ creatorPoints: '', challengerPoints: '' });
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setLoading('');
    }
  }

  async function handleDispute() {
    if (!disputeReason.trim()) return showToast('Please describe the issue.');
    setLoading('dispute');
    try {
      await createDispute({ challengeId: challengeId as any, reason: disputeReason.trim() });
      showToast('Dispute submitted. An admin will review shortly.');
      setShowDisputeForm(false);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setLoading('');
    }
  }

  async function handleCancel() {
    if (!confirm('Cancel this challenge?')) return;
    setLoading('cancel');
    try {
      await cancelChallenge({ challengeId: challengeId as any });
      router.push('/hooper/challenges');
    } catch (err: any) {
      showToast(err.message);
      setLoading('');
    }
  }

  if (challenge === undefined || verifying) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="glass rounded-2xl h-40 animate-pulse" />
        <div className="glass rounded-2xl h-32 animate-pulse" />
        <div className="glass rounded-2xl h-24 animate-pulse" />
        {verifying && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="glass rounded-2xl px-8 py-6 text-center space-y-3">
              <svg className="w-8 h-8 text-court-orange animate-spin mx-auto" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-white font-barlow tracking-widest uppercase text-sm">Verifying Payment…</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-white/40 font-barlow tracking-widest uppercase">Challenge not found</p>
        <Link href="/hooper/challenges" className="mt-3 text-court-orange text-sm font-barlow tracking-widest">
          ← Back to Challenges
        </Link>
      </div>
    );
  }

  const isCreator    = challenge.creatorId    === currentUser?._id;
  const isChallenger = challenge.challengerId === currentUser?._id;
  const isParticipant = isCreator || isChallenger;
  const meta = STATUS_META[challenge.status] ?? STATUS_META.cancelled;

  const myScoreSubmitted = isCreator ? challenge.creatorScoreSubmitted : challenge.challengerScoreSubmitted;

  const winnerId = challenge.winnerId;
  const didWin   = winnerId === currentUser?._id;
  const didLose  = isParticipant && winnerId && winnerId !== currentUser?._id;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass rounded-xl px-5 py-3 text-sm font-dm text-white border border-white/10 shadow-lg animate-pulse">
          {toast}
        </div>
      )}

      {/* Back */}
      <Link href="/hooper/challenges"
        className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors font-barlow text-xs tracking-widest uppercase">
        <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </Link>

      {/* ── VS Header ────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5 text-center space-y-3">
        {challenge.status === 'completed' && (
          <div className={`inline-block px-4 py-1.5 rounded-full font-bebas tracking-widest text-lg ${didWin ? 'text-court-gold' : didLose ? 'text-white/30' : 'text-white/50'}`}
            style={{ background: didWin ? 'rgba(240,181,42,0.1)' : 'rgba(255,255,255,0.03)' }}>
            {didWin ? '🏆 You Won!' : didLose ? 'Match Complete' : 'Completed'}
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <div className="text-center flex-1">
            <div className="w-12 h-12 rounded-full mx-auto mb-1.5 flex items-center justify-center text-lg font-bebas"
              style={{ background: 'linear-gradient(135deg, #FF4500, #F0B52A)' }}>
              {(challenge.creatorName?.[0] ?? '?').toUpperCase()}
            </div>
            <p className="font-barlow font-semibold text-sm text-white">
              {challenge.creatorName}
              {isCreator && <span className="text-court-orange"> (You)</span>}
            </p>
          </div>

          <div className="text-center px-2">
            {challenge.status === 'completed' && challenge.creatorScoreReport ? (
              <div className="font-bebas text-3xl text-white">
                {challenge.creatorScoreReport.creatorPoints}
                <span className="text-white/30 mx-1">—</span>
                {challenge.creatorScoreReport.challengerPoints}
              </div>
            ) : (
              <div className="font-bebas text-xl text-white/30">VS</div>
            )}
          </div>

          <div className="text-center flex-1">
            <div className="w-12 h-12 rounded-full mx-auto mb-1.5 flex items-center justify-center text-lg font-bebas border border-white/10"
              style={{ background: challenge.challengerId ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : 'rgba(255,255,255,0.03)' }}>
              {challenge.challengerId ? (challenge.challengerName?.[0] ?? '?').toUpperCase() : '?'}
            </div>
            <p className={`font-barlow font-semibold text-sm ${challenge.challengerId ? 'text-white' : 'text-white/25'}`}>
              {challenge.challengerName ?? 'Open'}
              {isChallenger && <span className="text-court-orange"> (You)</span>}
            </p>
          </div>
        </div>

        <div className={`inline-block text-xs font-barlow font-semibold px-3 py-1 rounded-full border ${
          meta.color.includes('emerald') ? 'border-emerald-400/20 bg-emerald-400/10' :
          meta.color.includes('yellow')  ? 'border-yellow-400/20 bg-yellow-400/10' :
          meta.color.includes('blue')    ? 'border-blue-400/20 bg-blue-400/10' :
          meta.color.includes('orange')  ? 'border-court-orange/20 bg-court-orange/10' :
          meta.color.includes('gold')    ? 'border-court-gold/20 bg-court-gold/10' :
          meta.color.includes('red')     ? 'border-red-400/20 bg-red-400/10' :
          'border-white/10 bg-white/5'
        } ${meta.color} tracking-widest uppercase`}>
          {meta.label}
        </div>
        <p className="text-white/35 text-xs font-dm">{meta.description}</p>
      </div>

      {/* ── Match Info ───────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <h3 className="font-barlow font-semibold text-xs tracking-widest uppercase text-white/50">Match Details</h3>
        <div className="space-y-2">
          {[
            {
              icon: (
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M8 1.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                  <path d="M8 6v2l1.5 1.5M8 14.5V12" strokeLinecap="round" />
                  <path d="M2.5 12.5l1.5-1.5M11 11l1.5 1.5M13.5 12.5l-1.5-1.5" strokeLinecap="round" />
                </svg>
              ),
              label: 'Location',
              value: challenge.location,
            },
            {
              icon: (
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="2" width="12" height="11" rx="2" />
                  <path d="M2 6h12M6 1v3M10 1v3" strokeLinecap="round" />
                </svg>
              ),
              label: 'Date & Time',
              value: `${new Date(challenge.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })} · ${challenge.time}`,
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <span className="text-white/30 mt-0.5 flex-shrink-0">{icon}</span>
              <div>
                <p className="text-white/30 text-xs font-barlow tracking-widest uppercase">{label}</p>
                <p className="text-white/70 text-sm font-dm">{value}</p>
              </div>
            </div>
          ))}
          {challenge.notes && (
            <div className="flex items-start gap-2.5">
              <span className="text-white/30 mt-0.5">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="1" width="12" height="14" rx="2" />
                  <path d="M5 5h6M5 8h6M5 11h4" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <p className="text-white/30 text-xs font-barlow tracking-widest uppercase">Notes</p>
                <p className="text-white/70 text-sm font-dm">{challenge.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Prize Structure ──────────────────────────────────────── */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <h3 className="font-barlow font-semibold text-xs tracking-widest uppercase text-white/50">Competition Prize Pool</h3>
        <div className="space-y-1.5">
          {[
            { label: 'Entry fee (per player)', value: `$${challenge.entryFee}`, dim: true },
            { label: 'Total competition pool',  value: `$${challenge.entryFee * 2}`, dim: true },
            { label: 'Platform service fee',    value: `-$${challenge.platformFee}`, dim: true },
          ].map(({ label, value, dim }) => (
            <div key={label} className="flex justify-between text-xs font-dm">
              <span className={dim ? 'text-white/35' : 'text-white/60'}>{label}</span>
              <span className={dim ? 'text-white/40' : 'text-white/70'}>{value}</span>
            </div>
          ))}
          <div className="court-line my-1" />
          <div className="flex justify-between text-sm font-dm font-semibold">
            <span className="text-court-gold">Winner prize</span>
            <span className="text-court-gold">${challenge.prizeAmount}</span>
          </div>
        </div>
        <p className="text-white/25 text-xs font-dm">
          Prize administered by Hooper platform. Skill-based competition — not peer-to-peer wagering.
        </p>
      </div>

      {/* ── Actions ──────────────────────────────────────────────── */}

      {/* Creator: pay entry fee */}
      {isCreator && challenge.status === 'pending_payment' && (
        <button onClick={handlePayEntryFee} disabled={loading === 'pay'}
          className="w-full btn-court text-white py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #FF4500, #F0B52A)' }}>
          {loading === 'pay' ? 'Redirecting…' : `Pay $${challenge.entryFee} Entry Fee`}
        </button>
      )}

      {/* Anyone (non-creator): accept + pay */}
      {!isParticipant && challenge.status === 'open' && (
        <div className="space-y-3">
          <div className="glass rounded-xl px-4 py-3 flex items-start gap-3">
            <svg viewBox="0 0 20 20" className="w-4 h-4 text-court-gold flex-shrink-0 mt-0.5" fill="currentColor">
              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm-.75 4.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 8a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            <p className="text-white/40 text-xs font-dm leading-relaxed">
              By accepting, you agree this is a skill-based competition. Your
              <strong className="text-white/60"> ${challenge.entryFee} entry fee</strong> funds
              the prize pool. The platform awards the winner <strong className="text-white/60">${challenge.prizeAmount}</strong>.
            </p>
          </div>
          <button onClick={handleAcceptAndPay} disabled={!!loading}
            className="w-full btn-court text-white py-4 flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #FF4500, #F0B52A)' }}>
            {loading === 'accept' ? 'Processing…' : `Accept & Pay $${challenge.entryFee} Entry Fee`}
          </button>
        </div>
      )}

      {/* Submit score (active or pending_result) */}
      {isParticipant && (challenge.status === 'active' || challenge.status === 'pending_result') && !myScoreSubmitted && (
        <div className="glass rounded-2xl p-4 space-y-4">
          <h3 className="font-barlow font-semibold text-xs tracking-widest uppercase text-white/50">Submit Match Score</h3>
          <p className="text-white/35 text-xs font-dm">Enter the final scoreline as you recorded it. Both players must submit.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 font-barlow tracking-widest uppercase mb-1.5">
                {challenge.creatorName} (points)
              </label>
              <input type="number" min="0" max="999" className="input-court w-full"
                placeholder="0"
                value={scoreForm.creatorPoints}
                onChange={e => setScoreForm(s => ({ ...s, creatorPoints: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 font-barlow tracking-widest uppercase mb-1.5">
                {challenge.challengerName ?? 'Opponent'} (points)
              </label>
              <input type="number" min="0" max="999" className="input-court w-full"
                placeholder="0"
                value={scoreForm.challengerPoints}
                onChange={e => setScoreForm(s => ({ ...s, challengerPoints: e.target.value }))}
              />
            </div>
          </div>
          <button onClick={handleSubmitScore} disabled={loading === 'score'}
            className="w-full btn-court text-white py-3 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #FF4500, #F0B52A)' }}>
            {loading === 'score' ? 'Submitting…' : 'Submit Score'}
          </button>
        </div>
      )}

      {/* Score submitted, waiting for other side */}
      {isParticipant && challenge.status === 'pending_result' && myScoreSubmitted && (
        <div className="glass rounded-2xl px-4 py-5 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-court-gold/10 flex items-center justify-center mx-auto">
            <svg viewBox="0 0 20 20" className="w-5 h-5 text-court-gold" fill="currentColor">
              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm3.25 6.25l-4 4a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 3.47-3.47a.75.75 0 011.06 1.06z"/>
            </svg>
          </div>
          <p className="text-white/60 text-sm font-dm">Score submitted — waiting for opponent's report.</p>
        </div>
      )}

      {/* Dispute section */}
      {isParticipant && (challenge.status === 'disputed' || challenge.status === 'pending_result') && !dispute && (
        <div className="space-y-3">
          {showDisputeForm ? (
            <div className="glass rounded-2xl p-4 space-y-3">
              <h3 className="font-barlow font-semibold text-xs tracking-widest uppercase text-white/50">Submit Dispute</h3>
              <textarea className="input-court w-full" rows={3}
                placeholder="Describe the issue with the match result..."
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => setShowDisputeForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 text-xs font-barlow tracking-widest uppercase hover:border-white/20 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDispute} disabled={loading === 'dispute'}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-barlow tracking-widest uppercase disabled:opacity-50 hover:bg-red-500/30 transition-colors">
                  {loading === 'dispute' ? 'Submitting…' : 'Submit Dispute'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowDisputeForm(true)}
              className="w-full py-3 rounded-xl border border-red-500/20 text-red-400/70 text-xs font-barlow tracking-widest uppercase hover:border-red-500/40 hover:text-red-400 transition-colors">
              Dispute Result
            </button>
          )}
        </div>
      )}

      {/* Existing dispute status */}
      {dispute && (
        <div className="glass rounded-2xl p-4 space-y-2 border border-red-500/10">
          <h3 className="font-barlow font-semibold text-xs tracking-widest uppercase text-red-400">Dispute Under Review</h3>
          <p className="text-white/50 text-xs font-dm">{dispute.reason}</p>
          <p className="text-white/25 text-xs font-dm">Status: {dispute.status} — An admin will review and contact both players.</p>
        </div>
      )}

      {/* Creator cancel option */}
      {isCreator && ['pending_payment', 'open'].includes(challenge.status) && (
        <button onClick={handleCancel} disabled={loading === 'cancel'}
          className="w-full py-3 rounded-xl border border-white/8 text-white/25 text-xs font-barlow tracking-widest uppercase hover:border-white/20 hover:text-white/40 transition-colors disabled:opacity-40">
          {loading === 'cancel' ? 'Cancelling…' : 'Cancel Challenge'}
        </button>
      )}
    </div>
  );
}
