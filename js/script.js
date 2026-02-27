'use strict';

/* ==========================================
   MOBILE MENU
   ========================================== */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on nav link click (mobile)
  nav.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ==========================================
   ACCORDION (FAQ)
   ========================================== */
(function initAccordion() {
  const buttons = document.querySelectorAll('.accordion-btn');
  if (!buttons.length) return;

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.accordion-item');
      const panel = item.querySelector('.accordion-panel');
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      buttons.forEach(function (b) {
        if (b !== btn) {
          b.setAttribute('aria-expanded', 'false');
          const p = b.closest('.accordion-item').querySelector('.accordion-panel');
          p.hidden = true;
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', String(!isExpanded));
      panel.hidden = isExpanded;
    });
  });
})();


/* ==========================================
   REVIEWS SLIDER
   ========================================== */
(function initSlider() {
  const track = document.getElementById('slider-track');
  const dotsContainer = document.getElementById('slider-dots');
  if (!track || !dotsContainer) return;

  const cards = Array.from(track.querySelectorAll('.review-card'));
  const total = cards.length;
  let current = 0;       // current page index
  let autoplayTimer = null;
  let prevSpv = null;    // track previous slides-per-view to detect layout change

  /* ---- helpers ---- */
  function getSlidesPerView() {
    return window.innerWidth <= 768 ? 1 : 3;
  }

  function getTotalPages() {
    return Math.ceil(total / getSlidesPerView());
  }

  /* Set each card's flex-basis to exactly fit the viewport */
  function setCardSizes() {
    const spv = getSlidesPerView();
    const wrapperWidth = track.parentElement.offsetWidth;
    const gap = spv > 1 ? 20 : 12;
    const cardWidth = spv > 1
      ? Math.floor((wrapperWidth - gap * (spv - 1)) / spv)
      : wrapperWidth;

    track.style.gap = gap + 'px';

    cards.forEach(function (card) {
      card.style.width = cardWidth + 'px';
      card.style.flexBasis = cardWidth + 'px';
    });

    return { cardWidth: cardWidth, gap: gap };
  }

  /* Build / rebuild dot buttons based on current layout */
  function rebuildDots() {
    dotsContainer.innerHTML = '';
    const pages = getTotalPages();
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Страница ' + (i + 1));
      dot.setAttribute('aria-selected', String(i === 0));
      dot.dataset.index = String(i);
      dot.addEventListener('click', function () {
        stopAutoplay();
        goTo(parseInt(this.dataset.index));
        startAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    Array.from(dotsContainer.querySelectorAll('.slider-dot')).forEach(function (d, i) {
      const active = i === current;
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-selected', String(active));
    });
  }

  function goTo(pageIndex) {
    const spv = getSlidesPerView();
    const totalPages = getTotalPages();
    current = ((pageIndex % totalPages) + totalPages) % totalPages;

    const sizes = setCardSizes();
    const offset = current * spv * (sizes.cardWidth + sizes.gap);
    track.style.transform = 'translateX(-' + offset + 'px)';

    updateDots();
  }

  /* ---- autoplay ---- */
  function startAutoplay() {
    autoplayTimer = setInterval(function () {
      goTo(current + 1);
    }, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  /* ---- touch / swipe ---- */
  let touchStartX = 0;

  track.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
    startAutoplay();
  }, { passive: true });

  /* ---- resize: rebuild dots if layout switches between desktop/mobile ---- */
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const spv = getSlidesPerView();
      if (spv !== prevSpv) {
        prevSpv = spv;
        current = 0;
        rebuildDots();
      }
      goTo(current);
    }, 120);
  });

  /* ---- init ---- */
  prevSpv = getSlidesPerView();
  setCardSizes();
  rebuildDots();
  goTo(0);
  startAutoplay();
})();


/* ==========================================
   STICKY HEADER SHADOW ENHANCEMENT
   ========================================== */
(function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      header.style.boxShadow = '0 2px 16px rgba(0,0,0,0.14)';
    } else {
      header.style.boxShadow = '';
    }
  }, { passive: true });
})();


/* ==========================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ========================================== */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const headerHeight = document.getElementById('site-header').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
