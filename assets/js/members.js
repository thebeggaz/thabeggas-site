// Roster filter on the Members page
(function () {
  var buttons = document.querySelectorAll('.filters button');
  var cards = document.querySelectorAll('#roster .member');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      cards.forEach(function (c) {
        c.hidden = !(f === 'All' || c.getAttribute('data-group') === f);
      });
    });
  });
})();
