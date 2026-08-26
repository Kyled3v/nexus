# Usage: & .\docs\UPDATE-STATUS.ps1 -Message "Completed middleware and auth pages"
# Run before every npm run build and at session end

param(
  [string]$Message = "Session checkpoint"
)

$date    = Get-Date -Format "yyyy-MM-dd HH:mm"
$file    = 'E:\Projects\nexus\docs\STATUS.md'
$content = Get-Content $file -Raw

# Update last-updated date
$content = $content -replace '(?<=Last updated: )[\d\-: ]+', $date

# Append to session log at bottom
$logEntry = "`n- [$date] $Message"
if ($content -notmatch "## Session Log") {
  $content = $content + "`n`n## Session Log`n"
}
$content = $content + $logEntry

Set-Content $file -Encoding UTF8 -Value $content
Write-Host "STATUS.md updated: $date — $Message"
