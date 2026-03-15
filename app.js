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
        duration: 0.1,
        stagger: 0.15, // slight delay between lines to simulate typing/loading
        ease: "none"
    })
    
    // Wait slightly after boot text is done
    .to({}, {duration: 0.5})

    // 2. Slide the entire preloader up and away
    .to("#preloader", {
        yPercent: -100,
        duration: 1,
        ease: "power3.inOut"
    }, "+=0.2")

    // 3. Chain the Hero Animation to fire right as the preloader leaves
    .to(".gsap-hero", {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        onComplete: () => {
            document.body.style.overflow = "";
        }
    }, "-=0.2"); // overlap slightly for fluidity

    // Reusable scroll animation utility
    const animateOnScroll = (target, trigger, staggerAmt = 0) => {
        gsap.to(target, {
            scrollTrigger: {
                trigger: trigger,
                start: "top 80%", // slightly earlier trigger for smoother feel
                toggleActions: "play none none reverse" // plays on scroll down, reverses if scrolled way back up
            },
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: staggerAmt,
            ease: "power3.out"
        });
    };

    // Apply scroll animations
    animateOnScroll(".gsap-project", "#featured");
    // Apply batch scroll animation for tech items so they trigger individually as they enter
    ScrollTrigger.batch(".gsap-tech", {
        start: "top 85%",
        onEnter: elements => gsap.to(elements, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", overwrite: true }),
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
});
