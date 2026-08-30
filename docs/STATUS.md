# NEXUS Project Status

Last updated: 2026-08-30

## Current Phase
**Phase 2 - Real Data + Multi-Business**
Status: BUILD PASSING — PHASE 2 COMPLETE

## What IS Done
- [x] Phase 1 complete: magic link auth, setup wizard, real org context
- [x] Real user name and org name in Header (server component)
- [x] Header user menu with sign out
- [x] Org logo shown in header if uploaded
- [x] Trusted device implementation (30 day cookie)
- [x] Multi-org schema pushed to Neon
- [x] Multi-org repository: getUserOrganisations, setActiveOrganisation
- [x] 26+ routes building clean (Dynamic, authenticated)
- [x] middleware.ts — all routes protected
- [x] All repositories org-scoped — no data leakage
- [x] Dashboard KPIs wired to real DB
- [x] Customers page fetches from real API
- [x] Inventory API org-scoped
- [x] Supabase packages removed (ADR-001 complete)
- [x] createBranch added to setup flow
- [x] awaitheaders() typo fixed in all files
- [x] sale_items table added and pushed to Neon
- [x] createSale repository function
- [x] decrementStockForSale — inventory decremented on sale
- [x] POS completeSale wired to real DB
- [x] POS loads real products from DB via /api/v1/pos
- [x] RBAC enforced on POS (pos.sell), customers (customer.manage), inventory (stock.view)
- [x] Permission helper: hasPermission(), requirePermission()
- [x] Business switcher UI ready — shows when user has 2+ orgs

## What Is NOT Done Yet
- [ ] Email verified before dashboard access
- [ ] RBAC on remaining API routes (sales GET, products, purchasing)
- [ ] Products page wired to real DB
- [ ] Purchasing module
- [ ] Phase 3: multi-business — test with second org
- [ ] middleware deprecation warning (proxy.ts) blocked by Turbopack

## Next Actions
1. Wire products page to real DB
2. Enforce RBAC on remaining routes
3. Phase 3: create second org, test business switcher end-to-end
4. Email verification gate

## Session Log
- 2026-08-30 (session 3) - Branch fix, sale_items, POS→DB, real products in POS, inventory decrement, RBAC
- 2026-08-30 (session 2) - Inventory + customers API org-scoped, customers page real data
- 2026-08-30 (session 1) - Fixed awaitheaders, middleware, secured repos, real dashboard KPIs, removed Supabase
- 2026-08-29 15:38 - Phase 2: real header, multi-org schema, trusted device, products API
- 2026-08-28 13:27 - Phase 1 complete: magic link, setup wizard, org context
- 2026-08-27 21:27 - Better Auth + nodemailer, 26 routes clean
- 2026-08-26 23:15 - Better Auth + Drizzle ORM, 24 routes clean
