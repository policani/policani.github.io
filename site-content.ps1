<#
  Site-wide content pipeline for policani.net.

  Common commands:
    .\site-content.ps1 -Action Build
    .\site-content.ps1 -Action Check
    .\site-content.ps1 -Action AddWhitepaper -Spec .\path\entry.json -Pdf .\path\paper.pdf

  Governance content is authored in content/governance-library.json. Generated
  field-note pages, landing-page cards, counts, and sitemap entries must not be
  edited by hand.
#>

[CmdletBinding()]
param(
    [ValidateSet('Build', 'Check', 'AddWhitepaper')]
    [string]$Action = 'Check',
    [string]$Spec,
    [string]$Pdf
)

$ErrorActionPreference = 'Stop'
$siteRoot = $PSScriptRoot
$manifestPath = Join-Path $siteRoot 'content\governance-library.json'
$entrySchemaPath = Join-Path $siteRoot 'content\governance-entry.schema.json'
$governancePath = Join-Path $siteRoot 'governance'
$fieldNotesPath = Join-Path $governancePath 'field-notes'
$whitepapersPath = Join-Path $governancePath 'whitepapers'
$libraryIndexPath = Join-Path $governancePath 'index.html'
$sitemapPath = Join-Path $siteRoot 'sitemap.xml'
$llmsPath = Join-Path $siteRoot 'llms.txt'

function Write-Utf8([string]$Path, [string]$Content) {
    [IO.File]::WriteAllText($Path, $Content, [Text.UTF8Encoding]::new($false))
}

function Encode-Html([string]$Value) {
    return [Net.WebUtility]::HtmlEncode([Net.WebUtility]::HtmlDecode($Value)).Replace('&#39;', "'")
}

function Encode-JsonString([string]$Value) {
    return $Value.Replace('\', '\\').Replace('"', '\"').Replace("`r", '').Replace("`n", '\n')
}

function Read-LibraryManifest {
    if (-not (Test-Path -LiteralPath $manifestPath)) {
        throw "Missing content manifest: $manifestPath"
    }
    # -Encoding UTF8 is required: Windows PowerShell's Get-Content defaults to
    # ANSI/cp1252, which turns every UTF-8 em dash and curly quote in the
    # manifest into mojibake that then propagates into every generated page.
    return Get-Content -Raw -Encoding UTF8 -LiteralPath $manifestPath | ConvertFrom-Json
}

function Get-ActualPdfPages([string]$Path) {
    $bytes = [IO.File]::ReadAllBytes($Path)
    $text = [Text.Encoding]::ASCII.GetString($bytes)
    return ([regex]::Matches($text, '/Type\s*/Page[^s]')).Count
}

function Assert-EntrySchema($Entry) {
    if (-not (Get-Command Test-Json -ErrorAction SilentlyContinue)) { return }
    try {
        $isValid = $Entry | ConvertTo-Json -Depth 12 | Test-Json -SchemaFile $entrySchemaPath -ErrorAction Stop
    } catch {
        throw "$($Entry.slug): entry schema validation failed. $($_.Exception.Message)"
    }
    if (-not $isValid) { throw "$($Entry.slug): entry does not match the governance intake schema." }
}

function Assert-LibraryManifest($Manifest) {
    if ([int]$Manifest.schemaVersion -ne 1) { throw 'Unsupported governance manifest schema.' }
    if (@($Manifest.categories).Count -ne 3) { throw 'The governance library must define exactly three categories.' }

    $categoryIds = @($Manifest.categories | ForEach-Object { $_.id })
    if (($categoryIds | Sort-Object -Unique).Count -ne $categoryIds.Count) { throw 'Category IDs must be unique.' }

    $entries = @($Manifest.entries)
    if ($entries.Count -eq 0) { throw 'The governance manifest has no entries.' }

    foreach ($field in @('sequence', 'slug', 'pdf')) {
        $values = @($entries | ForEach-Object { $_.$field })
        if (($values | Sort-Object -Unique).Count -ne $values.Count) { throw "Entry field '$field' must be unique." }
    }

    foreach ($entry in $entries) {
        Assert-EntrySchema $entry
        foreach ($field in @('sequence','slug','category','title','summary','operatingMove','preview','pdf','pages','publishedLabel','lastModified')) {
            if ([string]::IsNullOrWhiteSpace([string]$entry.$field)) { throw "$($entry.slug): missing '$field'." }
        }
        if ([int]$entry.sequence -lt 1) { throw "$($entry.slug): sequence must be positive." }
        if ($entry.slug -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') { throw "$($entry.slug): slug must use lowercase words and hyphens." }
        if ($categoryIds -notcontains $entry.category) { throw "$($entry.slug): unknown category '$($entry.category)'." }
        if (@($entry.inside).Count -ne 3) { throw "$($entry.slug): 'inside' must contain exactly three expectations." }
        if (@($entry.sourcesHtml).Count -lt 2) { throw "$($entry.slug): at least two visible sources are required." }
        if ($entry.pdf -notmatch '^marco-policani-[a-z0-9-]+\.pdf$') { throw "$($entry.slug): PDF filename does not follow the public naming standard." }
        if ($entry.lastModified -notmatch '^\d{4}-\d{2}-\d{2}$') { throw "$($entry.slug): lastModified must be YYYY-MM-DD." }
        if (-not [string]::IsNullOrWhiteSpace([string]$entry.socialImage)) {
            if ($entry.socialImage -notmatch '^[a-z0-9-]+\.(?:png|jpg|jpeg|webp)$') { throw "$($entry.slug): invalid socialImage filename." }
            if (-not (Test-Path -LiteralPath (Join-Path $siteRoot "assets\$($entry.socialImage)"))) { throw "$($entry.slug): missing social image '$($entry.socialImage)'." }
        }

        $pdfPath = Join-Path $whitepapersPath $entry.pdf
        if (-not (Test-Path -LiteralPath $pdfPath)) { throw "$($entry.slug): missing PDF '$($entry.pdf)'." }
        $actualPages = Get-ActualPdfPages $pdfPath
        if ($actualPages -gt 0 -and $actualPages -ne [int]$entry.pages) {
            throw "$($entry.slug): manifest says $($entry.pages) pages; PDF has $actualPages."
        }
    }

    $expectedFiles = @($entries | ForEach-Object { "$($_.slug).html" })
    $orphanFiles = @(Get-ChildItem -LiteralPath $fieldNotesPath -Filter '*.html' | Where-Object { $expectedFiles -notcontains $_.Name })
    if ($orphanFiles.Count -gt 0) {
        throw "Field-note pages missing from the manifest: $($orphanFiles.Name -join ', ')."
    }
}

function Get-Category($Manifest, [string]$Id) {
    return @($Manifest.categories | Where-Object { $_.id -eq $Id })[0]
}

function Get-Lens([string]$CategoryId) {
    switch ($CategoryId) {
        'portfolio-delivery' { return @('OWNER', 'EVIDENCE', 'NEXT COMMITMENT') }
        'ai-governance' { return @('WORKFLOW', 'CONTROL EVIDENCE', 'HUMAN OWNER') }
        'work-judgment' { return @('HANDOFFS', 'LEARNING', 'RECOVERY') }
        default { throw "Unknown category '$CategoryId'." }
    }
}

function New-FieldNoteHtml($Manifest, $Entry) {
    $category = Get-Category $Manifest $Entry.category
    # Preserve apostrophes as entities in standalone note markup so regeneration
    # remains byte-stable with the established page template.
    $titleHtml = (Encode-Html $Entry.title).Replace("'", '&#39;')
    $summaryHtml = Encode-Html $Entry.summary
    $previewHtml = Encode-Html $Entry.preview
    $moveHtml = Encode-Html $Entry.operatingMove
    $categoryHtml = Encode-Html $category.label
    $insideHtml = (@($Entry.inside) | ForEach-Object { '<li>' + (Encode-Html $_) + '</li>' }) -join ''
    $lensHtml = (Get-Lens $Entry.category | ForEach-Object { '<span>' + (Encode-Html $_) + '</span>' }) -join ''
    $sourcesHtml = (@($Entry.sourcesHtml) | ForEach-Object { '<li>' + $_.Trim() + '</li>' }) -join "`n"
    $canonical = "https://policani.net/governance/field-notes/$($Entry.slug).html"
    $socialImage = if ([string]::IsNullOrWhiteSpace([string]$Entry.socialImage)) { 'social-card-1200x630.jpg' } else { $Entry.socialImage }
    $schema = '{"@context":"https://schema.org","@type":"Article","headline":"' + (Encode-JsonString $Entry.title) + '","description":"' + (Encode-JsonString $Entry.summary) + '","dateModified":"' + $Entry.lastModified + '","author":{"@type":"Person","name":"Marco Policani","url":"https://policani.net/"},"mainEntityOfPage":"' + $canonical + '"}'

    return @"
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>$titleHtml | Marco Policani</title>
<meta name="description" content="$summaryHtml">
<meta name="author" content="Marco Policani">
<meta name="robots" content="index, follow">
<meta property="og:title" content="$titleHtml | Marco Policani">
<meta property="og:description" content="$summaryHtml">
<meta property="og:type" content="article">
<meta property="og:url" content="$canonical">
<meta property="og:image" content="https://policani.net/assets/$socialImage">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="$canonical">
<link rel="icon" type="image/svg+xml" href="../../assets/favicon.svg">
<link rel="stylesheet" href="../../assets/portfolio-site.css?v=20260720-fieldnote-hero">
<script type="application/ld+json">$schema</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body class="field-note-page note-$($category.className)">
<a class="skip-link" href="#main">Skip to content</a>
<nav class="local-nav" aria-label="Top-level portfolio sections">
  <div class="nav-inner">
    <a class="nav-title" href="../../index.html">Marco Policani</a>
    <div class="nav-links">
      <a href="../../pmo-portfolio-governance-leader.html">Profile</a>
      <a href="../../operating-history.html">Cases</a>
      <a href="../../artifacts.html">Methods</a>
      <a href="../index.html" aria-current="page">Library</a>
      <a href="../../resources/">Labs</a>
      <a href="../../contact.html">Contact</a>
      <a class="nav-search-link" href="/search.html" aria-label="Search" title="Search"><span aria-hidden="true">⌕</span></a>
    </div>
  </div>
</nav>
<header class="hero" data-parallax-travel="200">
  <div class="portfolio-hero-filament-bg" aria-hidden="true"><canvas class="portfolio-hero-filament-canvas"></canvas></div>
  <div class="hero-inner">
    <div class="hero-copy">
      <p class="eyebrow"><a href="../index.html#$($category.id)">$categoryHtml</a> &middot; Field note</p>
      <h1>$titleHtml</h1>
      <p class="subhead">$summaryHtml</p>
    </div>
  </div>
</header>
<main id="main">
  <section class="field-note-briefing">
    <div class="section-inner">
      <div class="field-note-layout">
        <article class="field-note-tldr">
          <p class="section-kicker">TL;DR</p>
          <p class="field-note-thesis">$summaryHtml</p>
          <div class="field-note-context">
            <h2>What the paper develops</h2>
            <p>$previewHtml</p>
          </div>
          <div class="field-note-move">
            <h2>The operating move</h2>
            <p>$moveHtml</p>
            <div class="field-note-lens" aria-label="Decision lens">$lensHtml</div>
          </div>
          <div class="field-note-inside">
            <h2>Inside the white paper</h2>
            <ul>$insideHtml</ul>
          </div>
          <section class="field-note-sources-wrap" aria-labelledby="sources-heading">
            <h2 id="sources-heading">Sources and notes</h2>
            <ol class="field-note-sources">
$sourcesHtml
            </ol>
          </section>
        </article>
        <aside class="field-note-download">
          <p class="section-kicker">Go deeper</p>
          <h2>Read the full argument.</h2>
          <p>The white paper expands the briefing into a practical governance model, with context, evidence, and the complete reasoning.</p>
          <a class="button" href="../whitepapers/$($Entry.pdf)">Download the white paper ($($Entry.pages) pages)</a>
          <a class="text-link" href="../index.html#$($category.id)">Back to $categoryHtml</a>
        </aside>
      </div>
    </div>
  </section>
</main>
<footer>
  <div class="section-inner"><p class="field-note-footer-links"><span>Marco Policani</span><a href="../index.html">Governance library</a><a href="../../artifacts.html">Methods</a><a href="../../contact.html">Contact</a></p></div>
</footer>
<script src="../../assets/hero-parallax.js?v=20260715-ia" defer></script>
<script src="../../assets/portfolio-hero-filament.js?v=20260613-signalfield" defer></script>
<script src="../../assets/site-concierge.js?v=20260703-contact" defer></script>
<script data-goatcounter="https://policani.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</body>
</html>
"@
}

function New-LibraryCardHtml($Entry, $Category, [bool]$Featured) {
    $class = if ($Featured) { 'library-entry entry-feature' } else { 'library-entry' }
    $title = Encode-Html $Entry.title
    $summary = Encode-Html $Entry.summary
    $category = Encode-Html $Category.label
    $summaryParagraph = if ($Featured) { "<p>$summary</p>" } else { '' }
    return '<article class="' + $class + '" data-sequence="' + $Entry.sequence + '" data-category="' + $category + '" data-summary="' + $summary + '"><span class="entry-kicker">Field note · ' + (Encode-Html $Entry.publishedLabel) + '</span><h3><a href="field-notes/' + $Entry.slug + '.html">' + $title + '</a></h3>' + $summaryParagraph + '<div class="entry-links"><a href="field-notes/' + $Entry.slug + '.html">Read note</a><a href="whitepapers/' + $Entry.pdf + '">White paper</a></div></article>'
}

function Update-LibraryIndex($Manifest) {
    $html = [IO.File]::ReadAllText($libraryIndexPath)
    $total = @($Manifest.entries).Count
    $html = [regex]::Replace($html, 'Search all \d+ field notes', "Search all $total field notes")
    $html = [regex]::Replace($html, 'Showing all \d+ field notes\.', "Showing all $total field notes.")

    foreach ($category in $Manifest.categories) {
        $entries = @($Manifest.entries | Where-Object { $_.category -eq $category.id } | Sort-Object { [int]$_.sequence } -Descending)
        $cards = for ($i = 0; $i -lt $entries.Count; $i++) { New-LibraryCardHtml $entries[$i] $category ($i -eq 0) }
        $cardsHtml = $cards -join "`n"

        $pattern = '(?s)(<section id="' + [regex]::Escape($category.id) + '" class="library-chapter.*?<div class="editorial-grid">).*?(</div></div></section>)'
        $match = [regex]::Match($html, $pattern)
        if (-not $match.Success) { throw "Could not locate landing-page section '$($category.id)'." }
        $prefix = [regex]::Replace($match.Groups[1].Value, '<span class="chapter-count">\d+ field notes</span>', '<span class="chapter-count">' + $entries.Count + ' field notes</span>')
        $replacement = $prefix + "`n" + $cardsHtml + "`n" + $match.Groups[2].Value
        $html = $html.Substring(0, $match.Index) + $replacement + $html.Substring($match.Index + $match.Length)

        $navPattern = '(href="#' + [regex]::Escape($category.id) + '">[^<]+<span>)\d+(</span>)'
        $html = [regex]::Replace($html, $navPattern, '${1}' + $entries.Count + '${2}')
    }

    Write-Utf8 $libraryIndexPath $html
}

function Update-GovernanceSitemap($Manifest) {
    [xml]$xml = Get-Content -Raw -Encoding UTF8 -LiteralPath $sitemapPath
    $namespace = $xml.DocumentElement.NamespaceURI
    $manager = [Xml.XmlNamespaceManager]::new($xml.NameTable)
    $manager.AddNamespace('s', $namespace)

    foreach ($entry in $Manifest.entries) {
        foreach ($relative in @("field-notes/$($entry.slug).html", "whitepapers/$($entry.pdf)")) {
            $locValue = "https://policani.net/governance/$relative"
            $node = $xml.SelectSingleNode("//s:url[s:loc='$locValue']", $manager)
            if (-not $node) {
                $node = $xml.CreateElement('url', $namespace)
                $loc = $xml.CreateElement('loc', $namespace)
                $loc.InnerText = $locValue
                [void]$node.AppendChild($loc)
                $lastmod = $xml.CreateElement('lastmod', $namespace)
                [void]$node.AppendChild($lastmod)
                $changefreq = $xml.CreateElement('changefreq', $namespace)
                $changefreq.InnerText = 'monthly'
                [void]$node.AppendChild($changefreq)
                $priority = $xml.CreateElement('priority', $namespace)
                $priority.InnerText = if ($relative.StartsWith('field-notes/')) { '0.7' } else { '0.5' }
                [void]$node.AppendChild($priority)
                [void]$xml.DocumentElement.AppendChild($node)
            }
            $node.lastmod = [string]$entry.lastModified
        }
    }

    $settings = [Xml.XmlWriterSettings]::new()
    $settings.Indent = $true
    $settings.IndentChars = '  '
    $settings.Encoding = [Text.UTF8Encoding]::new($false)
    $settings.NewLineChars = "`n"
    $settings.NewLineHandling = [Xml.NewLineHandling]::Replace
    $writer = [Xml.XmlWriter]::Create($sitemapPath, $settings)
    $xml.Save($writer)
    $writer.Dispose()
}

function Update-LlmsIndex($Manifest) {
    $text = [IO.File]::ReadAllText($llmsPath)
    $start = '<!-- BEGIN GENERATED GOVERNANCE FIELD NOTES -->'
    $end = '<!-- END GENERATED GOVERNANCE FIELD NOTES -->'
    if (-not $text.Contains($start) -or -not $text.Contains($end)) {
        throw 'llms.txt is missing the generated governance-field-note markers.'
    }

    $lines = @($Manifest.entries | Sort-Object { [int]$_.sequence } -Descending | ForEach-Object {
        '- [' + $_.title + '](https://policani.net/governance/field-notes/' + $_.slug + '.html): ' + $_.summary
    })
    $replacement = $start + "`n" + ($lines -join "`n") + "`n" + $end
    $pattern = '(?s)' + [regex]::Escape($start) + '.*?' + [regex]::Escape($end)
    $text = [regex]::Replace($text, $pattern, [Text.RegularExpressions.MatchEvaluator]{ param($match) $replacement })
    Write-Utf8 $llmsPath $text
}

function Assert-GeneratedSurfaces($Manifest) {
    $entries = @($Manifest.entries)
    $landing = [IO.File]::ReadAllText($libraryIndexPath)
    $sitemap = [IO.File]::ReadAllText($sitemapPath)
    $llms = [IO.File]::ReadAllText($llmsPath)
    $generatedPages = @(Get-ChildItem -LiteralPath $fieldNotesPath -Filter '*.html')
    if ($generatedPages.Count -ne $entries.Count) { throw "Generated field-note count is $($generatedPages.Count); manifest count is $($entries.Count)." }
    if ($landing -notmatch "Search all $($entries.Count) field notes") { throw 'Governance landing total is out of sync.' }

    foreach ($category in $Manifest.categories) {
        $count = @($entries | Where-Object { $_.category -eq $category.id }).Count
        if ($landing -notmatch ('href="#' + [regex]::Escape($category.id) + '">[^<]+<span>' + $count + '</span>')) {
            throw "Governance landing count is out of sync for '$($category.id)'."
        }
    }

    foreach ($entry in $entries) {
        $pagePath = Join-Path $fieldNotesPath "$($entry.slug).html"
        if (-not (Test-Path -LiteralPath $pagePath)) { throw "$($entry.slug): generated field note is missing." }
        $page = [IO.File]::ReadAllText($pagePath)
        foreach ($required in @('What the paper develops', 'Inside the white paper', '<section class="field-note-sources-wrap"', "whitepapers/$($entry.pdf)")) {
            if (-not $page.Contains($required)) { throw "$($entry.slug): generated page is missing '$required'." }
        }
        if ($page.Contains('<details class="field-note-sources-wrap"')) { throw "$($entry.slug): sources must remain visible." }
        if (-not $landing.Contains("field-notes/$($entry.slug).html")) { throw "$($entry.slug): landing card is missing." }
        if (-not $sitemap.Contains("field-notes/$($entry.slug).html") -or -not $sitemap.Contains("whitepapers/$($entry.pdf)")) { throw "$($entry.slug): sitemap entries are missing." }
        if (-not $llms.Contains("field-notes/$($entry.slug).html")) { throw "$($entry.slug): llms.txt entry is missing." }
    }
}

function Build-SiteContent {
    $manifest = Read-LibraryManifest
    Assert-LibraryManifest $manifest

    foreach ($entry in $manifest.entries) {
        $html = New-FieldNoteHtml $manifest $entry
        Write-Utf8 (Join-Path $fieldNotesPath "$($entry.slug).html") $html
    }
    Update-LibraryIndex $manifest
    Update-GovernanceSitemap $manifest
    Update-LlmsIndex $manifest
    Write-Host "==> Governance library built from manifest: $(@($manifest.entries).Count) entries."
}

function Add-WhitepaperEntry {
    if ([string]::IsNullOrWhiteSpace($Spec)) { throw 'AddWhitepaper requires -Spec path-to-entry.json.' }
    $specPath = (Resolve-Path -LiteralPath $Spec).Path
    $entry = Get-Content -Raw -Encoding UTF8 -LiteralPath $specPath | ConvertFrom-Json
    $originalManifestText = [IO.File]::ReadAllText($manifestPath)
    $manifest = Read-LibraryManifest

    if ([string]::IsNullOrWhiteSpace([string]$entry.sequence)) {
        $entry | Add-Member -NotePropertyName sequence -NotePropertyValue ((@($manifest.entries | ForEach-Object { [int]$_.sequence }) | Measure-Object -Maximum).Maximum + 1)
    }
    if ([string]::IsNullOrWhiteSpace([string]$entry.lastModified)) {
        $entry | Add-Member -NotePropertyName lastModified -NotePropertyValue (Get-Date -Format 'yyyy-MM-dd') -Force
    }
    if ([string]::IsNullOrWhiteSpace([string]$entry.publishedLabel)) {
        $entry | Add-Member -NotePropertyName publishedLabel -NotePropertyValue (Get-Date -Format 'MMM yyyy') -Force
    }

    if (@($manifest.entries | Where-Object { $_.slug -eq $entry.slug -or $_.pdf -eq $entry.pdf }).Count -gt 0) {
        throw "An entry with slug '$($entry.slug)' or PDF '$($entry.pdf)' already exists."
    }

    $fieldNoteDestination = Join-Path $fieldNotesPath "$($entry.slug).html"
    if (Test-Path -LiteralPath $fieldNoteDestination) {
        throw "A field-note page already exists for slug '$($entry.slug)'."
    }

    $copiedPdf = $false
    $destination = $null
    if (-not [string]::IsNullOrWhiteSpace($Pdf)) {
        $pdfSource = (Resolve-Path -LiteralPath $Pdf).Path
        if ([string]::IsNullOrWhiteSpace([string]$entry.pdf)) {
            $entry | Add-Member -NotePropertyName pdf -NotePropertyValue ([IO.Path]::GetFileName($pdfSource)) -Force
        }
        $destination = Join-Path $whitepapersPath $entry.pdf
        if ((Resolve-Path -LiteralPath $pdfSource).Path -ne [IO.Path]::GetFullPath($destination)) {
            if (Test-Path -LiteralPath $destination) {
                throw "The destination PDF '$($entry.pdf)' already exists."
            }
            Copy-Item -LiteralPath $pdfSource -Destination $destination
            $copiedPdf = $true
        }
    }

    try {
        $manifest.entries = @($manifest.entries) + $entry | Sort-Object { [int]$_.sequence } -Descending
        $manifest.updated = Get-Date -Format 'yyyy-MM-dd'
        Assert-LibraryManifest $manifest
        Write-Utf8 $manifestPath ($manifest | ConvertTo-Json -Depth 12)
        Build-SiteContent
    } catch {
        $intakeError = $_
        Write-Utf8 $manifestPath $originalManifestText
        if (Test-Path -LiteralPath $fieldNoteDestination) {
            Remove-Item -LiteralPath $fieldNoteDestination -Force
        }
        if ($copiedPdf -and (Test-Path -LiteralPath $destination)) {
            Remove-Item -LiteralPath $destination -Force
        }
        try { Build-SiteContent } catch { Write-Warning 'The prior generated surfaces could not be restored automatically.' }
        throw $intakeError
    }
    Write-Host ''
    Write-Host '==> White paper added. Review locally, then run:'
    Write-Host '    .\publish.ps1 -DryRun'
}

Set-Location -LiteralPath $siteRoot
switch ($Action) {
    'Build' { Build-SiteContent }
    'Check' {
        $manifest = Read-LibraryManifest
        Assert-LibraryManifest $manifest
        Assert-GeneratedSurfaces $manifest
        Write-Host "==> Site content is synchronized and valid: $(@($manifest.entries).Count) governance entries."
    }
    'AddWhitepaper' { Add-WhitepaperEntry }
}
