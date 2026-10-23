// Home: hover preview for the case-study cards. Pointer screens only; on touch the cards stay plain links.
(() => {
  if (!matchMedia('(hover: hover)').matches) return;
  const screen = document.querySelector('.home-screen'), list = document.querySelector('.cs-list');
  const cards = [...list.querySelectorAll('.cs-card')];

  // the panel: one screenshot per card, and the blue way in
  const pv = document.createElement('a');
  pv.className = 'cs-preview'; pv.tabIndex = -1; pv.setAttribute('aria-hidden', 'true');
  pv.innerHTML = cards.map(c => `<img src="${c.dataset.shot}" alt="" loading="lazy" decoding="async">`).join('') +
    '<span class="pv-go"><svg viewBox="0 0 16 16"><path d="M4.5 11.5l7-7M5.5 4.5h6v6"/></svg></span>';
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
  [list, pv].forEach(el => {
    el.addEventListener('pointerenter', () => clearTimeout(t));
    el.addEventListener('pointerleave', close);
  });
})();
