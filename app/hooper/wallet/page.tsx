'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';

const TYPE_META: Record<string, { label: string; sign: '+' | '−'; color: string }> = {
  entry_fee:  { label: 'Entry Fee',   sign: '−', color: 'text-white/40' },
  prize:      { label: 'Prize Won',   sign: '+', color: 'text-emerald-400' },
  refund:     { label: 'Refund',      sign: '+', color: 'text-blue-400' },
  withdrawal: { label: 'Withdrawal',  sign: '−', color: 'text-court-gold' },
};

function fmt(cents: number) {
  return (cents / 100).toFixed(2);
}

export default function WalletPage() {
  const wallet       = useQuery(api.wallets.getMyWallet);
  const transactions = useQuery(api.wallets.getMyTransactions);
  const withdraw     = useMutation(api.wallets.requestWithdrawal);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    const dollars = parseFloat(withdrawAmount);
    if (isNaN(dollars) || dollars < 5) return showToast('Minimum withdrawal is $5.00');
    const cents = Math.round(dollars * 100);
    if (cents > (wallet?.balanceCents ?? 0)) return showToast('Amount exceeds your balance.');

    setLoading(true);
    try {
      await withdraw({ amountCents: cents });
      showToast('Withdrawal request submitted! Processing within 3–5 business days.');
      setWithdrawAmount('');
      setShowWithdrawForm(false);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }

  const balance      = wallet?.balanceCents      ?? 0;
  const totalEarned  = wallet?.totalEarnedCents   ?? 0;
  const totalWithdrawn = wallet?.totalWithdrawnCents ?? 0;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass rounded-xl px-5 py-3 text-sm font-dm text-white border border-white/10 shadow-lg">
          {toast}
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────── */}
      <div>
        <h1 className="font-bebas text-3xl text-white tracking-widest">Wallet</h1>
        <p className="text-white/35 text-xs font-barlow tracking-widest uppercase mt-0.5">
          Competition Earnings
        </p>
      </div>

      {/* ── Balance card ─────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(255,69,0,0.15) 0%, rgba(240,181,42,0.1) 100%)', border: '1px solid rgba(255,69,0,0.2)' }}>
        <div className="noise-overlay rounded-2xl" />
        <p className="font-barlow text-xs tracking-widest uppercase text-white/40 mb-1">Available Balance</p>
        <p className="font-bebas text-5xl text-white mb-4">
          ${fmt(balance)}
        </p>
        <div className="flex items-center gap-4 text-xs font-dm">
          <div>
            <p className="text-white/35">Total Earned</p>
            <p className="text-emerald-400 font-semibold">${fmt(totalEarned)}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-white/35">Withdrawn</p>
            <p className="text-white/50 font-semibold">${fmt(totalWithdrawn)}</p>
          </div>
        </div>

        {balance >= 500 && !showWithdrawForm && (
          <button
            onClick={() => setShowWithdrawForm(true)}
            className="mt-4 btn-court text-white text-xs px-5 py-2.5 flex items-center gap-2 w-fit"
            style={{ background: 'linear-gradient(135deg, #FF4500, #F0B52A)' }}>
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 13h12" strokeLinecap="round" />
            </svg>
            Withdraw Earnings
          </button>
        )}
      </div>

      {/* ── Withdraw form ─────────────────────────────────────────── */}
      {showWithdrawForm && (
        <form onSubmit={handleWithdraw} className="glass rounded-2xl p-4 space-y-4">
          <h3 className="font-barlow font-semibold text-xs tracking-widest uppercase text-white/50">
            Withdraw Funds
          </h3>
          <div>
            <label className="block text-xs text-white/40 font-barlow tracking-widest uppercase mb-1.5">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 font-dm">$</span>
              <input
                type="number"
                min="5"
                step="0.01"
                max={fmt(balance)}
                className="input-court w-full pl-7"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                required
              />
            </div>
            <p className="text-white/25 text-xs font-dm mt-1.5">
              Available: ${fmt(balance)} · Min withdrawal: $5.00
            </p>
          </div>

          <div className="rounded-xl bg-court-gold/5 border border-court-gold/15 p-3">
            <p className="text-white/40 text-xs font-dm leading-relaxed">
              Withdrawals are processed within <strong className="text-white/60">3–5 business days</strong> to
              your registered payment method. Identity verification (KYC) may be required for amounts over $600/year.
            </p>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowWithdrawForm(false)}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 text-xs font-barlow tracking-widest uppercase hover:border-white/20 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-white text-xs font-barlow tracking-widest uppercase disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #FF4500, #F0B52A)' }}>
              {loading ? 'Submitting…' : 'Request Withdrawal'}
            </button>
          </div>
        </form>
      )}

      {/* Low balance notice */}
      {!showWithdrawForm && balance < 500 && balance > 0 && (
        <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
          <svg viewBox="0 0 16 16" className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3M8 10.5v.5" strokeLinecap="round" />
          </svg>
          <p className="text-white/35 text-xs font-dm">Minimum withdrawal is $5.00. Win more competitions to reach the threshold.</p>
        </div>
      )}

      {/* ── KYC notice ───────────────────────────────────────────── */}
      {!wallet?.kycVerified && totalEarned > 0 && (
        <div className="glass rounded-xl px-4 py-3 border border-court-gold/15 flex items-start gap-3">
          <svg viewBox="0 0 20 20" className="w-4 h-4 text-court-gold flex-shrink-0 mt-0.5" fill="currentColor">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm-.75 4.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 8a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
          <div>
            <p className="text-court-gold text-xs font-barlow font-semibold tracking-widest uppercase">Identity Verification Required</p>
            <p className="text-white/35 text-xs font-dm mt-0.5">
              Winnings over $600/year require identity verification per IRS regulations.
              Contact support to complete KYC before requesting large withdrawals.
            </p>
          </div>
        </div>
      )}

      {/* ── Transaction history ───────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="font-barlow font-semibold text-xs tracking-widest uppercase text-white/50">Transaction History</h3>

        {transactions === undefined ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-xl h-14 animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="glass rounded-xl px-4 py-6 text-center">
            <p className="text-white/30 text-xs font-barlow tracking-widest uppercase">No transactions yet</p>
            <Link href="/hooper/challenges"
              className="mt-2 inline-block text-court-orange text-xs font-barlow tracking-widest hover:text-court-gold transition-colors">
              Enter a challenge to get started →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx: any) => {
              const meta = TYPE_META[tx.type] ?? TYPE_META.entry_fee;
              const isCredit = meta.sign === '+';
              return (
                <div key={tx._id} className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bebas
                      ${isCredit ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                      {meta.sign}
                    </div>
                    <div>
                      <p className="text-white/70 text-xs font-dm font-semibold">{meta.label}</p>
                      <p className="text-white/25 text-xs font-dm">{tx.description}</p>
                      <p className="text-white/20 text-xs font-dm">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-dm font-semibold text-sm ${meta.color}`}>
                      {meta.sign}${fmt(tx.amountCents)}
                    </p>
                    <p className={`text-xs font-dm capitalize
                      ${tx.status === 'completed' ? 'text-white/25' :
                        tx.status === 'pending'   ? 'text-court-gold' :
                        'text-red-400/60'}`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Legal footer ─────────────────────────────────────────── */}
      <div className="glass rounded-xl px-4 py-3">
        <p className="text-white/20 text-xs font-dm leading-relaxed text-center">
          All prizes are awarded by the Hooper platform from competition prize pools.
          This platform facilitates skill-based competitions and is not a gambling service.
          Prize income may be subject to reporting requirements.
        </p>
      </div>
    </div>
  );
}
