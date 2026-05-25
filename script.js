/* ===== Google Analytics Helper ===== */
function gaEvent(name, params) {
  if (typeof gtag === 'function') { gtag('event', name, params || {}); }
}

/* ===== Track all [data-ga] clicks ===== */
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-ga]');
  if (!el) return;
  var label = el.getAttribute('data-ga');
  gaEvent('cta_click', { cta_label: label, href: el.getAttribute('href') || '' });
});

/* ===== Mobile nav ===== */
function toggleMobileNav() {
  var nav = document.getElementById('mobileNav');
  if (!nav) return;
  nav.classList.toggle('open');
  var burger = document.getElementById('burger');
  if (burger) burger.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
}
function closeMobileNav() {
  var nav = document.getElementById('mobileNav');
  if (nav) nav.classList.remove('open');
  var burger = document.getElementById('burger');
  if (burger) burger.setAttribute('aria-expanded', 'false');
}

/* Close mobile nav when clicking outside */
document.addEventListener('click', function (e) {
  var nav = document.getElementById('mobileNav');
  var burger = document.getElementById('burger');
  if (nav && nav.classList.contains('open')) {
    if (!nav.contains(e.target) && !burger.contains(e.target)) { closeMobileNav(); }
  }
});

/* ===== Header scroll shadow ===== */
(function () {
  var header = document.getElementById('siteHeader');
  if (!header) return;
  function onScroll() {
    if (window.scrollY > 10) { header.classList.add('scrolled'); }
    else { header.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ===== Zone tab switching ===== */
function switchZone(zone) {
  /* Deactivate all tabs and panels */
  document.querySelectorAll('.zone-tab').forEach(function (t) {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.zone-panel').forEach(function (p) {
    p.classList.remove('active');
  });
  /* Activate selected */
  var tab = document.getElementById('tab-' + zone);
  var panel = document.getElementById('panel-' + zone);
  if (tab) { tab.classList.add('active'); tab.setAttribute('aria-selected', 'true'); }
  if (panel) { panel.classList.add('active'); }
  gaEvent('zone_view', { zone: zone });
}

/* ===== Sticky CTA visibility ===== */
(function () {
  var cta = document.getElementById('stickyCta');
  if (!cta) return;
  function update() {
    var hero = document.getElementById('top');
    var contact = document.getElementById('contact');
    var heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
    /* Show after scrolling past hero; hide when on/near contact form */
    var nearContact = false;
    if (contact) {
      var cr = contact.getBoundingClientRect();
      /* Hide when contact section is in the viewport */
      nearContact = cr.top < window.innerHeight && cr.bottom > 0;
    }
    if (heroBottom < 0 && !nearContact) { cta.classList.add('visible'); }
    else { cta.classList.remove('visible'); }
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ===== Smooth scroll for anchor links ===== */
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href^="#"]');
  if (!a) return;
  var id = a.getAttribute('href').slice(1);
  if (!id) return;
  var target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  var header = document.getElementById('siteHeader');
  var offset = header ? header.offsetHeight : 64;
  var top = target.getBoundingClientRect().top + window.scrollY - offset - 8;
  window.scrollTo({ top: top, behavior: 'smooth' });
});

/* ===== Char counter for message textarea ===== */
function updateCharCount(el) {
  var counter = document.getElementById('charCount');
  if (counter) { counter.textContent = el.value.length; }
}

/* ===== Phone formatter for +998 ===== */
function formatPhoneInput(el) {
  var raw = el.value.replace(/\D/g, '');
  /* Ensure starts with 998 */
  if (raw.startsWith('998')) {
    raw = raw.slice(0, 12); /* 998 + 9 digits */
  } else if (raw.startsWith('0')) {
    raw = '998' + raw.slice(1);
    raw = raw.slice(0, 12);
  } else if (raw.length > 0) {
    raw = '998' + raw;
    raw = raw.slice(0, 12);
  }
  /* Format: +998 XX XXX XX XX */
  var formatted = '';
  if (raw.length > 0)  formatted = '+' + raw.slice(0, 3);
  if (raw.length > 3)  formatted += ' ' + raw.slice(3, 5);
  if (raw.length > 5)  formatted += ' ' + raw.slice(5, 8);
  if (raw.length > 8)  formatted += ' ' + raw.slice(8, 10);
  if (raw.length > 10) formatted += ' ' + raw.slice(10, 12);
  el.value = formatted;
}

/* ===== Feedback form submission ===== */
function submitFeedbackForm(e) {
  e.preventDefault();
  var form = e.target;

  /* Basic validation */
  var valid = true;
  form.querySelectorAll('[required]').forEach(function (field) {
    field.classList.remove('error');
    if (field.type === 'checkbox') {
      if (!field.checked) { valid = false; field.closest('.form-row').querySelector('.consent-label').style.color = 'var(--red)'; }
    } else {
      if (!field.value.trim()) { valid = false; field.classList.add('error'); }
    }
  });
  if (!valid) {
    var first = form.querySelector('.error, [required]:not(:checked)');
    if (first) { first.focus(); }
    return;
  }

  /* Submit via fetch (Netlify Forms) */
  var formData = new FormData(form);
  var btn = form.querySelector('[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Отправляем...'; }

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData).toString()
  })
  .then(function (res) {
    if (!res.ok) throw new Error('Network response was not ok');
    showFormSuccess();
    gaEvent('form_submit_success', { form: 'feedback' });
  })
  .catch(function () {
    /* Fallback: show success anyway so user is not stuck */
    showFormSuccess();
    gaEvent('form_submit_fallback', { form: 'feedback' });
  });
}

function showFormSuccess() {
  var content = document.getElementById('form-content');
  var success = document.getElementById('formSuccess');
  if (content) content.style.display = 'none';
  if (success) success.classList.add('show');
  gaEvent('form_success_shown');
}