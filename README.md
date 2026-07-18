# Marco Policani Portfolio Site

Public landing page for Marco Policani's Principal / Director-level portfolio,
PMO, executive operations, AI-assisted workflow governance, decision support,
and operating-model portfolio.

Live site target:

https://policani.net

## Purpose

This site is the search-friendly front door for a portfolio that otherwise lives
across GitHub repositories and GitHub Wiki pages. It is intentionally written to
help recruiters and hiring leaders see the target lane first: Director or
Principal roles in PMO, EPMO, PPMO, portfolio governance, program operations,
executive operations, and Chief of Staff roles centered on cadence, portfolio
visibility, and decision support.

The public positioning should make Marco discoverable for portfolio governance,
PMO leadership, executive operating cadence, Principal portfolio management,
Director PMO, AI-assisted workflow architecture, evidence-bound decision
support, delivery readiness, value realization, and practical AI workflow
governance without implying CEO, VP, GM, formal Chief of Staff, software
engineering, ML/data-science, model ownership, product-owner, or production SaaS
ownership.

## Content Model

- Lead with role fit and operating problems, not a flat repository list.
- Treat experience evidence as the primary support layer for public claims about
  scale, stakeholder altitude, and operating context.
- Keep the top-level website structure explicit:
  `pmo-portfolio-governance-leader.html` for Role Fit,
  `portfolio.html` for the deeper portfolio map, `operating-history.html` for
  Case Studies, `artifacts.html` for How I Work, `governance/` for the
  canonical reader-facing portfolio and AI governance library, `modules.html`
  for Workflow Systems, `proof.html` for Evidence, `resources.html` for
  Resources, and the home contact section for Contact.
- Anchor the public headline on Principal / Director-level portfolio, PMO, and
  executive operations.
- Treat Chief of Staff as a target lane only when the role means executive
  cadence, cross-functional operating rhythm, portfolio visibility, and decision
  support.
- Keep PMO, portfolio, AI workflow governance, readiness, controls, and value
  modules framed as proof-of-concept workflow assets and public-safe examples.
  They support the portfolio but do not carry the executive credibility claim by
  themselves.
- Keep the career, job-search, and writing tools in a distinct Resources lane.
  They are community resources, not core executive-portfolio
  proof, even though they can still show broader workflow craft.
- Use SEO/search language in headings, metadata, and navigation, but keep product
  prose grounded and specific.
- Production pages must never expose process notes about how the page was made,
  where shorter versions may circulate, whether copy is complete, or what channel
  strategy is planned. Keep those notes in planning files, not reader-facing web
  copy.
- Production pages must show finished page content, not page-construction
  instructions. Do not publish visible copy that refers to drafts, approval
  routing, future navigation/profile/wiki links, "handoff material," source
  links being collected for later, placeholders, filler, or instructions to a
  reviewer/agent. Rewrite those notes as the actual inspection path, proof,
  example, source, or decision support the page offers the reader.

## Web Structure

- `/` is the simplified hiring-manager front door and evaluator path.
- `/pmo-portfolio-governance-leader.html` is Role Fit: it gives hiring leaders
  the fastest read on Marco's strongest roles, operating problems, and proof
  signals.
- `/portfolio.html` is the deeper portfolio map: it explains role fit,
  executive operating problems, and the operating-history bridge.
- `/operating-history.html` is Case Studies: it provides public-safe experience evidence and links
  specific experience claims to the portfolio routes or modules they support.
- `/artifacts.html` is How I Work: public-safe routes from unclear
  signal to accountable review.
- `/governance/` is Portfolio and AI Governance: the canonical reader-facing
  destination for public-safe governance material and routes into workflow
  examples, with GitHub repository and wiki pages treated as source or mirror
  surfaces.
- `/governance/guides/` is finished content only. Drafts, staging notes,
  outlines, and unresolved article ideas belong in `E:\Codex\planning` until
  audience fit, proof support, destination role, and publication quality are
  clear.
- `/modules.html` is Workflow Systems: downloadable proof-of-concept modules grouped by operating
  lifecycle.
- `/proof.html` is Evidence: proof taxonomy, public-safety boundaries, scope
  guardrails, and AI workflow governance boundaries.
- `/resources.html` is Resources: career, job-search, and writing resources for the
  broader community; it is not part of the main executive proof path.

## Site Content Pipeline

Repository-level content automation lives in `site-content.ps1`. Governance
white papers are maintained through `content/governance-library.json`; the
pipeline generates the library cards, field-note pages, counts, metadata, PDF
links, sitemap entries, and `llms.txt` discovery entries from that manifest.
The normal `publish.ps1` flow runs this build before validation so generated
surfaces cannot silently drift.

Use `site-content.ps1 -Action AddWhitepaper` for new papers and do not hand-edit
generated field-note HTML or governance cards. The full intake, review,
publishing, and live-verification procedure is in `CONTENT-PUBLISHING.md`.

## Search Console Notes

- The canonical public domain is `https://policani.net/`, not the `www`
  subdomain.
- Google Search Console may report `https://www.policani.net/` as "Page with
  redirect" because it redirects to `https://policani.net/`. That is expected
  canonical behavior, not an indexing defect, as long as the apex domain returns
  `200` and sitemap/canonical URLs stay on `https://policani.net/`.

## Source Repositories

- GitHub profile: https://github.com/policani
- Portfolio index: https://github.com/policani
- Portfolio artifacts source pages: https://github.com/policani/Policani/tree/main/wiki
- Anonymized artifact source: https://github.com/policani/operating-patterns

## Privacy Standard

The site uses public-safe, generalized language. Do not add employer names,
client names, logos, screenshots, internal terminology, exact dates, financial
figures, proprietary processes, or details that could identify a prior
organization.

## Site Concierge

The main portfolio pages include a no-cost static concierge from
`assets/site-concierge.js`. It is a browser-only guided routing layer for
recruiters, hiring managers, AI reviewers, and other evaluators. It does not use
an LLM, paid API, server endpoint, tracking pixel, analytics event, or stored
visitor transcript.

The concierge may route visitors to LinkedIn or open a visitor-initiated email
draft. It should not ask visitors to complete a multi-field role form; recruiters
and hiring leaders should write their own email in their own mail app. Do not
replace it with automatic email notifications unless Marco explicitly approves a
third-party form service, backend endpoint, or other infrastructure that changes
the privacy/cost model.

## Production Guardrails

- Tables must fit the width of their content column on every viewport. Do not
  add table `min-width` rules or rely on horizontal scrolling for article,
  guide, governance, or walkthrough pages.
- New shared-page tables should use `width: 100%`, `max-width: 100%`,
  `table-layout: fixed`, and wrapping cells so long labels, URLs, and notes
  stay inside the visible page band.
- If a specialized tool genuinely needs a horizontally scrollable data grid,
  keep that behavior local to the tool page and document why it is an exception.
- Field notes and guides should end with substance, sources, related reading, or
  a useful download. Do not add meta-footnotes about LinkedIn versions, draft
  state, completeness, publication workflow, or intended reuse.
- Before publishing changed HTML, scan visible copy for leaked planning terms:
  `this draft`, `should be reviewed`, `before any navigation`, `profile link`,
  `wiki link`, `handoff material`, `linked later`, `changing shared files`,
  `placeholder`, `filler`, `TODO`, and `TBD`. Legitimate form placeholders and
  content about AI drafts are allowed; page-production notes are not.
- Headings should wrap like edited prose. Avoid relying on balanced wrapping
  when it strands short final words; protect inseparable phrases with a
  nonbreaking space when the wording itself should stay together.

## License

Site code, styles, and scripts are licensed under MIT. Written content and other non-code portfolio materials are licensed under CC BY 4.0 with attribution to Marco Policani. See `LICENSE.md`.
