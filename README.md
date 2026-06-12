# Sintex Analytics Hub — Dashboard Portal

A premium enterprise analytics portal built with Next.js 15, React 19, and Tailwind CSS. All 49 dashboards from the Excel file are embedded statically for blazing-fast performance.

---

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** — animations
- **Lucide React** — icons

---

## Features

- ✅ 49 dashboards auto-parsed from Excel
- ✅ Instant search (name + category)
- ✅ Department & status filters (Live / UAT / WIP)
- ✅ Favorites (persisted to localStorage)
- ✅ Recently visited (persisted to localStorage)
- ✅ Light / Dark theme toggle
- ✅ Skeleton loaders
- ✅ Framer Motion animations
- ✅ Fully responsive (mobile → 5-column desktop)
- ✅ Accessible (ARIA labels, keyboard nav, focus states)
- ✅ Vercel-optimized (no server, fully static)

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open http://localhost:3000
```

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# For production
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. Push this project to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel auto-detects Next.js — click **Deploy**
5. Done ✅

### Option C — Drag & Drop

1. Run `npm run build` locally
2. Drag the `.next` folder to [vercel.com/new](https://vercel.com/new)

---

## Environment Variables

No environment variables are required. The app is fully static.

Optional (analytics):
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## Updating Dashboards

All dashboard data lives in `/lib/dashboardData.ts`.

To add or update a dashboard:
```typescript
{
  id: '101',
  reportName: 'New Report Name',
  url: 'https://app.powerbi.com/...',
  category: 'Sales',       // Sales | Finance | Logistics | SCM | SM | PPC
  department: 'Sales',
  status: 'Live',           // Live | UAT | WIP
  owner: 'Name',
  type: 'Dashboard',
  description: 'Brief description of this report.',
}
```

---

## Build Optimization

The app is optimized for Lighthouse 95+:

- Static data (no API calls at runtime)
- Lazy hydration with `'use client'` only where needed
- Font preloading via `<link rel="preconnect">`
- Image optimization via `next/image`
- CSS variables for theme switching (no flash)
- `swcMinify: true` in next.config.js

---

## Project Structure

```
/app
  layout.tsx          Root layout with metadata + theme init
  page.tsx            Main portal page
  globals.css         Tailwind + CSS variables
  loading.tsx         Loading fallback
  error.tsx           Error boundary

/components
  Header.tsx          Sticky header with search + theme toggle
  Hero.tsx            Stats overview section
  Filters.tsx         Category + status filter pills
  DashboardCard.tsx   Individual dashboard tile
  DashboardGrid.tsx   Responsive grid container
  SkeletonCard.tsx    Loading skeleton
  EmptyState.tsx      Empty search state
  Favorites.tsx       Favorites strip
  RecentReports.tsx   Recently visited strip

/hooks
  useDashboards.ts    Search + filter logic
  useFavorites.ts     Favorites localStorage state
  useRecentReports.ts Recent visits localStorage state

/lib
  dashboardData.ts    All 49 dashboards + category/status colors

/types
  dashboard.ts        TypeScript interfaces
```

---

## License

Internal use only — Sintex Industries Ltd.
