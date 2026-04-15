'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import UserSync from '@/components/UserSync';

const nav = [
  {
    href:  '/youth-program',
    label: 'Dashboard',
    icon:  (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href:  '/youth-program/roster',
    label: 'Roster',
    icon:  (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="7" cy="7" r="3" />
        <path d="M1 17c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
        <path d="M14 6h5M14 9h5M14 12h3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href:  '/youth-program/schedule',
    label: 'Schedule',
    icon:  (
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <path d="M3 8h14M7 2v4M13 2v4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function YouthProgramLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const role     = useQuery(api.users.getUserRole);

  // Redirect non-coaches away
  useEffect(() => {
    if (role === null || role === 'user') {
      router.replace('/select');
    }
  }, [role, router]);

  if (role === undefined) return <CoachLoadingScreen />;
  if (role !== 'coach')   return null;

  return (
    <div className="min-h-screen bg-court-black flex flex-col">
      <UserSync />

      {/* ── Top Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/youth-program" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border border-court-orange/40"
              style={{ background: 'rgba(255,69,0,0.12)' }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-court-orange" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="font-bebas text-base text-white tracking-widest leading-none">Youth Program</div>
              <div className="font-barlow text-court-orange text-[10px] tracking-[0.25em] uppercase leading-none">Coach Portal</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {nav.map(({ href, label, icon }) => {
              const active = href === '/youth-program'
                ? pathname === '/youth-program'
                : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-barlow text-xs tracking-widest uppercase transition-all
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

          {/* Right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/select"
              className="hidden sm:block text-white/25 hover:text-white/60 transition-colors font-barlow text-xs tracking-widest uppercase">
              Switch
            </Link>
            <UserButton
              appearance={{ variables: { colorPrimary: '#FF4500' } }}
            />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex overflow-x-auto gap-1.5 px-4 pb-3">
          {nav.map(({ href, label, icon }) => {
            const active = href === '/youth-program'
              ? pathname === '/youth-program'
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-barlow text-xs tracking-widest uppercase transition-all
                  ${active
                    ? 'bg-court-orange/15 text-court-orange border border-court-orange/30'
                    : 'text-white/35 border border-white/[0.08] hover:text-white'
                  }`}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}

function CoachLoadingScreen() {
  return (
    <div className="min-h-screen bg-court-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border border-court-orange/30 border-t-court-orange animate-spin mx-auto mb-4" />
        <p className="text-white/30 font-dm text-sm">Verifying access…</p>
      </div>
    </div>
  );
}
