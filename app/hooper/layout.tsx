'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import UserSync from '@/components/UserSync';

const nav = [
  {
    href:  '/hooper',
    label: 'Home',
    icon:  (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 7.5L10 2l7 5.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V7.5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 18V11h6v7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href:  '/hooper/events',
    label: 'Events',
    icon:  (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <path d="M3 8h14M7 2v4M13 2v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href:  '/hooper/forum',
    label: 'Community',
    icon:  (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 3V4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href:  '/hooper/marketplace',
    label: 'Marketplace',
    icon:  (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 3h14l-1.5 7H4.5L3 3z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="17" r="1" />
        <circle cx="14" cy="17" r="1" />
        <path d="M3 3H1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href:  '/hooper/stream',
    label: 'Live',
    icon:  (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="5" width="14" height="10" rx="2" />
        <path d="M16 8l3-2v8l-3-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href:  '/hooper/challenges',
    label: '1v1',
    icon:  (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="10" cy="10" r="8" />
        <path d="M10 2c0 0-3 4-3 8s3 8 3 8" strokeLinecap="round" />
        <path d="M2 10h16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href:  '/hooper/wallet',
    label: 'Wallet',
    icon:  (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="1" y="5" width="18" height="12" rx="2" />
        <path d="M1 9h18" strokeLinecap="round" />
        <circle cx="15" cy="13" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function HooperLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-court-black flex flex-col">
      <UserSync />

      {/* ── Top Nav ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/hooper" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF4500, #F0B52A)' }}>
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2c0 0-4 5-4 10s4 10 4 10" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <span className="font-bebas text-xl text-white tracking-widest">Hooper</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {nav.map(({ href, label, icon }) => {
              const active = href === '/hooper'
                ? pathname === '/hooper'
                : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-barlow text-xs tracking-widest uppercase transition-all duration-200
                    ${active
                      ? 'bg-court-orange/15 text-court-orange'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {icon}
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: back + user */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/select"
              className="hidden sm:flex items-center gap-1.5 text-white/25 hover:text-white/60 transition-colors font-barlow text-xs tracking-widest uppercase">
              <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Switch
            </Link>
            <UserButton
              appearance={{ variables: { colorPrimary: '#FF4500' } }}
            />
          </div>
        </div>

        {/* Mobile scrollable nav */}
        <div className="md:hidden flex overflow-x-auto gap-1.5 px-4 pb-3 [-webkit-overflow-scrolling:touch]">
          {nav.map(({ href, label, icon }) => {
            const active = href === '/hooper'
              ? pathname === '/hooper'
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-barlow text-xs tracking-widest uppercase transition-all
                  ${active
                    ? 'bg-court-orange/15 text-court-orange border border-court-orange/30'
                    : 'text-white/35 border border-white/8 hover:text-white'
                  }`}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
