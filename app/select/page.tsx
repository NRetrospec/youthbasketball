'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { UserButton } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import UserSync from '@/components/UserSync';

export default function SelectPage() {
  const router  = useRouter();
  const role    = useQuery(api.users.getUserRole);
  const profile = useQuery(api.profiles.getMyProfile);

  const isCoach  = role === 'coach';
  const isLoaded = role !== undefined && profile !== undefined;

  function handleHooper() {
    router.push(profile ? '/hooper' : '/hooper/create-profile');
  }

  function handleYouthProgram() {
    if (isCoach) router.push('/youth-program');
  }

  return (
    <>
      <UserSync />

      {/* Top-right user button — fixed so it overlays both panels */}
      <div className="fixed top-4 right-4 z-50">
        <UserButton
          appearance={{ variables: { colorPrimary: '#FF4500' } }}
        />
      </div>

      {/*
        Layout:
        • Mobile  (< md): flex-col — Hooper panel on top (order-1), Youth Program on bottom (order-2)
        • Desktop (≥ md): flex-row — Youth Program on left,  Hooper on right (original design)
        CSS `order` handles the visual swap without changing DOM order.
      */}
      <div className="flex flex-col md:flex-row h-screen overflow-hidden select-none">

        {/* ── Left (desktop) / Bottom (mobile): Youth Program ──────────── */}
        <motion.div
          className={[
            // Stacking order: bottom on mobile, left on desktop
            'order-2 md:order-1',
            // Layout
            'relative flex flex-col items-center justify-center overflow-hidden',
            // Mobile height: ensure content isn't cramped (45vh ≈ 375px on most phones)
            'min-h-[45vh] md:min-h-0',
            // Flex sizing for desktop hover-expand animation
            'transition-[flex] duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
            isCoach ? 'cursor-pointer' : 'cursor-default',
          ].join(' ')}
          style={{ flex: 1 }}
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleYouthProgram}
          // whileHover only fires on devices with a pointer; touch devices ignore it
          whileHover={isCoach ? { flex: 1.45 } : {}}
        >
          {/* Backgrounds */}
          <div className="absolute inset-0 bg-court-black" />
          <div className="absolute inset-0 bg-gradient-to-br from-court-orange/8 via-transparent to-transparent" />

          {/* Decorative court circles — too large for mobile panels, desktop only */}
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/[0.04]" />
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/[0.04]" />

          {/* Separator between panels:
              • Desktop: vertical line on the right edge of this panel
              • Mobile : horizontal line on the bottom edge (Hooper is above this panel on mobile) */}
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-court-orange/25 to-transparent" />
          <div className="md:hidden absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-court-orange/20 to-transparent" />

          {/* Content */}
          <motion.div
            className="relative z-10 text-center px-8 md:px-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* Lock / unlock icon — scaled down on mobile */}
            <div
              className="mx-auto mb-4 md:mb-7 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center"
              style={{
                background: isCoach ? 'rgba(255,69,0,0.15)' : 'rgba(255,255,255,0.04)',
                border:     isCoach ? '1px solid rgba(255,69,0,0.5)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {isCoach ? (
                <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-7 md:h-7 text-court-orange" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-7 md:h-7 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              )}
            </div>

            <h2 className={`font-bebas text-[clamp(1.8rem,5.5vw,4.5rem)] leading-none mb-3 md:mb-4 ${isCoach ? 'text-white' : 'text-white/40'}`}>
              Youth Program
            </h2>

            {isCoach ? (
              <>
                <p className="font-barlow text-court-orange text-xs tracking-[0.35em] uppercase mb-4 md:mb-6">
                  Coach Access — Enter Portal
                </p>
                <motion.div
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
                  style={{ background: 'rgba(255,69,0,0.15)', border: '1px solid rgba(255,69,0,0.4)' }}
                  whileHover={{ scale: 1.04 }}
                >
                  <span className="font-barlow text-court-orange text-xs tracking-widest uppercase">Open Dashboard</span>
                  <svg viewBox="0 0 16 16" className="w-3 h-3 text-court-orange" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </>
            ) : (
              <>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span className="font-barlow text-white/30 text-xs tracking-[0.35em] uppercase">Coming Soon</span>
                </div>
                {/* Descriptive text hidden on small screens to keep panel compact */}
                <p className="hidden sm:block text-white/20 text-sm font-dm max-w-[220px] mx-auto leading-relaxed">
                  The full youth program portal is under development.
                </p>
              </>
            )}
          </motion.div>

          {/* Bottom label — desktop only (not enough vertical space on mobile) */}
          {!isCoach && (
            <div className="hidden md:block absolute bottom-8 left-0 right-0 text-center">
              <span className="font-barlow text-white/10 text-xs tracking-[0.4em] uppercase">For coaches only</span>
            </div>
          )}
        </motion.div>

        {/* ── Right (desktop) / Top (mobile): Hooper ───────────────────── */}
        <motion.div
          className={[
            // Stacking order: top on mobile, right on desktop
            'order-1 md:order-2',
            // Layout
            'relative flex flex-col items-center justify-center overflow-hidden cursor-pointer',
            // Mobile height: Hooper is the primary CTA so give it slightly more space
            'min-h-[52vh] md:min-h-0',
            'transition-[flex] duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
          ].join(' ')}
          style={{ flex: 1 }}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleHooper}
          whileHover={{ flex: 1.45 }}
        >
          {/* Backgrounds */}
          <div className="absolute inset-0 bg-court-black" />
          <div className="absolute inset-0 bg-gradient-to-br from-court-orange/18 via-transparent to-court-gold/5" />
          <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-court-orange/12 to-transparent" />
          <div className="noise-overlay" />

          {/* Content */}
          <motion.div
            className="relative z-10 text-center px-8 md:px-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {/* Basketball icon — scaled for mobile */}
            <motion.div
              className="mx-auto mb-5 md:mb-7 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FF4500 0%, #F0B52A 100%)',
                boxShadow:  '0 0 50px rgba(255,69,0,0.45)',
              }}
              whileHover={{ scale: 1.08, boxShadow: '0 0 70px rgba(255,69,0,0.65)' }}
              transition={{ duration: 0.3 }}
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M4.93 4.93C7 7 8 9.5 8 12s-1 5-3.07 7.07" />
                <path d="M19.07 4.93C17 7 16 9.5 16 12s1 5 3.07 7.07" />
                <path d="M2 12h20" />
                <path d="M12 2v20" />
              </svg>
            </motion.div>

            <h2
              className="font-bebas text-[clamp(2.2rem,7vw,4.5rem)] leading-none mb-3 md:mb-4"
              style={{
                background:           'linear-gradient(135deg, #FF4500 0%, #F0B52A 55%, #FF4500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
                filter:               'drop-shadow(0 0 25px rgba(255,69,0,0.5))',
              }}
            >
              Hooper
            </h2>

            <p className="font-barlow text-court-cream/60 text-xs tracking-[0.35em] uppercase mb-6 md:mb-7">
              {isLoaded && profile ? 'Continue to your dashboard' : 'Join the community'}
            </p>

            {/* Touch-friendly button — min 44px height via py-3 + text */}
            <motion.button
              className="btn-court bg-court-orange text-white inline-flex items-center gap-3"
              style={{ boxShadow: '0 0 30px rgba(255,69,0,0.4)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(255,69,0,0.6)' }}
              whileTap={{ scale: 0.97 }}
            >
              <span>{isLoaded && profile ? 'Enter' : 'Get Started'}</span>
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </motion.div>

          {/* Bottom tagline — desktop only */}
          <div className="hidden md:block absolute bottom-8 left-0 right-0 text-center">
            <span className="font-barlow text-white/20 text-xs tracking-[0.4em] uppercase">For all hoopers</span>
          </div>
        </motion.div>
      </div>
    </>
  );
}
