'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function LandingNav() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Logo wordmark */}
      <Link href="/" className="font-bebas text-xl text-white tracking-widest hover:text-court-orange transition-colors">
        Youth Basketball
      </Link>

      {/* Auth controls */}
      <div className="flex items-center gap-3">
        {!isLoaded ? null : isSignedIn ? (
          <>
            <Link
              href="/select"
              className="btn-court bg-court-orange text-white text-xs py-2.5 px-5"
              style={{ boxShadow: '0 0 20px rgba(255,69,0,0.35)' }}
            >
              Enter App
            </Link>
            <UserButton
              appearance={{ variables: { colorPrimary: '#FF4500' } }}
              afterSignOutUrl="/"
            />
          </>
        ) : (
          <>
            <SignInButton mode="redirect">
              <button className="font-barlow text-xs tracking-widest uppercase text-white/50 hover:text-white transition-colors px-3 py-2">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button className="btn-court bg-court-orange text-white text-xs py-2.5 px-5"
                style={{ boxShadow: '0 0 20px rgba(255,69,0,0.35)' }}>
                Join Free
              </button>
            </SignUpButton>
          </>
        )}
      </div>
    </motion.nav>
  );
}
