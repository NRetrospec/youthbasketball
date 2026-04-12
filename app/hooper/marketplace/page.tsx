'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

type Condition = 'new' | 'like-new' | 'good' | 'fair';

const CATEGORIES = ['Shoes', 'Jerseys', 'Balls', 'Accessories', 'Training Gear', 'Other'];
const CONDITIONS: Condition[] = ['new', 'like-new', 'good', 'fair'];

const condStyle: Record<Condition, string> = {
  'new':      'text-green-400 bg-green-500/15',
  'like-new': 'text-blue-400 bg-blue-500/15',
  'good':     'text-court-gold bg-court-gold/15',
  'fair':     'text-white/50 bg-white/10',
};

export default function MarketplacePage() {
  const [showForm, setShowForm] = useState(false);
  const [catFilter, setCatFilter] = useState('All');
  const [form, setForm] = useState({
    title: '', description: '', price: '', condition: 'good' as Condition, category: 'Shoes', imageUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const listings      = useQuery(api.marketplace.listListings);
  const createListing = useMutation(api.marketplace.createListing);
  const markSold      = useMutation(api.marketplace.markSold);

  const filtered = (listings ?? []).filter(l =>
    catFilter === 'All' || l.category === catFilter
  );

  function setField(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.price) return;
    setSubmitting(true);
    try {
      await createListing({
        title:       form.title,
        description: form.description,
        price:       parseFloat(form.price),
        condition:   form.condition,
        category:    form.category,
        imageUrl:    form.imageUrl || undefined,
      });
      setForm({ title: '', description: '', price: '', condition: 'good', category: 'Shoes', imageUrl: '' });
      setShowForm(false);
    } catch { /* noop */ }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wide">Marketplace</h1>
          <p className="text-white/40 font-dm text-sm mt-1">Buy & sell gear with the community</p>
        </div>
        <motion.button
          className="btn-court bg-court-orange text-white text-xs py-3 px-5 flex-shrink-0"
          style={{ boxShadow: '0 0 20px rgba(255,69,0,0.3)' }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(v => !v)}
        >
          {showForm ? 'Cancel' : '+ List Item'}
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
            <p className="font-bebas text-xl text-white">List an Item</p>

            <div className="grid sm:grid-cols-2 gap-3">
              <input placeholder="Title *" required value={form.title} onChange={e => setField('title', e.target.value)} className="input-court" />
              <input type="number" placeholder="Price ($) *" required min={0} step={0.01} value={form.price} onChange={e => setField('price', e.target.value)} className="input-court" />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <select value={form.condition} onChange={e => setField('condition', e.target.value)} className="input-court">
                {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <select value={form.category} onChange={e => setField('category', e.target.value)} className="input-court">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <textarea placeholder="Description" rows={2} value={form.description} onChange={e => setField('description', e.target.value)} className="input-court w-full resize-none" />
            <input placeholder="Image URL (optional)" value={form.imageUrl} onChange={e => setField('imageUrl', e.target.value)} className="input-court w-full" />

            <button type="submit" disabled={submitting} className="btn-court bg-court-orange text-white w-full disabled:opacity-50">
              {submitting ? 'Listing…' : 'List Item'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full font-barlow text-xs tracking-widest uppercase transition-all border
              ${catFilter === cat
                ? 'bg-court-orange/20 text-court-orange border-court-orange/40'
                : 'text-white/40 border-white/10 hover:text-white'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listings grid */}
      {listings === undefined ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <p className="text-white/25 font-dm text-sm">No listings yet. Be the first to sell something!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(listing => (
            <motion.div
              key={listing._id}
              className="glass rounded-xl overflow-hidden border border-white/[0.06] hover:border-court-orange/20 transition-colors"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -3 }}
            >
              {/* Image */}
              {listing.imageUrl ? (
                <div className="h-40 overflow-hidden bg-white/5">
                  <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-court-orange/10 to-transparent flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 text-white/15" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" />
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                  </svg>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-dm text-white font-semibold text-sm leading-snug flex-1">{listing.title}</h3>
                  <span className="font-bebas text-court-orange text-xl leading-none flex-shrink-0">${listing.price}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-barlow uppercase tracking-widest ${condStyle[listing.condition as Condition] ?? ''}`}>
                    {listing.condition}
                  </span>
                  <span className="text-white/30 text-xs font-barlow uppercase tracking-widest">{listing.category}</span>
                </div>

                {listing.description && (
                  <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-3">{listing.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-white/25 text-xs font-dm">{listing.sellerName}</span>
                  <button
                    onClick={() => markSold({ listingId: listing._id })}
                    className="text-xs font-barlow tracking-widest uppercase text-court-orange/60 hover:text-court-orange transition-colors"
                  >
                    Mark Sold
                  </button>
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
