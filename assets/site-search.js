(() => {
  const entries = [
    { title: "Role Fit: Program, Project, PMO & Portfolio Manager", url: "/pmo-portfolio-governance-leader.html", type: "Role fit", summary: "Role fit and evidence for Program Manager, Project Manager, PMO Manager, and Portfolio Manager roles.", keywords: "program manager project manager pmo manager portfolio manager recruiter hiring leadership" },
    { title: "Case Studies", url: "/operating-history.html", type: "Case studies", summary: "Ten public-safe case studies across enterprise software, telecom, SaaS, energy, and infrastructure.", keywords: "experience outcomes microsoft t-mobile avalara doosan gridtech miso delivery program project portfolio" },
    { title: "Methods: Walkthroughs", url: "/artifacts.html", type: "Methods", summary: "Client-safe walkthroughs showing how ambiguous work becomes governable.", keywords: "methods walkthroughs workflow intake prioritization readiness delivery proof" },
    { title: "Methods: Modules and PoCs", url: "/modules.html", type: "Methods", summary: "Reusable modules and proof-of-concept structures for intake, scoring, charters, readiness, value, and AI workflow governance.", keywords: "methods modules pocs workflow systems portfolio prioritization charter value realization" },
    { title: "Insights: Portfolio, Delivery, and AI Operations", url: "/governance/", type: "Insights", summary: "Guides, field notes, and white papers on portfolio leadership, delivery, executive decision support, and AI operations.", keywords: "insights governance pmo ai operations executive decision support" },
    { title: "Labs: Applied AI Systems and Tools", url: "/resources.html", type: "Labs", summary: "Applied AI systems, career tools, and experiments from Marco Policani.", keywords: "labs ai systems tools knowledge career experiments memventory subagent" },
    { title: "Contact Marco Policani", url: "/contact.html", type: "Contact", summary: "Contact Marco about remote program, project, PMO, portfolio, and governance roles.", keywords: "contact recruiter hiring remote program project pmo portfolio manager" },
    { title: "T-Mobile: Revenue Technology Portfolio", url: "/engagements/tmobile-revenue-technology.html", type: "Case study", summary: "Resetting portfolio signal and readiness-gated flow across a large revenue technology portfolio.", keywords: "t-mobile program manager portfolio delivery readiness cycle time" },
    { title: "Doosan GridTech: Delivery Sequencing", url: "/engagements/doosan-gridtech.html", type: "Case study", summary: "Sequencing software, construction, and security under capital and engineering constraints.", keywords: "doosan gridtech project manager program delivery capital cybersecurity" },
    { title: "Avalara: PPMO Formation", url: "/engagements/avalara-ppmo.html", type: "Case study", summary: "Forming a portfolio and program management office during acquisition-driven growth.", keywords: "avalara ppmo pmo manager portfolio governance investment" },
    { title: "Avalara: Billing Integrity", url: "/engagements/avalara-billing.html", type: "Case study", summary: "Stabilizing billing integrity across acquired platforms through governed transformation.", keywords: "avalara project manager billing transformation governance" },
    { title: "Microsoft: Commerce Finance Readiness", url: "/engagements/microsoft-commerce-finance.html", type: "Case study", summary: "Compressing finance-critical validation cycles with delivery readiness governance.", keywords: "microsoft project manager uat readiness finance delivery" },
    { title: "Microsoft: GDPR Remediation", url: "/engagements/microsoft-gdpr-remediation.html", type: "Case study", summary: "Closing a supplier compliance blind spot across acquired entities.", keywords: "microsoft program manager gdpr compliance remediation" },
    { title: "Microsoft: Software Assurance Governance", url: "/engagements/microsoft-software-assurance.html", type: "Case study", summary: "Governing a global partner-delivered platform under contract and liability pressure.", keywords: "microsoft portfolio program governance partner platform" },
    { title: "Microsoft: SharePoint Launch Evidence", url: "/engagements/microsoft-sharepoint-evidence.html", type: "Case study", summary: "Turning partner readiness into launch evidence against a fixed deadline.", keywords: "microsoft project manager launch readiness partner evidence" },
    { title: "Microsoft: Mobile Device Manager Pilots", url: "/engagements/microsoft-mdm-pilots.html", type: "Case study", summary: "Governing concurrent enterprise pilots across customer environments.", keywords: "microsoft program manager pilots portfolio" },
    { title: "MISO Energy: R&D Portfolio", url: "/engagements/miso-rd-portfolio.html", type: "Case study", summary: "Structuring R&D demand for executive comparison and investment decisions.", keywords: "miso portfolio manager r&d intake prioritization" },
    { title: "Messy Demand to Executive Review", url: "/walkthroughs/messy-demand-to-executive-review.html", type: "Walkthrough", summary: "How unstructured intake becomes a governed pipeline and executive review.", keywords: "demand intake program pmo prioritization executive review" },
    { title: "Tradeoffs to Executive Decision", url: "/walkthroughs/tradeoffs-to-executive-decision.html", type: "Walkthrough", summary: "How comparable tradeoffs move through scoring, sequencing, and decision follow-through.", keywords: "portfolio prioritization scoring capacity decision support" },
    { title: "Approved Intent to Chartered Delivery", url: "/walkthroughs/approved-intent-to-chartered-delivery-start.html", type: "Walkthrough", summary: "How approved intent becomes a business case, charter, and delivery start.", keywords: "project manager charter business case delivery start" },
    { title: "Delivery Readiness to Value Realization", url: "/walkthroughs/delivery-readiness-to-value-realization.html", type: "Walkthrough", summary: "How readiness evidence, launch controls, benefits, and value realization become reviewable.", keywords: "delivery readiness uat release value realization project program" },
    { title: "AI Governance and Artifact Lifecycle", url: "/walkthroughs/ai-idea-to-governed-artifact-lifecycle.html", type: "Walkthrough", summary: "How AI ideas and artifacts move through value proof, reliance boundaries, and governed adoption.", keywords: "ai governance workflow lifecycle human review" },
    { title: "Public-Safe Proof Review", url: "/walkthroughs/artifact-source-to-public-safe-proof-review.html", type: "Walkthrough", summary: "How anonymized artifacts become inspectable public-safe proof.", keywords: "evidence public safe proof confidentiality" },
    { title: "Partner Ecosystem Governance", url: "/walkthroughs/partner-ecosystem-governance.html", type: "Walkthrough", summary: "How partner, vendor, and external delivery work becomes governable.", keywords: "partner vendor ecosystem governance readiness" },
    { title: "AI Adoption Starts With the Constraint", url: "/governance/field-notes/ai-adoption-starts-with-the-constraint.html", type: "Field note", summary: "Start AI adoption with a recurring workflow constraint, accountable ownership, and proof.", keywords: "ai adoption workflow constraint governance" },
    { title: "AI Usage Belongs in Workflow Governance", url: "/governance/field-notes/ai-usage-workflow-governance.html", type: "Field note", summary: "Why AI use needs scoped access, evidence, escalation, and named ownership.", keywords: "ai usage workflow governance controls" },
    { title: "AI Knowledge Bases Are Operating Infrastructure", url: "/governance/field-notes/ai-knowledge-bases-operating-infrastructure.html", type: "Field note", summary: "Why AI knowledge bases need ownership, quality, provenance, and lifecycle management.", keywords: "ai knowledge base provenance documentation governance" },
    { title: "Oversight Capacity Is the Ceiling on AI Scale", url: "/governance/field-notes/oversight-capacity-ai-scale.html", type: "Field note", summary: "Designing human oversight capacity as the constraint on AI scale.", keywords: "ai oversight capacity human review governance" },
    { title: "Enterprise AI Trust Through Operating Evidence", url: "/governance/field-notes/enterprise-ai-trust-operating-evidence.html", type: "Field note", summary: "Why trust is built through inspectable operating evidence, limits, and accountability.", keywords: "ai trust evidence accountability governance" },
    { title: "Portfolio Governance Is Funding Discipline", url: "/governance/field-notes/portfolio-governance-funding-discipline.html", type: "Field note", summary: "Why portfolio governance is the authority and evidence to start, redirect, or stop investments.", keywords: "portfolio governance funding capacity prioritization" },
    { title: "Benefits Realization Is Where Transformations Fail", url: "/governance/field-notes/benefits-realization-transformations-fail.html", type: "Field note", summary: "How to govern the end of delivery with a benefits owner, baseline, target, and realization gate.", keywords: "benefits realization transformation delivery value" },
    { title: "Documentation Is Cross-Functional Leverage", url: "/governance/field-notes/documentation-cross-functional-leverage.html", type: "Field note", summary: "Why documentation is an operating asset that coordinates decisions and keeps knowledge usable.", keywords: "documentation knowledge operations ai governance" }
    , { title: "A Practical AI Value Test", url: "/governance/field-notes/ai-value-test-automate-build-buy-hire-wait.html", type: "Field note", summary: "A decision framework for choosing whether to automate, build, buy, hire, or wait.", keywords: "ai value test automate build buy hire wait investment decision" }
    , { title: "AI Replacement Boomerang: A Governance Failure", url: "/governance/field-notes/ai-replacement-boomerang-governance-failure.html", type: "Field note", summary: "Why replacing capability before governing the workflow can create avoidable operating risk.", keywords: "ai replacement workforce governance operating risk" }
    , { title: "AI Should Make People Better Thinkers", url: "/governance/field-notes/ai-should-make-people-better-thinkers.html", type: "Field note", summary: "A view of AI adoption that strengthens judgment, evidence, and accountable decision-making.", keywords: "ai thinkers judgment decision making human capability" }
    , { title: "Business Imagination Is the Scarce Asset Now", url: "/governance/field-notes/business-imagination-is-the-scarce-asset-now.html", type: "Field note", summary: "Why operating imagination and execution discipline matter more as AI expands options.", keywords: "business imagination ai operations leadership execution" }
    , { title: "Every Agent Needs a Human Operating Model", url: "/governance/field-notes/every-agent-needs-a-human-operating-model.html", type: "Field note", summary: "How human roles, escalation, and verification make AI agents governable.", keywords: "ai agent human operating model escalation verification" }
    , { title: "Governing AI as Operational Change", url: "/governance/field-notes/governing-ai-as-operational-change.html", type: "Field note", summary: "Treat AI adoption as a sustained operating-model change, not a one-time tool rollout.", keywords: "governing ai operational change adoption pmo" }
    , { title: "The Prove-It Economy", url: "/governance/field-notes/prove-it-economy-careers-ai-programs.html", type: "Field note", summary: "How demonstrated operating evidence matters in careers and AI programs.", keywords: "prove it economy careers ai programs evidence" }
  ];

  const form = document.querySelector("[data-site-search-form]");
  const input = document.querySelector("[data-site-search-input]");
  const status = document.querySelector("[data-site-search-status]");
  const results = document.querySelector("[data-site-search-results]");

  if (!form || !input || !status || !results) return;

  const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  const scoreEntry = (entry, query) => {
    const title = normalize(entry.title);
    const keywords = normalize(entry.keywords);
    const summary = normalize(entry.summary);
    const tokens = normalize(query).split(" ").filter(Boolean);
    if (!tokens.length) return 0;

    let score = title.includes(normalize(query)) ? 12 : 0;
    if (keywords.includes(normalize(query))) score += 8;
    if (summary.includes(normalize(query))) score += 4;

    for (const token of tokens) {
      if (title.includes(token)) score += 5;
      if (keywords.includes(token)) score += 3;
      if (summary.includes(token)) score += 1;
    }
    return score;
  };

  const addResult = (entry) => {
    const item = document.createElement("li");
    item.className = "site-search-result";

    const type = document.createElement("span");
    type.className = "site-search-result-type";
    type.textContent = entry.type;

    const link = document.createElement("a");
    link.href = entry.url;
    link.textContent = entry.title;

    const summary = document.createElement("p");
    summary.textContent = entry.summary;

    item.append(type, link, summary);
    results.append(item);
  };

  const render = (query) => {
    results.replaceChildren();
    const trimmed = query.trim();

    if (!trimmed) {
      status.textContent = "Search by role, operating problem, case study, method, or insight.";
      entries.slice(0, 8).forEach(addResult);
      return;
    }

    const matches = entries
      .map((entry) => ({ entry, score: scoreEntry(entry, trimmed) }))
      .filter((result) => result.score > 0)
      .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title))
      .slice(0, 12)
      .map((result) => result.entry);

    status.textContent = matches.length
      ? `${matches.length} ${matches.length === 1 ? "result" : "results"} for “${trimmed}”.`
      : `No results for “${trimmed}”. Try a role, case study, or topic such as delivery readiness.`;
    matches.forEach(addResult);
  };

  const updateUrl = (query) => {
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", url);
  };

  const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
  input.value = initialQuery;
  render(initialQuery);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateUrl(input.value);
    render(input.value);
  });

  input.addEventListener("input", () => {
    updateUrl(input.value);
    render(input.value);
  });
})();
