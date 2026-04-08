# Youth Basketball

Production-ready Next.js website with:
- **Frame-scrubbing parallax hero** — 99 sequential basketball frames animate as you scroll
- **Cinematic landing photo section** with org reveal animation
- **Three modals** — Game Plan (schedule + FAQ), Sign Up (Convex booking form), Gallery (lightbox)
- **Convex backend** — bookings stored in real-time DB
- **Dark court aesthetic** — Bebas Neue + DM Sans + Barlow Condensed, orange/gold palette

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Convex (backend)
```bash
npx convex dev
```
This will:
- Ask you to log in / create a project at convex.dev
- Generate `convex/_generated/` files
- Output your `NEXT_PUBLIC_CONVEX_URL`

Copy `.env.local.example` → `.env.local` and paste your URL:
```bash
cp .env.local.example .env.local
# then edit .env.local and set NEXT_PUBLIC_CONVEX_URL
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

> **Note:** The site works without Convex configured — the Sign Up form falls back gracefully. Sign-ups simply won't persist to a database until Convex is set up.

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

In the Vercel dashboard, add environment variable:
- `NEXT_PUBLIC_CONVEX_URL` = your Convex deployment URL

For Convex production deployment:
```bash
npx convex deploy
```

---

## Project Structure

```
app/
  layout.tsx          # SEO, fonts, Convex provider wrapper
  page.tsx            # Main page (HeroParallax + LandingSection)
  globals.css         # Tailwind + custom CSS variables, noise overlay

components/
  HeroParallax.tsx    # Canvas frame-scrubbing (scroll = playback)
  LandingSection.tsx  # Photo background + org reveal + CTA buttons
  CTAButtons.tsx      # 3 animated buttons with modal state
  Modal.tsx           # Reusable portal modal (backdrop, animation)
  ConvexClientProvider.tsx
  modals/
    GamePlanModal.tsx # Schedule table + accordion FAQ
    SignUpModal.tsx   # Booking form → Convex mutation
    GalleryModal.tsx  # Photo grid + lightbox

convex/
  schema.ts           # bookings table definition
  bookings.ts         # createBooking, getBookings, updateStatus

public/
  assets/             # 99 basketball frames + landing photo
  manifest.json       # PWA manifest
```

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Framework  | Next.js 14 (App Router)           |
| Styling    | Tailwind CSS + custom CSS vars    |
| Animation  | Framer Motion                     |
| Backend    | Convex (real-time DB + mutations) |
| Fonts      | Bebas Neue, DM Sans, Barlow Condensed (Google Fonts) |
| Images     | Next.js `<Image>` (optimised)     |
| Deploy     | Vercel + Convex Cloud             |
