# NEXUS Project Status

Last updated: 2026-08-30

## Current Phase
**Phase 2 - Real Data + Multi-Business**
Status: BUILD PASSING

## What IS Done
- [x] Phase 1 complete: magic link auth, setup wizard, real org context
- [x] Real user name and org name in Header (server component)
- [x] Header user menu with sign out
- [x] Org logo shown in header if uploaded
- [x] Trusted device implementation (30 day cookie)
- [x] Multi-org schema: user_organisation_memberships + user_active_organisation
- [x] Multi-org repository: getUserOrganisations, setActiveOrganisation
- [x] Multi-org tables pushed to Neon
- [x] 26 routes building clean (Dynamic, authenticated)
- [x] middleware.ts created — all routes protected
- [x] awaitheaders() typo fixed in context.ts, Header.tsx, org/switch/route.ts
- [x] customers.repository.ts scoped to organisationId
- [x] sales.repository.ts scoped to organisationId
- [x] customers API route authenticated via session org context
- [x] sales API route authenticated via session org context
- [x] inventory API route authenticated via session org context
- [x] Dashboard KPIs wired to real DB (revenue, transactions, tax, discounts, customer count)
- [x] Customers page fetches from real API with loading state
- [x] Supabase packages removed (ADR-001 complete)

## What Is NOT Done Yet
- [ ] Business switcher tested end-to-end
- [ ] Inventory page — real DB data displaying (API wired, page uses demo fallback)
- [ ] POS connected to DB
- [ ] RBAC enforcement
- [ ] Email verified before dashboard access
- [ ] middleware deprecation warning (proxy.ts) — blocked by Turbopack limitation

## Next Actions
1. Test sign in flow end-to-end in browser
2. Test business switcher end-to-end
3. Wire inventory page to display real DB stock levels
4. POS to DB connection

## Session Log
- 2026-08-30 (session 2) - Inventory + customers API org-scoped, customers page real data
- 2026-08-30 (session 1) - Fixed awaitheaders, middleware, secured repos, real dashboard KPIs, removed Supabase
- 2026-08-29 15:38 - Phase 2: real header, multi-org schema, trusted device, products API
- 2026-08-28 13:27 - Phase 1 complete: magic link, setup wizard, org context
- 2026-08-27 21:27 - Better Auth + nodemailer, 26 routes clean
- 2026-08-26 23:15 - Better Auth + Drizzle ORM, 24 routes clean
