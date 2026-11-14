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
})();

// Mailchimp signups: submit in place (JSONP) instead of opening a new tab
(function () {
  var n = 0;
  document.querySelectorAll('form[data-mc]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var email = form.querySelector('input[name="EMAIL"]');
      if (!email.value || !email.checkValidity()) { status.textContent = 'Enter a valid email.'; email.focus(); return; }
      var cb = 'tbMc' + (++n) + Date.now();
      var params = new URLSearchParams(new FormData(form)).toString();
      var url = form.action.replace('/post?', '/post-json?') + '&' + params + '&c=' + cb;
      var s = document.createElement('script');
      var done = false;
      window[cb] = function (r) {
        done = true;
        if (r && r.result === 'success') {
          form.reset();
          status.textContent = 'You are on the list. Check your inbox.';
          var dlg = form.closest('dialog');
          if (dlg) setTimeout(function () { dlg.close(); }, 1600);
        } else {
          var msg = (r && r.msg) ? String(r.msg).replace(/<[^>]*>/g, '') : '';
          status.textContent = /already subscribed/i.test(msg) ? 'You are already on the list.' : 'That did not go through. Check the email and try again.';
        }
        delete window[cb]; s.remove();
      };
      s.src = url;
      s.onerror = function () { if (!done) { status.textContent = 'That did not go through. Try again in a minute.'; } };
      status.textContent = 'Sending...';
      document.body.appendChild(s);
    });
  });
})();
