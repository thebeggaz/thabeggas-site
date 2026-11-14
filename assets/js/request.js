// Clan page request form: test mode, roles, repeatable rows, link checks, live cost, image checks, submit
(function () {
  var form = document.getElementById('page-request-form');
  if (!form) return;
  var status = form.querySelector('.form-status');
  var files = {};
  var UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbwphn5424FThrtfXQW-UpITS4c8huCVg1MP0pT5oGQPwmV0wj8cs22TkV43s3Unb9FLFw/exec';
  var UPLOAD_TOKEN = 'begga-temple-scrolls';

  // ---- Test mode: add ?test=1 to the URL to turn off required fields
  var TEST = /[?&]test=1\b/.test(location.search);
  if (TEST) {
    form.querySelector('#test-banner').hidden = false;
    form.querySelector('input[name=subject]').value = 'TEST: Clan page request';
  }

  // ---- Link checks
  var KINDS = {
    any: { label: 'link' },
    youtube: { host: /(^|\.)(youtube\.com|youtu\.be)$/i, label: 'YouTube link' },
    instagram: { host: /(^|\.)instagram\.com$/i, label: 'Instagram link', handle: 'https://www.instagram.com/' },
    linktree: { host: /(^|\.)linktr\.ee$/i, label: 'Linktree link', handle: 'https://linktr.ee/' }
  };
  function ytId(u) {
    var m = u.match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live)\/)([\w-]{11})/);
    return m ? m[1] : '';
  }
  function checkLink(input) {
    var kind = input.getAttribute('data-link') || 'any', k = KINDS[kind] || KINDS.any;
    var st = input.parentNode.querySelector('.link-status');
    var v = input.value.trim();
    input.setCustomValidity(''); if (st) { st.textContent = ''; st.className = 'link-status'; }
    if (!v) return;
    if (k.handle && /^@?[\w.]+$/.test(v)) { v = k.handle + v.replace(/^@/, '') + (kind === 'instagram' ? '/' : ''); input.value = v; }
    if (!/^https?:\/\//i.test(v) && /^[\w-]+(\.[\w-]+)+(\/|$)/.test(v)) { v = 'https://' + v; input.value = v; }
    var url; try { url = new URL(v); } catch (e) { url = null; }
    function bad(msg) { input.setCustomValidity(msg); if (st) { st.textContent = msg; st.className = 'link-status bad'; } }
    function good(msg) { if (st) { st.textContent = msg; st.className = 'link-status good'; } }
    if (!url || !/^https?:$/.test(url.protocol) || url.hostname.indexOf('.') < 0) return bad('That is not a full link. It should start with https://');
    if (k.host && !k.host.test(url.hostname)) return bad('That is not ' + (/^[AEIOU]/i.test(k.label) ? 'an ' : 'a ') + k.label + '.');
    var input2 = input;
    if (kind === 'youtube' && input.hasAttribute('data-video')) {
      var id = ytId(v);
      if (!id) return bad('That YouTube link does not point to a video.');
      good('Checking the video...');
      fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id))
        .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
        .then(function (d) {
          if (input2.value.trim() !== v) return;
          good('Found: ' + d.title);
          var row = input2.closest('.work-row'), t = row && row.querySelector('[data-title]');
          if (t && !t.value.trim()) t.value = d.title;
        })
        .catch(function (e) {
          if (input2.value.trim() !== v) return;
          if (e === 401 || e === 403 || e === 404) bad('We could not find that video. Check that it is public or unlisted.');
          else good('Link looks right.');
        });
      return;
    }
    good('Link looks right.');
  }
  function wireLink(input) {
    input.addEventListener('change', function () { checkLink(input); });
    input.addEventListener('blur', function () { checkLink(input); });
  }
  form.querySelectorAll('[data-link]').forEach(wireLink);

  // ---- Repeatable rows
  // [label, type, required-when-used, link kind, extra]
  var CREDITS = [['Performed by', 'text', true], ['Produced by', 'text', true]];
  var GROUPS = {
    'Other link': { noun: 'link', fields: [['What it is', 'text', true, null, 'title'], ['Link', 'link', true, 'any']] },
    'Selected work': { noun: 'song', start: 1, fields: [['Title', 'text', true, null, 'title'], ['Song link', 'link', false, 'any']].concat(CREDITS, [['Mixed and mastered by', 'text', false]]) },
    'Executive production': { noun: 'release', fields: [['Title', 'text', true, null, 'title'], ['Link', 'link', false, 'any']].concat(CREDITS, [['Mixed and mastered by', 'text', false]]) },
    'Projects': { noun: 'project', fields: [['Title', 'text', true, null, 'title'], ['Link', 'link', false, 'any']].concat(CREDITS, [['Mixed and mastered by', 'text', false]]) },
    'Music visual': { noun: 'video', fields: [['Title', 'text', true, null, 'title'], ['YouTube link', 'link', true, 'youtube', 'video'], ['Prod by', 'text', false], ['Video by', 'text', false]] },
    'Documentary': { noun: 'documentary', fields: [['Title', 'text', true, null, 'title'], ['YouTube link', 'link', true, 'youtube', 'video'], ['Video by', 'text', false]] },
    'Dirty demo': { noun: 'demo', fields: [['Title', 'text', true, null, 'title'], ['Link', 'link', false, 'any'], ['Who is on it', 'text', false], ['Produced by', 'text', false]] }
  };
  var counts = {};
  function addRow(set) {
    var key = set.getAttribute('data-group'), g = GROUPS[key];
    counts[key] = (counts[key] || 0) + 1;
    var n = counts[key], Noun = g.noun.charAt(0).toUpperCase() + g.noun.slice(1);
    var row = document.createElement('div'); row.className = 'work-row';
    var html = '<p class="kicker" style="margin:0">' + Noun + ' ' + n + '</p>', pair = [];
    g.fields.forEach(function (f) {
      var id = 'g-' + key.replace(/\W/g, '') + n + f[0].replace(/\W/g, '');
      var name = key + ' ' + n + ' - ' + f[0];
      var lab = f[0] + (f[2] ? '' : ' (optional)');
      var inp = '<input id="' + id + '" name="' + name + '" type="text"' + (f[2] ? ' data-rowreq' : '') +
        (f[1] === 'link' ? ' inputmode="url" autocomplete="off" data-link="' + f[3] + '"' : '') +
        (f[4] === 'title' ? ' data-title' : '') + (f[4] === 'video' ? ' data-video' : '') + '>';
      var block = '<div class="field"><label for="' + id + '">' + lab + '</label>' + inp + (f[1] === 'link' ? '<p class="link-status" aria-live="polite"></p>' : '') + '</div>';
      if (f[0] === 'Performed by' || f[0] === 'Produced by') { pair.push(block); if (pair.length === 2) { html += '<div class="g2" style="gap:18px">' + pair.join('') + '</div>'; pair = []; } }
      else html += block;
    });
    html += '<button type="button" class="link-mono remove-row">Remove this ' + g.noun + '</button>';
    row.innerHTML = html;
    set.querySelector('.work-rows').appendChild(row);
    row.querySelectorAll('[data-link]').forEach(wireLink);
    row.querySelector('.remove-row').addEventListener('click', function () { row.remove(); });
  }
  form.querySelectorAll('[data-group]').forEach(function (set) {
    set.querySelector('.add-row').addEventListener('click', function () { addRow(set); });
    if (GROUPS[set.getAttribute('data-group')].start) addRow(set);
  });

  // ---- Live cost
  var game = form.querySelector('#r-game'), pat = form.querySelector('#r-patreon'), cov = form.querySelector('#r-cover');
  var total = form.querySelector('#cost-total'), detail = form.querySelector('#cost-detail'), costField = form.querySelector('#r-cost');
  function cost() {
    var g = game.value, p = pat.value, c = cov.value, t = '', d = '', wantsGame = g === 'Yes';
    if (!g || !p || !c) { t = 'Answer the questions above to see your cost.'; costField.value = ''; }
    else if (c === 'Approved stems') { t = '$0'; d = 'Approved stems cover your page' + (wantsGame ? ' and your game chapter.' : '.'); }
    else if (p === 'Yes') { t = wantsGame ? '$100' : '$0'; d = wantsGame ? 'Your page is included with Patreon. The game chapter is $100, half up front and half on delivery.' : 'Your page is included with Patreon.'; }
    else { t = wantsGame ? '$150' : '$50'; d = wantsGame ? 'Page and game chapter. Half up front and half on delivery.' : 'Page only. Add a game chapter for $100 more.'; }
    if (g === 'Maybe later' && t.charAt(0) === '$') d += ' A game chapter can be added later.';
    total.textContent = t; detail.textContent = d;
    if (t.charAt(0) === '$') costField.value = t + ' (' + d + ')';
  }
  [game, pat, cov].forEach(function (el) { el.addEventListener('change', cost); });

  // ---- Image checks: PNG, transparent, minimum size
  form.querySelectorAll('input[type=file][data-img]').forEach(function (input) {
    var st = input.closest('.field').querySelector('.img-status');
    var label = input.getAttribute('data-img');
    function reset() { delete files[label]; input.setCustomValidity(''); st.textContent = ''; st.className = 'img-status'; }
    form.querySelector('.clear-file[data-for="' + input.id + '"]').addEventListener('click', function () { input.value = ''; reset(); });
    input.addEventListener('change', function () {
      reset();
      var file = input.files[0];
      if (!file) return;
      function bad(msg) { input.setCustomValidity(msg); st.textContent = msg; st.className = 'img-status bad'; }
      if (file.type !== 'image/png' && !/\.png$/i.test(file.name)) return bad('That file is not a PNG.');
      if (file.size > 5 * 1024 * 1024) return bad('That file is over 5 MB.');
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var w = +input.getAttribute('data-w'), h = +input.getAttribute('data-h');
        var iw = img.naturalWidth, ih = img.naturalHeight;
        if (iw < w || ih < h) {
          URL.revokeObjectURL(url);
          return bad('Your image is ' + iw + ' x ' + ih + '. It needs to be at least ' + (h ? w + ' x ' + h : w + ' pixels wide') + '.');
        }
        var c = document.createElement('canvas'); c.width = iw; c.height = ih;
        var ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
        var data = ctx.getImageData(0, 0, iw, ih).data, clear = false;
        for (var i = 3; i < data.length; i += 4) { if (data[i] < 250) { clear = true; break; } }
        URL.revokeObjectURL(url);
        if (!clear) return bad('This PNG has no transparent background. Remove the background and try again.');
        files[label] = file;
        st.textContent = 'Looks good: ' + iw + ' x ' + ih + ', transparent PNG.'; st.className = 'img-status good';
      };
      img.onerror = function () { URL.revokeObjectURL(url); bad('That image could not be read.'); };
      img.src = url;
    });
  });

  // ---- Submit
  function send() {
    return fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) }).then(function (r) { return r.json(); });
  }
  function b64(file) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(String(fr.result).split(',')[1]); };
      fr.onerror = rej; fr.readAsDataURL(file);
    });
  }
  function upload() {
    var keys = Object.keys(files);
    if (!keys.length) return Promise.resolve(true);
    if (!UPLOAD_URL) return Promise.resolve(false);
    return Promise.all(keys.map(function (k) { return b64(files[k]).then(function (d) { return { label: k, type: 'image/png', data: d }; }); }))
      .then(function (images) {
        return fetch(UPLOAD_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({
          token: UPLOAD_TOKEN, test: TEST, begga: form.querySelector('#r-begga').value, name: form.querySelector('#r-name').value,
          email: form.querySelector('#r-email').value, images: images }) });
      })
      .then(function (r) { return r.json(); })
      .then(function (d) { return !!d.success; })
      .catch(function () { return false; });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var roles = [].map.call(form.querySelectorAll('.role:checked'), function (c) { return c.value; });
    form.querySelector('#r-roles').value = roles.join(', ');
    form.querySelectorAll('[data-link]').forEach(checkLink);
    form.querySelectorAll('.work-row').forEach(function (row) {
      var used = [].some.call(row.querySelectorAll('input'), function (i) { return i.value.trim(); });
      row.querySelectorAll('[data-rowreq]').forEach(function (i) { i.required = used; });
    });
    if (TEST) form.querySelectorAll('[required]').forEach(function (i) { i.required = false; });
    cost();
    if (!form.checkValidity()) {
      var first = form.querySelector(':invalid');
      form.reportValidity(); if (first) first.focus();
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; status.textContent = 'Sending...';
    send()
      .then(function (d) {
        if (!d.success) { status.textContent = 'That did not go through. Try again in a minute.'; return; }
        status.textContent = 'Sending your images...';
        return upload().then(function (ok) {
          status.textContent = ok
            ? "Received. We'll reach out to start building your page."
            : 'Received. Your images did not come through, so we will reach out to get them from you.';
          status.scrollIntoView({ block: 'center' });
        });
      })
      .catch(function () { status.textContent = 'That did not go through. Try again in a minute.'; })
      .then(function () { btn.disabled = false; });
  });
})();
