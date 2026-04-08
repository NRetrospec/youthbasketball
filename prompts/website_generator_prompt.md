# Prompt for Full-Stack AI Website Generator

You are an expert full-stack developer. Generate a complete, production-ready website for 'Youth Basketball' organization using the provided assets. Create a new Next.js (React) project with Tailwind CSS for styling, Framer Motion for animations, Convex for backend (user signups/bookings), and responsive design.

## Assets (include these exactly in /public/assets/):
- Parallax frames: Copy all ~100 images from basketballframes/frame_*.jpg (sequential basketball action frames for smooth parallax animation).
- Landing photo: public/photo_5093955213516803788_y.jpg (full-screen hero background after parallax).

## Page Flow & Features:
1. **Parallax Hero Section (full viewport height)**:
   - Infinite/slow vertical parallax scroll using the frame sequence (like a high-quality video background of basketball play).
   - Use CSS or library (e.g., react-parallax) for smooth layer speed differences.
   - Dark overlay for readability.

2. **Transition to Landing Photo**:
   - Fade/scroll into full-screen display of photo_5093955213516803788_y.jpg.
   - Match aesthetic: Youth sports, energetic basketball theme (bold colors, modern, sans-serif fonts like Inter or Montserrat, dark backgrounds).

3. **Organization Reveal**:
   - Animate in large title: 'Youth Basketball' (white/gold text, glow effect).
   - Subtitle: 'Empowering young athletes through competitive play and skill development.'

4. **Call-to-Action Buttons** (fade up staggered):
   - 'Game Plan' → Modal with program schedule, rules, info (static content, accordion).
   - 'Sign Up' → Modal with booking form (name, age, email, preferred time) → Submit to Convex DB.
   - 'Gallery' → Modal with responsive grid of basketballframes images + placeholders.

## Modals:
- Full-screen overlay, backdrop blur, slide/zoom animations.
- Close button (X), match landing photo aesthetic (rounded, shadowed buttons).
- Responsive: Mobile-friendly stack.

## Backend (Convex):
- Setup Convex project (provide convex.dev deploy instructions).
- Schema: users/bookings (id, name, age, email, date, status).
- Mutations: createBooking.
- Queries: getBookings (admin view optional).
- Auth: Clerk or Convex auth for signups.

## Tech Stack & Best Practices:
- Next.js 14+ App Router.
- Tailwind CSS + custom theme matching photo (extract dominant colors if possible: assume orange/black/white basketball).
- Framer Motion for parallax, fades, modal anims.
- Convex React client.
- Optimized images (Next Image).
- SEO: Meta tags, schema.org for sports org.
- PWA-ready.
- Folder structure: /app, /components (HeroParallax, LandingPhoto, Buttons, Modals), /convex, /public/assets.
- package.json with all deps, scripts for dev/build/deploy.
- README.md with setup: `npx create-next-app`, copy assets, `npm install`, `npx convex dev`, deploy to Vercel.

## Output:
- Complete zip/repo with all files.
- Live deploy link if possible.
- Ensure parallax is buttery smooth on all devices.
- No external assets; use provided images only.

Generate the FULL code now.
