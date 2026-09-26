<#
  Builds the static Pagefind index served by policani.net.

  Self-canonical public HTML and manifest-backed governance PDFs define the
  discoverable corpus. The build synchronizes sitemap.xml from that inventory,
  then indexes HTML from its <main> element (or <body> fallback). Governance
  PDFs are converted to text only while building; the extracted text is not
  published separately.
#>

[CmdletBinding()]
param(
    [ValidateSet('Build', 'Check')]
    [string]$Action = 'Build'
)

$ErrorActionPreference = 'Stop'
$siteRoot = $PSScriptRoot
$sitemapPath = Join-Path $siteRoot 'sitemap.xml'
$manifestPath = Join-Path $siteRoot 'content\governance-library.json'
$searchScriptPath = Join-Path $siteRoot 'assets\site-search.js'
$searchPagePath = Join-Path $siteRoot 'search.html'
$libraryIndexPath = Join-Path $siteRoot 'governance\index.html'
$indexPath = Join-Path $siteRoot 'pagefind'
$coveragePath = Join-Path $indexPath 'policani-search-manifest.json'

$pagefindVersion = '1.5.2'
$pagefindArchive = "pagefind-v$pagefindVersion-x86_64-pc-windows-msvc.tar.gz"
$pagefindSha256 = 'fab125d5e8e2d3481ffe7d36dec6e101f54a6581cd51cf5e2e09220d4bc78e9c'
$pagefindUrl = "https://github.com/Pagefind/pagefind/releases/download/v$pagefindVersion/$pagefindArchive"

function Write-Utf8([string]$Path, [string]$Content) {
    [IO.File]::WriteAllText($Path, $Content, [Text.UTF8Encoding]::new($false))
}

function Get-StringSha256([string]$Content) {
    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        $hash = $sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Content))
        return -join @($hash | ForEach-Object { $_.ToString('x2') })
    } finally {
        $sha.Dispose()
    }
}

function Encode-HtmlAttribute([string]$Value) {
    return [Net.WebUtility]::HtmlEncode($Value)
}

function Get-MetaContent([string]$Html, [string]$Name) {
    foreach ($tagMatch in [regex]::Matches($Html, '<meta\b[^>]*>', 'IgnoreCase')) {
        $tag = $tagMatch.Value
        $nameMatch = [regex]::Match($tag, '\bname\s*=\s*(?:"([^"]*)"|''([^'']*)'')', 'IgnoreCase')
        $metaName = if ($nameMatch.Groups[1].Success) { $nameMatch.Groups[1].Value } else { $nameMatch.Groups[2].Value }
        if ($metaName -ne $Name) { continue }
        $contentMatch = [regex]::Match($tag, '\bcontent\s*=\s*(?:"([^"]*)"|''([^'']*)'')', 'IgnoreCase')
        if ($contentMatch.Success) {
            return [Net.WebUtility]::HtmlDecode($(if ($contentMatch.Groups[1].Success) { $contentMatch.Groups[1].Value } else { $contentMatch.Groups[2].Value }))
        }
    }
    return ''
}

function Get-CanonicalHref([string]$Html) {
    foreach ($tagMatch in [regex]::Matches($Html, '<link\b[^>]*>', 'IgnoreCase')) {
        $tag = $tagMatch.Value
        $relMatch = [regex]::Match($tag, '\brel\s*=\s*(?:"([^"]*)"|''([^'']*)'')', 'IgnoreCase')
        $rel = if ($relMatch.Groups[1].Success) { $relMatch.Groups[1].Value } else { $relMatch.Groups[2].Value }
        if (@($rel -split '\s+' | Where-Object { $_ -eq 'canonical' }).Count -eq 0) { continue }
        $hrefMatch = [regex]::Match($tag, '\bhref\s*=\s*(?:"([^"]*)"|''([^'']*)'')', 'IgnoreCase')
        if ($hrefMatch.Success) {
            return [Net.WebUtility]::HtmlDecode($(if ($hrefMatch.Groups[1].Success) { $hrefMatch.Groups[1].Value } else { $hrefMatch.Groups[2].Value }))
        }
    }
    return ''
}

function Get-DocumentTitle([string]$Html) {
    $heading = [regex]::Match($Html, '<h1\b[^>]*>(.*?)</h1>', 'IgnoreCase, Singleline')
    if ($heading.Success) {
        return [Net.WebUtility]::HtmlDecode(([regex]::Replace($heading.Groups[1].Value, '<[^>]+>', ' '))).Trim()
    }
    $title = [regex]::Match($Html, '<title\b[^>]*>(.*?)</title>', 'IgnoreCase, Singleline')
    if ($title.Success) {
        return [Net.WebUtility]::HtmlDecode(([regex]::Replace($title.Groups[1].Value, '<[^>]+>', ' '))).Trim()
    }
    return ''
}

function Get-PageType([string]$UrlPath) {
    if ($UrlPath -like '/governance/field-notes/*') { return 'Field note' }
    if ($UrlPath -like '/engagements/*') { return 'Case study' }
    if ($UrlPath -like '/walkthroughs/*') { return 'Walkthrough' }
    if ($UrlPath -like '/resources/*' -or $UrlPath -in @('/job-boards-scanner.html', '/hero-banner-lab.html', '/orbit-raiders.html', '/kytherion-drift/')) { return 'Lab' }
    if ($UrlPath -eq '/governance/') { return 'Insights' }
    if ($UrlPath -in @('/artifacts.html', '/modules.html')) { return 'Methods' }
    if ($UrlPath -eq '/operating-history.html') { return 'Case study' }
    if ($UrlPath -eq '/pmo-portfolio-governance-leader.html') { return 'Role fit' }
    if ($UrlPath -eq '/contact.html') { return 'Contact' }
    return 'Portfolio'
}

function Get-PublicRecords {
    $records = @()
    $rootPrefix = [IO.Path]::GetFullPath($siteRoot).TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
    $htmlFiles = @(Get-ChildItem -LiteralPath $siteRoot -Recurse -File -Filter '*.html' | Where-Object {
        $relative = [IO.Path]::GetFullPath($_.FullName).Substring($rootPrefix.Length).Replace([IO.Path]::DirectorySeparatorChar, '/')
        $relative -notmatch '^(?:\.git|\.site-tools|pagefind)(?:/|$)'
    })

    foreach ($file in $htmlFiles) {
        $relativeUrlPath = [IO.Path]::GetFullPath($file.FullName).Substring($rootPrefix.Length).Replace([IO.Path]::DirectorySeparatorChar, '/')
        if ($relativeUrlPath -match '^google[a-z0-9]+\.html$') { continue }

        $html = [IO.File]::ReadAllText($file.FullName)
        $robots = Get-MetaContent $html 'robots'
        if ($robots -match '(?i)(?:^|[,\s])noindex(?:[,\s]|$)') { continue }

        $canonical = Get-CanonicalHref $html
        if ([string]::IsNullOrWhiteSpace($canonical)) {
            throw "$relativeUrlPath must declare a self-canonical URL or use robots noindex."
        }
        try { $canonicalUri = [uri]$canonical } catch { throw "$relativeUrlPath has an invalid canonical URL: $canonical" }
        if (-not $canonicalUri.IsAbsoluteUri -or $canonicalUri.Scheme -ne 'https' -or $canonicalUri.Host -ne 'policani.net') {
            throw "$relativeUrlPath canonical URL must use https://policani.net/: $canonical"
        }

        $expectedUrl = if ($relativeUrlPath -eq 'index.html') {
            '/'
        } elseif ($relativeUrlPath.EndsWith('/index.html')) {
            '/' + $relativeUrlPath.Substring(0, $relativeUrlPath.Length - 'index.html'.Length)
        } else {
            '/' + $relativeUrlPath
        }
        if ($canonicalUri.AbsolutePath -ne $expectedUrl) {
            # Canonical aliases remain reachable but should not compete with the
            # destination page in either search or the sitemap.
            continue
        }
        $records += [pscustomobject]@{
            Kind = 'html'
            Url = $expectedUrl
            RelativePath = $relativeUrlPath.Replace('/', [IO.Path]::DirectorySeparatorChar)
        }
    }

    $manifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $manifestPath | ConvertFrom-Json
    foreach ($entry in $manifest.entries) {
        $pdfName = [string]$entry.pdf
        if ([string]::IsNullOrWhiteSpace($pdfName)) { throw "$($entry.slug): manifest PDF is missing." }
        $relativeUrlPath = "governance/whitepapers/$pdfName"
        $records += [pscustomobject]@{
            Kind = 'pdf'
            Url = '/' + $relativeUrlPath
            RelativePath = $relativeUrlPath.Replace('/', [IO.Path]::DirectorySeparatorChar)
        }
    }

    $duplicates = @($records | Group-Object Url | Where-Object Count -gt 1 | ForEach-Object Name)
    if ($duplicates.Count) { throw "Public content discovery produced duplicate URLs: $($duplicates -join ', ')." }
    return @($records | Sort-Object Kind, Url)
}

function Get-SitemapUrls {
    [xml]$xml = [IO.File]::ReadAllText($sitemapPath)
    return @($xml.urlset.url.loc | ForEach-Object { ([uri]([string]$_)).AbsolutePath })
}

function Assert-SitemapCoverage($Records) {
    $expected = @($Records | ForEach-Object Url | Sort-Object -Unique)
    $actual = @(Get-SitemapUrls)
    $duplicates = @($actual | Group-Object | Where-Object Count -gt 1 | ForEach-Object Name)
    $missing = @($expected | Where-Object { $actual -notcontains $_ })
    $extra = @($actual | Sort-Object -Unique | Where-Object { $expected -notcontains $_ })
    if ($duplicates.Count -or $missing.Count -or $extra.Count) {
        throw "Sitemap differs from discovered public content. Missing: $($missing -join ', '); extra: $($extra -join ', '); duplicates: $($duplicates -join ', '). Run .\build-search.ps1 -Action Build."
    }
}

function Get-ChangedRepositoryPaths {
    $changed = @(& git -C $siteRoot diff --name-only --diff-filter=ACMRTUXB HEAD --)
    if ($LASTEXITCODE -ne 0) { throw 'Could not inspect changed files for sitemap lastmod synchronization.' }
    $untracked = @(& git -C $siteRoot ls-files --others --exclude-standard)
    if ($LASTEXITCODE -ne 0) { throw 'Could not inspect new files for sitemap lastmod synchronization.' }
    $lookup = @{}
    foreach ($path in @($changed) + @($untracked)) {
        if (-not [string]::IsNullOrWhiteSpace([string]$path)) {
            $lookup[[string]$path.Replace('\', '/')] = $true
        }
    }
    return $lookup
}

function Sync-Sitemap($Records) {
    [xml]$xml = [IO.File]::ReadAllText($sitemapPath)
    $namespace = $xml.DocumentElement.NamespaceURI
    $manager = [Xml.XmlNamespaceManager]::new($xml.NameTable)
    $manager.AddNamespace('s', $namespace)
    $expected = @{}
    foreach ($record in $Records) { $expected[[string]$record.Url] = $record }
    $seen = @{}
    $changed = $false
    $today = Get-Date -Format 'yyyy-MM-dd'
    $changedPaths = Get-ChangedRepositoryPaths

    foreach ($node in @($xml.SelectNodes('//s:url', $manager))) {
        $url = ([uri]([string]$node.loc)).AbsolutePath
        if (-not $expected.ContainsKey($url) -or $seen.ContainsKey($url)) {
            [void]$xml.DocumentElement.RemoveChild($node)
            $changed = $true
            continue
        }
        $seen[$url] = $true
        $record = $expected[$url]
        $relativePath = ([string]$record.RelativePath).Replace('\', '/')
        if ($changedPaths.ContainsKey($relativePath) -and [string]$node.lastmod -ne $today) {
            if ($node.lastmod) {
                $node.lastmod = $today
            } else {
                $lastmod = $xml.CreateElement('lastmod', $namespace)
                $lastmod.InnerText = $today
                [void]$node.AppendChild($lastmod)
            }
            $changed = $true
        }
    }

    foreach ($record in @($Records | Sort-Object Kind, Url)) {
        if ($seen.ContainsKey([string]$record.Url)) { continue }
        $node = $xml.CreateElement('url', $namespace)
        $loc = $xml.CreateElement('loc', $namespace)
        $loc.InnerText = 'https://policani.net' + [string]$record.Url
        [void]$node.AppendChild($loc)
        $lastmod = $xml.CreateElement('lastmod', $namespace)
        $lastmod.InnerText = $today
        [void]$node.AppendChild($lastmod)
        $changefreq = $xml.CreateElement('changefreq', $namespace)
        $changefreq.InnerText = 'monthly'
        [void]$node.AppendChild($changefreq)
        $priority = $xml.CreateElement('priority', $namespace)
        $priority.InnerText = if ($record.Kind -eq 'pdf') { '0.5' } else { '0.7' }
        [void]$node.AppendChild($priority)
        [void]$xml.DocumentElement.AppendChild($node)
        $seen[[string]$record.Url] = $true
        $changed = $true
    }

    if ($changed) {
        $settings = [Xml.XmlWriterSettings]::new()
        $settings.Indent = $true
        $settings.IndentChars = '  '
        $settings.Encoding = [Text.UTF8Encoding]::new($false)
        $settings.NewLineChars = "`n"
        $settings.NewLineHandling = [Xml.NewLineHandling]::Replace
        $writer = [Xml.XmlWriter]::Create($sitemapPath, $settings)
        try { $xml.Save($writer) } finally { $writer.Dispose() }
        Write-Host '==> Sitemap synchronized from self-canonical public content.'
    }
    Assert-SitemapCoverage $Records
}

function Get-PagefindExecutable {
    if (-not $IsWindows -and $PSVersionTable.PSEdition -eq 'Core') {
        throw 'build-search.ps1 currently pins the Windows x64 Pagefind binary used by this project.'
    }
    $toolPath = Join-Path $siteRoot ".site-tools\pagefind\v$pagefindVersion"
    $executable = Join-Path $toolPath 'pagefind.exe'
    if (Test-Path -LiteralPath $executable) { return $executable }

    New-Item -ItemType Directory -Path $toolPath -Force | Out-Null
    $archivePath = Join-Path $toolPath $pagefindArchive
    Write-Host "==> Downloading Pagefind v$pagefindVersion"
    Invoke-WebRequest -UseBasicParsing -Uri $pagefindUrl -OutFile $archivePath
    $actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $archivePath).Hash.ToLowerInvariant()
    if ($actualHash -ne $pagefindSha256) {
        Remove-Item -LiteralPath $archivePath -Force
        throw "Pagefind archive checksum mismatch. Expected $pagefindSha256; received $actualHash."
    }
    & tar -xzf $archivePath -C $toolPath
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $executable)) {
        throw 'Pagefind could not be extracted.'
    }
    Remove-Item -LiteralPath $archivePath -Force
    return $executable
}

function Get-PdfTextExecutable {
    $command = Get-Command pdftotext -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }
    $candidates = @(
        (Join-Path $env:ProgramFiles 'Git\mingw64\bin\pdftotext.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Git\mingw64\bin\pdftotext.exe')
    )
    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate) { return $candidate }
    }
    throw 'pdftotext is required to index public PDFs. Install Git for Windows with its bundled PDF utility or place pdftotext on PATH.'
}

function Get-SearchFingerprint($Records) {
    $parts = foreach ($record in $Records) {
        $path = Join-Path $siteRoot $record.RelativePath
        if ($record.Url -eq '/governance/') {
            $content = [IO.File]::ReadAllText($path)
            $content = [regex]::Replace($content, 'assets/governance-library\.js\?v=[^"'']+', 'assets/governance-library.js?v=generated')
            $contentHash = Get-StringSha256 $content
            "$($record.Kind):$($record.Url):$contentHash"
        } else {
            "$($record.Kind):$($record.Url):$((Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash)"
        }
    }
    $script = [IO.File]::ReadAllText($searchScriptPath)
    $script = [regex]::Replace($script, 'const SEARCH_INDEX_VERSION = "[^"]+";', 'const SEARCH_INDEX_VERSION = "generated";')
    $page = [IO.File]::ReadAllText($searchPagePath)
    $page = [regex]::Replace($page, 'assets/site-search\.js\?v=[^"'']+', 'assets/site-search.js?v=generated')
    $page = [regex]::Replace($page, 'assets/portfolio-site\.css\?v=[^"'']+', 'assets/portfolio-site.css?v=generated')
    $parts += "pagefind:$pagefindVersion"
    $parts += "script:$script"
    $parts += "page:$page"
    $parts += "styles:$((Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $siteRoot 'assets\portfolio-site.css')).Hash)"
    $parts += "library-ui:$((Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $siteRoot 'assets\governance-library.js')).Hash)"
    $parts += "builder:$((Get-FileHash -Algorithm SHA256 -LiteralPath $PSCommandPath).Hash)"
    $parts += "manifest:$((Get-FileHash -Algorithm SHA256 -LiteralPath $manifestPath).Hash)"
    return (Get-StringSha256 ($parts -join "`n")).Substring(0, 12)
}

function Update-SearchAssetVersion([string]$Fingerprint) {
    $script = [IO.File]::ReadAllText($searchScriptPath)
    $updatedScript = [regex]::Replace($script, 'const SEARCH_INDEX_VERSION = "[^"]+";', "const SEARCH_INDEX_VERSION = `"$Fingerprint`";")
    if ($updatedScript -eq $script -and $script -notmatch "const SEARCH_INDEX_VERSION = `"$Fingerprint`";") {
        throw 'assets/site-search.js is missing SEARCH_INDEX_VERSION.'
    }
    Write-Utf8 $searchScriptPath $updatedScript

    $page = [IO.File]::ReadAllText($searchPagePath)
    $updatedPage = [regex]::Replace($page, 'assets/site-search\.js\?v=[^"'']+', "assets/site-search.js?v=$Fingerprint")
    $updatedPage = [regex]::Replace($updatedPage, 'assets/portfolio-site\.css\?v=[^"'']+', "assets/portfolio-site.css?v=$Fingerprint")
    if ($updatedPage -eq $page -and $page -notmatch "assets/site-search\.js\?v=$Fingerprint") {
        throw 'search.html is missing the versioned site-search.js reference.'
    }
    Write-Utf8 $searchPagePath $updatedPage

    $libraryPage = [IO.File]::ReadAllText($libraryIndexPath)
    $updatedLibraryPage = [regex]::Replace($libraryPage, 'assets/governance-library\.js\?v=[^"'']+', "assets/governance-library.js?v=$Fingerprint")
    if ($updatedLibraryPage -eq $libraryPage -and $libraryPage -notmatch "assets/governance-library\.js\?v=$Fingerprint") {
        throw 'governance/index.html is missing the versioned governance-library.js reference.'
    }
    Write-Utf8 $libraryIndexPath $updatedLibraryPage
}

function Assert-SearchIndex($Records) {
    if (-not (Test-Path -LiteralPath $coveragePath)) { throw 'Search coverage manifest is missing. Run .\build-search.ps1 first.' }
    foreach ($required in @('pagefind.js', 'pagefind-entry.json')) {
        if (-not (Test-Path -LiteralPath (Join-Path $indexPath $required))) { throw "Pagefind output is missing $required." }
    }
    $coverage = Get-Content -Raw -Encoding UTF8 -LiteralPath $coveragePath | ConvertFrom-Json
    if ([string]$coverage.pagefindVersion -ne $pagefindVersion) { throw 'The generated search index uses the wrong Pagefind version.' }
    $expectedFingerprint = Get-SearchFingerprint $Records
    if ([string]$coverage.fingerprint -ne $expectedFingerprint) {
        throw "Search index content is stale. Expected fingerprint $expectedFingerprint; found $($coverage.fingerprint). Run .\build-search.ps1."
    }

    $expectedHtml = @($Records | Where-Object Kind -eq 'html' | ForEach-Object Url | Sort-Object -Unique)
    $expectedPdf = @($Records | Where-Object Kind -eq 'pdf' | ForEach-Object Url | Sort-Object -Unique)
    $indexedHtml = @($coverage.htmlUrls | Sort-Object -Unique)
    $indexedPdf = @($coverage.pdfUrls | Sort-Object -Unique)
    $missingHtml = @($expectedHtml | Where-Object { $indexedHtml -notcontains $_ })
    $extraHtml = @($indexedHtml | Where-Object { $expectedHtml -notcontains $_ })
    $missingPdf = @($expectedPdf | Where-Object { $indexedPdf -notcontains $_ })
    $extraPdf = @($indexedPdf | Where-Object { $expectedPdf -notcontains $_ })
    if ($missingHtml.Count -or $extraHtml.Count -or $missingPdf.Count -or $extraPdf.Count) {
        throw "Search coverage differs from discovered public content. Missing HTML: $($missingHtml -join ', '); extra HTML: $($extraHtml -join ', '); missing PDFs: $($missingPdf -join ', '); extra PDFs: $($extraPdf -join ', ')."
    }

    $allUrls = @($indexedHtml) + @($indexedPdf)
    $duplicates = @($allUrls | Group-Object | Where-Object Count -gt 1 | ForEach-Object Name)
    if ($duplicates.Count) { throw "Search index has duplicate result URLs: $($duplicates -join ', ')." }
    $entry = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $indexPath 'pagefind-entry.json') | ConvertFrom-Json
    $indexedPageCount = @($entry.languages.psobject.Properties | ForEach-Object { [int]$_.Value.page_count } | Measure-Object -Sum).Sum
    if ($indexedPageCount -ne $allUrls.Count) {
        throw "Pagefind indexed $indexedPageCount results, but the discovered public corpus contains $($allUrls.Count)."
    }
    Write-Host "==> Search index valid: $($indexedHtml.Count) HTML pages and $($indexedPdf.Count) PDFs."
}

function Build-SearchIndex($Records) {
    $fingerprint = Get-SearchFingerprint $Records
    if (Test-Path -LiteralPath $coveragePath) {
        try {
            $existingCoverage = Get-Content -Raw -Encoding UTF8 -LiteralPath $coveragePath | ConvertFrom-Json
            if ([string]$existingCoverage.fingerprint -eq $fingerprint) {
                Assert-SearchIndex $Records
                Update-SearchAssetVersion $fingerprint
                Write-Host "==> Search content unchanged; retained verified index $fingerprint."
                return
            }
        } catch {
            Write-Warning "Existing search index could not be reused: $($_.Exception.Message)"
        }
    }

    $pagefind = Get-PagefindExecutable
    $pdftotext = Get-PdfTextExecutable
    $manifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $manifestPath | ConvertFrom-Json
    $categories = @{}
    foreach ($category in $manifest.categories) { $categories[[string]$category.id] = [string]$category.label }
    $entriesBySlug = @{}
    $entriesByPdf = @{}
    foreach ($entry in $manifest.entries) {
        $entriesBySlug[[string]$entry.slug] = $entry
        $entriesByPdf[[string]$entry.pdf] = $entry
    }

    $tempBase = [IO.Path]::GetTempPath()
    $stagePath = Join-Path $tempBase ("policani-search-" + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $stagePath | Out-Null
    try {
        foreach ($record in @($Records | Where-Object Kind -eq 'html')) {
            $source = Join-Path $siteRoot $record.RelativePath
            if (-not (Test-Path -LiteralPath $source)) { throw "Discovered public HTML file is missing: $($record.Url)" }
            $destination = Join-Path $stagePath $record.RelativePath
            New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
            $html = [IO.File]::ReadAllText($source)
            $title = Get-DocumentTitle $html
            $hadHeading = $html -match '<h1\b'
            if ($html -match '<main\b') {
                $html = [regex]::Replace($html, '<main\b', '<main data-pagefind-body', 'IgnoreCase', [timespan]::FromSeconds(1))
            } elseif ($html -match '<body\b') {
                $html = [regex]::Replace($html, '<body\b', '<body data-pagefind-body', 'IgnoreCase', [timespan]::FromSeconds(1))
            } else {
                throw "$($record.Url) has no <main> or <body> element for search indexing."
            }
            $type = Get-PageType $record.Url
            $summary = Get-MetaContent $html 'description'
            if (-not $hadHeading) {
                $fallback = "<section><h1>$(Encode-HtmlAttribute $title)</h1><p>$(Encode-HtmlAttribute $summary)</p></section>"
                $html = [regex]::Replace($html, '(<(?:main|body)\b[^>]*data-pagefind-body[^>]*>)', ('$1' + $fallback), 'IgnoreCase')
            }
            $category = ''
            if ($record.Url -match '^/governance/field-notes/([^/]+)\.html$' -and $entriesBySlug.ContainsKey($Matches[1])) {
                $entry = $entriesBySlug[$Matches[1]]
                $category = $categories[[string]$entry.category]
            }
            $metadata = @(
                "<meta data-pagefind-meta=`"title[content]`" content=`"$(Encode-HtmlAttribute $title)`">",
                "<meta data-pagefind-meta=`"type[content]`" data-pagefind-filter=`"type[content]`" content=`"$(Encode-HtmlAttribute $type)`">",
                "<meta data-pagefind-meta=`"summary[content]`" content=`"$(Encode-HtmlAttribute $summary)`">",
                "<meta data-pagefind-meta=`"resultUrl[content]`" content=`"$(Encode-HtmlAttribute $record.Url)`">"
            )
            if ($category) {
                $metadata += "<meta data-pagefind-meta=`"category[content]`" data-pagefind-filter=`"category[content]`" content=`"$(Encode-HtmlAttribute $category)`">"
            }
            $html = [regex]::Replace($html, '</head>', (($metadata -join "`n") + "`n</head>"), 'IgnoreCase')
            Write-Utf8 $destination $html
        }

        $pdfStage = Join-Path $stagePath '_pdf'
        New-Item -ItemType Directory -Path $pdfStage -Force | Out-Null
        foreach ($record in @($Records | Where-Object Kind -eq 'pdf')) {
            $source = Join-Path $siteRoot $record.RelativePath
            if (-not (Test-Path -LiteralPath $source)) { throw "Manifest-backed public PDF file is missing: $($record.Url)" }
            $pdfName = [IO.Path]::GetFileName($source)
            if (-not $entriesByPdf.ContainsKey($pdfName)) { throw "Public PDF has no governance manifest entry: $pdfName" }
            $entry = $entriesByPdf[$pdfName]
            $textPath = Join-Path $stagePath ("pdf-text-" + [guid]::NewGuid().ToString('N') + '.txt')
            & $pdftotext -enc UTF-8 -nopgbrk $source $textPath
            if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $textPath)) { throw "Text extraction failed for $pdfName." }
            $pdfText = [IO.File]::ReadAllText($textPath).Replace([char]0, ' ')
            Remove-Item -LiteralPath $textPath -Force
            if ([string]::IsNullOrWhiteSpace($pdfText)) { throw "No searchable text was extracted from $pdfName." }
            $category = $categories[[string]$entry.category]
            $stub = @"
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta data-pagefind-meta="type[content]" data-pagefind-filter="type[content]" content="White paper">
<meta data-pagefind-meta="summary[content]" content="$(Encode-HtmlAttribute ([string]$entry.summary))">
<meta data-pagefind-meta="resultUrl[content]" content="$(Encode-HtmlAttribute $record.Url)">
<meta data-pagefind-meta="category[content]" data-pagefind-filter="category[content]" content="$(Encode-HtmlAttribute $category)">
<title>$(Encode-HtmlAttribute ([string]$entry.title)) | White paper</title>
</head>
<body>
<main data-pagefind-body>
<h1>$(Encode-HtmlAttribute ([string]$entry.title))</h1>
<p>$(Encode-HtmlAttribute ([string]$entry.summary))</p>
<div>$(Encode-HtmlAttribute $pdfText)</div>
</main>
</body>
</html>
"@
            Write-Utf8 (Join-Path $pdfStage (([string]$entry.slug) + '.html')) $stub
        }

        & $pagefind --site $stagePath --output-subdir pagefind
        if ($LASTEXITCODE -ne 0) { throw 'Pagefind index generation failed.' }
        $stageIndex = Join-Path $stagePath 'pagefind'
        if (-not (Test-Path -LiteralPath (Join-Path $stageIndex 'pagefind.js'))) { throw 'Pagefind did not produce its browser search module.' }
        foreach ($unusedUiAsset in @(
            'pagefind-component-ui.css',
            'pagefind-component-ui.js',
            'pagefind-highlight.js',
            'pagefind-modular-ui.css',
            'pagefind-modular-ui.js',
            'pagefind-ui.css',
            'pagefind-ui.js'
        )) {
            $unusedPath = Join-Path $stageIndex $unusedUiAsset
            if (Test-Path -LiteralPath $unusedPath) { Remove-Item -LiteralPath $unusedPath -Force }
        }

        $coverage = [ordered]@{
            schemaVersion = 1
            pagefindVersion = $pagefindVersion
            fingerprint = $fingerprint
            htmlUrls = @($Records | Where-Object Kind -eq 'html' | ForEach-Object Url | Sort-Object -Unique)
            pdfUrls = @($Records | Where-Object Kind -eq 'pdf' | ForEach-Object Url | Sort-Object -Unique)
        }
        Write-Utf8 (Join-Path $stageIndex 'policani-search-manifest.json') ($coverage | ConvertTo-Json -Depth 4)

        $resolvedSite = [IO.Path]::GetFullPath($siteRoot).TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
        $resolvedIndex = [IO.Path]::GetFullPath($indexPath)
        if (-not $resolvedIndex.StartsWith($resolvedSite, [StringComparison]::OrdinalIgnoreCase)) { throw 'Refusing to replace a search index outside the site repository.' }
        if (Test-Path -LiteralPath $indexPath) { Remove-Item -LiteralPath $indexPath -Recurse -Force }
        Copy-Item -LiteralPath $stageIndex -Destination $indexPath -Recurse
        Update-SearchAssetVersion $fingerprint
    } finally {
        $resolvedTemp = [IO.Path]::GetFullPath($tempBase).TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
        $resolvedStage = [IO.Path]::GetFullPath($stagePath)
        if ((Test-Path -LiteralPath $stagePath) -and $resolvedStage.StartsWith($resolvedTemp, [StringComparison]::OrdinalIgnoreCase)) {
            Remove-Item -LiteralPath $stagePath -Recurse -Force
        }
    }
    Assert-SearchIndex $Records
}

Set-Location -LiteralPath $siteRoot
$records = Get-PublicRecords
if ($Action -eq 'Check') {
    Assert-SitemapCoverage $records
    Assert-SearchIndex $records
} else {
    Sync-Sitemap $records
    Build-SearchIndex $records
}
