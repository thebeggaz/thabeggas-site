// Clan page request form: roles, song rows, live cost, image checks, Web3Forms submit
(function () {
  var form = document.getElementById('page-request-form');
  if (!form) return;
  var status = form.querySelector('.form-status');
  var files = {};

  // ---- Song rows (Selected work, Executive production, Projects)
  var counts = {};
  function addRow(set) {
    var key = set.getAttribute('data-works');
    counts[key] = (counts[key] || 0) + 1;
    var n = counts[key], p = key + ' ' + n + ' - ';
    var row = document.createElement('div');
    row.className = 'work-row';
    function f(label, name, type, req) {
      var id = 'w-' + key.replace(/\W/g, '') + n + name.replace(/\W/g, '');
      return '<div class="field"><label for="' + id + '">' + label + (req ? '' : ' (optional)') + '</label>' +
        '<input id="' + id + '" type="' + type + '" name="' + p + name + '"' + (req ? ' data-rowreq' : '') + '></div>';
    }
    var noun = set.querySelector('.work-rows').getAttribute('data-noun') || 'song';
    var Noun = noun.charAt(0).toUpperCase() + noun.slice(1);
    row.innerHTML = '<p class="kicker" style="margin:0">' + Noun + ' ' + n + '</p>' +
      f('Title', 'Title', 'text', true) + f(noun === 'song' ? 'Song link' : 'Link', noun === 'song' ? 'Song link' : 'Link', 'url', true) +
      '<div class="g2" style="gap:18px">' + f('Performed by', 'Performed by', 'text', true) + f('Produced by', 'Produced by', 'text', true) + '</div>' +
      f('Mixed and mastered by', 'Mixed and mastered by', 'text', false) +
      '<button type="button" class="link-mono remove-row">Remove this ' + noun + '</button>';
    set.querySelector('.work-rows').appendChild(row);
    row.querySelector('.remove-row').addEventListener('click', function () { row.remove(); });
  }
  form.querySelectorAll('[data-works]').forEach(function (set) {
    set.querySelector('.add-row').addEventListener('click', function () { addRow(set); });
    if (set.getAttribute('data-works') === 'Selected work') addRow(set);
  });

  // ---- Live cost
  var game = form.querySelector('#r-game'), pat = form.querySelector('#r-patreon'), cov = form.querySelector('#r-cover');
  var total = form.querySelector('#cost-total'), detail = form.querySelector('#cost-detail'), costField = form.querySelector('#r-cost');
  function cost() {
    var g = game.value, p = pat.value, c = cov.value, t = '', d = '';
    var wantsGame = g === 'Yes';
    if (!g || !p || !c) { t = 'Answer the questions above to see your cost.'; d = ''; costField.value = ''; }
    else if (c === 'Approved stems') { t = '$0'; d = 'Approved stems cover your page' + (wantsGame ? ' and your game chapter.' : '.'); }
    else if (p === 'Yes') { t = wantsGame ? '$100' : '$0'; d = wantsGame ? 'Your page is included with Patreon. The game chapter is $100, half up front and half on delivery.' : 'Your page is included with Patreon.'; }
    else { t = wantsGame ? '$150' : '$50'; d = wantsGame ? 'Page and game chapter. Half up front and half on delivery.' : 'Page only. Add a game chapter for $100 more.'; }
    if (g === 'Maybe later' && t.charAt(0) === '$') d += ' A game chapter can be added later.';
    total.textContent = t; detail.textContent = d;
    if (t.charAt(0) === '$') costField.value = t + ' (' + d + ')';
  }
  [game, pat, cov].forEach(function (el) { el.addEventListener('change', cost); });

  // ---- Image checks: PNG, transparent, size
  form.querySelectorAll('input[type=file][data-img]').forEach(function (input) {
    var st = input.parentNode.querySelector('.img-status');
    input.addEventListener('change', function () {
      var label = input.getAttribute('data-img');
      delete files[label]; input.setCustomValidity(''); st.textContent = ''; st.className = 'img-status';
      var file = input.files[0];
      if (!file) return;
      function bad(msg) { input.setCustomValidity(msg); st.textContent = msg; st.className = 'img-status bad'; }
      if (file.type !== 'image/png' && !/\.png$/i.test(file.name)) return bad('That file is not a PNG.');
      if (file.size > 5 * 1024 * 1024) return bad('That file is over 5 MB.');
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var w = +input.getAttribute('data-w'), h = +input.getAttribute('data-h'), exact = input.getAttribute('data-exact') === '1';
        var iw = img.naturalWidth, ih = img.naturalHeight;
        if (exact ? (iw !== w || ih !== h) : (iw !== w || ih > h)) {
          URL.revokeObjectURL(url);
          return bad('Your image is ' + iw + ' x ' + ih + '. It needs to be ' + (exact ? w + ' x ' + h : w + ' pixels wide and no more than ' + h + ' tall') + '.');
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
  function send(withFiles) {
    var fd = new FormData(form);
    if (withFiles) Object.keys(files).forEach(function (k) { fd.append('attachment', files[k], k.replace(/\W+/g, '-') + '.png'); });
    return fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: fd }).then(function (r) { return r.json(); });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var roles = [].map.call(form.querySelectorAll('.role:checked'), function (c) { return c.value; });
    form.querySelector('#r-roles').value = roles.join(', ');
    form.querySelectorAll('.work-row').forEach(function (row) {
      var used = [].some.call(row.querySelectorAll('input'), function (i) { return i.value.trim(); });
      row.querySelectorAll('[data-rowreq]').forEach(function (i) { i.required = used; });
    });
    cost();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; status.textContent = 'Sending...';
    var hasFiles = Object.keys(files).length > 0;
    send(hasFiles)
      .then(function (d) {
        if (d.success) return { ok: true, files: hasFiles };
        if (hasFiles) return send(false).then(function (d2) { return { ok: d2.success, files: false, dropped: true }; });
        return { ok: false };
      })
      .then(function (r) {
        if (!r.ok) { status.textContent = 'That did not go through. Try again in a minute.'; return; }
        status.textContent = r.dropped
          ? 'Received. Your images did not come through, so we will reach out to get them from you.'
          : "Received. We'll reach out to start building your page.";
        status.scrollIntoView({ block: 'center' });
      })
      .catch(function () { status.textContent = 'That did not go through. Try again in a minute.'; })
      .then(function () { btn.disabled = false; });
  });
})();
