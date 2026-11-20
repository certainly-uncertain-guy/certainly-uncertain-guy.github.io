# Curriculum Vitae — Ashutosh Shukla

Academic CV in LaTeX.

## Build

Run from this `cv/` folder:

```sh
make           # builds main.pdf and publishes it to ../assets/pdf/Ashutosh_Shukla_Resume.pdf
make clean     # removes LaTeX build files
```

The CV is kept in the repo but is not published on the website: there are no
Resume links, and `_config.yml` excludes `assets/pdf/Ashutosh_Shukla_Resume.pdf` from the
Jekyll build. Run `make` after every CV edit and commit that PDF to keep it current. `cv/main.pdf` and the LaTeX build files are git-ignored. Jekyll excludes `cv/`
(see `_config.yml`), so the LaTeX source is never published.

## Layout

```
main.tex        Section order. Comment out or move an \input line to hide or reorder a section.
preamble.tex    Packages, margins, name/contact, and shared macros.
resume.cls      Page style (header, section headings). Rarely needs edits.
sections/       One file per CV section.
```

| File | Section |
|------|---------|
| `education.tex` | Degrees and dissertation |
| `research-interests.tex` | Research interests |
| `appointments.tex` | Industry and research positions |
| `journal-articles.tex` | Published journal articles |
| `conference-proceedings.tex` | Refereed conference proceedings |
| `under-review.tex` | Manuscripts under review |
| `preprints.tex` | arXiv / ESSOAr preprints |
| `datasets.tex` | Published datasets |
| `patents.tex` | Patents and patent applications |
| `talks.tex` | Conference talks; invited and seminar talks |
| `posters-abstracts.tex` | Posters and conference abstracts |
| `honors.tex` | Honors and awards |
| `research-support.tex` | Grants |
| `teaching.tex` | Teaching |
| `service.tex` | Reviewing and leadership |
| `projects.tex` | Selected projects |
| `coursework.tex` | Graduate coursework |

## Conventions

- **Order:** newest first in every section.
- **Dates:** `Mon YYYY` (e.g. `Nov 2026`), ranges with `--`, current role ends in `Present`.
- **Citations** (APA-like): `Authors (Year). Title in sentence case. \textit{Venue}, volume, article/pages. \doi{...}`
  - Write your own name as `\me` (renders **Shukla, A.**).
  - Use `\doi{10.xxxx/...}`, `\arxiv{2604.22221}`, `\note{Best Paper Award}`.
- **Talks:** `` ``Title.'' Venue, City, ST, Mon YYYY. `` with the title exactly as on the certificate or program.
- **Positions:** `\position{Organization}{Title}{Mon YYYY -- Mon YYYY}` followed by an `itemize` list.
- **Placeholders:** `\todo{...}` prints in red, so you can see what still needs to be filled in before sending.

## Common updates

- **Paper accepted:** move its entry from `under-review.tex` or `preprints.tex` to `journal-articles.tex` and add the DOI.
- **New talk:** add one line at the top of the list in `talks.tex`.
- **New job:** add a `\position{...}` block at the top of `appointments.tex` and set the previous role's end date.
