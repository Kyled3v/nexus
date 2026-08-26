# Run at start of every session, paste output to agent

Write-Host "`n=== NEXUS SESSION CONTEXT ===" -ForegroundColor Cyan

# Current phase + incomplete tasks only
$status = Get-Content 'E:\Projects\nexus\docs\STATUS.md' -Raw

# Extract just: Current Phase block + What Is NOT Done Yet block
$phase   = [regex]::Match($status, '(?s)## Current Phase.+?(?=## )').Value
$todo    = [regex]::Match($status, '(?s)## What Is NOT Done Yet.+?(?=## )').Value
$next    = [regex]::Match($status, '(?s)## Next Actions.+?(?=## |\Z)').Value
$log     = [regex]::Match($status, '(?s)## Session Log.+?\Z').Value -split "`n" | Select-Object -Last 5

Write-Host $phase
Write-Host $todo
Write-Host $next
Write-Host "`n--- Last 5 session log entries ---"
$log | ForEach-Object { Write-Host $_ }

Write-Host "`n=== RULES REMINDER ===" -ForegroundColor Yellow
Write-Host "PowerShell only. Single-quote paths with parens. Set-Content for file writes."
Write-Host "Stack: Next.js 16, Drizzle, Neon, Better Auth. No Supabase."
Write-Host "Path: E:\Projects\nexus"
Write-Host "==============================`n" -ForegroundColor Cyan
