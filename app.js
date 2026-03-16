if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
window.onbeforeunload = function () { window.scrollTo(0, 0); };

document.addEventListener("DOMContentLoaded", (event) => {
    document.body.style.overflow = "hidden";

    gsap.registerPlugin(ScrollTrigger);

    // Master Timeline for Boot Sequence & Hero Reveal
    const masterTl = gsap.timeline();

    // 1. Terminal Text Loading Sequence
    masterTl.to(".gsap-step", {
        opacity: 1,
        duration: 0.08,
        stagger: 0.09, // faster typing simulation
        ease: "none"
    })
    
    // Minimal wait after boot text is done
    .to({}, {duration: 0.2})

    // 2. Slide the entire preloader up and away faster
    .to("#preloader", {
        yPercent: -100,
        duration: 0.7,
        ease: "power4.inOut"
    }, "+=0.1")

    // 3. Chain the Hero Animation to fire right as the preloader leaves
    .to(".gsap-hero", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        onComplete: () => {
            document.body.style.overflow = "";
        }
    }, "-=0.4"); // overlap more for fluidity

    // Reusable scroll animation utility
    const animateOnScroll = (target, trigger, staggerAmt = 0) => {
        gsap.to(target, {
            scrollTrigger: {
                trigger: trigger,
                start: "top 75%", // slightly earlier trigger for smoother feel
                toggleActions: "play none none reverse" // plays on scroll down, reverses if scrolled way back up
            },
            y: 0,
            opacity: 1,
            duration: 1.8,
            stagger: staggerAmt,
            ease: "power3.out"
        });
    };

    // Apply scroll animations
    gsap.to(".gsap-project-left", {
        scrollTrigger: {
            trigger: "#featured",
            start: "top 75%",
            toggleActions: "play none none reverse"
        },
        x: 0,
        opacity: 1,
        duration: 2.5,
        ease: "power3.out"
    });

    gsap.to(".gsap-project-right", {
        scrollTrigger: {
            trigger: "#featured",
            start: "top 75%",
            toggleActions: "play none none reverse"
        },
        x: 0,
        opacity: 1,
        duration: 2.5,
        ease: "power3.out"
    });

    // Apply batch scroll animation for tech items so they trigger individually as they enter
    ScrollTrigger.batch(".gsap-tech", {
        start: "top 85%",
        onEnter: elements => gsap.to(elements, { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: "power3.out", overwrite: true }),
        onLeaveBack: elements => gsap.set(elements, { opacity: 0, y: 16, overwrite: true })
    });
    animateOnScroll(".gsap-graph", ".gsap-graph");
    animateOnScroll(".gsap-contact", "#contact", 0.15);

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileLinks = document.querySelectorAll(".mobile-link");
    let isMenuOpen = false;

    if (mobileMenuBtn && mobileMenu) {
        // Create GSAP Timeline for Menu
        const menuTl = gsap.timeline({ paused: true })
            .to(mobileMenu, {
                opacity: 1,
                pointerEvents: "auto",
                duration: 0.3,
                ease: "power2.inOut"
            })
            .fromTo(mobileLinks, {
                opacity: 0,
                y: 20
            }, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.1");

        const toggleMenu = () => {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) {
                // Change to Close (X) Icon
                mobileMenuBtn.innerHTML = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
                menuTl.play();
                document.body.style.overflow = "hidden"; // Prevent scrolling
            } else {
                // Change back to Hamburger Icon
                mobileMenuBtn.innerHTML = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>';
                menuTl.reverse();
                document.body.style.overflow = ""; // Restore scrolling
            }
        };

        mobileMenuBtn.addEventListener("click", toggleMenu);

        // Close menu on link click
        mobileLinks.forEach(link => {
            link.addEventListener("click", () => {
                if (isMenuOpen) toggleMenu();
            });
        });
    }

    // Hybrid Image Crossfade (Hover for Mouse, Tap for Touch)
    const imgContainer = document.getElementById("featured-image-container");
    const img1 = document.getElementById("featured-img-1");
    const img2 = document.getElementById("featured-img-2");

    if (imgContainer && img1 && img2) {
        const isHoverSupported = window.matchMedia('(hover: hover)').matches;

        const showSecondImage = () => {
            img1.classList.replace("opacity-100", "opacity-0");
            img2.classList.replace("opacity-0", "opacity-100");
        };

        const showFirstImage = () => {
            img1.classList.replace("opacity-0", "opacity-100");
            img2.classList.replace("opacity-100", "opacity-0");
        };

        if (isHoverSupported) {
            // Desktop: Bind precise hover events
            imgContainer.addEventListener("mouseenter", showSecondImage);
            imgContainer.addEventListener("mouseleave", showFirstImage);
        } else {
            // Mobile: Inject Affordance Badge and bind click toggle
            const badge = document.createElement("div");
            badge.className = "absolute bottom-4 right-4 z-30 pointer-events-none bg-black/90 backdrop-blur-sm border border-lime-400 px-3 py-1 flex items-center gap-2";
            badge.innerHTML = `
                <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                </span>
                <span class="text-lime-400 font-mono text-[10px] uppercase tracking-widest font-bold">Tap to Swap</span>
            `;
            imgContainer.appendChild(badge);

            let isToggled = false;
            imgContainer.addEventListener("click", () => {
                isToggled = !isToggled;
                isToggled ? showSecondImage() : showFirstImage();
            });
        }
    }

    // Theme Toggler Logic
    const themeToggleDarkIcon = document.getElementById("theme-toggle-dark-icon");
    const themeToggleLightIcon = document.getElementById("theme-toggle-light-icon");
    const themeToggleBtn = document.getElementById("theme-toggle");

    if (themeToggleBtn && themeToggleDarkIcon && themeToggleLightIcon) {
        // Set initial icon based on root class
        if (document.documentElement.classList.contains("dark")) {
            themeToggleLightIcon.classList.remove("hidden");
        } else {
            themeToggleDarkIcon.classList.remove("hidden");
        }

        themeToggleBtn.addEventListener("click", () => {
            // Toggle icons
            themeToggleDarkIcon.classList.toggle("hidden");
            themeToggleLightIcon.classList.toggle("hidden");

            // Toggle logic & storage
            if (localStorage.getItem("theme")) {
                if (localStorage.getItem("theme") === "light") {
                    document.documentElement.classList.add("dark");
                    localStorage.setItem("theme", "dark");
                } else {
                    document.documentElement.classList.remove("dark");
                    localStorage.setItem("theme", "light");
                }
            } else {
                if (document.documentElement.classList.contains("dark")) {
                    document.documentElement.classList.remove("dark");
                    localStorage.setItem("theme", "light");
                } else {
                    document.documentElement.classList.add("dark");
                    localStorage.setItem("theme", "dark");
                }
            }
        });
    }

    // Live OS Theme Sync
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        // Only auto-switch if the user has NOT manually overridden the theme
        if (localStorage.getItem("theme") === null) {
            if (e.matches) {
                document.documentElement.classList.add("dark");
                themeToggleLightIcon.classList.remove("hidden");
                themeToggleDarkIcon.classList.add("hidden");
            } else {
                document.documentElement.classList.remove("dark");
                themeToggleLightIcon.classList.add("hidden");
                themeToggleDarkIcon.classList.remove("hidden");
            }
        }
    });
});
