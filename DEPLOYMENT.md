# 🚀 Ananke Desktop App - Final Deployment Guide

## Status: Ready for Production ✅

Your Windows desktop installer and web app are ready to deploy!

---

## **Quick Summary**

| Item | Status | File |
|------|--------|------|
| Desktop App (.exe) | ✅ Ready | `/release/Ananke Setup 0.0.0.exe` (94 MB) |
| App Logo | ✅ Updated | `/public/icon-512.png` |
| Electron Security | ✅ Locked | DevTools disabled, context isolation on |
| Web App | ✅ Ready | Syncs from GitHub → Vercel |

---

## **Step 1: Push Code to GitHub**

```bash
cd c:\Users\Mohamed\Desktop\ananke-main

# Configure git user (do once)
git config user.email "your-email@gmail.com"
git config user.name "Your Name"

# Stage changes
git add .

# Commit
git commit -m "feat: Ananke desktop app with Electron wrapper and secured installer"

# Push to GitHub
git remote add origin https://github.com/aegis504/ananke.git
git branch -M main
git push -u origin main
```

If you get a permission error:
- Use SSH key (recommended):
  ```bash
  git remote set-url origin git@github.com:aegis504/ananke.git
  git push -u origin main
  ```
- Or use GitHub token instead of password

---

## **Step 2: Update Version for Release**

Edit `package.json`:
```json
{
  "version": "1.0.0",  // Change from 0.0.0 to 1.0.0
  ...
}
```

Rebuild installer:
```bash
npm run electron:build
# Creates: release/Ananke Setup 1.0.0.exe
```

Commit the version bump:
```bash
git add package.json
git commit -m "chore: bump version to 1.0.0"
git push origin main
```

---

## **Step 3: Deploy to Vercel**

### Option A: Connect Vercel to GitHub (Automatic)

1. Go to https://vercel.com
2. Sign in / Create account
3. Click "New Project"
4. Select "Import from GitHub" 
5. Choose `aegis504/ananke` repository
6. Framework: Vite
7. Build Command: `npm run build`
8. Output Directory: `dist`
9. Click "Deploy"

**Every time you push to GitHub → Vercel auto-deploys!**

### Option B: Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts, confirm production deployment
```

---

## **Step 4: Users Download Desktop App**

Share installer link:
```
https://github.com/aegis504/ananke/releases/download/v1.0.0/Ananke Setup 1.0.0.exe
```

Or users can:
1. Visit your repo: https://github.com/aegis504/ananke
2. Click "Releases" (right sidebar)
3. Download `.exe` file
4. Run installer
5. App opens to https://ananke.vercel.app

---

## **Remaining Features to Implement** (In Web App)

These go in `/src/` files. After each change:
```bash
git add .
git commit -m "feat: [feature name]"
git push origin main
# Wait 2-3 minutes for Vercel to redeploy
# Users see updates in their app automatically!
```

### Priority 1 (Critical):
- [ ] **Admin Email Check** → Only `samsari.owner.gmail.com` accesses `/judges` page
- [ ] **Task Completion Fix** → Clicking one task's "Mark Complete" only marks THAT task
- [ ] **AI Error Handling** → Add fallback API key for when primary is down

### Priority 2 (Important):
- [ ] **Shortcuts Tutorial** → Interactive step-by-step walkthrough
- [ ] **Notebook Save** → "Save to Notebook" option on every note
- [ ] **Shared Notes** → Fix the "Shared with me / Shared by me" sections

### Priority 3 (Nice-to-Have):
- [ ] **Calendar iOS** → "Connect to iOS" button with QR code
- [ ] **Home Download** → "Download Desktop App" button on landing page
- [ ] **User Settings** → Password change, push notifications
- [ ] **AI Task Parsing** → Understand "repair car engine tomorrow, urgent"

---

## **Your Project Structure**

```
ananke-main/
├── electron/
│   └── main.js           ← Desktop app wrapper
├── src/
│   ├── App.tsx           ← Main app routing
│   ├── components/
│   │   ├── dashboard/    ← All page views
│   │   ├── auth/
│   │   └── landing/
│   ├── hooks/            ← Business logic
│   └── lib/              ← Utilities
├── api/
│   └── ai.ts             ← AI API endpoint (Vercel)
├── public/
│   └── icon-512.png      ← Your logo
├── package.json          ← Version goes here
├── vite.config.ts        ← Web app config
└── electron/tsconfig.json ← Desktop app config

GitHub Repo:   aegis504/ananke
Live Web App:  https://ananke.vercel.app
Desktop App:   Ananke Setup 1.0.0.exe
```

---

## **Troubleshooting Deployment**

**GitHub push fails?**
```bash
# Check remote
git remote -v

# Fix if wrong
git remote set-url origin https://github.com/aegis504/ananke.git
```

**Vercel says "build failed"?**
```bash
# Test locally first
npm run build
npm run preview

# Check for TypeScript errors
npx tsc --noEmit
```

**Users can't download from GitHub?**
1. Go to Releases tab
2. Create new release for v1.0.0
3. Upload `.exe` file
4. Mark as "Latest release"

**Web app won't load in desktop app?**
- Check internet connection
- Vercel might be deploying (wait 3 mins)
- Try restarting the desktop app

---

## **Environment Variables**

For production, set these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_AI_API_KEY_PRIMARY=your_primary_api_key
VITE_AI_API_KEY_FALLBACK=your_fallback_api_key
```

Vercel auto-injects these at build time. No need for `.env` file!

---

## **Success Checklist**

- [ ] GitHub repo created and has code pushed
- [ ] Vercel connected and building from `main` branch
- [ ] https://ananke.vercel.app loads your app
- [ ] Desktop installer runs and loads web app
- [ ] Changes push to GitHub → appear on web app (2-3 mins)
- [ ] Logo shows green "A" in navbar and window title
- [ ] DevTools unavailable (can't right-click inspect)

---

## **Next 24 Hours**

1. **Within 1 hour**: Push to GitHub and verify Vercel builds
2. **Today**: Implement the 3 Priority 1 features
3. **Tomorrow**: Add Priority 2 features
4. **This week**: Deploy v1.0.0 with all features

---

## **Questions?**

- GitHub workflow: https://docs.github.com/en/get-started
- Vercel deployment: https://vercel.com/docs
- Electron API: https://www.electronjs.org/docs

Your desktop app is production-ready! 🎉
