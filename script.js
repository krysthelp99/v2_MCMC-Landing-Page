/* ===========================
   MCMC LANDING PAGE — SCRIPT
   =========================== */

// ── Hero Carousel ──────────────────────────────────────────
(function initCarousel() {
  const track       = document.getElementById('carouselTrack');
  const slides      = document.querySelectorAll('.carousel-slide');
  const dots        = document.querySelectorAll('.carousel-dot');
  const prevBtn     = document.getElementById('carouselPrev');
  const nextBtn     = document.getElementById('carouselNext');
  const progressBar = document.getElementById('carouselProgress');
  const container   = document.getElementById('heroCarousel');

  if (!track || slides.length === 0) return;

  const TOTAL       = slides.length;
  const INTERVAL_MS = 5500; // autoplay interval
  let   current     = 0;
  let   autoTimer   = null;
  let   progTimer   = null;
  let   paused      = false;

  /* — Activate a given slide index — */
  function goTo(index, direction = 'next') {
    // Bounds-wrap
    index = ((index % TOTAL) + TOTAL) % TOTAL;

    // Remove active from current slide
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');

    // Move track
    track.style.transform = `translateX(-${index * 100}%)`;

    // Activate new slide
    current = index;
    slides[current].classList.add('is-active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');

    // Restart progress bar
    startProgress();
  }

  /* — Progress bar animation — */
  function startProgress() {
    // Reset
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    void progressBar.offsetWidth; // force reflow

    if (!paused) {
      progressBar.style.transition = `width ${INTERVAL_MS}ms linear`;
      progressBar.style.width = '100%';
    }
  }

  /* — Autoplay — */
  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(() => {
      if (!paused) goTo(current + 1);
    }, INTERVAL_MS);
    startProgress();
  }

  function stopAutoplay() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  /* — Pause on hover / focus — */
  container.addEventListener('mouseenter', () => {
    paused = true;
    progressBar.style.transition = 'none';
    // Freeze bar at current visual width by reading computed style
    const computed = getComputedStyle(progressBar).width;
    const containerW = getComputedStyle(progressBar.parentElement).width;
    const pct = (parseFloat(computed) / parseFloat(containerW) * 100).toFixed(1);
    progressBar.style.width = pct + '%';
  });

  container.addEventListener('mouseleave', () => {
    paused = false;
    // Resume: recompute remaining time proportionally? — simpler: just restart
    startProgress();
  });

  container.addEventListener('focusin', () => { paused = true; });
  container.addEventListener('focusout', () => { paused = false; startProgress(); });

  /* — Arrow controls — */
  prevBtn.addEventListener('click', () => {
    goTo(current - 1);
    startAutoplay(); // reset timer
  });
  nextBtn.addEventListener('click', () => {
    goTo(current + 1);
    startAutoplay();
  });

  /* — Dot controls — */
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      startAutoplay();
    });
  });

  /* — Keyboard nav — */
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); startAutoplay(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); startAutoplay(); }
  });

  /* — Touch / swipe support — */
  let touchStartX = 0;
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  container.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
      startAutoplay();
    }
  }, { passive: true });

  /* — Init — */
  slides[0].classList.add('is-active');
  startAutoplay();
})();



// ── Floating Nav — Mobile Toggle ───────────────────────────
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

if (navToggle && navMobile) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    // Animate hamburger → X
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close mobile drawer when a link is clicked
  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMobile.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });
}

// ── Scroll Reveal (IntersectionObserver) ───────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Accordion ──────────────────────────────────────────────
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => handleAccordion(header));
  header.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAccordion(header);
    }
  });
});

function handleAccordion(header) {
  const item = header.closest('.accordion-item');
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.accordion-item.open').forEach(openItem => {
    openItem.classList.remove('open');
    openItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
  });

  // Open clicked (if was closed)
  if (!isOpen) {
    item.classList.add('open');
    header.setAttribute('aria-expanded', 'true');
  }
}

// ── Doctor Search ──────────────────────────────────────────
const doctorSearch = document.getElementById('doctorSearch');
const doctorCards = document.querySelectorAll('.doctor-card');
const doctorsGrid = document.getElementById('doctorsGrid');

doctorSearch.addEventListener('input', () => {
  const query = doctorSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  doctorCards.forEach(card => {
    const name = card.dataset.name.toLowerCase();
    const spec = card.dataset.spec.toLowerCase();
    const matches = name.includes(query) || spec.includes(query);
    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount++;
  });

  // Show/hide no results message
  let noResults = doctorsGrid.querySelector('.no-results');
  if (visibleCount === 0 && query.length > 0) {
    if (!noResults) {
      noResults = document.createElement('p');
      noResults.className = 'no-results';
      noResults.textContent = `No specialists found for "${doctorSearch.value}". Try a different search.`;
      doctorsGrid.appendChild(noResults);
    } else {
      noResults.textContent = `No specialists found for "${doctorSearch.value}". Try a different search.`;
      noResults.style.display = '';
    }
  } else if (noResults) {
    noResults.style.display = 'none';
  }
});

// ── Animated Counters ──────────────────────────────────────
function animateCounter(el, target, suffix = '') {
  const duration = 1800;
  const start = performance.now();
  const from = 0;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(from + (target - from) * eased);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Counter observer
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, suffix);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

// Set counter data attributes on glance numbers
const glanceItems = [
  { selector: '.glance-item:nth-child(1) .glance-number em', target: 20, suffix: '' },
  { selector: '.glance-item:nth-child(2) .glance-number em', target: 15, suffix: '' },
];

glanceItems.forEach(({ selector, target, suffix }) => {
  const el = document.querySelector(selector);
  if (el) {
    el.dataset.target = target;
    el.dataset.suffix = suffix;
    el.textContent = '0';
    counterObserver.observe(el);
  }
});

// ── Contact Form ───────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const phone = document.getElementById('cf-phone').value.trim();
    const service = document.getElementById('cf-service').value;
    const message = document.getElementById('cf-message').value.trim();

    if (!name) {
      alert('Please enter your name.');
      document.getElementById('cf-name').focus();
      return;
    }

    // Build WhatsApp message and redirect
    const text = `Hello MCMC,%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone || 'N/A')}%0AService: ${encodeURIComponent(service || 'General Enquiry')}%0AMessage: ${encodeURIComponent(message || 'I would like to enquire about your services.')}`;
    window.open(`https://wa.me/60855475555?text=${text}`, '_blank', 'noopener,noreferrer');

    contactForm.reset();
    showToast('Message sent! We\'ll get back to you shortly. 💬');
  });
}

// ── Toast Notification ─────────────────────────────────────
function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: var(--ink);
    color: var(--white);
    padding: 14px 24px;
    border-radius: 100px;
    font-size: 0.88rem;
    font-weight: 500;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    white-space: nowrap;
    max-width: calc(100vw - 40px);
    text-align: center;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── Active Floating Nav Link Highlighting ──────────────────
const sections = document.querySelectorAll('section[id]');
const floatNavLinks = document.querySelectorAll('.floatnav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      floatNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ── Hero number animation on load ─────────────────────────
window.addEventListener('load', () => {
  // Ensure hero is immediately visible
  document.querySelectorAll('#hero .reveal').forEach(el => {
    el.classList.add('visible');
  });
});
