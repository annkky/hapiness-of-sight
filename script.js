// ============================================================
// GA4 EVENT HELPER
// ============================================================
function gaEvent(name, params) {
  if (typeof gtag === 'function') {
    gtag('event', name, params || {});
  }
}

document.addEventListener('click', function (e) {
  const el = e.target.closest('[data-ga]');
  if (el) gaEvent('click', { event_label: el.dataset.ga });
});

// ============================================================
// NETLIFY FORMS AJAX HELPER
// ============================================================
async function submitToNetlify(formEl) {
  return fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(new FormData(formEl)).toString()
  });
}

// ============================================================
// MOBILE NAV
// ============================================================
function toggleMobileNav() {
  const nav = document.querySelector('.mobile-nav');
  if (nav) nav.classList.toggle('open');
}

function closeMobileNav() {
  const nav = document.querySelector('.mobile-nav');
  if (nav) nav.classList.remove('open');
}

// Close mobile nav when any link is clicked
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.mobile-nav a').forEach(function (a) {
    a.addEventListener('click', closeMobileNav);
  });
});

// ============================================================
// HEADER SCROLL SHADOW
// ============================================================
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();

// ============================================================
// ZONE TABS
// ============================================================
const ZONES = ['green', 'yellow', 'red'];

function switchZone(zone) {
  ZONES.forEach(function (z) {
    var tab   = document.getElementById('tab-' + z);
    var panel = document.getElementById('panel-' + z);
    if (!tab || !panel) return;
    if (z === zone) {
      tab.className = 'zone-tab zone-tab--' + z + ' active';
      tab.setAttribute('aria-selected', 'true');
      panel.classList.add('active');
    } else {
      tab.className = 'zone-tab zone-tab--' + z;
      tab.setAttribute('aria-selected', 'false');
      panel.classList.remove('active');
    }
  });
}

// ============================================================
// FAQ ACCORDION
// ============================================================
function toggleFaq(btn) {
  var isOpen = btn.getAttribute('aria-expanded') === 'true';
  document.querySelectorAll('.faq-btn').forEach(function (b) {
    b.setAttribute('aria-expanded', 'false');
    var body = b.nextElementSibling;
    if (body) body.classList.remove('open');
  });
  if (!isOpen) {
    btn.setAttribute('aria-expanded', 'true');
    var body = btn.nextElementSibling;
    if (body) body.classList.add('open');
  }
}

// ============================================================
// VALIDATION HELPERS
// ============================================================
function isValidPhone(v) {
  return /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(v.trim());
}
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function markField(el, valid) {
  el.style.borderColor = valid ? '' : 'var(--red)';
  el.style.boxShadow   = valid ? '' : '0 0 0 3px rgba(220,38,38,.15)';
}

// ============================================================
// APPOINTMENT FORM
// ============================================================
function submitForm(e) {
  e.preventDefault();
  var form  = e.target;
  var valid = true;

  form.querySelectorAll('[required]').forEach(function (el) {
    var ok = el.value.trim() !== '';
    markField(el, ok);
    if (!ok) valid = false;
  });

  var phoneEl = form.querySelector('#phone');
  if (phoneEl && phoneEl.value && !isValidPhone(phoneEl.value)) {
    markField(phoneEl, false);
    valid = false;
  }

  if (!valid) {
    var first = form.querySelector('[style*="var(--red)"]');
    if (first) first.focus();
    return;
  }

  gaEvent('appointment_form_submit');
  submitToNetlify(form).catch(function () {});

  var content = document.getElementById('form-content');
  var success = document.getElementById('formSuccess');
  if (content) content.style.display = 'none';
  if (success) {
    success.classList.add('show');
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ============================================================
// STICKY CTA вЂ” show after scroll, hide near appointment section
// ============================================================
(function () {
  var cta         = document.getElementById('stickyCta');
  var appointment = document.getElementById('appointment');
  if (!cta) return;

  function update() {
    var scrolled = window.scrollY > 400;
    var nearForm  = false;
    if (appointment) {
      var rect = appointment.getBoundingClientRect();
      nearForm = rect.top < window.innerHeight && rect.bottom > 0;
    }
    cta.classList.toggle('visible', scrolled && !nearForm);
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ============================================================
// SMOOTH SCROLL for anchor links
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    var href = link.getAttribute('href');
    if (href === '#') return;
    var target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================================================
// PHONE FORMATTING (+998 format)
// ============================================================
function formatPhone998(el) {
  el.addEventListener('input', function () {
    var v = this.value.replace(/\D/g, '');
    if (v.startsWith('998')) {
      v = '+' + v;
    } else if (v.startsWith('8') && v.length > 1) {
      v = '+998' + v.slice(1);
    } else if (v && !v.startsWith('+')) {
      v = '+998' + v;
    }
    this.value = v;
  });
}

var phoneInput = document.getElementById('phone');
if (phoneInput) formatPhone998(phoneInput);

