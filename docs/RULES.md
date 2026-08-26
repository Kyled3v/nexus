# NEXUS Agent Rules

> These rules are MANDATORY. Every agent session must read this file first.

## Product

- Product name: **NEXUS** (never "Nexis")
- Company: **KyleDev Software Systems Pty Ltd**
- Sub-brand: **KDOS** (KyleDev Operating System)
- Project path: `E:\Projects\nexus`

## Terminal Rules (CRITICAL)

All commands must be PowerShell-compatible. NEVER use bash syntax.

### File writes
```powershell
Set-Content 'path\to\file.ts' -Encoding UTF8 -Value @'
...file content...
