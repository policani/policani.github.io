<#
  publish.ps1  -  Publish policani.net to GitHub Pages
  Usage:
    .\publish.ps1                          # validate + commit pending changes + push
    .\publish.ps1 "your message"           # custom commit message
    .\publish.ps1 -DryRun                  # show what would be committed; no commit, no push
    .\publish.ps1 -Force "msg"             # push even if link validation finds problems
  This script is tracked with the repository so the release process travels
  with the site. GitHub Pages serves it only as a source file, not executable code.
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$MessageParts,
    [switch]$DryRun,
    [switch]$Force,
    [string[]]$ExcludePath = @('.nojekyll')
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot
Write-Host "==> Repo: $PSScriptRoot"

# 1) Clear any stale git lock left by another tool
if (Test-Path ".git\index.lock") {
    Remove-Item ".git\index.lock" -Force
    Write-Host "==> Removed stale .git\index.lock"
}

# 2) Remove the temporary mockups folder if it is still present
if (Test-Path "_mockups") {
    git rm -r --quiet --ignore-unmatch "_mockups" 2>$null
    if (Test-Path "_mockups") { Remove-Item "_mockups" -Recurse -Force -ErrorAction SilentlyContinue }
    Write-Host "==> Removed _mockups (temp files)"
}

# 3) Rebuild generated site content from repository-level manifests. Do not
#    discard working-tree files here; publication must preserve intentional edits.
if (Test-Path '.\site-content.ps1') {
    try {
        & '.\site-content.ps1' -Action Build
    } catch {
        Write-Host '==> Site content build failed. Nothing was published.' -ForegroundColor Red
        Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# 4) Collect changed files (tracked modifications + untracked), excluding
#    explicitly local-only paths.
$allChanged = @(git status --porcelain | ForEach-Object { $_.Substring(3).Trim('"') })
$changed = @($allChanged | Where-Object { $ExcludePath -notcontains $_ })
$excludedChanged = @($allChanged | Where-Object { $ExcludePath -contains $_ })
$changedHtml = @($changed | Where-Object { $_ -like "*.html" -and (Test-Path $_) })

if ($excludedChanged.Count -gt 0) {
    Write-Host "==> Keeping local-only path(s) out of this release: $($excludedChanged -join ', ')"
}

if ($changed.Count -eq 0) {
    Write-Host "==> Working tree clean; pushing any existing commits."
} else {
    Write-Host "==> Changes to publish ($($changed.Count) file(s)):"
    git status --short -- $changed
}

# 5) Validate local links in changed HTML files (href/src that point to files in this repo)
$broken = @()
foreach ($file in $changedHtml) {
    $dir = Split-Path -Parent (Resolve-Path $file)
    $html = Get-Content $file -Raw -Encoding UTF8
    $linkMatches = [regex]::Matches($html, '(?:href|src)\s*=\s*"([^"]+)"')
    foreach ($m in $linkMatches) {
        $link = $m.Groups[1].Value
        # Skip external, anchors, protocol-relative, mail, data URIs
        if ($link -match '^(https?:|mailto:|data:|#|//)') { continue }
          # Strip query string and fragment
          $path = ($link -split '[?#]')[0]
          if ([string]::IsNullOrWhiteSpace($path)) { continue }
          # Root-relative vs file-relative
        if ($path.StartsWith('/')) { $target = Join-Path $PSScriptRoot $path.TrimStart('/') }
        else { $target = Join-Path $dir $path }
        # Directory links resolve to index.html
        if (Test-Path $target -PathType Container) { $target = Join-Path $target "index.html" }
        if (-not (Test-Path $target)) { $broken += "$file -> $link" }
    }
}
if ($broken.Count -gt 0) {
    Write-Host ""
    Write-Host "==> BROKEN LOCAL LINKS ($($broken.Count)):" -ForegroundColor Red
    $broken | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    if (-not $Force -and -not $DryRun) {
        Write-Host "==> Aborting. Fix the links or re-run with -Force." -ForegroundColor Red
        exit 1
    }
} elseif ($changedHtml.Count -gt 0) {
    Write-Host "==> Link check passed on $($changedHtml.Count) changed HTML file(s)."
}

# 5b) Internal-leak scan on changed HTML (private paths, workspace names, production notes)
#     Added 2026-07-09 after an internal file path and a production note shipped to the live site.
#     2026-07-10: 'Codex' narrowed to path-shaped forms — bare 'Codex' is the public
#     product name in resources copy; the leak class is workspace paths.
$leakPatterns = @(
    'E:\\',
    'Codex\',
    '/Codex/',
    'Codex workspace',
    'Resume Assets Engine',
    'shorter version of this note',
    'This is the complete version',
    'pending Marco review',
    'Editorial Gate',
    'article-packet'
)
$leaks = @()
foreach ($file in $changedHtml) {
    $html = Get-Content $file -Raw -Encoding UTF8
    foreach ($p in $leakPatterns) {
        if ($html -like "*$p*") { $leaks += "$file contains '$p'" }
    }
}
if ($leaks.Count -gt 0) {
    Write-Host ""
    Write-Host "==> INTERNAL-LEAK SCAN FAILED ($($leaks.Count)):" -ForegroundColor Red
    $leaks | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    if (-not $Force -and -not $DryRun) {
        Write-Host "==> Aborting. Remove the internal reference or re-run with -Force." -ForegroundColor Red
        exit 1
    }
} elseif ($changedHtml.Count -gt 0) {
    Write-Host "==> Internal-leak scan passed on $($changedHtml.Count) changed HTML file(s)."
}

# 5b-2) Encoding scan: catch UTF-8 read as cp1252 before it reaches readers.
#       Added 2026-07-20 after em dashes and curly quotes shipped as
#       "&#226;<eu>" across 10 generated files. Root cause was Get-Content
#       defaulting to ANSI in site-content.ps1; this is the backstop.
$mojibakePatterns = @(
    [char]0x00E2 + [char]0x20AC,   # a-circumflex + euro: mangled em dash / curly quote
    '&#226;',                      # the same, half-escaped by HtmlEncode
    [char]0x00C3 + [char]0x00A9,   # mangled accented e
    [char]0xFFFD                   # replacement character
)
$changedText = @($changed | Where-Object {
    ($_ -like "*.html" -or $_ -like "*.txt" -or $_ -like "*.json") -and (Test-Path $_)
})
$mojibake = @()
foreach ($file in $changedText) {
    $text = Get-Content $file -Raw -Encoding UTF8
    foreach ($p in $mojibakePatterns) {
        if ($text -like "*$p*") { $mojibake += "$file contains mangled encoding '$p'" }
    }
}
if ($mojibake.Count -gt 0) {
    Write-Host ""
    Write-Host "==> ENCODING SCAN FAILED ($($mojibake.Count)):" -ForegroundColor Red
    $mojibake | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    Write-Host "==> UTF-8 was read as ANSI somewhere. Check that every Get-Content" -ForegroundColor Red
    Write-Host "    in the content pipeline passes -Encoding UTF8, then regenerate." -ForegroundColor Red
    if (-not $Force -and -not $DryRun) { exit 1 }
} elseif ($changedText.Count -gt 0) {
    Write-Host "==> Encoding scan passed on $($changedText.Count) changed file(s)."
}

# 5c) Page-count parity: every PDF page-count claim in changed HTML must match the actual PDF
#     Added 2026-07-09 after a landing card advertised 15 pages for a 13-page PDF.
$pageMismatches = @()
foreach ($file in $changedHtml) {
    $dir = Split-Path -Parent (Resolve-Path $file)
    $html = Get-Content $file -Raw -Encoding UTF8
    $claims = [regex]::Matches($html, 'href\s*=\s*"([^"]+\.pdf)[^"]*"[^>]*>[^<]*?(?:PDF,\s*)?(\d+)\s*pages')
    foreach ($m in $claims) {
        $pdfLink = ($m.Groups[1].Value -split '[?#]')[0]
        if ($pdfLink -match '^(https?:|//)') { continue }
        if ($pdfLink.StartsWith('/')) { $pdfPath = Join-Path $PSScriptRoot $pdfLink.TrimStart('/') }
        else { $pdfPath = Join-Path $dir $pdfLink }
        if (-not (Test-Path $pdfPath)) { continue } # broken links are caught by step 5
        $claimed = [int]$m.Groups[2].Value
        $bytes = [System.IO.File]::ReadAllBytes($pdfPath)
        $text = [System.Text.Encoding]::ASCII.GetString($bytes)
        $countMatches = [regex]::Matches($text, '/Type\s*/Page[^s]')
        $actual = $countMatches.Count
        if ($actual -gt 0 -and $claimed -ne $actual) {
            $pageMismatches += "$file claims $claimed pages; $(Split-Path -Leaf $pdfPath) has $actual"
        }
    }
}
if ($pageMismatches.Count -gt 0) {
    Write-Host ""
    Write-Host "==> PDF PAGE-COUNT MISMATCH ($($pageMismatches.Count)):" -ForegroundColor Red
    $pageMismatches | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    if (-not $Force -and -not $DryRun) {
        Write-Host "==> Aborting. Fix the page-count text or re-run with -Force." -ForegroundColor Red
        exit 1
    }
} elseif ($changedHtml.Count -gt 0) {
    Write-Host "==> Page-count parity check passed."
}

# 6) Warn if pages changed but sitemap.xml did not
if ($changedHtml.Count -gt 0 -and ($changed -notcontains "sitemap.xml")) {
    Write-Host "==> NOTE: HTML changed but sitemap.xml was not touched. Update lastmod if these pages are listed." -ForegroundColor Yellow
}

# 7) Dry run stops here
if ($DryRun) {
    Write-Host ""
    Write-Host "==> Dry run: nothing committed, nothing pushed."
    exit 0
}

# 8) Stage only the reviewed release paths, commit if needed, push
if ($changed.Count -gt 0) { git add -A -- $changed }
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    if ($MessageParts -and $MessageParts.Count -gt 0) { $msg = ($MessageParts -join ' ') }
    else { $msg = "Update site $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
    git commit -m $msg
    Write-Host "==> Committed: $msg"
} else {
    Write-Host "==> No new changes; pushing existing commits."
}

git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "==> Push failed. Check network/credentials and re-run." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==> Done. GitHub Pages will rebuild in ~1 minute:  https://policani.net"
