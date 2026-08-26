# NEXUS — Architecture

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v3 + custom design system in `globals.css` |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM (`drizzle-orm/neon-http`) |
| Auth | Better Auth v1 (email/password, Drizzle adapter) |
| Package manager | npm |
| IDE | VS Code on Windows (PowerShell terminal) |
| Runtime | Node.js |

## Directory Structure
src/
app/ # Next.js App Router pages
(auth)/ # Sign in, sign up (unauthenticated)
(dashboard)/ # Protected app shell
(pos)/ # POS terminal (separate layout)
api/
auth/ # Better Auth API handler
v1/ # REST API routes
[module]/page.tsx # Module pages (customers, products, etc.)
components/
layout/ # Header, Sidebar
shared/ # StatCard, etc.
ui/ # Button, Badge, Card primitives
config/
app.ts # APP_CONFIG, NAV_ITEMS
modules.ts # NEXUS_MODULES, plan gating, DEV_ENTITLEMENT
data/ # Demo data (dev only)
domain/ # Domain type definitions per module
hooks/ # React hooks
lib/
auth/
index.ts # Better Auth instance
client.ts # Auth client (signIn, signOut, useSession)
dev-context.ts # Dev role-switcher (DEV_USERS, _devSwitchRole)
db/
index.ts # Drizzle instance (Neon)
schema.ts # All DB table definitions
errors/ # AppError class
modules/ # Module gate context + gate component
supabase/ # TO BE REMOVED
utils/cn.ts # clsx + tailwind-merge
validation/schemas.ts # Zod schemas
modules/ # Feature module implementations
intelligence/
pos/
reporting/
settings/
repositories/ # DB query layer (per entity)
services/
ai/kdos-client.ts # KDOS AI client (stub)
automation/ # Event bus, stock intelligence
notifications/
types/
core.ts # BaseEntity, Result<T>, ID, etc.
permissions.ts # Role, Permission, ROLE_PERMISSIONS


## Key Patterns

### Result type
All service/repository functions return `Result<T>`:
```typescript
return ok(data)   // { success: true, data }
return err(msg)   // { success: false, error }
```

### Org isolation
Every query must filter by `organisationId` sourced from session context — never from client input.

### Module gating
Wrap any module-gated UI in `<ModuleGate module="pos">...</ModuleGate>`.

### Design system
Use CSS classes from `globals.css` only. Never write inline Tailwind in components for layout — use the established class names (`.btn--primary`, `.card`, `.page-header`, etc.).

## Auth Flow (target)

User visits /customers
→ middleware checks session
→ no session → redirect /sign-in
→ session exists → load userProfile for activeOrganisationId
→ inject org context into request
→ page renders with scoped data


## Multi-Tenancy Model

user (Better Auth)
└── userProfiles (one per org membership)
├── organisationId
├── role (owner | manager | cashier | ...)
└── permissions[]

session
└── activeOrganisationId ← drives entire workspace
