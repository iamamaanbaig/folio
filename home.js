// Home: hover preview for the case-study cards. Pointer screens only; on touch the cards stay plain links.
(() => {
  if (!matchMedia('(hover: hover)').matches) return;
  const screen = document.querySelector('.home-screen'), list = document.querySelector('.cs-list');
  const cards = [...list.querySelectorAll('.cs-card[data-shot]')]; // the placeholder has no screen yet

  // the panel: one screenshot per card
  const pv = document.createElement('a');
  pv.className = 'cs-preview'; pv.tabIndex = -1; pv.setAttribute('aria-hidden', 'true');
  pv.innerHTML = cards.map(c => `<img src="${c.dataset.shot}" alt="" loading="lazy" decoding="async">`).join('');
  screen.append(pv);
  const imgs = [...pv.querySelectorAll('img')];

  // it starts on the cards' bottom line (covering it), so card and panel read as one shape
  const place = () => screen.style.setProperty('--pv-top', (list.getBoundingClientRect().bottom - screen.getBoundingClientRect().top - 1) + 'px');
  place(); addEventListener('resize', place);

  let t;
  const open = i => {
    clearTimeout(t); place();
    cards.forEach((c, k) => c.classList.toggle('active', k === i));
    imgs.forEach((m, k) => m.classList.toggle('on', k === i));
    pv.href = cards[i].href;
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
  // the cursor over a case study: a dark pill, the pixel arrow and "View case study", following the pointer
  const cur = document.createElement('div');
  cur.className = 'cs-cursor'; cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = '<img src="cursor.png" alt="" width="30" height="32"><span>View case study</span>';
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
  [...cards, pv].forEach(el => {
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { cx = x = e.clientX; cy = y = e.clientY; follow(); cur.classList.add('on'); } });
    el.addEventListener('pointerleave', () => cur.classList.remove('on'));
  });

  [list, pv].forEach(el => {
    el.addEventListener('pointerenter', () => clearTimeout(t));
    el.addEventListener('pointerleave', close);
  });
})();
