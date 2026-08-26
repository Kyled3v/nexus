# NEXUS — Project Status

> Last updated: 2026-08-26 23:15
> Updated by: Agent session

## Current Phase

**Phase 1 — Auth + Real Org Context**
Status: NOT STARTED

## Completed Work

### Infrastructure
- [x] Next.js 16 App Router scaffold
- [x] TypeScript + Tailwind + Drizzle configured
- [x] Neon PostgreSQL connected
- [x] Schema pushed to production DB (`drizzle-kit push` ✅)
- [x] Better Auth configured (email/password)
- [x] Auth client (`signIn`, `signOut`, `useSession`)
- [x] Design system (`globals.css`) — comprehensive, complete
- [x] RBAC: 8 roles, 35+ permissions (`types/permissions.ts`)
- [x] Module entitlement system with plan gating
- [x] Dev role-switcher in Header
- [x] Domain type files (all major domains)
- [x] Repository pattern started (5 repos)
- [x] Event bus + stock intelligence service
- [x] KDOS client stub
- [x] Dashboard page with demo data + stat cards + KDOS UI
- [x] POS CSS fully defined

### Schema Tables Live on Neon
- [x] organisations
- [x] branches
- [x] user (Better Auth)
- [x] session (Better Auth)
- [x] account (Better Auth)
- [x] verification (Better Auth)
- [x] userProfiles
- [x] moduleEntitlements
- [x] products
- [x] inventory
- [x] customers
- [x] leads
- [x] sales
- [x] auditLogs
- [x] notifications

## What Is NOT Done Yet

- [ ] Sign in / sign up pages
- [ ] Route middleware (all pages are currently public)
- [ ] Real org context provider (currently hardcoded dev-context)
- [ ] Business switcher (session.activeOrganisationId not wired)
- [ ] Business registration / onboarding flow
- [ ] Real RBAC enforcement (permissions are dev-only stubs)
- [ ] Supabase dependency cleanup (still in package.json alongside Drizzle)
- [ ] KDOS client returns mock data (not real AI)
- [ ] POS functional logic (cart/till not connected to DB)
- [ ] (auth) and (dashboard) route groups have no page files

## Known Issues / Risks

- Dual auth stack: Supabase + Better Auth both in package.json — must remove Supabase
- `auth/index.ts` has a typo: `typeof auth..Session` (double dot) — needs fix before build
- `Header.tsx` regex literal `\w/g` may cause TS error — check on next build
- `userProfiles` not queried anywhere — multi-tenancy is schema-only right now

## Next Actions (Phase 1)

1. Fix `auth/index.ts` double-dot typo
2. Create `src/middleware.ts` — protect all routes, redirect to `/sign-in`
3. Create `src/app/(auth)/sign-in/page.tsx`
4. Create `src/app/(auth)/sign-up/page.tsx`
5. Create `src/lib/auth/org-context.tsx` — real userProfiles lookup
6. Wire `session.activeOrganisationId` to business switcher
7. Remove Supabase from dependencies



## Session Log

- [2026-08-26 22:28] Pre-build checkpoint

- [2026-08-26 22:35] Pre-build checkpoint

- [2026-08-26 22:38] Pre-build checkpoint

- [2026-08-26 23:15] Pre-build checkpoint

## Session Update — 2026-08-27 00:18

### Completed This Session
- Removed Supabase packages (@supabase/supabase-js, @supabase/ssr)
- Installed Drizzle ORM + @neondatabase/serverless + better-auth + drizzle-kit
- Wrote Drizzle schema (src/lib/db/schema.ts) — all core tables
- Wrote Drizzle client (src/lib/db/index.ts) — Neon HTTP driver
- Rewrote all repositories to use Drizzle (products, inventory, customers, sales, organisation)
- Configured Better Auth (src/lib/auth/index.ts, src/lib/auth/client.ts)
- Better Auth API route live at /api/auth/[...all]
- Auth pages live: /sign-in, /sign-up
- Fixed useSearchParams Suspense boundary on sign-in page
- Fixed package.json BOM corruption
- Removed all remaining Supabase files
- proxy.ts created for Next.js 16 route protection
- drizzle.config.ts created
- DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL added to .env.local

### Build Status
- Routes: 24 (12 pages + 9 API + 2 auth pages + not-found)
- TypeCheck: CLEAN
- Build: CLEAN

### Next Steps
- Run: npx drizzle-kit push (push schema to Neon)
- Add auth styles to globals.css (auth-card classes)
- Build sign-up flow with organisation creation
- Push schema to Neon database
- Test full sign-up → sign-in → dashboard flow
- Phase 3: Multi-business architecture
