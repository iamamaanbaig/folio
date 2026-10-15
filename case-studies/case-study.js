// Case study interactions: reveals, pinned headers, number reel, count-up and ghost-word parallax.
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

  /* ---------- reveals: once, slightly before an element is fully in view ---------- */
  const revealer = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    revealer.unobserve(e.target);
  }), { rootMargin: '0px 0px -12% 0px' });
  $$('.rv, .rv-img').forEach(el => revealer.observe(el));

  /* ---------- 1. hero: the title fades back as the image box rises over it ---------- */
  const heroText = $('.hero-text');
  const frame = $('.frame');
  if (heroText && frame && !reduceMotion) {
    const cover = () => {
      if (!desktop()) { heroText.style.opacity = ''; heroText.style.transform = ''; return; }
      const t = heroText.getBoundingClientRect();
      const f = frame.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, (t.bottom - f.top) / t.height)); // 0 = clear, 1 = fully covered
      heroText.style.opacity = (1 - k * .85).toFixed(3);
      heroText.style.transform = `scale(${(1 - k * .04).toFixed(4)})`;
    };
    onScroll.push(cover);
    addEventListener('resize', cover);
    cover();
  }

  /* ---------- 2 & 5. panels: the header pins for the length of its section ---------- */
  const panels = $$('.panel');
  const panelFade = () => panels.forEach(sec => {
    const head = $('.panel-head', sec);
    const r = sec.getBoundingClientRect();
    head.style.setProperty('--fade', r.top < -4 && r.bottom > head.offsetHeight + 80 ? 1 : 0);
  });
  onScroll.push(panelFade);
  panelFade();

  /* ---------- 3. challenges: rows match their image group, header bands pin under the label ---------- */
  const steps = $('.steps');
  if (steps) {
    const stack = $('.stack', steps);
    const imgs = $$('img', stack);
    const row1 = $$('.row-1', steps);
    const row2 = $$('.row-2', steps);
    const cells = $$('.tri-cell', steps);
    const labelPin = $('.label-pin', steps);

    const layout = () => {
      [...row1, ...row2].forEach(el => el.style.removeProperty('--row-h'));
      if (desktop() && imgs.length >= 5) {
        // Challenge 1 owns images 1–2, challenge 2 owns images 3–5
        const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
        const top = el => el.getBoundingClientRect().top;
        const h1 = top(imgs[2]) - gap / 2 - top(row1[0]);
        row1.forEach(el => el.style.setProperty('--row-h', `${h1}px`));
        const h2 = imgs[4].getBoundingClientRect().bottom - top(row2[0]);
        row2.forEach(el => el.style.setProperty('--row-h', `${h2}px`));
      }
      const strip = labelPin.offsetHeight;
      cells.forEach(c => {
        const band = $('.ghost-cell', c).offsetHeight;
        c.style.setProperty('--pin-top', `${strip + band - c.offsetHeight}px`);
      });
    };
    new ResizeObserver(layout).observe(document.body);
    imgs.forEach(img => img.complete || img.addEventListener('load', layout, { once: true }));
    layout();

    const fade = () => {
      const r = steps.getBoundingClientRect();
      const pinned = r.top < -10 && r.bottom > innerHeight * .3;
      cells.forEach(c => c.style.setProperty('--fade', pinned ? 1 : 0));
    };
    onScroll.push(fade);
    fade();
  }

  /* ---------- 4. problems → solutions: one pinned header whose number rolls per block ---------- */
  const pss = $('.pss');
  if (pss) {
    const label = $('.pss-label', pss);
    const band = $('.pband', pss);
    const reel = $('.pnum', band);
    const blocks = $$('.pblock', pss);

    const setStrip = () => pss.style.setProperty('--strip', `${label.offsetHeight}px`);
    new ResizeObserver(setStrip).observe(label);
    setStrip();

    const update = () => {
      const bandBottom = label.offsetHeight + band.offsetHeight;
      const r = pss.getBoundingClientRect();
      const pinned = blocks[0].getBoundingClientRect().top < bandBottom + 8 && r.bottom > bandBottom + 80;
      band.style.setProperty('--fade', pinned ? 1 : 0);
      // Roll to the block whose top has passed 40% of the free space under the header
      const line = bandBottom + (innerHeight - bandBottom) * .4;
      let i = 0;
      blocks.forEach((b, k) => { if (b.getBoundingClientRect().top < line) i = k; });
      reel.style.setProperty('--i', i);
    };
    onScroll.push(update);
    update();
  }

  /* ---------- screen thumbnails ---------- */
  $$('.thumbs').forEach(group => group.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    $$('button', group).forEach(b => b.setAttribute('aria-current', b === btn));
  }));

  /* ---------- 5. count-up: once, when half visible; expo-out over 1.6s, staggered ---------- */
  const figs = $$('.metric .fig');
  if (figs.length && !reduceMotion) {
    const show = (el, v) => {
      el.textContent = (el.dataset.pre || '') + v.toFixed(+(el.dataset.dec || 0)) + (el.dataset.suf || '');
    };
    const run = (el, delay) => {
      const to = +el.dataset.to;
      let start = null;
      const step = now => {
        if (start === null) start = now + delay;
        const k = Math.min(1, Math.max(0, (now - start) / 1600));
        show(el, k < 1 ? to * (1 - Math.pow(2, -10 * k)) : to);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    figs.forEach(f => show(f, 0));
    const counter = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      run(e.target, figs.indexOf(e.target) * 100);
      counter.unobserve(e.target);
    }), { threshold: .5 });
    figs.forEach(f => counter.observe(f));
  }

  /* ---------- parallax: ghost words drift sideways behind their crop line ----------
     Scrubbed to scroll with a soft, time-based follow so they glide. Cropped words slide until their end
     shows; words that already fit slide in from a cropped start. */
  if (!reduceMotion) {
    const items = $$('.ghost').map(g => ({ g, cell: g.parentElement, sec: g.closest('section'), cur: 0, tgt: 0, a: 0, b: 0 }));
    const pinnedSection = sec => desktop() && (sec.matches('.steps, .pss, .panel'));

    const measure = () => items.forEach(it => {
      const cellRight = it.cell.getBoundingClientRect().right;
      const left = it.g.getBoundingClientRect().left - it.cur;
      const hidden = it.g.scrollWidth - (cellRight - left);
      const nudge = parseFloat(getComputedStyle(it.g).fontSize) * .3;
      it.a = hidden > 0 ? 0 : nudge;
      it.b = hidden > 0 ? -hidden : 0;
    });

    const targets = () => {
      const vh = innerHeight;
      items.forEach(it => {
        const r = it.sec.getBoundingClientRect();
        let p = pinnedSection(it.sec)
          ? -r.top / Math.max(1, r.height - vh * .35)  // while the header is pinned
          : (vh - r.top) / (vh + r.height);            // while the section crosses the screen
        p = Math.min(1, Math.max(0, p));
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
