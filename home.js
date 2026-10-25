// Home: hover preview for the case-study cards. Pointer screens only; on touch the cards stay plain links.
(() => {
  if (!matchMedia('(hover: hover)').matches) return;
  const screen = document.querySelector('.home-screen'), list = document.querySelector('.cs-list');
  const cards = [...list.querySelectorAll('.cs-card[data-shot]')];

  // the panel: one screenshot per card; a card without one yet (the case study to come) gets an empty frame
  const pv = document.createElement('a');
  pv.className = 'cs-preview'; pv.tabIndex = -1; pv.setAttribute('aria-hidden', 'true');
  pv.innerHTML = cards.map(c => c.dataset.shot
    ? `<img src="${c.dataset.shot}" alt="" loading="lazy" decoding="async">`
    : '<span class="pv-empty"><span>Image coming soon</span></span>').join('');
  screen.append(pv);
  const imgs = [...pv.children];

  // it fills the space between the header and the cards; the raised card reaches up to meet it
  const head = screen.querySelector('.site-head');
  const place = () => {
    const r = screen.getBoundingClientRect();
    screen.style.setProperty('--pv-head', (head.getBoundingClientRect().bottom - r.top) + 'px');
    screen.style.setProperty('--pv-bottom', (r.bottom - list.getBoundingClientRect().top) + 'px');
  };
  place(); addEventListener('resize', place);

  let t;
  const open = i => {
    clearTimeout(t); place();
    cards.forEach((c, k) => c.classList.toggle('active', k === i));
    imgs.forEach((m, k) => m.classList.toggle('on', k === i));
    if (cards[i].href) pv.href = cards[i].href; else pv.removeAttribute('href'); // the case study to come has no page yet
    screen.classList.add('previewing');
  };
  // a short delay, so moving from a card down into the panel keeps it open
  const close = () => {
    t = setTimeout(() => {
      screen.classList.remove('previewing');
      cards.forEach(c => c.classList.remove('active'));
      imgs.forEach(m => m.classList.remove('on'));
    }, 120);
  };
  cards.forEach((c, i) => {
    c.addEventListener('pointerenter', () => open(i));
    c.addEventListener('focus', () => open(i));
    c.addEventListener('blur', close);
  });
  // the cursor over a case study: a dark pill, the site's arrow in the brand gradient and "View case study",
  // following the pointer
  const cur = document.createElement('div');
  cur.className = 'cs-cursor'; cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = '<svg viewBox="0 0 16 16"><defs><linearGradient id="cur-grad" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#6BABFF"/><stop offset="1" stop-color="#0051FF"/></linearGradient></defs>' +
    '<path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="url(#cur-grad)" stroke-width="2" stroke-linecap="square"/></svg>' +
    '<span>View case study</span>';
  const label = cur.querySelector('span');
  const soon = list.querySelector('.cs-card.soon');
  document.body.append(cur);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
  const follow = () => {
    cx += (x - cx) * (still ? 1 : .35); cy += (y - cy) * (still ? 1 : .35);
    cur.style.transform = `translate(${cx}px, ${cy}px)`;
    raf = Math.abs(x - cx) + Math.abs(y - cy) > .1 ? requestAnimationFrame(follow) : 0;
  };
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    if (!cur.classList.contains('on')) { cx = x; cy = y; }
    if (!raf) raf = requestAnimationFrame(follow);
  }, { passive: true });
  [...cards, pv, soon].filter(Boolean).forEach(el => {
    el.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      // the fourth card has no page yet: the pill turns light grey and says so
      const isSoon = el === soon || (el === pv && !pv.hasAttribute('href'));
      cur.classList.toggle('soon', isSoon);
      label.textContent = isSoon ? 'Case study coming soon' : 'View case study';
      cx = x = e.clientX; cy = y = e.clientY; follow(); cur.classList.add('on');
    });
    el.addEventListener('pointerleave', () => cur.classList.remove('on'));
  });

  [list, pv].forEach(el => {
    el.addEventListener('pointerenter', () => clearTimeout(t));
    el.addEventListener('pointerleave', close);
  });
})();
