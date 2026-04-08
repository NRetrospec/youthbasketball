'use client';

import { useState } from 'react';
import HeroVideo      from '@/components/HeroParallax';
import LandingSection from '@/components/LandingSection';

export default function Home() {
  const [showHero, setShowHero] = useState(true);

  return (
    <main className="relative bg-court-black">
      <LandingSection />
      {showHero && <HeroVideo onComplete={() => setShowHero(false)} />}
    </main>
  );
}
