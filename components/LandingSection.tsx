'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import CTAButtons from './CTAButtons';

export default function LandingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  // id used by HeroParallax for auto-scroll target after playback ends
  const titleRef   = useRef<HTMLDivElement>(null);
  const inView     = useInView(titleRef, { once: true, amount: 0.4 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Parallax: photo moves slower than scroll
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  // Fade out photo at bottom
  const photoOpacity = useTransform(scrollYProgress, [0.7, 1], [1, 0]);

  return (
    <section
      id="landing-section"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-court-black"
      aria-label="Organization introduction"
    >
      {/* ── Photo background with parallax ─────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        style={{ y: photoY, opacity: photoOpacity }}
      >
        <Image
          src="/assets/photo_5093955213516803788_y.jpg"
          alt="Youth Basketball team"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Multi-layer photo overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-court-black via-black/60 to-court-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </motion.div>

      {/* ── Noise texture ──────────────────────────────────────────── */}
      <div className="noise-overlay" />

      {/* ── Decorative court circle ────────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/[0.03] pointer-events-none" />

      {/* ── Content ────────────────────────────────────────────────── */}
      <div
        ref={titleRef}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20 text-center"
      >
        {/* Season tag */}
        <motion.div
          className="mb-8 inline-flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="h-px w-8 bg-court-orange/60" />
          <span className="font-barlow text-court-orange text-xs tracking-[0.4em] uppercase">
            Season 2025 · 2026
          </span>
          <span className="h-px w-8 bg-court-orange/60" />
        </motion.div>

        {/* Main title */}
        <div className="overflow-hidden mb-4">
          <motion.h1
            className="font-bebas text-[clamp(3.5rem,14vw,10rem)] leading-none text-white text-glow-orange"
            initial={{ y: '105%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Youth
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-6">
          <motion.h1
            className="font-bebas text-[clamp(3.5rem,14vw,10rem)] leading-none"
            style={{
              background: 'linear-gradient(135deg, #FF4500 0%, #F0B52A 50%, #FF4500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={{ y: '105%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            Basketball
          </motion.h1>
        </div>

        {/* Divider */}
        <motion.div
          className="court-line w-40 my-6"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        />

        {/* Subtitle */}
        <motion.p
          className="text-court-cream/70 text-base md:text-lg font-dm max-w-md leading-relaxed mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          Empowering young athletes through competitive play and skill development.
        </motion.p>

        {/* CTA Buttons */}
        <CTAButtons inView={inView} />

        {/* Stats strip */}
        <motion.div
          className="absolute bottom-10 left-0 right-0 flex justify-center gap-10 md:gap-20"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          {[
            { num: '200+', label: 'Athletes' },
            { num: '12',   label: 'Teams'    },
            { num: '8',    label: 'Seasons'  },
            { num: '100%', label: 'Heart'    },
          ].map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="font-bebas text-2xl md:text-3xl text-court-orange">{num}</div>
              <div className="font-barlow text-white/30 text-xs tracking-widest uppercase">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
