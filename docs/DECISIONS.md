# NEXUS — Architectural Decisions Log

> Record every significant decision here with rationale.

---

## ADR-001 — Auth Stack: Better Auth over Supabase Auth

**Date:** 2025-08-26
**Status:** Decided

**Decision:** Use Better Auth with Drizzle adapter on Neon PostgreSQL.

**Rationale:**
- Full control over schema (Better Auth tables in same DB as app tables)
- No Supabase RLS complexity — org isolation handled at query layer via `organisationId`
- `activeOrganisationId` stored on session for business switching
- Drizzle handles all DB access uniformly

**Action required:** Remove `@supabase/ssr` and `@supabase/supabase-js` from package.json.

---

## ADR-002 — Database: Neon PostgreSQL via Drizzle ORM

**Date:** 2025-08-26
**Status:** Decided, schema live

**Decision:** Neon serverless PostgreSQL, accessed via `drizzle-orm/neon-http`.

**Rationale:**
- Serverless-compatible (Next.js Edge/Node)
- Drizzle gives type-safe queries with full schema control
- Schema already pushed to production DB

---

## ADR-003 — Multi-Tenancy: organisationId on every table

**Date:** 2025-08-26
**Status:** Schema implemented, not yet enforced in queries

**Decision:** Every business-scoped table has `organisationId` (UUID FK to organisations).

**Enforcement plan:**
- All repository queries filter by `organisationId` from session context
- Middleware injects active org into request context
- Never trust client-supplied organisationId

---

## ADR-004 — Module System: Plan-gated entitlements

**Date:** 2025-08-26
**Status:** Implemented (dev mode: all modules enabled)

**Decision:** Modules are gated by plan (starter/business/professional/enterprise).
Each org has a `moduleEntitlements` row. In dev, `DEV_ENTITLEMENT` enables all.

---

## ADR-005 — RBAC: Role-based permissions per org membership

**Date:** 2025-08-26
**Status:** Types defined, dev context only — not enforced in real auth

**Decision:** 8 roles, 35+ permissions defined in `types/permissions.ts`.
User role is stored in `userProfiles.role` per org (not global).
Same user can be Owner in Org A and Cashier in Org B.

**Action required:** Wire real permission checks once auth is live.
