// Case study interactions (cs1.3): layout, section index, image viewer, thumbnails.
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = () => matchMedia('(min-width: 900px)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // Scroll work is batched into one frame
  const onScroll = [];
  let scrollQueued = false;
  addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      onScroll.forEach(fn => fn());
    });
  }, { passive: true });

  /* ---------- 3. challenges: each challenge row ends where its image ends ---------- */
  const steps = $('.steps');
  if (steps) {
    const stack = $('.stack', steps);
    const shots = $$('.shot', stack);
    const row1 = $$('.row-1', steps);
    const row2 = $$('.row-2', steps);

    const layout = () => {
      [...row1, ...row2].forEach(el => el.style.removeProperty('--row-h'));
      if (desktop() && shots.length >= 2) {
        // Each challenge row ends where its image ends
        const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
        const top = el => el.getBoundingClientRect().top;
        const h1 = top(shots[1]) - gap / 2 - top(row1[0]);
        row1.forEach(el => el.style.setProperty('--row-h', `${h1}px`));
        const h2 = shots[1].getBoundingClientRect().bottom - top(row2[0]);
        row2.forEach(el => el.style.setProperty('--row-h', `${h2}px`));
      }
    };
    new ResizeObserver(layout).observe(document.body);
    $$('img', stack).forEach(img => img.complete || img.addEventListener('load', layout, { once: true }));
    layout();

  }

  /* ---------- section index: appears after the hero, tracks the current section, jumps on click ---------- */
  const index = $('.index');
  if (index) {
    const links = $$('a', index);
    const targets = links.map(a => $(a.getAttribute('href')));
    const track = () => {
      const first = targets[0].getBoundingClientRect().top;
      const last = targets[targets.length - 1].getBoundingClientRect().bottom;
      index.classList.toggle('show', first < innerHeight * .6 && last > innerHeight * .5);
      let cur = 0;
      targets.forEach((t, i) => { if (t.getBoundingClientRect().top < innerHeight * .4) cur = i; });
      links.forEach((a, i) => a.setAttribute('aria-current', i === cur));
    };
    onScroll.push(track);
    track();
    links.forEach((a, i) => a.addEventListener('click', e => {
      e.preventDefault();
      targets[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', a.getAttribute('href'));
    }));
  }

  /* ---------- image viewer: full-screen gallery for the challenge images ---------- */
  const viewer = $('.viewer');
  if (viewer) {
    const img = $('img', viewer);
    const cap = $('figcaption', viewer);
    let list = [];
    let at = 0;
    const show = i => {
      at = (i + list.length) % list.length;
      img.src = list[at].src;
      img.alt = list[at].alt;
      cap.innerHTML = `<span>${list[at].alt}</span><span>${at + 1} / ${list.length}</span>`;
      $('.prev', viewer).hidden = $('.next', viewer).hidden = list.length < 2;
    };
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-gallery]');
      if (!btn) return;
      const tpl = $(`template.gallery[data-id="${btn.dataset.gallery}"]`);
      list = [...tpl.content.querySelectorAll('img')].map(i => ({ src: i.getAttribute('src'), alt: i.alt }));
      show(+btn.dataset.index || 0);
      viewer.showModal();
    });
    $('.prev', viewer).addEventListener('click', () => show(at - 1));
    $('.next', viewer).addEventListener('click', () => show(at + 1));
    $('.close', viewer).addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
    viewer.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    });
  }

  /* ---------- screen thumbnails ---------- */
  $$('.thumbs').forEach(group => group.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    $$('button', group).forEach(b => b.setAttribute('aria-current', b === btn));
  }));
})();
