// Case study (cs1v1.5): one scroll = next section, pinned section headers with a square per row,
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

  /* ---------- one scroll = next section (desktop) ----------
     Stops are the elements marked data-stop. Rows stop just under their section's pinned header. If a stretch
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
    if (!desktop() || e.ctrlKey) return;
    e.preventDefault();
    const now = performance.now();
    const quiet = now - lastWheel > 160;
    lastWheel = now;
    if (animating || !quiet || Math.abs(e.deltaY) < 4) return;
    go(Math.sign(e.deltaY));
  }, { passive: false });

  addEventListener('keydown', e => {
    if (!desktop() || e.target.closest('input, textarea, select, [contenteditable]')) return;
    const down = ['PageDown', 'ArrowDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
    const up = ['PageUp', 'ArrowUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
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
})();
