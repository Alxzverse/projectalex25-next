# 🚀 How to Publish ProjectAlex25 on Vercel (Beginner Guide)

Your code is **100% ready** for Vercel. Follow these 2-minute steps.

### Option A: Deploy via Vercel Dashboard (EASIEST - Recommended)

#### Step 1: Merge PR to Main (1 click)
1. Go to: **https://github.com/Alxzverse/projectalex25-next/pull/1**
2. Click **Merge pull request** → **Confirm merge**
3. Now `main` branch has all the code.

> If you skip merging, you can still deploy the `arena/01a0edd0-projectalex25-next` branch directly in Step 3.

#### Step 2: Login to Vercel
1. Go to **https://vercel.com**
2. Click **Sign Up** or **Log In** → Choose **Continue with GitHub**
3. Authorize Vercel to access your GitHub.

#### Step 3: Import Project
1. Click **Add New...** → **Project**
2. In the list, find **`Alxzverse/projectalex25-next`** → Click **Import**
   - If not visible, click **Adjust GitHub App Permissions** and allow access to this repo.
3. Vercel auto-detects:
   - **Framework Preset:** Next.js ✅
   - **Build Command:** `npm run build` (leave default)
   - **Output Directory:** `.next` (leave default)
   - **Install Command:** `npm install` (leave default)

#### Step 4: Environment Variables (Optional - Skip for now)
- You can leave empty and deploy. It will use default secret.
- Optional for production hardening: Add `JWT_SECRET` = `your-random-long-secret-2026-change-me`

#### Step 5: Deploy
1. Click **Deploy**
2. Wait 60-90 seconds → You’ll see **Congratulations!** 🎉
3. You get a URL like: `https://projectalex25-next.vercel.app`
4. Click **Visit** → Your app is LIVE!

#### Step 6: Test Your Live App
- `/` → Landing page
- `/register` → Create account (gets +150 XP)
- `/login` → Use **1-Click Demo Login** or `alex@projectalex25.com / password123`
- `/dashboard` → Full Command Center

Every future `git push` to `main` will auto-deploy!

---

### Option B: Deploy via Vercel CLI (For Developers)

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login (opens browser)
vercel login

# 3. From project folder
cd projectalex25-next
vercel

# Answer prompts:
# ? Set up and deploy? Y
# ? Which scope? Your username
# ? Link to existing project? N
# ? Project name? projectalex25-next
# ? In which directory is your code located? ./
# ? Override settings? N

# 4. Deploy to production
vercel --prod
```

You’ll get live URL instantly.

---

### 🔧 Troubleshooting

**Q: Build fails with "next: not found"?**
- Make sure `package.json` has `next` dependency (it does). Vercel runs `npm install` automatically.

**Q: Data resets on Vercel?**
- Normal for file DB on serverless. We use `/tmp` + memory cache + JWT self-healing. For permanent DB, later swap to Vercel Postgres.

**Q: How to add custom domain?**
- Vercel Dashboard → Your Project → Settings → Domains → Add `projectalex25.com`

---

### 🎯 What Happens After Deploy?

- Vercel gives you:
  - `https://projectalex25-next.vercel.app` (production)
  - `https://projectalex25-next-git-arena-...vercel.app` (preview)
  - Automatic HTTPS, CDN

- Backend APIs:
  - `https://your-url.vercel.app/api/health`
  - `https://your-url.vercel.app/api/dashboard`
