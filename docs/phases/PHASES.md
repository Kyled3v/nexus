# NEXUS — Implementation Phases

> 23 phases total. Update status as each phase completes.
> Status: 🔴 Not started | 🟡 In progress | 🟢 Complete | ⏸ Blocked

## Phase Summary

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 1 | Auth + Real Org Context | 🟡 In progress | Next up |
| 2 | Map current architecture | 🟢 Complete | See ARCHITECTURE.md |
| 3 | Multi-business architecture | 🔴 Not started | Schema ready |
| 4 | Users, memberships, permissions | 🔴 Not started | Types ready |
| 5 | Business switching | 🔴 Not started | session.activeOrganisationId exists |
| 6 | Shared collaboration and messaging | 🔴 Not started | |
| 7 | Business branding and logo system | 🔴 Not started | logoUrl on org |
| 8 | Migration architecture | 🔴 Not started | |
| 9 | Industry templates / configuration | 🔴 Not started | |
| 10 | POS / storefront architecture | 🔴 Not started | CSS done |
| 11 | Device management | 🔴 Not started | |
| 12 | Accounting assistance architecture | 🔴 Not started | |
| 13 | Business learning profile | 🔴 Not started | |
| 14 | Business assistant | 🔴 Not started | KDOS stub exists |
| 15 | Workflow automation | 🔴 Not started | Event bus exists |
| 16 | Notifications and universal search | 🔴 Not started | notifications table exists |
| 17 | Versioning and feature flags | 🔴 Not started | |
| 18 | Safe update architecture | 🔴 Not started | |
| 19 | KDOS integration | 🔴 Not started | client stub exists |
| 20 | System health and audit | 🔴 Not started | auditLogs table exists |
| 21 | Mobile readiness | 🔴 Not started | |
| 22 | Complete UI/UX integration review | 🔴 Not started | |
| 23 | Testing and validation | 🔴 Not started | |

---

## Phase 1 — Auth + Real Org Context

**Goal:** Real users can sign in. Routes are protected. Active org drives the workspace.

### Tasks
- [ ] Fix `auth/index.ts` double-dot typo (`typeof auth..Session`)
- [ ] Create `src/middleware.ts` — protect all routes, redirect `/sign-in`
- [ ] Create `src/app/(auth)/sign-in/page.tsx`
- [ ] Create `src/app/(auth)/sign-up/page.tsx`
- [ ] Create `src/app/(auth)/layout.tsx`
- [ ] Create `src/lib/auth/org-context.tsx` — provider reading userProfiles
- [ ] Wire `session.activeOrganisationId` → active org
- [ ] Remove Supabase from package.json

### Definition of Done
- User can register, sign in, sign out
- Unauthenticated users are redirected to /sign-in
- Authenticated users see dashboard scoped to their active org
- Dev role-switcher still works in dev mode

---

## Phase 3 — Multi-Business Architecture

**Goal:** One user can belong to multiple orgs and switch between them.

### What exists
- `userProfiles` table with `organisationId` + `role`
- `session.activeOrganisationId` column
- `organisations` table with `slug`, `logoUrl`, `settings`

### Tasks
- [ ] `getMyOrganisations(userId)` — fetch all orgs for a user
- [ ] Business switcher UI in Sidebar (replace hardcoded brand area)
- [ ] `setActiveOrganisation(orgId)` — update session
- [ ] Middleware reads `activeOrganisationId` and injects into context
- [ ] All repository queries accept `organisationId` from context (not client)

---

## Phase 5 — Business Switching

**Goal:** Switching org changes the entire workspace with zero data leakage.

### Tasks
- [ ] Business switcher dropdown in sidebar (show logo + name)
- [ ] On switch: update `session.activeOrganisationId`
- [ ] On switch: clear all cached/state data from previous org
- [ ] Redirect to dashboard of new org
- [ ] Show active business name + logo in sidebar at all times

---

## Phase 10 — POS / Storefront

**Goal:** Functional POS terminal connected to real inventory and sales DB.

### What exists
- Full POS CSS in `globals.css`
- `sales` table in schema
- `products` + `inventory` tables

### Missing
- `sale_items` table
- POS state management (cart, till session)
- Product search connected to DB
- Payment processing flow
- Receipt generation
- Till open/close session tracking
