import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'court-black':   '#080808',
        'court-surface': '#111111',
        'court-orange':  '#FF4500',
        'court-amber':   '#FF6B1A',
        'court-gold':    '#F0B52A',
        'court-cream':   '#EDE8DD',
        'court-muted':   'rgba(237,232,221,0.5)',
      },
      fontFamily: {
        bebas:    ['var(--font-bebas)', 'sans-serif'],
        dm:       ['var(--font-dm)', 'sans-serif'],
        barlow:   ['var(--font-barlow)', 'sans-serif'],
      },
      animation: {
        'spin-slow':   'spin 8s linear infinite',
        'pulse-glow':  'pulse-glow 2.5s ease-in-out infinite',
        'float-up':    'float-up 0.6s ease-out forwards',
        'slide-in':    'slide-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { textShadow: '0 0 30px rgba(255,69,0,0.6), 0 0 60px rgba(255,69,0,0.3)' },
          '50%':       { textShadow: '0 0 60px rgba(255,69,0,0.9), 0 0 100px rgba(255,69,0,0.5)' },
        },
        'float-up': {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(20px) scale(0.96)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      backgroundImage: {
        'court-lines': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='none'/%3E%3Cline x1='200' y1='0' x2='200' y2='400' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3Ccircle cx='200' cy='200' r='60' stroke='rgba(255,255,255,0.03)' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
      },
    },
  },
  plugins: [],
};

export default config;
