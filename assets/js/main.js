// First-visit mailing list popup (Temple Scrolls)
(function () {
  var KEY = 'tb_scrolls_seen';
  var dlg = document.getElementById('scroll-popup');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var seen = false;
  try { seen = localStorage.getItem(KEY) === '1'; } catch (e) { return; }
  if (seen || location.pathname.indexOf('/contact/') !== -1) return;

  function markSeen() { try { localStorage.setItem(KEY, '1'); } catch (e) {} }
  function open() {
    if (dlg.open) return;
    markSeen();
    dlg.showModal();
    window.removeEventListener('scroll', onScroll);
  }
  function onScroll() {
    var h = document.documentElement;
    if ((h.scrollTop + window.innerHeight) / h.scrollHeight > 0.4) open();
  }
  setTimeout(open, 8000);
  window.addEventListener('scroll', onScroll, { passive: true });

  dlg.querySelector('[data-close]').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  var form = dlg.querySelector('form');
  if (form) form.addEventListener('submit', function () { setTimeout(function () { dlg.close(); }, 300); });
})();
