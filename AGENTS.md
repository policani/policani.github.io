# Policani.net Site Agent Instructions

This file applies to the public portfolio site at `E:\Codex\policani.github.io`.
Codex and Cursor use this file. Claude uses `CLAUDE.md`.

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

## Governance Article Placement

- Published field-note pages live in `governance/field-notes/`.
- Published white-paper PDFs live in `governance/whitepapers/`.
- Article preview and social images live in `assets/`.
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
- Run the local publish dry run when the change set is nontrivial:
  `cd E:\Codex\policani.github.io; .\publish.ps1 -DryRun`
- After deployment, verify the live `https://policani.net` URL for changed
  pages when practical.
