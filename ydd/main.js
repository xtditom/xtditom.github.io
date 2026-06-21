/* ============================================
   YourDynamicDashboard — Main JavaScript
   GSAP ScrollTrigger, Parallax, Magnetic Buttons,
   3D Tilt, Lazy Loading, Typewriter
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ─── Scroll to Top on Refresh (Fallback) ─── */
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  /* ─── Also scroll to top before unload (ensures next load starts at top) ─── */
  window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
  });

  /* ─── GSAP Guard — Bail gracefully if CDN failed ─── */
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded. Animations disabled.');
    // Still show all content that was hidden for animation
    document.querySelectorAll('[data-src]').forEach(el => {
      if (el.tagName === 'IMG') {
        el.src = el.dataset.src;
        el.style.opacity = '1';
      }
    });
    return;
  }

  /* ─── GSAP Registration ─── */
  gsap.registerPlugin(ScrollTrigger);

  /* ─── Touch Device Detection ─── */
  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  /* ─── DOM References ─── */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const videoWrapper = document.getElementById('video-wrapper');

  /* ─── Navbar Scroll Effect ─── */
  let lastScroll = 0;
  const handleNavScroll = () => {
    const currentScroll = window.scrollY;
    navbar.classList.toggle('scrolled', currentScroll > 60);
    lastScroll = currentScroll;
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ─── Mobile Menu ─── */
  const toggleMobileMenu = (open) => {
    const isOpen = typeof open === 'boolean' ? open : !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', isOpen);
    mobileOverlay.classList.toggle('open', isOpen);
    hamburger.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  hamburger.addEventListener('click', () => toggleMobileMenu());
  mobileOverlay.addEventListener('click', () => toggleMobileMenu(false));

  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  /* ─── Smooth Scroll for Anchor Links ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─── Hero Entrance Animation ─── */
  const heroTl = gsap.timeline({
    defaults: { ease: 'power4.out', duration: 1 }
  });

  heroTl
    .from('#hero-badge', {
      y: 24,
      opacity: 0,
      duration: 0.7,
    })
    .from('#hero-title', {
      y: 50,
      opacity: 0,
      duration: 1.1,
    }, '-=0.45')
    .from('#hero-subtitle', {
      y: 30,
      opacity: 0,
      duration: 0.8,
    }, '-=0.6')
    .from('#hero-buttons', {
      y: 30,
      opacity: 0,
      duration: 0.8,
    }, '-=0.5')
    .from('#hero-image', {
      y: 60,
      opacity: 0,
      scale: 0.97,
      duration: 1.3,
    }, '-=0.55');

  /* ─── Typewriter Effect ─── */
  const typewriterEl = document.getElementById('typewriter-text');
  const phrases = [
    'A privacy-first start page.',
    'Beautiful. Fast. Yours.',
    'Your browser, your rules.',
    'Zero tracking. Full control.',
    'Built for focus & speed.',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 60;
  let typewriterTimer = null;

  const typewrite = () => {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentPhrase.length) {
        isDeleting = true;
        typeSpeed = 2200;
      } else {
        typeSpeed = 55 + Math.random() * 30;
      }
    } else {
      typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 400;
      } else {
        typeSpeed = 28;
      }
    }

    typewriterTimer = setTimeout(typewrite, typeSpeed);
  };

  typewriterTimer = setTimeout(typewrite, 1200);

  /* ─── ScrollTrigger Reveals ─── */
  const createReveal = (selector, options = {}) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      const fromVars = {
        y: options.y ?? 40,
        x: options.x ?? 0,
        opacity: 0,
        scale: options.scale ?? 1,
        duration: options.duration ?? 1,
        ease: 'power4.out',
      };

      gsap.from(el, {
        ...fromVars,
        scrollTrigger: {
          trigger: el,
          start: options.start ?? 'top 88%',
          end: options.end ?? 'top 40%',
          toggleActions: 'play none none none',
        },
      });
    });
  };

  /* Section labels & headings */
  createReveal('.section-label', { y: 20, duration: 0.7 });
  createReveal('.section-heading', { y: 35, duration: 0.9 });
  createReveal('.section-desc', { y: 25, duration: 0.8 });

  /* Demo section */
  createReveal('#video-wrapper', { y: 50, duration: 1.1, scale: 0.98 });

  /* Mode cards - staggered */
  const modeCards = gsap.utils.toArray('.mode-card');
  modeCards.forEach((card, i) => {
    gsap.from(card, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      delay: i * 0.12,
    });
  });

  /* Feature cards - staggered grid */
  const featureCards = gsap.utils.toArray('.feature-card');
  featureCards.forEach((card, i) => {
    gsap.from(card, {
      y: 50,
      opacity: 0,
      scale: 0.96,
      duration: 0.9,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      delay: i * 0.08,
    });
  });

  /* Developer section */
  createReveal('.dev-card', { y: 40, duration: 1, scale: 0.98 });

  /* Footer */
  createReveal('.footer-content', { y: 30, duration: 0.8 });

  /* ─── Parallax on Background Glows ─── */
  gsap.to('.glow-1', {
    y: -120,
    x: 30,
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5,
    },
  });

  gsap.to('.glow-2', {
    y: -80,
    x: -40,
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2,
    },
  });

  gsap.to('.glow-3', {
    y: -150,
    x: 20,
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.8,
    },
  });

  /* ─── Magnetic Buttons (Desktop only — no hover on touch) ─── */
  if (!isTouchDevice) {
    const magneticStrength = 0.3;

    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * magneticStrength,
          y: y * magneticStrength,
          duration: 0.35,
          ease: 'power2.out',
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
        });
      });
    });

    /* ─── 3D Tilt on Feature Cards (Desktop only) ─── */
    const maxTilt = 6;

    document.querySelectorAll('.feature-card').forEach(card => {
      const inner = card.querySelector('.card-inner');
      if (!inner) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateX = (y - 0.5) * -maxTilt * 2;
        const rotateY = (x - 0.5) * maxTilt * 2;

        gsap.to(inner, {
          rotateX,
          rotateY,
          duration: 0.25,
          ease: 'power2.out',
          transformPerspective: 800,
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(inner, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.7,
          ease: 'power4.out',
        });
      });
    });
  }

  /* ─── Lazy Loading with IntersectionObserver ─── */
  const lazyTargets = document.querySelectorAll('[data-src]');

  const lazyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.tagName === 'IMG') {
            el.src = el.dataset.src;
            el.addEventListener('load', () => {
              el.removeAttribute('data-src');
              el.classList.add('lazy-loaded');
            }, { once: true });
          }
          lazyObserver.unobserve(el);
        }
      });
    },
    {
      rootMargin: '300px 0px',
      threshold: 0.01,
    }
  );

  lazyTargets.forEach(el => lazyObserver.observe(el));

  /* ─── YouTube Click-to-Load ─── */
  if (videoWrapper) {
    videoWrapper.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/FaX-uawBMJw?autoplay=1&rel=0&modestbranding=1';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.title = 'YourDynamicDashboard Demo';

      videoWrapper.replaceChildren(iframe);
      videoWrapper.style.cursor = 'default';
    });
  }

  /* ─── Footer Year ─── */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ─── Install Modal Control ─── */
  const installModal = document.getElementById('install-modal');
  const desktopInstallBtn = document.getElementById('install-btn-desktop');
  const mobileInstallBtn = document.getElementById('install-btn-mobile');
  const closeModalBtn = document.getElementById('close-modal');

  const openModal = () => {
    if (installModal) {
      installModal.classList.remove('hidden');
      setTimeout(() => {
        installModal.classList.add('open');
      }, 10);
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    if (installModal) {
      installModal.classList.remove('open');
      setTimeout(() => {
        installModal.classList.add('hidden');
      }, 300);
      if (!mobileMenu.classList.contains('open')) {
        document.body.style.overflow = '';
      }
    }
  };

  if (desktopInstallBtn) {
    desktopInstallBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  if (mobileInstallBtn) {
    mobileInstallBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (installModal) {
    installModal.addEventListener('click', (e) => {
      if (e.target === installModal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && installModal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  /* ─── Accessibility: Reduce Motion ─── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.globalTimeline.timeScale(20);
    ScrollTrigger.getAll().forEach(st => st.kill());
  }
});
