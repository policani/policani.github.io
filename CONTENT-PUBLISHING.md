# Policani.net Content Publishing

The repository owns the publication process for the whole site. Governance is
the first generated collection: one manifest drives its landing-page cards,
field-note pages, category counts, PDF links, page counts, metadata, and sitemap
and `llms.txt` entries.

## Source of truth

- `content/governance-library.json` contains every published white-paper entry.
- `content/governance-entry.schema.json` defines the intake fields.
- `governance/whitepapers/` contains the public PDFs.
- `assets/` contains an optional 1200x630 social image named by `socialImage`.
- `site-content.ps1` validates and builds generated site content.
- `publish.ps1` runs the content build before its normal site checks.

Do not hand-edit generated governance cards or field-note HTML. A later build
will replace those edits.

## Add a white paper

1. Copy an existing entry from `content/governance-library.json` into a new JSON
   file outside the manifest.
2. Replace every field with the finished content for the new paper. The intake
   requires a TL;DR, operating move, substantive preview, exactly three contents
   expectations, the PDF filename and page count, and at least two visible
   sources. `sequence`, `publishedLabel`, and `lastModified` may be omitted; the
   intake command supplies them.
3. Run:

   ```powershell
   .\site-content.ps1 -Action AddWhitepaper -Spec .\path\new-entry.json -Pdf .\path\marco-policani-new-paper.pdf
   ```

The command copies the PDF, adds the manifest entry, validates the full library,
regenerates every affected surface, updates counts, and creates sitemap entries.
It also updates the answer-engine index in `llms.txt`. It does not publish.

## Review and publish

1. Run `.\site-content.ps1 -Action Check`.
2. Preview `governance/index.html` and the new field note locally at desktop and
   mobile widths.
3. Confirm the landing-card order, category color, full toolbar, TL;DR, paper
   preview, operating move, contents preview, visible sources, PDF download, and
   source links.
4. Run `.\publish.ps1 -DryRun`.
5. Inspect the exact Git changes. Keep unrelated files out of the release.
6. Publish with `.\publish.ps1 "Add governance paper: <title>"` only after the
   public change is approved.
7. Verify the live landing page, field note, and PDF on `https://policani.net`.

## Build and validation guarantees

The root pipeline rejects:

- duplicate sequences, slugs, or PDFs;
- unknown categories or malformed public filenames;
- missing PDFs or incorrect page counts;
- previews without exactly three contents expectations;
- fewer than two visible sources;
- field-note pages that are not represented in the manifest;
- missing optional social images.

The normal publishing workflow continues to check changed HTML for broken local
links, internal workspace leaks, and PDF page-count claims.

## Updating the system

When the governance field-note design changes, update the template in
`site-content.ps1`, run `.\site-content.ps1 -Action Build`, and review the
generated change across representative papers from all three categories. Avoid
editing 28 generated pages independently.
