'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const STREAMS = [
  { id: 1, title: 'Saturday 3v3 Tournament',   date: '2026-04-12', status: 'live',     viewers: 142, platform: 'Twitch' },
  { id: 2, title: 'Elite Skills Session',       date: '2026-04-13', status: 'upcoming', viewers: 0,   platform: 'Mux'    },
  { id: 3, title: 'Friday Night Pickup Games',  date: '2026-04-18', status: 'upcoming', viewers: 0,   platform: 'Twitch' },
  { id: 4, title: 'Coach Q&A: Defense Drills',  date: '2026-04-20', status: 'upcoming', viewers: 0,   platform: 'Mux'    },
];

export default function StreamPage() {
  const [activeStream, setActiveStream] = useState(STREAMS[0]);
  const liveStream = STREAMS.find(s => s.status === 'live');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-bebas text-4xl text-white tracking-wide">Live</h1>
          {liveStream && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-barlow text-red-400 text-xs tracking-widest uppercase">Live Now</span>
            </span>
          )}
        </div>
        <p className="text-white/40 font-dm text-sm mt-1">Watch games, practices & events in real-time</p>
      </div>

      {/*
        Layout:
        • Mobile / tablet : single column — schedule cards first (so users can pick a stream
          before scrolling to the big player), then video player below
        • Desktop (lg+)   : 3-column grid — player takes 2 cols, schedule sidebar 1 col
        CSS order controls the visual swap without duplicating markup.
      */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Schedule sidebar — order-1 on mobile (appears above player), order-2 on lg */}
        <div className="order-1 lg:order-2 lg:col-span-1">
          <h2 className="font-bebas text-xl text-white tracking-wide mb-4">Schedule</h2>
          <div className="space-y-2.5">
            {STREAMS.map(stream => (
              <button
                key={stream.id}
                onClick={() => setActiveStream(stream)}
                className={`w-full text-left p-4 rounded-xl border transition-all
                  ${activeStream.id === stream.id
                    ? 'border-court-orange/40 bg-court-orange/10'
                    : 'border-white/[0.06] bg-white/[0.03] hover:border-white/15'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-barlow text-[10px] tracking-widest uppercase
                    ${stream.status === 'live' ? 'text-red-400' : 'text-white/30'}`}>
                    {stream.status === 'live' ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
                        Live
                      </span>
                    ) : (
                      new Date(stream.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                    )}
                  </span>
                  <span className="text-white/20 text-xs font-barlow uppercase tracking-widest">{stream.platform}</span>
                </div>
                <p className="font-dm text-white/80 text-sm leading-snug">{stream.title}</p>
                {stream.status === 'live' && (
                  <p className="text-red-400/70 text-xs font-dm mt-0.5">{stream.viewers} watching</p>
                )}
              </button>
            ))}
          </div>

          {/* Twitch follow CTA */}
          <div className="mt-6 glass rounded-xl p-4 text-center">
            <p className="text-white/40 font-dm text-sm mb-3">Never miss a game</p>
            <a
              href="#"
              className="btn-court text-xs py-2.5 px-5 inline-block"
              style={{ background: '#9147ff', color: 'white' }}
            >
              Follow on Twitch
            </a>
          </div>
        </div>

        {/* Video player — order-2 on mobile (below schedule), order-1 on lg */}
        <div className="order-2 lg:order-1 lg:col-span-2 space-y-3">
          {/* Embed area — aspect-video keeps 16:9 on all screen sizes */}
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-court-surface border border-white/[0.07]">
            {activeStream.status === 'live' ? (
              <iframe
                src={`https://player.twitch.tv/?channel=YOUR_CHANNEL&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&autoplay=false`}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title={activeStream.title}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="5" width="14" height="10" rx="2" />
                    <path d="M16 8l5-3v10l-5-3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-bebas text-lg md:text-xl text-white/40">{activeStream.title}</p>
                  <p className="text-white/25 font-dm text-sm mt-1">
                    Starts {new Date(activeStream.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stream info bar */}
          <motion.div
            className="glass rounded-xl p-4"
            key={activeStream.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-dm text-white font-semibold">{activeStream.title}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-white/35 font-barlow uppercase tracking-widest flex-wrap">
                  <span>{activeStream.platform}</span>
                  {activeStream.status === 'live' && (
                    <>
                      <span>·</span>
                      <span className="text-red-400">{activeStream.viewers.toLocaleString()} watching</span>
                    </>
                  )}
                </div>
              </div>
              {activeStream.status === 'live' && (
                <a
                  href="#"
                  className="btn-court bg-court-orange text-white text-xs py-2.5 px-5 flex-shrink-0"
                  style={{ boxShadow: '0 0 20px rgba(255,69,0,0.3)' }}
                >
                  Watch Full
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
