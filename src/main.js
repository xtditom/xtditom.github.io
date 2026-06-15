/**
 * XTDITOM OS v2.0 — Main Entry Point
 * Orchestrates: Three.js 3D scene, GSAP animations, Lenis smooth scroll,
 * terminal CLI, theme toggling, contact form, and custom cursor.
 */
import "./styles/index.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { SceneManager } from "./scene/SceneManager.js";
import { CyberGrid } from "./objects/CyberGrid.js";
import { ParticleField } from "./objects/ParticleField.js";
import { Terminal } from "./ui/Terminal.js";

gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════════════════
// SCROLL RESTORATION — always start from top on refresh
// ═══════════════════════════════════════════════════════════════
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (window.location.hash) window.history.replaceState(null, null, window.location.pathname);
window.scrollTo(0, 0);
window.addEventListener("beforeunload", () => window.scrollTo(0, 0));

// ═══════════════════════════════════════════════════════════════
// DETECT WEBGL + DEVICE CAPABILITIES
// ═══════════════════════════════════════════════════════════════
const isDesktop = window.matchMedia("(hover: hover) and (min-width: 768px)").matches;
const hasWebGL = (() => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
})();

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo(0, 0);
  document.body.style.overflow = "hidden";

  // ─── THREE.JS SCENE (Desktop + WebGL only) ───
  let scene = null;
  if (isDesktop && hasWebGL) {
    const canvas = document.getElementById("webgl-canvas");
    if (canvas) {
      scene = new SceneManager(canvas);
      const isDark = document.documentElement.classList.contains("dark");

      const grid = new CyberGrid();
      grid.setTheme(isDark);
      scene.addObject(grid);

      const particles = new ParticleField(350);
      particles.setTheme(isDark);
      scene.addObject(particles);

      // Render loop
      const animate = () => {
        scene.update();
        requestAnimationFrame(animate);
      };
      animate();
    }
  }

  // ─── LENIS SMOOTH SCROLL ───
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Scroll progress for 3D scene + progress bar
  const progressFill = document.querySelector(".scroll-progress__fill");
  lenis.on("scroll", ({ progress }) => {
    if (scene) scene.setScrollProgress(progress);
    if (progressFill) progressFill.style.width = `${progress * 100}%`;
  });

  // ─── SMOOTH SCROLL ANCHOR LINKS ───
  // Intercept all anchor links and use Lenis for smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, {
          offset: -80, // Account for nav height
          duration: 1.6,
        });
      }
    });
  });

  // ─── PRELOADER / BOOT SEQUENCE ───
  const preloader = document.getElementById("preloader");
  const preloaderSteps = document.querySelectorAll("[data-preloader-step]");
  const progressBar = document.getElementById("preloader-bar");
  const progressWrap = document.querySelector(".preloader__progress");

  const bootTl = gsap.timeline({
    onComplete: () => {
      gsap.to(preloader, {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.inOut",
        onComplete: () => {
          preloader.style.display = "none";
          document.body.style.overflow = "";
          lenis.start();
          animateHero();
        },
      });
    },
  });

  // Animate boot text lines
  bootTl
    .to(preloaderSteps, {
      opacity: 1,
      duration: 0.06,
      stagger: 0.12,
      ease: "none",
    })
    .to(progressWrap, { opacity: 1, duration: 0.2 }, "-=0.2")
    .to(progressBar, { width: "100%", duration: 0.6, ease: "power2.inOut" }, "-=0.1")
    .to({}, { duration: 0.3 });

  // ─── HERO REVEAL ───
  function animateHero() {
    gsap.to("[data-scroll-reveal]", {
      y: 0,
      opacity: 1,
      duration: 0,
    });

    // Re-hide for scroll triggers (except hero which reveals immediately)
    document.querySelectorAll(".section:not(.section--hero) [data-scroll-reveal]").forEach((el) => {
      gsap.set(el, { y: 40, opacity: 0 });
    });

    // Hero content — stagger each child element one by one
    const heroItems = document.querySelectorAll(
      ".hero__greeting, .hero__name, .hero__tagline, .hero__bio"
    );
    if (heroItems.length) {
      gsap.set(heroItems, { y: 40, opacity: 0 });
      gsap.to(heroItems, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
      });
    }

    // Set up scroll-triggered reveals for other sections
    document.querySelectorAll(".section:not(.section--hero) [data-scroll-reveal]").forEach((el) => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
      });
    });

    // Terminal entrance animation
    const terminalEl = document.querySelector(".terminal");
    if (terminalEl) {
      gsap.fromTo(terminalEl,
        { scaleY: 0.5, scaleX: 0.9, rotateX: 15, transformOrigin: "top center" },
        {
          scrollTrigger: {
            trigger: "#terminal",
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
          scaleY: 1,
          scaleX: 1,
          rotateX: 0,
          duration: 1.6,
          ease: "expo.out",
        }
      );
    }

    // Tech items batch animation
    ScrollTrigger.batch(".tech__item", {
      start: "top 85%",
      onEnter: (elements) =>
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          overwrite: true,
        }),
      onLeaveBack: (elements) =>
        gsap.set(elements, { opacity: 0, y: 16, overwrite: true }),
    });

    // Set initial state for tech items
    gsap.set(".tech__item", { opacity: 0, y: 16 });

    // ─── ACTIVE NAV LINK HIGHLIGHTING ───
    setupActiveNav();
  }

  // ─── ACTIVE NAV HIGHLIGHTING ───
  function setupActiveNav() {
    const navLinks = document.querySelectorAll(".nav-hud__link[data-section]");
    const sections = ["#hero", "#featured", "#tech", "#rigs", "#terminal"];

    sections.forEach((sectionId, index) => {
      const section = document.querySelector(sectionId);
      if (!section) return;

      ScrollTrigger.create({
        trigger: section,
        start: "top 40%",
        end: "bottom 40%",
        onEnter: () => setActiveLink(index),
        onEnterBack: () => setActiveLink(index),
      });
    });

    function setActiveLink(index) {
      navLinks.forEach((link) => link.classList.remove("is-active"));
      if (navLinks[index]) navLinks[index].classList.add("is-active");
    }
  }

  // ─── THEME TOGGLE ───
  const themeBtn = document.getElementById("theme-toggle");
  const iconSun = document.getElementById("icon-sun");
  const iconMoon = document.getElementById("icon-moon");

  if (themeBtn && iconSun && iconMoon) {
    // Set initial icon
    if (document.documentElement.classList.contains("dark")) {
      iconSun.classList.remove("hidden");
    } else {
      iconMoon.classList.remove("hidden");
    }

    themeBtn.addEventListener("click", () => {
      themeBtn.style.pointerEvents = "none";

      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
        iconSun.classList.add("hidden");
        iconMoon.classList.remove("hidden");
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        iconMoon.classList.add("hidden");
        iconSun.classList.remove("hidden");
      }

      if (scene) scene.setTheme(!isDark);

      setTimeout(() => {
        themeBtn.style.pointerEvents = "auto";
      }, 300);
    });

    // Listen for terminal theme commands
    window.addEventListener("themechange", (e) => {
      if (scene) scene.setTheme(e.detail.dark);
      if (e.detail.dark) {
        iconSun.classList.remove("hidden");
        iconMoon.classList.add("hidden");
      } else {
        iconSun.classList.add("hidden");
        iconMoon.classList.remove("hidden");
      }
    });
  }

  // OS theme sync
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (localStorage.getItem("theme") === null) {
      if (e.matches) {
        document.documentElement.classList.add("dark");
        iconSun?.classList.remove("hidden");
        iconMoon?.classList.add("hidden");
      } else {
        document.documentElement.classList.remove("dark");
        iconSun?.classList.add("hidden");
        iconMoon?.classList.remove("hidden");
      }
      if (scene) scene.setTheme(e.matches);
    }
  });

  // ─── MOBILE MENU ───
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-menu__link, .mobile-menu__cta");

  if (mobileMenuBtn && mobileMenu) {
    let isOpen = false;
    const toggle = () => {
      isOpen = !isOpen;
      mobileMenuBtn.classList.toggle("is-open", isOpen);
      mobileMenu.classList.toggle("is-open", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    };

    mobileMenuBtn.addEventListener("click", toggle);
    mobileLinks.forEach((link) => link.addEventListener("click", () => isOpen && toggle()));
  }

  // ─── FEATURED IMAGE CROSSFADE ───
  const imgContainer = document.getElementById("featured-image-container");
  const img1 = document.getElementById("featured-img-1");
  const img2 = document.getElementById("featured-img-2");

  if (imgContainer && img1 && img2) {
    const showAlt = () => { img1.style.opacity = "0"; img2.style.opacity = "1"; };
    const showMain = () => { img1.style.opacity = "1"; img2.style.opacity = "0"; };

    if (isDesktop) {
      imgContainer.addEventListener("mouseenter", showAlt);
      imgContainer.addEventListener("mouseleave", showMain);
    } else {
      let toggled = false;
      imgContainer.addEventListener("click", () => {
        toggled = !toggled;
        toggled ? showAlt() : showMain();
        // Hide tap hint after first interaction
        const hint = imgContainer.querySelector(".featured__tap-hint");
        if (hint) hint.style.display = "none";
      });
    }
  }

  // ─── CONTACT FORM ───
  const contactForm = document.getElementById("contact-form");
  const formSuccess = document.getElementById("form-success");
  const submitBtn = contactForm?.querySelector("button[type='submit']");

  if (contactForm && formSuccess && submitBtn) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const originalText = submitBtn.innerText;
      submitBtn.innerText = "Transmitting...";
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.5";

      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method,
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          contactForm.style.display = "none";
          formSuccess.classList.remove("hidden");
          setTimeout(() => {
            formSuccess.classList.add("hidden");
            contactForm.style.display = "";
            contactForm.reset();
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = "";
          }, 3000);
        } else {
          alert("[ERROR] Server rejected the payload.");
          submitBtn.innerText = originalText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = "";
        }
      } catch {
        alert("[ERROR] Network failure.");
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = "";
      }
    });
  }

  // ─── CUSTOM CURSOR (Desktop only) ───
  if (isDesktop) {
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let dotX = 0, dotY = 0, ringX = 0, ringY = 0;

    window.addEventListener("mousemove", (e) => {
      dotX = e.clientX;
      dotY = e.clientY;
    });

    const cursorLoop = () => {
      ringX += (dotX - ringX) * 0.15;
      ringY += (dotY - ringY) * 0.15;
      dot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
      ring.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
      requestAnimationFrame(cursorLoop);
    };
    cursorLoop();

    // Hover detection
    const hoverTargets = "a, button, input, textarea, .tech__item, .featured__image-container, .magnetic-btn";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverTargets)) {
        dot.classList.add("is-hovering");
        ring.classList.add("is-hovering");
      }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverTargets)) {
        dot.classList.remove("is-hovering");
        ring.classList.remove("is-hovering");
      }
    });
  }

  // ─── MAGNETIC BUTTONS ───
  if (isDesktop) {
    document.querySelectorAll(".magnetic-btn").forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
      const yTo = gsap.quickTo(btn, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        xTo((e.clientX - rect.left - rect.width / 2) * 0.4);
        yTo((e.clientY - rect.top - rect.height / 2) * 0.4);
      });
      btn.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
  }

  // ─── HIDE LINK PREVIEW IN BROWSER STATUSBAR ───
  // Remove href on hover/focus so the browser doesn't show the URL preview,
  // then restore it when the user leaves or the link activates.
  document.querySelectorAll("a[href]").forEach((link) => {
    const realHref = link.getAttribute("href");
    // Skip anchor links (#section) — they don't show a preview
    if (realHref.startsWith("#")) return;

    link.addEventListener("mouseenter", () => {
      link.dataset.href = link.getAttribute("href");
      link.removeAttribute("href");
    });
    link.addEventListener("mouseleave", () => {
      if (link.dataset.href) {
        link.setAttribute("href", link.dataset.href);
        delete link.dataset.href;
      }
    });
    link.addEventListener("focus", () => {
      link.dataset.href = link.getAttribute("href");
      link.removeAttribute("href");
    });
    link.addEventListener("blur", () => {
      if (link.dataset.href) {
        link.setAttribute("href", link.dataset.href);
        delete link.dataset.href;
      }
    });
    // Restore href and navigate on click
    link.addEventListener("click", (e) => {
      if (link.dataset.href) {
        e.preventDefault();
        const url = link.dataset.href;
        link.setAttribute("href", url);
        delete link.dataset.href;
        if (link.target === "_blank") {
          window.open(url, "_blank", "noopener,noreferrer");
        } else if (url.startsWith("mailto:")) {
          window.location.href = url;
        } else {
          window.location.href = url;
        }
      }
    });
  });

  // ─── NAV: always visible (no hide on scroll) ───

  // ─── TAB VISIBILITY ───
  const originalTitle = document.title;

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      document.title = "XTDITOM";
    } else {
      document.title = originalTitle;
    }
  });

  // ─── TERMINAL INIT ───
  const terminal = new Terminal();
  if (scene) terminal.setSceneManager(scene);
});
