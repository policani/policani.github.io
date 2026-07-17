$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $PSScriptRoot 'index.html'
$notesPath = Join-Path $PSScriptRoot 'field-notes'
$index = [IO.File]::ReadAllText($indexPath)

$moves = @{
  'ai-adoption-starts-with-the-constraint.html' = 'Before buying or piloting anything, name the recurring workflow constraint, compare AI with simpler interventions, assign an owner, and define the evidence that would justify another increment of investment.'
  'ai-knowledge-bases-operating-infrastructure.html' = 'Treat the knowledge base like a production service: assign ownership for quality, permissions, provenance, refresh, and retirement before people or agents are expected to rely on it.'
  'ai-replacement-boomerang-governance-failure.html' = 'Do not book labor savings until the work, exception path, knowledge transfer, and capability pipeline have been redesigned. Removing people without redesigning the system simply moves cost into rework and fragility.'
  'ai-should-make-people-better-thinkers.html' = 'Design interactions that require people to reason, challenge assumptions, and confirm conclusions. The human role must preserve judgment, not become a ceremonial approval after the answer has already been accepted.'
  'ai-usage-workflow-governance.html' = 'Set AI permissions at the workflow level. Match access, review, and evidence requirements to the data involved, the consequence of error, and the ability to recover when the output is wrong.'
  'ai-value-test-automate-build-buy-hire-wait.html' = 'Compare automation, custom build, vendor purchase, hiring, and waiting against the same value, risk, capacity, and reversibility criteria before treating AI as the default answer.'
  'benefits-realization-transformations-fail.html' = 'Keep a named benefits owner, an agreed baseline, and a realization review after delivery. A project is not complete when the output ships; it is complete when the expected operating change can be shown.'
  'business-imagination-is-the-scarce-asset-now.html' = 'Invest in problem framing, operating judgment, and the ability to imagine a better system of work. As execution gets cheaper, deciding what is worth changing becomes the higher-value capability.'
  'confident-and-wrong.html' = 'Add a challenge protocol before consequential AI output can be relied on: identify assumptions, compare independent evidence, record uncertainty, and name the person who can stop or correct the decision.'
  'coordination-tax.html' = 'Map the handoffs, queues, approvals, and exception owners before claiming that a workflow is streamlined. Automation that leaves the coordination topology untouched only hides the cost.'
  'decision-friction-portfolio-risk.html' = 'Make unresolved decisions visible with an owner, a decision date, the evidence still needed, and the cost of delay. Ambiguity should appear in portfolio review before it becomes delivery rework.'
  'demo-to-production-gap.html' = 'Require operating ownership, real-workflow evidence, monitoring, recovery, and a stop mechanism before moving from a successful demonstration to production reliance.'
  'documentation-cross-functional-leverage.html' = 'Fund documentation as shared operating infrastructure, with an owner and maintenance cadence. Its value is faster coordination, safer handoffs, and less dependence on memory or individual availability.'
  'earned-ai-autonomy.html' = 'Increase autonomy in stages. Each expansion should be earned by evidence that the system stays within its boundaries, exceptions are caught, recovery works, and an accountable owner can intervene.'
  'enterprise-ai-trust-operating-evidence.html' = 'Make AI activity inspectable: what it did, which inputs and rules it used, where its limits apply, who reviewed it, and how a mistake can be corrected.'
  'epmo-capacity-not-calendars.html' = 'Govern demand against real constrained capacity by role, skill, and dependency. Calendar activity is an output; the portfolio decision is which work receives scarce capacity and which work waits.'
  'every-agent-needs-a-human-operating-model.html' = 'Define the agent role, decision rights, evidence duty, escalation path, stop condition, and accountable human owner before it is allowed to act inside a real workflow.'
  'exception-path-automation.html' = 'Design the exception taxonomy and recovery path before declaring the happy path automated. Every exception class needs detection, routing, a response owner, and a way back to a known state.'
  'governing-ai-as-operational-change.html' = 'Measure the recurring work AI changes: cycle time, quality, rework, exceptions, judgment, and outcomes. Tool adoption is an input, not evidence that the operation improved.'
  'investment-health-dashboard.html' = 'Put expected benefit, confidence, capacity pressure, unresolved decisions, and risk beside schedule and spend. A dashboard should help leaders change the portfolio, not merely observe activity.'
  'local-ai-cloud-governance.html' = 'Choose local or cloud deployment from the data boundary, consequence of failure, required controls, support capacity, and recovery model. Architecture follows the operating decision.'
  'oversight-capacity-ai-scale.html' = 'Scale AI no faster than the organization can review, correct, and answer for its output. Budget oversight capacity as part of the operating model, not as invisible work added after deployment.'
  'portfolio-governance-funding-discipline.html' = 'Release funding in increments tied to evidence and the next decision. Reporting can explain what happened; funding authority is what redirects, pauses, expands, or stops the portfolio.'
  'portfolio-scenarios-not-plan.html' = 'Maintain multiple feasible portfolio scenarios that show capacity, dependencies, and tradeoffs. When conditions change, leaders should be choosing among explicit options, not improvising around a frozen annual plan.'
  'production-ai-evaluation.html' = 'Run evaluation as a recurring production control. Test the real workflow, monitor drift and exceptions, and change the evaluation set as users, data, models, and consequences change.'
  'project-readiness-before-kickoff.html' = 'Before kickoff, require an owner, evidence for the key premise, a clear boundary, and an explicit decision about the next commitment. A populated plan is not proof that the work is ready.'
  'prove-it-economy-careers-ai-programs.html' = 'Replace broad claims with evidence that another person—or a machine—can inspect: artifacts, decision records, outcomes, boundaries, and a clear explanation of what the evidence does and does not prove.'
  'stage-gates-with-teeth.html' = 'Give each gate real authority to redirect, pause, or stop work, then specify the evidence required for the next commitment. A review without a consequential decision is only a meeting.'
}

$lenses = @{
  'Portfolio & delivery governance' = @('OWNER', 'EVIDENCE', 'NEXT COMMITMENT')
  'AI operating governance' = @('WORKFLOW', 'CONTROL EVIDENCE', 'HUMAN OWNER')
  'Work, adoption & judgment' = @('HANDOFFS', 'LEARNING', 'RECOVERY')
}

function Encode([string]$value) {
  return [Net.WebUtility]::HtmlEncode([Net.WebUtility]::HtmlDecode($value))
}

function JsonString([string]$value) {
  return $value.Replace('\', '\\').Replace('"', '\"').Replace("`r", '').Replace("`n", '\n')
}

$articlePattern = '<article class="library-entry[^"]*"[^>]*data-sequence="(?<sequence>\d+)"[^>]*data-category="(?<category>[^"]+)"[^>]*data-summary="(?<summary>[^"]+)"[^>]*>(?<body>.*?)</article>'
$articles = [regex]::Matches($index, $articlePattern, [Text.RegularExpressions.RegexOptions]::Singleline)

if ($articles.Count -eq 0) {
  throw 'No library entries were found.'
}

foreach ($article in $articles) {
  $body = $article.Groups['body'].Value
  $noteMatch = [regex]::Match($body, '<h3><a href="field-notes/(?<file>[^"]+)">(?<title>.*?)</a></h3>', [Text.RegularExpressions.RegexOptions]::Singleline)
  $pdfMatch = [regex]::Match($body, '<a href="(?<pdf>whitepapers/[^"]+\.pdf)">White paper</a>')
  if (-not $noteMatch.Success -or -not $pdfMatch.Success) { throw 'A library entry is missing its note or PDF link.' }

  $file = $noteMatch.Groups['file'].Value
  $title = [Net.WebUtility]::HtmlDecode([regex]::Replace($noteMatch.Groups['title'].Value, '<[^>]+>', ''))
  $category = [Net.WebUtility]::HtmlDecode($article.Groups['category'].Value)
  $summary = [Net.WebUtility]::HtmlDecode($article.Groups['summary'].Value)
  $pdf = $pdfMatch.Groups['pdf'].Value
  if (-not $moves.ContainsKey($file)) { throw "Add an operating move for $file before rebuilding field notes." }
  $sourcePath = Join-Path $notesPath $file
  $old = (& git -C $root show "HEAD:governance/field-notes/$file" 2>$null) -join "`n"
  if (-not $old) { $old = [IO.File]::ReadAllText($sourcePath) }
  $pageMatch = [regex]::Match($old, 'Download the white paper \(PDF, (?<pages>\d+) pages?\)')
  $pages = if ($pageMatch.Success) { $pageMatch.Groups['pages'].Value } else { 'PDF' }

  $sourceItems = [regex]::Matches($old, '<li(?:\s[^>]*)?>(?<item>.*?)</li>', [Text.RegularExpressions.RegexOptions]::Singleline) |
    ForEach-Object { '<li>' + $_.Groups['item'].Value.Trim() + '</li>' }

  if ($sourceItems.Count -eq 0 -and $file -eq 'ai-should-make-people-better-thinkers.html') {
    $sourceItems = @(
      '<li><a href="https://www.pnas.org/doi/10.1073/pnas.2422633122" target="_blank" rel="noopener noreferrer">Bastani et al., “Generative AI without guardrails can harm learning,” PNAS</a>. The study examined student learning; the workplace implication is an operating-design argument.</li>',
      '<li><a href="https://news.harvard.edu/gazette/story/2024/09/professor-tailored-ai-tutor-to-physics-course-engagement-doubled/" target="_blank" rel="noopener noreferrer">Harvard Gazette, “Professor tailored AI tutor to physics course. Engagement doubled.”</a></li>'
    )
  }

  $anchor = switch ($category) {
    'Portfolio & delivery governance' { 'portfolio-delivery' }
    'AI operating governance' { 'ai-governance' }
    default { 'work-judgment' }
  }
  $noteClass = switch ($category) {
    'Portfolio & delivery governance' { 'note-portfolio' }
    'AI operating governance' { 'note-ai' }
    default { 'note-work' }
  }
  $lensHtml = ($lenses[$category] | ForEach-Object { '<span>' + (Encode $_) + '</span>' }) -join ''
  $sourcesHtml = $sourceItems -join "`n"
  $titleHtml = Encode $title
  $summaryHtml = Encode $summary
  $categoryHtml = Encode $category
  $moveHtml = Encode $moves[$file]
  $canonical = "https://policani.net/governance/field-notes/$file"
  $schema = '{"@context":"https://schema.org","@type":"Article","headline":"' + (JsonString $title) + '","description":"' + (JsonString $summary) + '","dateModified":"2026-07-17","author":{"@type":"Person","name":"Marco Policani","url":"https://policani.net/"},"mainEntityOfPage":"' + $canonical + '"}'

  $html = @"
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
<meta property="og:image" content="https://policani.net/assets/social-card-1200x630.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="$canonical">
<link rel="icon" type="image/svg+xml" href="../../assets/favicon.svg">
<link rel="stylesheet" href="../../assets/portfolio-site.css?v=20260717-fieldnotes">
<script type="application/ld+json">$schema</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body class="field-note-page $noteClass">
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
<header class="field-note-hero">
  <div class="section-inner field-note-hero-grid">
    <div>
      <p class="section-kicker"><a href="../index.html#$anchor">$categoryHtml</a> &middot; Field note</p>
      <h1>$titleHtml</h1>
      <p class="lead">$summaryHtml</p>
    </div>
    <aside class="field-note-format" aria-label="Reading format">
      <strong>Two-minute briefing</strong>
      <span>A concise companion to the full white paper.</span>
    </aside>
  </div>
</header>
<main id="main">
  <section class="field-note-briefing">
    <div class="section-inner">
      <div class="field-note-layout">
        <article class="field-note-tldr">
          <p class="section-kicker">TL;DR</p>
          <p class="field-note-thesis">$summaryHtml</p>
          <div class="field-note-move">
            <h2>The operating move</h2>
            <p>$moveHtml</p>
            <div class="field-note-lens" aria-label="Decision lens">$lensHtml</div>
          </div>
          <details class="field-note-sources-wrap">
            <summary>Sources and notes ($($sourceItems.Count))</summary>
            <ol class="field-note-sources">
$sourcesHtml
            </ol>
          </details>
        </article>
        <aside class="field-note-download">
          <p class="section-kicker">Go deeper</p>
          <h2>Read the full argument.</h2>
          <p>The white paper expands the briefing into a practical governance model, with context, evidence, and the complete reasoning.</p>
          <a class="button" href="../$pdf">Download the white paper ($pages pages)</a>
          <a class="text-link" href="../index.html#$anchor">Back to $categoryHtml</a>
        </aside>
      </div>
    </div>
  </section>
</main>
<footer>
  <div class="section-inner"><p class="field-note-footer-links"><span>Marco Policani</span><a href="../index.html">Governance library</a><a href="../../artifacts.html">Methods</a><a href="../../contact.html">Contact</a></p></div>
</footer>
<script src="../../assets/site-concierge.js?v=20260703-contact" defer></script>
<script data-goatcounter="https://policani.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</body>
</html>
"@

  [IO.File]::WriteAllText($sourcePath, $html, [Text.UTF8Encoding]::new($false))
}

Write-Host "Rebuilt $($articles.Count) field-note pages."
