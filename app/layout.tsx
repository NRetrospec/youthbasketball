import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import ConvexClientProvider from '@/components/ConvexClientProvider';

export const metadata: Metadata = {
  title: 'Youth Basketball | Empowering Young Athletes',
  description:
    'Youth Basketball — Empowering young athletes through competitive play and skill development. Sign up for our programs today.',
  keywords: ['youth basketball', 'basketball training', 'youth sports', 'basketball league', 'kids basketball'],
  authors: [{ name: 'Youth Basketball Organization' }],
  openGraph: {
    title: 'Youth Basketball',
    description: 'Empowering young athletes through competitive play and skill development.',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/assets/photo_5093955213516803788_y.jpg', width: 1200, height: 630, alt: 'Youth Basketball' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Youth Basketball',
    description: 'Empowering young athletes through competitive play and skill development.',
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  themeColor: '#FF4500',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SportsOrganization',
                name: 'Youth Basketball',
                sport: 'Basketball',
                description: 'Empowering young athletes through competitive play and skill development.',
                url: 'https://youthbasketball.org',
              }),
            }}
          />
        </head>
        <body className="bg-court-black text-court-cream antialiased">
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
