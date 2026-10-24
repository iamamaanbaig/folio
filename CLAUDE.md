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
  Behind the first screen (`has-bg` on `.home-screen` shows it, with the
  frosted cards and readability patches; drop the class to hide them): the signature, `assets/home-bg.webp` (a lossless WebP
  of the uploaded `homebackgroundimage.png`: lossy compression smudged the glow), as a CSS background, frame
  width at its own proportions, centred on the window; on phones it stays
  pinned to the screen until the last case-study card scrolls up.
  The statement comes first in the markup (shown first on phones, below the
  work on wide screens). `home.js` adds the card hover preview (pointer
  screens only): the card turns light and opens into a panel with the case
  study's opening screen (`data-shot` on each card). Four cards in a row:
  GIFA, Fee management, Creating Automation, then a placeholder (`.soon`,
  not a link, no preview) for the fourth case study. The card in focus keeps
  full strength and the others fade to 35%. At rest a card shows only its
  title (lead size, medium) and arrow; the description (body size) appears
  when the card is in focus (pointer screens; phones always show it). The
  preview panel has no corner button: the card's arrow and the cursor lead in.
  "Selected case studies" is a quiet grey sentence-case label on the home
  page only (no ghost word); case studies keep their uppercase section
  titles. The statement is lighter (weight 400) and smaller, with open
  space above it.
  Over a case-study card or its preview, the pointer becomes a dark pill:
  the pixel arrow (`cursor.png`, turned to point up-right) and "View case
  study" in PP Mondwest (`.cs-cursor`, home.js; mouse only).
- Site header (name, Home, Contact) on every page; its styles live in the
  shared `case-studies/case-study.css`. On case studies it opens the first
  screen, then floats: hidden while scrolling down, shown when scrolling up,
  when the pointer reaches the top edge, or on keyboard focus (`case-study.js`).
- Case-study footers: "Other projects" shows the other two case studies, each
  a link with its opening screen (the same shot as the home preview), title,
  description and arrow.
- Contact page: `contact/index.html` with `contact/contact.css` and
  `contact/contact.js`.
- "Global Incentive Fee Awards case study":
  `case-studies/global-incentive-fee-awards/index.html`. A case study page,
  not the home page. Its images live in `GIFAcasestudyimages/`.
