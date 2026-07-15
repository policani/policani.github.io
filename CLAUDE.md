# Policani.net Site Agent Instructions

This file applies to the public portfolio site at `E:\Codex\policani.github.io`.
Claude uses this file. Codex and Cursor use `AGENTS.md`.

## Public Page Content Gate

Every rendered page must show finished reader-facing content. Do not publish
internal process notes, planning scaffolds, memos, placeholders, filler, or page
assembly instructions as visible copy.

Before changing or publishing HTML, scan the visible text for phrases such as:

- `this draft`
- `should be reviewed`
- `before any navigation`
- `profile link`
- `wiki link`
- `handoff material`
- `approved before publication`
- `linked later`
- `changing shared files`
- `placeholder`
- `filler`
- `TODO` or `TBD`

Legitimate form placeholders and content about AI drafts are allowed. Leaked
production notes are not.

Rewrite process language into the actual thing the reader needs: the proof,
example, inspection path, source list, decision support, claim boundary, or next
useful link. Keep approval routing, publishing strategy, optional link plans,
channel strategy, and staging state in planning notes or handoff notes.

## Site Positioning

- Keep the site focused on Marco Policani as a Principal / Director-level
  portfolio, PMO, executive operations, and AI workflow governance leader.
- Write for hiring managers, PMO/portfolio leaders, AI operations readers, and
  recruiters.
- Keep career, job-search, and writing tools in the Resources lane, separate
  from the main executive proof path.
- Do not add employer/client names, screenshots, proprietary details, internal
  terminology, unsupported exact figures, or claims that imply ML/model,
  production AI platform, software engineering, VP/GM, or formal Chief of Staff
  ownership beyond the evidence.

## Client Work and Article Citations

- Field notes and articles must not describe client-site work by employer or
  client name in the reader-facing body. Present the operating pattern in
  anonymized terms (workflow type, constraint, evidence path). Support it with
  related case-study links in the aside, never with named client claims inside
  the argument. This caused a correction on 2026-07-07 when a field note
  narrated Doosan GridTech and T-Mobile work in its body.
- Every field note that carries external statistics must render its sources as
  clickable links (`<a href … target="_blank" rel="noopener noreferrer">`), not
  raw pasted URLs and not a thin prose note. The field-note citation set must
  cover the claims on the page and match the validated sources in the companion
  white paper; if the white paper cites six primary sources, the field note
  should not silently drop to two.

## Governance Article Placement

- Published field-note pages live in `governance/field-notes/`.
- Published white-paper PDFs live in `governance/whitepapers/`.
- Article preview and social images live in `assets/`.
- Only three asset types from an article campaign are published to this repo:
  the field-note HTML (`governance/field-notes/`), the white-paper PDF
  (`governance/whitepapers/`), and the 1200x627 social preview (`assets/`).
  LinkedIn-native assets — the native reach post, the document carousel PDF, the
  native LinkedIn Article copy, and the 1920x1080 Article cover — are LinkedIn
  deliverables that stay in the planning packet. Do not copy them into this repo.
- Planning article folders may keep working website field-note source files,
  but Policani.net is served from this repo. Do not treat planning-only HTML as
  published web content.
- Wire new governance article pages into `governance/index.html`,
  `sitemap.xml`, and page metadata only after public-site PDFs/assets exist or
  links are intentionally omitted.
- A field-note page is not publication-ready if it is orphaned. Add every new
  field note to the `governance/index.html` Field Notes grid in the intended
  priority order, update the Governance landing page `lastmod` in
  `sitemap.xml`, add the field-note URL to `sitemap.xml`, and update `llms.txt`
  when the page should be discoverable by answer engines.
- If a field note is part of a white-paper campaign, the PDF must exist in
  `governance/whitepapers/`, be linked from both the field-note aside and the
  `governance/index.html` card, and be listed in `sitemap.xml` before publish.
  Do not ship a field-note-only version unless Marco explicitly approves
  publishing without the PDF.
- Before publishing, render `governance/` locally and confirm the new Field
  Notes card is visible, ordered correctly, and links to the expected page.

## Publishing Checks

- New public pages must be added to `sitemap.xml`.
- When changing a page materially, update its sitemap `lastmod`.
- In Claude/Cowork sessions, do not commit directly from the mounted sandbox;
  hand Marco runnable PowerShell commands instead, following the root
  `E:\Codex\CLAUDE.md` push guidance.
- Run the local publish dry run when the change set is nontrivial:
  `cd E:\Codex\policani.github.io; .\publish.ps1 -DryRun`
- After deployment, verify the live `https://policani.net` URL for changed
  pages when practical.

## Search Console Review Procedure

Use Google Search Console whenever the task involves SEO, search visibility,
indexing, title/metadata changes, or a material content release. Open the
verified apex-domain property:

`https://search.google.com/search-console?resource_id=sc-domain%3Apolicani.net`

1. In **Performance**, keep the search type at **Web** and start with the
   **last 3 months**. Record clicks, impressions, CTR, and average position.
   Review both **Queries** and **Pages**.
2. Separate branded, self-test, and known internal queries from non-branded
   discovery. Do not treat searches for `policani` or the owner's own test
   visits as evidence of recruiting demand.
3. Compare the non-branded queries and visible pages against the intended
   reader and role language. For this site, inspect whether Program Manager,
   Project Manager, PMO Manager, Portfolio Manager, portfolio governance,
   delivery readiness, and related evidence terms are earning impressions.
   Use gaps to improve a relevant existing page before creating thin
   keyword-targeted pages.
4. In **Indexing > Pages**, review indexed and not-indexed counts and the
   reason categories for pages that should be public. Treat the `www` URL's
   redirect status as expected when the canonical apex URL returns `200`.
5. Check **Enhancements > Profile page** for valid and invalid items. Note
   that Core Web Vitals can show no field data until the site has enough real
   traffic; that is not, by itself, a defect.
6. After an approved, deployed change to an important page, use **URL
   inspection** to confirm Google's canonical/indexing view and request
   indexing when appropriate. Recheck the performance window after enough
   time has passed to distinguish a trend from a small sample.
