// Case study interactions (cs1.3): pinned section titles, layout, section index, image viewer, thumbnails, parallax.
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

  /* ---------- 2 & 5. panels: the title pins for the length of its section ---------- */
  const panels = $$('.panel');
  const panelFade = () => panels.forEach(sec => {
    const head = $('.panel-head', sec);
    const r = sec.getBoundingClientRect();
    head.style.setProperty('--fade', r.top < -4 && r.bottom > head.offsetHeight + 80 ? 1 : 0);
  });
  onScroll.push(panelFade);
  panelFade();

  /* ---------- 3. challenges: rows match their image, header bands pin under the section title ---------- */
  const steps = $('.steps');
  if (steps) {
    const stack = $('.stack', steps);
    const shots = $$('.shot', stack);
    const row1 = $$('.row-1', steps);
    const row2 = $$('.row-2', steps);
    const cells = $$('.tri-cell', steps);
    const labelPin = $('.label-pin', steps);

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
      const strip = labelPin.offsetHeight;
      cells.forEach(c => {
        const band = $('.ghost-cell', c).offsetHeight;
        c.style.setProperty('--pin-top', `${strip + band - c.offsetHeight}px`);
      });
    };
    new ResizeObserver(layout).observe(document.body);
    $$('img', stack).forEach(img => img.complete || img.addEventListener('load', layout, { once: true }));
    layout();

    const fade = () => {
      const r = steps.getBoundingClientRect();
      const pinned = r.top < -10 && r.bottom > innerHeight * .3;
      cells.forEach(c => c.style.setProperty('--fade', pinned ? 1 : 0));
    };
    onScroll.push(fade);
    fade();
  }

  /* ---------- 4. problems → solutions: title and column header pin for the whole section ---------- */
  const pss = $('.pss');
  if (pss) {
    const label = $('.pss-label', pss);
    const band = $('.pband', pss);
    const firstBlock = $('.pblock', pss);
    const setStrip = () => pss.style.setProperty('--strip', `${label.offsetHeight}px`);
    new ResizeObserver(setStrip).observe(label);
    setStrip();
    const fade = () => {
      const bandBottom = label.offsetHeight + band.offsetHeight;
      const r = pss.getBoundingClientRect();
      const pinned = firstBlock.getBoundingClientRect().top < bandBottom + 8 && r.bottom > bandBottom + 80;
      band.style.setProperty('--fade', pinned ? 1 : 0);
    };
    onScroll.push(fade);
    fade();
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

  /* ---------- parallax: ghost words drift sideways behind their crop line ----------
     The only scroll effect in this version. Each word drifts while its section crosses the screen, with a
     soft time-based follow so it glides. Cropped words slide until their end shows; words that already fit
     slide in from a cropped start. */
  if (!reduceMotion) {
    const items = $$('.ghost').map(g => ({ g, cell: g.parentElement, sec: g.closest('section'), cur: 0, tgt: 0, a: 0, b: 0 }));

    const measure = () => items.forEach(it => {
      const cellRight = it.cell.getBoundingClientRect().right;
      const left = it.g.getBoundingClientRect().left - it.cur;
      const hidden = it.g.scrollWidth - (cellRight - left);
      const nudge = parseFloat(getComputedStyle(it.g).fontSize) * .3;
      // Every word travels at least `nudge`, so short crops still read as motion
      it.a = hidden >= nudge ? 0 : nudge - Math.max(0, hidden);
      it.b = -Math.max(0, hidden);
    });

    const targets = () => {
      const vh = innerHeight;
      items.forEach(it => {
        const r = it.sec.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        it.tgt = it.a + (it.b - it.a) * p;
      });
    };

    let running = false;
    let last = 0;
    const tick = now => {
      const k = 1 - Math.exp(-Math.min(64, now - last) / 140); // τ ≈ 140ms, same feel at 60/120Hz
      last = now;
      let moving = false;
      items.forEach(it => {
        it.cur += (it.tgt - it.cur) * k;
        if (Math.abs(it.tgt - it.cur) > .1) moving = true;
        else it.cur = it.tgt;
        it.g.style.transform = `translate3d(${it.cur.toFixed(2)}px, 0, 0)`;
      });
      running = moving;
      if (moving) requestAnimationFrame(tick);
    };
    const kick = () => {
      targets();
      if (running) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(tick);
    };

    onScroll.push(kick);
    addEventListener('resize', () => { measure(); kick(); });
    document.fonts.ready.then(() => { measure(); kick(); });
    measure();
    kick();
  }
})();
