// Static preview only: this checks a demo account in the browser.
// The real sign-in will run on the Laravel app, not here.
(function () {
  var DEMO_ACCOUNTS = { 'admin.toko': 'admin123' };

  // Login page
  var form = document.getElementById('login-form');
  if (form) {
    var error = document.getElementById('error');

    function showError(message) {
      error.textContent = message;
      error.hidden = false;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var username = form.username.value.trim();
      var password = form.password.value;

      if (!username || !password) {
        showError('Username dan password wajib diisi.');
        return;
      }
      if (DEMO_ACCOUNTS[username] === password) {
        window.location.href = 'dashboard.html';
        return;
      }
      showError('Username atau password salah.');
    });
  }

  // Profile menu on the dashboard
  var toggle = document.getElementById('profile-toggle');
  var menu = document.getElementById('profile-menu');
  if (toggle && menu) {
    function closeMenu() {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      var willOpen = menu.hidden;
      menu.hidden = !willOpen;
      toggle.setAttribute('aria-expanded', String(willOpen));
    });

    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  // 7 hari / 30 hari switch (visual only, the data is static)
  document.querySelectorAll('[data-period]').forEach(function (button) {
    button.addEventListener('click', function () {
      document.querySelectorAll('[data-period]').forEach(function (other) {
        other.setAttribute('aria-pressed', String(other === button));
      });
    });
  });
})();
