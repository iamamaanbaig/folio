// Contact: the message field grows with what you write, shows the send button once there is text, and
// sends through the visitor's mail app (a static site has no server to post to).
(() => {
  const form = document.getElementById('msg'), field = document.getElementById('msg-text');
  const fit = () => { field.style.height = 'auto'; field.style.height = field.scrollHeight + 'px'; };
  const sync = () => { form.classList.toggle('has-text', field.value !== ''); fit(); };
  field.addEventListener('input', sync); addEventListener('resize', sync); sync();
  // Enter sends, Shift+Enter starts a new line
  field.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && field.value.trim()) { e.preventDefault(); form.requestSubmit(); } });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const to = form.dataset.to, body = field.value.trim();
    if (!to || !body) return;
    location.href = `mailto:${to}?subject=${encodeURIComponent('Hello from your portfolio')}&body=${encodeURIComponent(body)}`;
  });
})();
