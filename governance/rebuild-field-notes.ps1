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

$details = @{
  'ai-adoption-starts-with-the-constraint.html' = @{
    Preview = 'Most AI portfolios can show activity long before they can show value. This paper explains why tool-first adoption creates that gap and replaces it with a constraint-first operating model: identify the recurring workflow, name what limits value, compare AI with simpler interventions, and decide what evidence would justify more reliance. It connects experimentation to a five-gate portfolio cadence so that pilots become comparable investment decisions rather than isolated demonstrations.'
    Inside = @('How to distinguish a workflow constraint from a technology opportunity', 'A five-gate path from intake and intervention routing to value realization', 'A practical scorecard, evidence pack, and decision-rights model for scaling')
  }
  'ai-knowledge-bases-operating-infrastructure.html' = @{
    Preview = 'A knowledge base becomes operational infrastructure as soon as people or agents depend on it to answer questions, route work, or make decisions. This paper sets expectations for that dependency: named ownership, source provenance, access boundaries, quality evaluation, refresh, and retirement. It treats retrieval quality and content lifecycle as operating responsibilities, not background technical tasks, and shows why a polished interface cannot compensate for an unmanaged corpus.'
    Inside = @('Ownership and service boundaries for a shared knowledge layer', 'Controls for ingestion, provenance, permissions, retrieval quality, and evaluation', 'Refresh, incident response, and retirement practices across the lifecycle')
  }
  'ai-replacement-boomerang-governance-failure.html' = @{
    Preview = 'Headcount reduction can look like immediate AI value while the underlying work remains unchanged. This paper traces how that shortcut returns as rework, lost operating knowledge, brittle exception handling, and a damaged capability pipeline. It reframes replacement as a portfolio-governance decision: leaders must redesign the work, prove that the new operating model can carry ordinary and exceptional cases, and preserve the human capabilities the organization will still need.'
    Inside = @('Why labor removal without work redesign creates a delayed cost boomerang', 'How to map tasks, judgment, exceptions, knowledge, and capability development', 'Evidence gates for releasing savings without quietly transferring risk')
  }
  'ai-should-make-people-better-thinkers.html' = @{
    Preview = 'The same AI system can accelerate learning or weaken it, depending on how the interaction is designed. This paper connects evidence from answer-first and reasoning-first learning environments to enterprise work, then asks what human-in-the-loop should mean when reviewer judgment is itself at risk. The focus is not on slowing people down; it is on designing use patterns that preserve the ability to challenge assumptions, compare independent evidence, and work effectively when the model is wrong.'
    Inside = @('What research on answer-first and reasoning-first assistance suggests', 'Interaction patterns that make people reason before they receive an answer', 'How to build review capability beyond a ceremonial human approval')
  }
  'ai-usage-workflow-governance.html' = @{
    Preview = 'Blanket access policies treat every AI use as if the data, consequence, and recovery path were the same. This paper moves governance into the workflow, where those differences are visible. It shows how to tier uses by consequence, define permitted actions and evidence duties, and assign review and escalation without forcing low-risk work through the same controls as consequential decisions.'
    Inside = @('Workflow-level risk tiers for access, use, and reliance', 'Decision rights, evidence duties, and human review by consequence', 'Monitoring, exception handling, and escalation when boundaries are crossed')
  }
  'ai-value-test-automate-build-buy-hire-wait.html' = @{
    Preview = 'AI proposals are often evaluated against doing nothing instead of against the full set of available responses. This paper creates a common decision frame for automation, custom build, vendor purchase, hiring, and waiting. It compares value mechanism, operating cost, time to evidence, reversibility, dependency, and risk so leaders can choose the smallest credible intervention without mistaking novelty for strategic fit.'
    Inside = @('A common comparison model for five intervention paths', 'How sequence, reversibility, capacity, and operating cost change the decision', 'Evidence gates for funding, expanding, redirecting, or stopping the choice')
  }
  'benefits-realization-transformations-fail.html' = @{
    Preview = 'Transformation governance often becomes weakest after delivery, exactly when expected value should become measurable. This paper explains how benefits lose ownership between approval, implementation, adoption, and steady-state operations. It proposes a practical realization discipline built around a named benefits owner, a credible baseline, leading and lagging evidence, and a gate that can change the intervention when the promised operating result does not appear.'
    Inside = @('Why delivery completion and value realization are different governance events', 'Baselines, benefit owners, adoption evidence, and post-launch measurement', 'A realization gate that can sustain, redirect, narrow, or stop investment')
  }
  'business-imagination-is-the-scarce-asset-now.html' = @{
    Preview = 'As AI lowers the cost of producing analysis, prototypes, and content, execution alone becomes less differentiating. This paper argues that the scarce capability shifts toward business imagination: framing valuable problems, seeing alternative operating models, and deciding which changes are worth making. It explores the portfolio implications of abundant production capacity and the leadership practices required to keep faster output connected to real strategic choice.'
    Inside = @('Why cheaper execution raises the value of problem framing and judgment', 'How abundant production changes portfolio selection and differentiation', 'Operating practices that turn imagination into testable, governed commitments')
  }
  'confident-and-wrong.html' = @{
    Preview = 'Plausibility is one of the most useful qualities of generative AI and one of its most dangerous. This paper examines what happens when fluent output enters a workflow without a challenge protocol, independent evidence, or a named person able to reject it. It turns “verify the output” into an operating control by defining the questions, records, thresholds, and escalation paths that make confidence testable before reliance expands.'
    Inside = @('Why fluent output bypasses ordinary skepticism in consequential work', 'A repeatable challenge protocol for assumptions, evidence, and uncertainty', 'Ownership, escalation, and learning when an output fails review')
  }
  'coordination-tax.html' = @{
    Preview = 'Work can appear efficient at the task level while remaining slow and expensive across handoffs, queues, approvals, and exceptions. This paper makes that hidden coordination tax visible. It maps the topology around the work, distinguishes productive collaboration from avoidable routing, and shows why automation that ignores ownership and recovery often moves the burden instead of removing it.'
    Inside = @('How to map handoffs, queues, approvals, dependencies, and exception owners', 'Signals that distinguish necessary coordination from avoidable operating friction', 'Redesign and measurement choices before automation or autonomy expands')
  }
  'decision-friction-portfolio-risk.html' = @{
    Preview = 'Portfolios usually report schedule, spend, and risk while unresolved decisions remain scattered across meetings and delivery teams. This paper treats that friction as a governable source of delay and rework. It shows how to make each consequential choice visible with an owner, evidence need, decision date, escalation path, and cost of delay—before ambiguity becomes a delivery problem.'
    Inside = @('A decision inventory that sits beside schedule and risk reporting', 'Ownership, evidence, due dates, escalation, and the cost of delay', 'Measures for identifying recurring decision bottlenecks across the portfolio')
  }
  'demo-to-production-gap.html' = @{
    Preview = 'A demonstration answers whether something can work under selected conditions. Production asks whether the organization can rely on it in ordinary work, under change, and when something goes wrong. This paper defines the missing operating evidence between those two states and gives leaders a readiness frame for ownership, monitoring, recovery, capacity, and stop authority.'
    Inside = @('What a successful demo proves—and what it leaves unanswered', 'Production ownership, monitoring, exceptions, recovery, and support capacity', 'A readiness gate for expanding from possibility to accountable reliance')
  }
  'documentation-cross-functional-leverage.html' = @{
    Preview = 'Documentation is often funded as cleanup even though teams rely on it to coordinate decisions, transfer knowledge, onboard people, and recover from change. This paper reframes documentation as shared operating infrastructure with an owner, service level, and lifecycle. It explains how useful records reduce dependency on memory, accelerate cross-functional work, and make evidence available at the moment a decision is needed.'
    Inside = @('The coordination, continuity, and decision value of maintained documentation', 'Ownership, audience, lifecycle, and maintenance responsibilities', 'Practical signals for documentation health, use, and operating leverage')
  }
  'earned-ai-autonomy.html' = @{
    Preview = 'Autonomy is often discussed as a model capability when it is really a decision about permitted action and recoverable consequence. This paper defines progressive levels of autonomy and the evidence required to move between them. It keeps expansion tied to boundary adherence, exception detection, human intervention, and demonstrated recovery rather than to the impressiveness of a single run.'
    Inside = @('Progressive autonomy levels tied to real workflow authority', 'Control evidence for boundaries, exceptions, intervention, and recovery', 'Rollback, stop conditions, and accountable ownership at each level')
  }
  'enterprise-ai-trust-operating-evidence.html' = @{
    Preview = 'Enterprise trust cannot be sustained by model reputation, vendor claims, or a successful pilot. This paper defines the operating evidence people need before they can rely on AI: what happened, which inputs and rules shaped it, what limits apply, who reviewed it, and how an error can be corrected. It connects traceability to ownership and incident learning so trust grows from inspectable practice.'
    Inside = @('The evidence pack behind a consequential AI-assisted action', 'Provenance, boundaries, human review, and ownership requirements', 'Incident records and learning loops that improve future reliance decisions')
  }
  'epmo-capacity-not-calendars.html' = @{
    Preview = 'A portfolio calendar can show when activity is planned without showing whether the organization has the scarce roles, skills, attention, and dependency capacity to deliver it. This paper repositions the EPMO around active demand and constrained capacity. It gives leaders a way to expose overload, compare tradeoffs, and decide which commitments move, change shape, or wait.'
    Inside = @('Demand and capacity views that go beyond project calendars', 'How role, skill, dependency, and decision bottlenecks shape feasible work', 'Scenario and sequencing choices for steering constrained portfolios')
  }
  'every-agent-needs-a-human-operating-model.html' = @{
    Preview = 'An AI agent enters an organization as an operating role, not merely as software. This paper defines the human system around that role: what the agent may decide, what evidence it owes, when it must stop, how exceptions escalate, and who remains accountable. It provides a concrete design frame for moving from an impressive agent demonstration to a governable participant in recurring work.'
    Inside = @('Role, decision rights, evidence duty, boundaries, and stop authority', 'Human ownership and escalation across ordinary and exceptional cases', 'A practical operating record for reviewing and expanding agent reliance')
  }
  'exception-path-automation.html' = @{
    Preview = 'The happy path is the easiest part of a workflow to automate and the least informative test of whether the operation is ready. This paper focuses on what happens when inputs are missing, classifications are ambiguous, dependencies change, or a case falls outside the rules. It treats exception design as part of the automated workflow itself, with detection, routing, ownership, evidence, recovery, and recurring learning.'
    Inside = @('An exception taxonomy tied to detection and routing', 'Boundaries, response ownership, recovery decisions, and evidence records', 'Testing and learning practices that improve the workflow after failure')
  }
  'governing-ai-as-operational-change.html' = @{
    Preview = 'Usage counts and license activity say little about whether AI improved the work an organization funded. This paper moves the unit of governance from the tool to the recurring workflow. It shows how to establish a baseline, select operating measures, assign ownership, and review whether AI changed cycle time, quality, rework, exceptions, judgment, or outcomes without creating new hidden costs.'
    Inside = @('Workflow baselines and value mechanisms before deployment', 'Operating measures for quality, rework, exceptions, judgment, and outcomes', 'A governance cadence for adapting or stopping the intervention')
  }
  'investment-health-dashboard.html' = @{
    Preview = 'Most PMO dashboards are strong on activity and weak on the condition of the investment. This paper defines a decision-oriented view of health that puts expected value, confidence, capacity pressure, unresolved choices, dependency, and risk beside schedule and spend. The goal is to help leaders change the portfolio while action is still possible, not explain the outcome after the fact.'
    Inside = @('A balanced view of value, confidence, capacity, risk, and delivery', 'Decision signals that reveal when an investment needs intervention', 'Review cadence and ownership for acting on the dashboard')
  }
  'local-ai-cloud-governance.html' = @{
    Preview = 'Local and cloud AI are often framed as a technology preference, but the meaningful differences are operational: data boundaries, required control, consequence of failure, support capacity, update model, and recovery. This paper gives leaders a governance frame for comparing those tradeoffs before architecture becomes a sunk decision, including cases where a hybrid or deliberately limited solution is the better answer.'
    Inside = @('Data, control, consequence, performance, and support tradeoffs', 'Operating economics, lifecycle capacity, and recovery obligations', 'A decision path for local, cloud, hybrid, or bounded non-adoption')
  }
  'oversight-capacity-ai-scale.html' = @{
    Preview = 'Organizations can deploy AI faster than they can review, correct, and answer for its output. This paper treats human oversight as a finite portfolio resource and shows how hidden review demand becomes the real ceiling on scale. It connects consequence tiers to reviewer skill, attention, escalation, and capacity planning so reliance does not grow faster than the operating system around it.'
    Inside = @('A capacity model for review, correction, escalation, and accountability', 'How consequence and reversibility change the required oversight tier', 'Staffing, training, queue, and prioritization choices for responsible scale')
  }
  'portfolio-governance-funding-discipline.html' = @{
    Preview = 'Reporting can describe a portfolio without changing a single commitment. This paper argues that governance becomes real when leaders can release, redirect, expand, pause, or stop funding in response to evidence. It links incremental investment to decision rights and the next meaningful proof point, making the funding cadence part of the operating model rather than an annual administrative event.'
    Inside = @('Why reporting visibility and governing authority are different', 'Incremental funding tied to evidence and the next commitment', 'Decision rights and gates for expanding, redirecting, pausing, or stopping')
  }
  'portfolio-scenarios-not-plan.html' = @{
    Preview = 'A single annual plan becomes less useful as soon as capacity, dependencies, demand, or assumptions change. This paper replaces false precision with a small set of feasible portfolio scenarios that make tradeoffs and consequences visible. It shows how leaders can use triggers and recurring reviews to move among explicit options instead of improvising around a plan that no longer reflects reality.'
    Inside = @('How to build feasible scenarios from capacity, demand, and dependencies', 'Assumptions, triggers, and consequences that distinguish each option', 'A steering cadence for choosing and adapting the active portfolio')
  }
  'production-ai-evaluation.html' = @{
    Preview = 'A one-time evaluation cannot protect a workflow whose users, data, models, and consequences continue to change. This paper treats evaluation as a living production control: a maintained set of representative cases, thresholds, exception review, drift signals, incident learning, and an owner who can change permitted use. The emphasis is on evidence that remains relevant after launch.'
    Inside = @('A production evaluation set grounded in representative workflow cases', 'Thresholds, drift, exceptions, incidents, and change triggers', 'Ownership and cadence for updating reliance as evidence changes')
  }
  'project-readiness-before-kickoff.html' = @{
    Preview = 'A plan can be complete while the work is still missing sponsorship, capacity, decision rights, evidence, or a credible path through its first dependency. This paper defines readiness as an earned condition for the next commitment, not a checklist attached to a date. It gives sponsors and delivery leaders a proportionate way to narrow, stage, delay, or approve work based on what is actually known.'
    Inside = @('Readiness dimensions across ownership, evidence, capacity, boundaries, and dependencies', 'A concise decision record for the next commitment', 'Options to narrow, stage discovery, approve, or hold work without false certainty')
  }
  'prove-it-economy-careers-ai-programs.html' = @{
    Preview = 'Credibility is moving from assertion toward evidence that can be inspected by people and increasingly by machines. This paper applies that shift to both professional work and AI programs. It explains how artifacts, decision records, outcomes, methods, and clear boundaries form a stronger proof pack than broad claims, while avoiding the opposite mistake of presenting incomplete evidence as certainty.'
    Inside = @('Why careers and AI investments face the same credibility shift', 'How to assemble artifacts, outcomes, decisions, and methods into proof', 'Boundaries and disclosure practices that keep evidence useful and honest')
  }
  'stage-gates-with-teeth.html' = @{
    Preview = 'A stage gate that can only acknowledge progress is a reporting meeting, not a governance control. This paper restores the connection between the gate and a consequential decision: advance, redirect, narrow, pause, or stop. It shows how evidence requirements, decision authority, and explicit consequences keep gates proportionate while preventing weak commitments from becoming inevitable through momentum.'
    Inside = @('Decision authority and consequences behind each gate', 'Evidence requirements tied to the next commitment rather than a generic checklist', 'Proportionate routes to advance, redirect, narrow, pause, or stop')
  }
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
  if (-not $details.ContainsKey($file)) { throw "Add download-preview details for $file before rebuilding field notes." }
  $sourcePath = Join-Path $notesPath $file
  $old = (& git -C $root show "HEAD:governance/field-notes/$file" 2>$null) -join "`n"
  if (-not $old) { $old = [IO.File]::ReadAllText($sourcePath) }
  $pageMatch = [regex]::Match($old, 'Download the white paper \((?:PDF, )?(?<pages>\d+) pages?\)')
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
  $previewHtml = Encode $details[$file].Preview
  $insideHtml = ($details[$file].Inside | ForEach-Object { '<li>' + (Encode $_) + '</li>' }) -join ''
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
<link rel="stylesheet" href="../../assets/portfolio-site.css?v=20260717-fieldnotes2">
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
      <strong>Briefing and source notes</strong>
      <span>TL;DR, scope, operating move, and sources.</span>
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
