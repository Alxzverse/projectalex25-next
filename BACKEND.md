# ProjectAlex25 — Backend Architecture

This is a **full-stack Next.js backend** designed to work **zero-config on Vercel** (no external database needed) while remaining persistent locally.

## Storage Layer — `src/lib/db.ts`

### Problem
Vercel serverless functions are stateless and `/tmp` is ephemeral. A traditional file DB would reset on cold start.

### Solution — Hybrid 3-tier fallback
1. **Local dev**: `data/projectalex25.db.json` (auto-created)
2. **Vercel**: `/tmp/projectalex25.db.json` (survives warm invocations)
3. **Global memory cache**: `global.__pa25_db_cache` (survives within same lambda)
4. **Session self-healing**: `ensureSessionUser()` — if a valid JWT cookie exists but user is missing from DB (cold start), it auto-recreates the user + starter habits/goals/journal/focus

```ts
readDb() -> tries file -> falls back to memory -> seeds with createInitialSeedDatabase()
writeDb() -> writes to file + updates global cache
ensureSessionUser(session) -> guarantees JWT user exists
```

**Seed** (`src/lib/seed.ts`):
- 5 demo users (Alex, Elena, Marcus, Kai, Aria) with XP, streaks, badges
- 4 challenges (Protocol 25, Monk Mode, Kinetic Temple, Sovereign)
- Community posts
- For new users: 4 starter habits, 2 goals, 1 journal, 1 focus session, auto-join Protocol 25 +150 XP

## Auth — `src/lib/auth.ts`

- **Password hashing**: PBKDF2-SHA512, 10k iterations, static salt `pa25_salt_v1` (simple, Vercel-safe, no native deps)
- **JWT-like session**: `base64url(payload).HMAC-SHA256(payload, SECRET)` — no external lib
  - Payload: `{userId, email, name, handle, exp: 30d}`
  - Cookie: `pa25_session` httpOnly, SameSite=lax, 30d
- **Functions**:
  - `hashPassword()`, `verifyPassword()`
  - `signSessionToken()`, `verifySessionToken()`
  - `sanitizeUser()` — strips passwordHash
  - `getSessionFromCookies()` — server-side helper

**Env**: `JWT_SECRET` optional — defaults to hardcoded dev secret for zero-config.

## API Routes — `src/app/api/*`

All routes are **Next.js Route Handlers** (App Router), edge-ready.

### Auth
- `POST /api/auth/register` — `{name, email, password, primaryPillar, handle?}` → creates user + starter data + Protocol25 join + sets cookie
- `POST /api/auth/login` — `{email, password}` OR `{isDemo:true}` → sets cookie
- `POST /api/auth/logout` — clears cookie
- `GET /api/auth/me` — returns current user from cookie
- `PATCH /api/auth/me` — update name, handle, bio, pillar, focusTarget, avatarColor, newPassword → re-signs JWT

### Core Data
- `GET /api/dashboard` — **main aggregator**
  - If unauthenticated: returns `leaderboard + challenges + posts`
  - If authenticated: returns `user, habits, goals, journals, focusSessions, challenges, posts, leaderboard, pillarScores`
  - Pillar scores computed from habit completions + goal progress + focus minutes

- `POST /api/habits` — create habit `{title, description, pillar, xpReward, targetDaysPerWeek}`
- `PATCH /api/habits` — toggle completion `{habitId, date: YYYY-MM-DD}` → updates streak, XP, level
- `DELETE /api/habits?id=...`

- `POST /api/goals` — create goal with milestones
- `PATCH /api/goals` — toggle milestone `{goalId, milestoneId}` or add milestone `{newMilestoneTitle}`
- `DELETE /api/goals?id=...`

- `POST /api/journal` — create entry `{title, winOfTheDay, lessonLearned, gratitude, content, pillar, mood, energy, tags}` → +40 XP
- `DELETE /api/journal?id=...`

- `POST /api/focus` — log session `{taskTitle, pillar, durationMinutes}` → XP = minutes*2, updates focusMinutesTotal

- `POST /api/challenges`
  - `{action: "create", title, subtitle, description, pillar, difficulty, durationDays, rules[]}` → +100 XP
  - `{action: "join", challengeId}` → +50 XP
  - `{action: "toggleDay", challengeId, dayNumber}` → +50/-50 XP, +300 XP + badge on completion

- `POST /api/community`
  - `{action: "post", content, tag}` → +30 XP
  - `{action: "like", postId}` → toggle like
  - `{action: "comment", postId, content}`

- `GET /api/health` — stats + env info

## Types — `src/lib/types.ts`

- `User` (with passwordHash) + `SafeUser` (omitted)
- `Habit`, `Goal`, `JournalEntry`, `FocusSession`
- `ChallengeProtocol` with `userProgress[]`
- `CommunityPost` with `likes[]` + `comments[]`
- `DatabaseSchema`

## Security & Vercel Notes

- **Cookies**: httpOnly prevents XSS theft, SameSite=lax prevents CSRF
- **Password**: timingSafeEqual comparison
- **No external DB**: zero cost, zero config, instant deploy
- **For production scale**: swap `readDb/writeDb` with Prisma + Postgres (Vercel Postgres) or Upstash Redis — types remain same
- **Middleware**: `src/middleware.ts` currently passthrough but ready for protected route logic

## How to test backend locally

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/dashboard

# Register
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","password":"123456","primaryPillar":"Mind"}' -c cookies.txt

# Use dashboard authenticated
curl http://localhost:3000/api/dashboard -b cookies.txt

# Toggle habit today
curl -X PATCH http://localhost:3000/api/habits -H "Content-Type: application/json" -d '{"habitId":"hab_...","date":"2026-09-29"}' -b cookies.txt
```

All endpoints return JSON and update XP/level/streak automatically.
