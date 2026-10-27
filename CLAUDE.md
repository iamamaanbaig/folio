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
- Font: Inter, everywhere. PP Mondwest survives only as the shape of the
  contact page's "@" mark (an SVG path); the web font file
  (`assets/fonts/pp-mondwest-regular.woff2`) is no longer loaded.
- Structure: `index.html` (home: hero → case-study list → contact),
  `case-studies/<slug>/index.html` per case study, shared `styles.css`.

## Pages
- Home page: `index.html`, one screen on wide windows: header; the hero
  ("UX & Product Designer", sized so "UX & Product" ends on the frame's middle
  line, then "I make complicated software feel obvious." in uppercase Inter);
  then "Selected case studies" (a quiet grey label, the home page's own) and
  four cards along the bottom. Phones: hero, signature, then the cards.
  Its styles are in `home.css`, on top of `styles.css` and the shared
  `case-studies/case-study.css`.
  The signature (`has-bg` on `.home-screen`; drop the class to hide it, with
  the frosted cards): `assets/home-bg.webp`, a lossless WebP of the uploaded
  `homebackgroundimage.png` with its page-coloured backdrop turned into
  transparency (so the grid lines show through), as a CSS background, large on
  the right at its own proportions (at most 1.4 window heights wide), starting
  where the title ends, running off the top and
  right frame line and fading out before the cards; it fades in last on load,
  after the title, statement and cards rise in; on phones it
  sits under the hero and stays pinned until the last card scrolls up.
  Cards: GIFA, Fee management, Creating Automation, then the fourth case
  study to come, Stamp (`.soon`: a full card but not a link; its preview pairs
  two screens from `Stampcasestudyimages/`; "Soon" in
  the arrow's colour and place; its cursor is a light grey pill, "Case study
  coming soon"; on phones it shows only its title and "Soon"). At rest a card is only
  its title and arrow; its description waits under it (`.cs-text`). Phones
  always show the descriptions.
  Hover (`home.js`, pointer screens): a light panel covers the hero with the
  case study's opening composition, as on the case study itself: one laptop
  (`data-shot`), two (`data-shot` in front, `data-shot-back` behind) or three
  (`data-shot` centre, `data-shot-left`, `data-shot-right`); the hovered card
  rises to meet it,
  title and description lifting with it, so they read as one light shape; the
  other cards fade to 35%, the hero and label fade out, and the frame lines
  round the panel step out. The cursor becomes a flat dark pill: the site's
  arrow in the brand gradient and "View case study" in Inter (`.cs-cursor`).
- Site header on every page: the name, then Home and Contact close beside it
  on the left; its styles live in the shared `case-studies/case-study.css`. On case studies it opens the first
  screen, then floats: hidden while scrolling down, shown when scrolling up,
  when the pointer reaches the top edge, or on keyboard focus (`case-study.js`).
- Case-study section index: a bar of section numbers on desktop; on phones one
  "Index" button (bottom right) that opens the sections in a panel from the
  right, the current one marked, Close at the bottom (`.ix-*`, case-study.js).
- Case-study footers: "Other projects" shows the other two case studies, each
  a link with its opening screen (the same shot as the home preview), title,
  description and arrow.
- Contact page: `contact/index.html` with `contact/contact.css` and
  `contact/contact.js`.
- "Global Incentive Fee Awards case study":
  `case-studies/global-incentive-fee-awards/index.html`. A case study page,
  not the home page. Its images live in `GIFAcasestudyimages/`.
