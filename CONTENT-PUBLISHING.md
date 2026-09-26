# Policani.net Content Publishing

The repository owns the publication process for the whole site. Governance is
the first generated collection: one manifest drives its landing-page cards,
field-note pages, category counts, PDF links, page counts, metadata, sitemap
entries, `llms.txt` entries, and inputs to the full-text search build.

## Source of truth

- `content/governance-library.json` contains every published white-paper entry.
- `content/governance-entry.schema.json` defines the intake fields.
- `governance/whitepapers/` contains the public PDFs.
- `assets/` contains an optional 1200x630 social image named by `socialImage`.
- `assets/site-search.js` renders Pagefind results, filters, excerpts, and
  pagination. It does not contain the search corpus.
- `build-search.ps1` builds the generated `pagefind/` index from the public HTML
  and PDF URLs in `sitemap.xml`.
- `site-content.ps1` validates and builds generated site content.
- `publish.ps1` runs the content build before its normal site checks.

Before generated surfaces are rebuilt, `publish.ps1` reconciles each white
paper's `lastModified` value with its public PDF revision. A pending PDF
replacement receives the release date; an older manifest date advances to the
latest committed PDF revision. The pipeline then regenerates the companion
field note's Article `dateModified` and both sitemap entries from that value.
Run `./site-content.ps1 -Action SyncPdfDates` before a local review when the
PDF date itself is part of the change under review.

Do not hand-edit generated governance cards, field-note HTML, or the generated
`pagefind/` directory. A later build will replace those edits.

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
It also rebuilds the site-search index and updates the answer-engine index in
`llms.txt`.
It does not publish.

Site search is full-text search. Pagefind indexes the main content of every
public sitemap HTML page and extracted text from every public sitemap PDF.
Titles, summaries, headings, and categories receive more ranking weight, but
body and PDF wording can produce results. The generated index also supplies
highlighted excerpts, content-type filters, and paginated results.

## Review and publish

1. Run `.\site-content.ps1 -Action Check`.
2. Preview `governance/index.html` and the new field note locally at desktop and
   mobile widths.
3. Confirm the landing-card order, category color, full toolbar, TL;DR, paper
   preview, operating move, contents preview, visible sources, PDF download, and
   source links.
4. Search locally at a smartphone width for the paper by title, one distinctive
   field-note body phrase, and one phrase found only in the PDF. Confirm the
   expected content type, excerpt, and link on `search.html`, and confirm the
   matching card through the Governance Library filter. The build updates the
   search asset fingerprints automatically.
5. Run `.\publish.ps1 -DryRun`.
6. Inspect the exact Git changes. Keep unrelated files out of the release.
7. Publish with `.\publish.ps1 "Add governance paper: <title>"` only after the
   public change is approved.
8. Verify the live landing page, field note, PDF, and successful search result
   on `https://policani.net`. Publication is incomplete if the content is live
   but its search result is absent or stale.

## Build and validation guarantees

The root pipeline rejects:

- duplicate sequences, slugs, or PDFs;
- unknown categories or malformed public filenames;
- missing PDFs or incorrect page counts;
- previews without exactly three contents expectations;
- fewer than two visible sources;
- field-note pages that are not represented in the manifest;
- published HTML pages or PDFs missing from the site-search index;
- duplicate result URLs or a Pagefind page count that differs from the sitemap
  search corpus;
- missing optional social images.

The normal publishing workflow continues to check changed HTML for broken local
links, internal workspace leaks, and PDF page-count claims.

## Updating the system

When the governance field-note design changes, update the template in
`site-content.ps1`, run `.\site-content.ps1 -Action Build`, and review the
generated change across representative papers from all three categories. Avoid
editing 28 generated pages independently.
