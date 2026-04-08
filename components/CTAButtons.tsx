'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GamePlanModal from './modals/GamePlanModal';
import SignUpModal   from './modals/SignUpModal';
import GalleryModal  from './modals/GalleryModal';

type ModalType = 'gameplan' | 'signup' | 'gallery' | null;

interface Props { inView?: boolean }

const buttons = [
  {
    id: 'gameplan' as ModalType,
    label: 'Game Plan',
    icon: (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M7 7h6M7 10h6M7 13h4" />
      </svg>
    ),
    style: 'bg-court-orange text-white hover:bg-court-amber shadow-[0_0_30px_rgba(255,69,0,0.35)]',
  },
  {
    id: 'signup' as ModalType,
    label: 'Sign Up',
    icon: (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 3v14M3 10h14" strokeLinecap="round" />
      </svg>
    ),
    style: 'bg-court-gold text-court-black hover:brightness-110 shadow-[0_0_30px_rgba(240,181,42,0.3)]',
  },
  {
    id: 'gallery' as ModalType,
    label: 'Gallery',
    icon: (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="4" width="16" height="12" rx="2" />
        <circle cx="7.5" cy="8.5" r="1.5" />
        <path d="M2 14l4-4 3 3 3-3 6 5" />
      </svg>
    ),
    style: 'glass-light text-court-cream hover:bg-white/10 border border-white/10',
  },
] as const;

export default function CTAButtons({ inView = true }: Props) {
  const [open, setOpen] = useState<ModalType>(null);

  return (
    <>
      {/* ── Button row ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        {buttons.map(({ id, label, icon, style }, i) => (
          <motion.button
            key={id}
            className={`btn-court flex items-center gap-2.5 ${style}`}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.7 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setOpen(id)}
            aria-label={`Open ${label}`}
          >
            {icon}
            {label}
          </motion.button>
        ))}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open === 'gameplan' && <GamePlanModal onClose={() => setOpen(null)} />}
        {open === 'signup'   && <SignUpModal   onClose={() => setOpen(null)} />}
        {open === 'gallery'  && <GalleryModal  onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </>
  );
}
