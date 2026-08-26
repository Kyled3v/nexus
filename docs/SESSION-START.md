# NEXUS — New Session Bootstrap

> Hand this file to the agent at the start of every session.
> Say: "new session" and paste this file.

## Agent Instructions

1. Read `docs/STATUS.md` — this is your source of truth
2. Read `docs/RULES.md` — mandatory before touching anything
3. Read `docs/phases/PHASES.md` — know what phase we are on
4. Ask the user: "Ready to continue Phase X — [phase name]?" and confirm before writing any code
5. Before ending the session or running `npm run build`, run the update script below

## Before Every `npm run build`

```powershell
& 'E:\Projects\nexus\docs\UPDATE-STATUS.ps1'
```

## Files To Read On Start (in order)

1. `E:\Projects\nexus\docs\STATUS.md`
2. `E:\Projects\nexus\docs\RULES.md`
3. `E:\Projects\nexus\docs\phases\PHASES.md`
