# Folio — working agreement

## Role
Act as an expert UX/UI designer, product designer, interaction designer,
graphic designer, motion designer and art director — not just a developer.

## Design references
Reference images supplied for this site are rough, not pixel-perfect.
Do not copy them literally. Fix spacing, alignment, proportion and colour
as needed, keeping the intent of the reference.

## Workflow
1. Design first: present the refined design (rendered mockup) and note
   what was changed from the reference and why.
2. Develop only after the design is approved.

## Fixed decisions (change only when told)
- Background `#121315`, stroke `#202123`.
- Fixed background: 6-column vertical grid lines, 2.75vw side gutters.
- Font: Inter. One accent: the home statement's "complicated software" line in
  PP Mondwest (`assets/fonts/pp-mondwest-regular.woff2`, made from the
  uploaded `ppmondwest-regular.otf`).
- Structure: `index.html` (home: hero → case-study list → contact),
  `case-studies/<slug>/index.html` per case study, shared `styles.css`.

## Pages
- Home page: `index.html`: header, selected case studies, then the
  statement at the bottom of the first screen (contact section to come).
  Its styles are in `home.css`, on top of `styles.css` and the shared
  `case-studies/case-study.css`.
  Behind the first screen (hidden for now; `has-bg` on `.home-screen` shows
  it, with the frosted cards and readability patches): the signature, `assets/home-bg.webp` (a WebP made
  from the uploaded `homebackgroundimage.png`), as a CSS background, frame
  width at its own proportions, centred on the window; on phones it stays
  pinned to the screen until the last case-study card scrolls up.
  The statement comes first in the markup (shown first on phones, below the
  work on wide screens). `home.js` adds the card hover preview (pointer
  screens only): the card turns light and opens into a panel with the case
  study's opening screen (`data-shot` on each card).
- Site header (name, Home, Contact) on every page; its styles live in the
  shared `case-studies/case-study.css`. On case studies it opens the first
  screen, then floats: hidden while scrolling down, shown when scrolling up,
  when the pointer reaches the top edge, or on keyboard focus (`case-study.js`).
- Contact page: `contact/index.html` with `contact/contact.css` and
  `contact/contact.js`.
- "Global Incentive Fee Awards case study":
  `case-studies/global-incentive-fee-awards/index.html`. A case study page,
  not the home page. Its images live in `GIFAcasestudyimages/`.
