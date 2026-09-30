# ProjectAlex25 — Evolution OS v2.0

Premium personal growth platform built with **Next.js 15** for everyone. Architect your next evolution across **Mind, Body, Craft, Wealth, and Spirit**.

Live Demo: `alex@projectalex25.com / password123` or 1-Click Demo Login

### ✨ Features (Full-Stack Usable App)

**Auth & Backend**
- JWT httpOnly cookie sessions (30-day), secure password hashing (PBKDF2)
- File-based JSON DB with in-memory fallback — works on Vercel `/tmp` + local `data/`
- Auto-seed: 5 demo users, Protocol 25 challenges, Arena posts, habits & goals
- New users get starter habits, goals, journal, and auto-enrollment into Protocol 25 (+150 XP)

**Frontend — Dark Luxury / High-Performance**
- Landing page with 5 Pillars, Protocol previews, Arena feed, and Vercel-ready CTA
- Dashboard (Command Center) with 9 tabs:
  - **Command**: Pillar mastery scores, habit completion %, deep work stats, XP progress
  - **Habit Matrix**: Daily toggle, streaks, 7-day mini heatmap, weekly targets, CRUD
  - **Goals**: Roadmaps with milestones, progress bars, priority & XP rewards
  - **Deep Work Studio**: Pomodoro / 50m / 90m timer with pillar tracking, XP earning, live stats
  - **Journal**: Stoic reflection (Win, Lesson, Gratitude), mood/energy, pillar tagging
  - **Protocols**: 25/30-day challenges (Protocol 25, Monk Mode, Kinetic Temple, Sovereign), day-by-day toggles, custom protocol creation
  - **The Arena**: Community feed — posts, likes, comments, XP for engagement
  - **Leaderboard**: Global XP ranking with pillar & streak
  - **Settings**: Profile, handle, bio, primary pillar, focus target, avatar gradient, password update

**Tech Stack**
- Next.js 15.5 (App Router), React 19, Tailwind CSS 3.4, TypeScript
- Lucide Icons, clsx + tailwind-merge
- No external DB required — zero-config deploy

### 🚀 Deploy to Vercel (One-Click)

1. **Push to GitHub** (this repo is already `Alxzverse/projectalex25-next`)

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import `Alxzverse/projectalex25-next`
   - Framework: **Next.js** (auto-detected)
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - No env vars required (optional: set `JWT_SECRET` for production hardening)

3. **Deploy**
   - Vercel will build and give you `https://projectalex25-next.vercel.app`
   - Custom domain can be added in Vercel dashboard

**Local Dev**
```bash
npm install
npm run dev
# http://localhost:3000
```

**Demo Accounts**
- Any registered account works
- Demo: `alex@projectalex25.com / password123`
- Or use **1-Click Demo Login** button on `/login` and `/register`

### 🔐 API Routes

- `POST /api/auth/register` — name, email, password, primaryPillar
- `POST /api/auth/login` — email/password or `{isDemo:true}`
- `POST /api/auth/logout`
- `GET /api/auth/me` + `PATCH` for profile updates
- `GET /api/dashboard` — full aggregated data + leaderboard + pillarScores
- `POST/PATCH/DELETE /api/habits` — habit CRUD & daily toggle
- `POST/PATCH/DELETE /api/goals` — goal CRUD & milestone toggle
- `POST/DELETE /api/journal` — stoic journal
- `POST /api/focus` — log deep work session
- `POST /api/challenges` — join/toggle day or create custom protocol
- `POST /api/community` — post/like/comment

### 📁 Structure

```
src/
  app/
    page.tsx (landing)
    login/ register/ dashboard/
    api/...
  lib/
    db.ts (file+memory hybrid)
    auth.ts (hash + JWT)
    seed.ts (demo + starter data)
    types.ts
    utils.ts
```

### 🌍 Built for Everyone

Not just elite — free global membership, instant access, +150 XP starter, Protocol 25 auto-enrollment. Usable by anyone ready to track 5 pillars daily.

Built with ❤️ for ProjectAlex25 • Ready for Vercel.
