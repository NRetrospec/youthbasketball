'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'loading' | 'ready' | 'playing' | 'done';

interface Props {
  onComplete: () => void;
}

export default function HeroVideo({ onComplete }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const progressEl = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('loading');

  const markReady = useCallback(() => {
    setPhase(p => (p === 'loading' ? 'ready' : p));
  }, []);

  // Check readyState on mount (handles cached / fast local loads)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.readyState >= 2) { markReady(); return; }
    const timer = setTimeout(markReady, 4000);
    return () => clearTimeout(timer);
  }, [markReady]);

  const handleShoot = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setPhase('playing');
    document.body.style.overflow = 'hidden';
    v.play().catch(() => {});
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !progressEl.current || !v.duration) return;
    progressEl.current.style.width = `${(v.currentTime / v.duration) * 100}%`;
  }, []);

  const handleEnded = useCallback(() => {
    setPhase('done');
    document.body.style.overflow = '';
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      onComplete();
    }, 620);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 bg-court-black overflow-hidden"
      aria-label="Intro video"
    >
      {/* ── Video — object-cover fills every screen size ── */}
      <video
        ref={videoRef}
        src="/BASKETBALLintro.MP4"
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        preload="auto"
        onCanPlay={markReady}
        onCanPlayThrough={markReady}
        onLoadedData={markReady}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        // Mobile: suppress native controls overlay on iOS
        x-webkit-airplay="deny"
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.55) 100%)' }}
      />
      <div className="noise-overlay opacity-[0.035]" />
      <div className="absolute top-0    inset-x-0 h-20 bg-gradient-to-b from-court-black to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-court-black to-transparent pointer-events-none" />

      {/* ── Brand ── */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3 pointer-events-none">
        <svg viewBox="0 0 40 40" className="w-7 h-7 sm:w-8 sm:h-8">
          <circle cx="20" cy="20" r="19" fill="#FF4500" />
          <path d="M20 1 Q20 20 20 39"  stroke="#C03300" strokeWidth="2"   fill="none" />
          <path d="M1 20 Q20 20 39 20"  stroke="#C03300" strokeWidth="2"   fill="none" />
          <path d="M5 10 Q20 20 35 10"  stroke="#C03300" strokeWidth="1.5" fill="none" />
          <path d="M5 30 Q20 20 35 30"  stroke="#C03300" strokeWidth="1.5" fill="none" />
        </svg>
        <span className="font-bebas text-white text-lg sm:text-xl tracking-widest">Youth Basketball</span>
      </div>

      {/* ── Loading spinner ── */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            key="loading"
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-court-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.svg
              viewBox="0 0 100 100"
              className="w-12 h-12 sm:w-14 sm:h-14 mb-5"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            >
              <circle cx="50" cy="50" r="44" fill="#FF4500" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="#C03300" strokeWidth="2.5" />
              <path d="M50 6 Q50 50 50 94"  stroke="#C03300" strokeWidth="2.5" fill="none" />
              <path d="M6 50 Q50 50 94 50"  stroke="#C03300" strokeWidth="2.5" fill="none" />
              <path d="M14 22 Q50 50 86 22" stroke="#C03300" strokeWidth="2"   fill="none" />
              <path d="M14 78 Q50 50 86 78" stroke="#C03300" strokeWidth="2"   fill="none" />
            </motion.svg>
            <p className="font-barlow text-white/25 text-xs tracking-[0.4em] uppercase">Loading…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SHOOT button ── */}
      <AnimatePresence>
        {phase === 'ready' && (
          <motion.div
            key="shoot"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.4 }}
          >
            {/* Ambient glow */}
            <motion.div
              className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,69,0,0.18) 0%, transparent 70%)' }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            />

            {/* Button — min 44 px touch target, larger on desktop */}
            <motion.button
              onClick={handleShoot}
              className="relative touch-manipulation"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              initial={{ scale: 0.72, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              transition={{ type: 'spring', stiffness: 270, damping: 18, delay: 0.1 }}
              aria-label="Play intro video"
            >
              {/* Pulse rings */}
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-court-orange/50"
                animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
                transition={{ repeat: Infinity, duration: 1.9, ease: 'easeOut' }}
              />
              <motion.span
                className="absolute inset-0 rounded-full border border-court-orange/30"
                animate={{ scale: [1, 1.9],  opacity: [0.4, 0] }}
                transition={{ repeat: Infinity, duration: 1.9, ease: 'easeOut', delay: 0.45 }}
              />

              {/* Face — 120 px on mobile, 144 px on sm+ */}
              <span
                className="relative flex flex-col items-center justify-center w-[7.5rem] h-[7.5rem] sm:w-36 sm:h-36 rounded-full select-none"
                style={{
                  background:  'radial-gradient(circle at 40% 35%, #FF6B1A 0%, #FF4500 60%, #C03300 100%)',
                  boxShadow:   '0 0 55px rgba(255,69,0,0.65), 0 0 110px rgba(255,69,0,0.22), inset 0 2px 0 rgba(255,255,255,0.15)',
                }}
              >
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                  <path d="M50 5 Q50 50 50 95"  stroke="white" strokeWidth="2"   fill="none" />
                  <path d="M5 50 Q50 50 95 50"  stroke="white" strokeWidth="2"   fill="none" />
                  <path d="M15 20 Q50 50 85 20" stroke="white" strokeWidth="1.5" fill="none" />
                  <path d="M15 80 Q50 50 85 80" stroke="white" strokeWidth="1.5" fill="none" />
                </svg>
                <span
                  className="font-bebas text-white text-[2.2rem] sm:text-4xl tracking-widest leading-none relative z-10"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.45)' }}
                >
                  SHOOT
                </span>
                <span className="font-barlow text-white/55 text-[8px] sm:text-[9px] tracking-[0.35em] uppercase relative z-10 mt-0.5">
                  tap to play
                </span>
              </span>
            </motion.button>

            <motion.p
              className="font-barlow text-white/30 text-[10px] sm:text-xs tracking-[0.4em] uppercase"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              Watch the play unfold
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress bar while playing ── */}
      <AnimatePresence>
        {phase === 'playing' && (
          <motion.div
            key="bar"
            className="absolute bottom-0 inset-x-0 h-[3px] bg-white/[0.08] z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              ref={progressEl}
              className="h-full bg-court-orange"
              style={{ width: '0%', transition: 'width 0.2s linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fade-to-black on end ── */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            key="fade"
            className="absolute inset-0 z-40 bg-court-black pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
