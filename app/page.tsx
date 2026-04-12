'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import HeroVideo      from '@/components/HeroParallax';
import LandingSection from '@/components/LandingSection';
import LandingNav     from '@/components/LandingNav';

export default function Home() {
  const [showHero, setShowHero] = useState(true);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Skip the landing/video entirely for already-authenticated users
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/select');
    }
  }, [isLoaded, isSignedIn, router]);

  // Don't render the page if we're about to redirect
  if (isLoaded && isSignedIn) return null;

  return (
    <main className="relative bg-court-black">
      <LandingNav />
      <LandingSection />
      {showHero && <HeroVideo onComplete={() => setShowHero(false)} />}
    </main>
  );
}
