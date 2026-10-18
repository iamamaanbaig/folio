// Case study (cs1v1.5): one scroll = next section, pinned challenges title with a square per challenge,
// and the section index.
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = () => matchMedia('(min-width: 900px)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const onScroll = [];
  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; onScroll.forEach(fn => fn()); });
  }, { passive: true });

  /* ---------- pinned sections (challenges, solutions) ----------
     Each .snap-sec has a pinned header (.pin) and rows (data-row) that snap under it. The header height is
     exposed as --sticky-h on the section, and the squares next to its title track the current row. */
  const pinOf = el => { const sec = el.closest('.snap-sec'); return sec ? $('.pin', sec) : null; };
  $$('.snap-sec').forEach(sec => {
    const pin = $('.pin', sec);
    const rows = $$('[data-row]', sec);
    const count = $('.count', sec);
    const setH = () => sec.style.setProperty('--sticky-h', `${pin.offsetHeight}px`);
    new ResizeObserver(setH).observe(pin);
    setH();
    if (!count) return;
    count.innerHTML = rows.map(() => '<i></i>').join('');
    const squares = $$('i', count);
    const mark = () => {
      const line = pin.getBoundingClientRect().bottom + innerHeight * .35;
      let cur = 0;
      rows.forEach((r, i) => { if (r.getBoundingClientRect().top < line) cur = i; });
      squares.forEach((q, i) => q.classList.toggle('on', i === cur));
    };
    onScroll.push(mark);
    mark();
  });

  /* ---------- product designs: a horizontal strip, one screen per step ----------
     Desktop: drag the strip with the mouse (it follows the pointer, then settles on the nearest screen), or
     use the arrow buttons, left/right keys or a sideways trackpad swipe to move it one screen along; page
     scrolling passes straight through to the footer. Phones: the strip is swiped sideways. The squares by the
     title track the screen(s) at rest on the left. */
  const designs = $('.designs');
  const strip = designs && $('.ds-strip', designs);
  const screens = strip ? $$('.ds-fig', strip) : [];
  const dsArrows = designs ? $$('.ds-arrow', designs) : [];
  let dsSquares = [];
  let dsIndex = 0;
  let dsX = 0; // current offset of the strip, in px (0 or negative)
  // where each screen comes to rest; the strip never travels past the point where the last screen meets the
  // right frame, so the last few screens can share that resting place
  const dsStops = () => {
    const pad = screens[0].offsetLeft;
    const end = screens[screens.length - 1];
    const max = end.offsetLeft + end.offsetWidth - pad - (designs.clientWidth - 2 * pad);
    return screens.map(s => Math.max(0, Math.min(s.offsetLeft - pad, max)));
  };
  const dsMark = i => {
    dsIndex = i;
    const at = desktop() ? dsStops() : null;
    dsSquares.forEach((q, k) => q.classList.toggle('on', at ? at[k] === at[i] : k === i));
    dsArrows.forEach(a => { a.disabled = dsNext(Number(a.dataset.dir)) === -1; });
  };
  // the next screen in that direction that actually moves the strip, or -1 at the end
  const dsNext = dir => {
    if (!desktop()) { const n = dsIndex + dir; return n < 0 || n >= screens.length ? -1 : n; }
    const at = dsStops();
    for (let n = dsIndex + dir; n >= 0 && n < screens.length; n += dir) {
      if (at[n] !== at[dsIndex]) return dir > 0 ? n : at.indexOf(at[n]);
    }
    return -1;
  };
  const dsShow = i => {
    const at = dsStops();
    i = at.indexOf(at[i]);
    dsX = -at[i];
    strip.style.transform = `translateX(${dsX}px)`;
    dsMark(i);
  };
  if (strip) {
    const count = $('.count', designs);
    count.innerHTML = screens.map(() => '<i></i>').join('');
    dsSquares = $$('i', count);
    dsMark(0);
    addEventListener('resize', () => { if (desktop()) dsShow(dsIndex); else { strip.style.transform = ''; dsX = 0; } });
    const viewport = strip.parentElement;
    dsArrows.forEach(a => a.addEventListener('click', () => {
      const next = dsNext(Number(a.dataset.dir));
      if (next === -1) return;
      if (desktop()) dsShow(next);
      else viewport.scrollTo({ left: screens[next].offsetLeft - screens[0].offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
    viewport.addEventListener('scroll', () => {
      if (desktop()) return;
      const x = viewport.scrollLeft;
      let cur = 0;
      screens.forEach((s, i) => { if (s.offsetLeft - screens[0].offsetLeft <= x + s.offsetWidth / 2) cur = i; });
      dsMark(cur);
    }, { passive: true });

    // drag with the mouse (or a finger on a wide tablet): the strip follows the pointer 1:1, stretches a
    // little past either end, and on release settles on the nearest screen, or the next one after a flick
    let drag = null;
    let dragged = false;
    viewport.addEventListener('click', e => { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
    viewport.addEventListener('pointerdown', e => {
      dragged = false;
      if (!desktop() || e.button !== 0) return;
      drag = { id: e.pointerId, x0: e.clientX, base: dsX, x: e.clientX, t: performance.now(), v: 0, moved: false };
      strip.style.transition = 'none';
    });
    viewport.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0;
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true;
        viewport.setPointerCapture(e.pointerId);
        viewport.classList.add('is-dragging');
      }
      if (!drag.moved) return;
      const now = performance.now();
      drag.v = (e.clientX - drag.x) / Math.max(1, now - drag.t);
      drag.x = e.clientX;
      drag.t = now;
      const min = -dsStops()[screens.length - 1];
      let x = drag.base + dx;
      if (x > 0) x /= 3;
      else if (x < min) x = min + (x - min) / 3;
      dsX = x;
      strip.style.transform = `translateX(${x}px)`;
    });
    const release = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const { moved, v } = drag;
      drag = null;
      strip.style.transition = '';
      viewport.classList.remove('is-dragging');
      if (!moved) return;
      dragged = true; // the click that ends a drag must not open the viewer
      const at = dsStops();
      const pos = -dsX;
      let i = 0;
      at.forEach((s, k) => { if (Math.abs(s - pos) < Math.abs(at[i] - pos)) i = k; });
      // a quick flick carries on to the next resting place in that direction
      if (Math.abs(v) > .5) {
        const dir = v < 0 ? 1 : -1;
        if (dir > 0 && at[i] <= pos) i = at.findIndex(s => s > pos + 1);
        if (dir < 0 && at[i] >= pos) i = at.map(s => s < pos - 1).lastIndexOf(true);
        if (i === -1) i = dir > 0 ? screens.length - 1 : 0;
      }
      dsShow(i);
    };
    viewport.addEventListener('pointerup', release);
    viewport.addEventListener('pointercancel', release);
    viewport.addEventListener('dragstart', e => e.preventDefault());
  }
  // true when the designs section is on screen and the strip can still move in that direction
  const dsStep = dir => {
    if (!strip) return false;
    const r = designs.getBoundingClientRect();
    if (r.top > innerHeight / 2 || r.bottom < innerHeight / 2) return false;
    const next = dsNext(dir);
    if (next === -1) return false;
    dsShow(next);
    animating = true;
    setTimeout(() => { animating = false; }, reduceMotion ? 0 : 850);
    return true;
  };

  /* ---------- image viewer ----------
     Opens from a challenge image (stepping through the challenge images on screen), a solution's screen
     (stepping through that solution's screens) or a product design (stepping through all six). Arrows and left/right keys step, Esc or the close
     button shuts it and returns focus to where it was opened. */
  const lb = $('.lightbox');
  let lbList = []; // { src, alt, label }
  let lbAt = 0;
  let lbFrom = null;
  let lbDone = null; // called with the last image shown, when the viewer closes
  const lbOpen = () => lb && !lb.hidden;
  const lbShow = i => {
    lbAt = (i + lbList.length) % lbList.length;
    const item = lbList[lbAt];
    const pic = $('.lb-img', lb);
    pic.src = item.src;
    pic.alt = item.alt;
    pic.style.animation = 'none';
    void pic.offsetWidth; // restart the fade for each image
    pic.style.animation = '';
    $('.lb-title', lb).textContent = item.label;
    $('.lb-count', lb).textContent = `${lbAt + 1} / ${lbList.length}`;
  };
  const lbStart = (items, at, from, done) => {
    lbList = items;
    lbFrom = from;
    lbDone = done || null;
    lb.hidden = false;
    document.documentElement.classList.add('lb-open');
    lbShow(at);
    $('.lb-close', lb).focus();
  };
  const lbClose = () => {
    lb.hidden = true;
    document.documentElement.classList.remove('lb-open');
    if (lbDone) lbDone(lbAt);
    if (lbFrom) lbFrom.focus();
  };
  const itemOf = (img, label) => ({ src: img.currentSrc || img.src, alt: img.alt, label });

  /* ---------- solution screens: thumbnails switch the screen, the label follows ---------- */
  $$('.sol-shot').forEach(fig => {
    const view = $('.sol-view', fig);
    if (!view) return;
    const imgs = $$('img', view);
    const thumbs = $$('.thumb', fig);
    const cap = $('.sol-cap', fig);
    let at = 0;
    const set = i => {
      at = i;
      imgs.forEach((im, k) => im.classList.toggle('on', k === i));
      thumbs.forEach((t, k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-pressed', k === i); });
      cap.textContent = imgs[i].dataset.label;
      view.setAttribute('aria-label', `Enlarge: ${imgs[i].dataset.label}`);
    };
    thumbs.forEach((t, k) => t.addEventListener('click', () => set(k)));
    if (lb) view.addEventListener('click', () => {
      imgs.forEach(im => { im.loading = 'eager'; });
      lbStart(imgs.map(im => itemOf(im, im.dataset.label)), at, view, set);
    });
  });

  if (lb) {
    // product designs: a click (not a drag) opens the screen; closing the viewer leaves the strip on the last one seen
    const dsViews = $$('.ds-view');
    dsViews.forEach((v, i) => v.addEventListener('click', () => {
      lbStart(dsViews.map(d => itemOf($('img', d), d.closest('.ds-fig').querySelector('figcaption').textContent)), i, v, k => {
        if (desktop()) dsShow(k);
        else strip.parentElement.scrollTo({ left: screens[k].offsetLeft - screens[0].offsetLeft });
      });
    }));
    $$('.zoom').forEach(btn => btn.addEventListener('click', () => {
      const figs = $$('.ch-fig', btn.closest('section')).filter(f => f.offsetParent !== null);
      lbStart(figs.map(f => itemOf($('img', f), $('figcaption', f).textContent)), figs.indexOf(btn.closest('.ch-fig')), btn);
    }));
    $('.lb-prev', lb).addEventListener('click', () => lbShow(lbAt - 1));
    $('.lb-next', lb).addEventListener('click', () => lbShow(lbAt + 1));
    $('.lb-close', lb).addEventListener('click', lbClose);
    // a click on the backdrop (not the image or a button) closes it
    lb.addEventListener('click', e => { if (e.target === lb || e.target.matches('.lb-stage, .lb-frame, .lb-bar')) lbClose(); });
    lb.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); lbClose(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); lbShow(lbAt - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); lbShow(lbAt + 1); }
      else if (e.key === 'Tab') { // keep focus inside the viewer
        const f = $$('button', lb);
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
  }

  /* ---------- one scroll = next section (desktop) ----------
     Stops are the elements marked data-stop. Challenges stop just under the pinned title. If a stretch
     between two stops is taller than the screen, extra stops a screen apart make sure nothing is skipped.
     Trackpad inertia is ignored until the wheel goes quiet, so one flick moves exactly one stop. */
  let stops = [];
  const buildStops = () => {
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const offsetFor = el => (el.hasAttribute('data-row') && pinOf(el) ? pinOf(el).offsetHeight : 0);
    const base = $$('[data-stop]').map(el => Math.round(el.getBoundingClientRect().top + scrollY - offsetFor(el)));
    base.push(max);
    // stops closer than a fifth of the screen collapse into one (e.g. the section top and its first row)
    const sorted = [...new Set(base.map(y => Math.min(max, Math.max(0, y))))].sort((a, b) => a - b)
      .filter((y, i, arr) => i === 0 || y - arr[i - 1] > vh * .2);
    stops = [];
    sorted.forEach((y, i) => {
      stops.push(y);
      const next = sorted[i + 1];
      if (next !== undefined && next - y > vh * 1.15) {
        for (let s = y + vh * .85; s < next - vh * .3; s += vh * .85) stops.push(Math.round(s));
      }
    });
  };

  let animating = false;
  let lastWheel = 0;
  const glide = to => {
    const from = scrollY;
    if (Math.abs(to - from) < 2) return;
    if (reduceMotion) { scrollTo(0, to); return; }
    animating = true;
    let start = null;
    const T = 850;
    const step = now => {
      if (start === null) start = now;
      const k = Math.min(1, (now - start) / T);
      const e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k); // expo-out: quick start, soft landing
      scrollTo(0, from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
      else animating = false;
    };
    requestAnimationFrame(step);
  };
  const go = dir => {
    buildStops();
    const y = scrollY;
    const next = dir > 0 ? stops.find(s => s > y + 4) : [...stops].reverse().find(s => s < y - 4);
    if (next !== undefined) glide(next);
  };

  addEventListener('wheel', e => {
    if (!desktop() || e.ctrlKey || lbOpen()) return;
    e.preventDefault();
    const now = performance.now();
    const quiet = now - lastWheel > 160;
    lastWheel = now;
    const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const d = sideways ? e.deltaX : e.deltaY;
    if (animating || !quiet || Math.abs(d) < 4) return;
    if (sideways) dsStep(Math.sign(d));
    else go(Math.sign(d));
  }, { passive: false });

  addEventListener('keydown', e => {
    if (!desktop() || lbOpen() || e.target.closest('input, textarea, select, [contenteditable]')) return;
    const down = ['PageDown', 'ArrowDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
    const up = ['PageUp', 'ArrowUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
    const side = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (side) { if (!animating && dsStep(side)) e.preventDefault(); return; }
    if (!down && !up) return;
    e.preventDefault();
    if (!animating) go(down ? 1 : -1);
  });

  /* ---------- section index: tracks the current section, glides there on click ---------- */
  const index = $('.index');
  if (index) {
    const links = $$('a', index);
    const targets = links.map(a => $(a.getAttribute('href')));
    const track = () => {
      let cur = 0;
      targets.forEach((t, i) => { if (t.getBoundingClientRect().top < innerHeight * .4) cur = i; });
      // the last section can't scroll to the top of the screen on phones; at the page end it is current
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) cur = targets.length - 1;
      links.forEach((a, i) => a.setAttribute('aria-current', i === cur));
    };
    onScroll.push(track);
    track();
    links.forEach((a, i) => a.addEventListener('click', e => {
      e.preventDefault();
      const y = Math.round(targets[i].getBoundingClientRect().top + scrollY);
      if (desktop()) glide(y);
      else targets[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', a.getAttribute('href'));
    }));
  }

  /* ---------- back to top ---------- */
  $$('.to-top').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    if (desktop()) glide(0);
    else scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));
})();
