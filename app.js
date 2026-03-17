// --- AGGRESSIVE SCROLL OVERRIDE ---
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
// Strip URL hash on load to prevent native anchor jumping
if (window.location.hash) {
  window.history.replaceState(null, null, window.location.pathname);
}
// Force to top before paint
window.scrollTo(0, 0);
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

document.addEventListener("DOMContentLoaded", (event) => {
  window.scrollTo(0, 0); // Safety lock for GSAP calculations
  document.body.style.overflow = "hidden";

  gsap.registerPlugin(ScrollTrigger);

  // Master Timeline for Boot Sequence & Hero Reveal
  const masterTl = gsap.timeline();

  // 1. Terminal Text Loading Sequence
  masterTl
    .to(".gsap-step", {
      opacity: 1,
      duration: 0.08,
      stagger: 0.09, // faster typing simulation
      ease: "none",
    })

    // Minimal wait after boot text is done
    .to({}, { duration: 0.2 })

    // 2. Slide the entire preloader up and away faster
    .to(
      "#preloader",
      {
        yPercent: -100,
        duration: 0.7,
        ease: "power4.inOut",
      },
      "+=0.1",
    )

    // 3. Chain the Hero Animation to fire right as the preloader leaves
    .to(
      ".gsap-hero",
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        onComplete: () => {
          document.body.style.overflow = "";
        },
      },
      "-=0.4",
    ); // overlap more for fluidity

  // Reusable scroll animation utility
  const animateOnScroll = (target, trigger, staggerAmt = 0) => {
    gsap.to(target, {
      scrollTrigger: {
        trigger: trigger,
        start: "top 75%", // slightly earlier trigger for smoother feel
        toggleActions: "play none none reverse", // plays on scroll down, reverses if scrolled way back up
      },
      y: 0,
      opacity: 1,
      duration: 1.8,
      stagger: staggerAmt,
      ease: "power3.out",
    });
  };

  // Apply scroll animations
  gsap.to(".gsap-project-left", {
    scrollTrigger: {
      trigger: "#featured",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
    x: 0,
    opacity: 1,
    duration: 2.5,
    ease: "power3.out",
  });

  gsap.to(".gsap-project-right", {
    scrollTrigger: {
      trigger: "#featured",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
    x: 0,
    opacity: 1,
    duration: 2.5,
    ease: "power3.out",
  });

  // Apply batch scroll animation for tech items so they trigger individually as they enter
  ScrollTrigger.batch(".gsap-tech", {
    start: "top 85%",
    onEnter: (elements) =>
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
        overwrite: true,
      }),
    onLeaveBack: (elements) =>
      gsap.set(elements, { opacity: 0, y: 16, overwrite: true }),
  });
  animateOnScroll(".gsap-graph", ".gsap-graph");
  animateOnScroll(".gsap-rig", "#rigs", 0.2);
  animateOnScroll(".gsap-rig-item", "#rigs", 0.08);
  animateOnScroll(".gsap-contact", "#contact", 0.15);

  // Terminal Entrance Animation Logic
  gsap.fromTo(
    ".gsap-terminal",
    {
      opacity: 0,
      y: 60,
      scaleY: 0.5,
      scaleX: 0.9,
      rotateX: 15,
      transformOrigin: "top center",
      perspective: 1000,
    },
    {
      scrollTrigger: {
        trigger: "#terminal",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
      opacity: 1,
      y: 0,
      scaleY: 1,
      scaleX: 1,
      rotateX: 0,
      duration: 1.6,
      ease: "expo.out",
    },
  );

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-link");
  let isMenuOpen = false;

  if (mobileMenuBtn && mobileMenu) {
    // Create GSAP Timeline for Menu
    const menuTl = gsap
      .timeline({ paused: true })
      .to(mobileMenu, {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.3,
        ease: "power2.inOut",
      })
      .fromTo(
        mobileLinks,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.1",
      );

    const toggleMenu = () => {
      isMenuOpen = !isMenuOpen;
      if (isMenuOpen) {
        mobileMenuBtn.classList.add("menu-open");
        menuTl.play();
        document.body.style.overflow = "hidden"; // Prevent scrolling
      } else {
        mobileMenuBtn.classList.remove("menu-open");
        menuTl.reverse();
        document.body.style.overflow = ""; // Restore scrolling
      }
      mobileMenuBtn.blur(); // Force focus away to reset color manually
    };

    mobileMenuBtn.addEventListener("click", toggleMenu);

    // Close menu on link click
    mobileLinks.forEach((link) => {
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
    const isHoverSupported = window.matchMedia("(hover: hover)").matches;

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
      badge.className =
        "absolute bottom-4 right-4 z-30 pointer-events-none bg-black/90 backdrop-blur-sm border border-lime-400 px-3 py-1 flex items-center gap-2";
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
  const themeToggleLightIcon = document.getElementById(
    "theme-toggle-light-icon",
  );
  const themeToggleBtn = document.getElementById("theme-toggle");

  if (themeToggleBtn && themeToggleDarkIcon && themeToggleLightIcon) {
    // Create an overlay for the transition
    const themeOverlay = document.createElement("div");
    themeOverlay.className =
      "fixed inset-0 z-[9999] pointer-events-none opacity-0 backdrop-blur-xl bg-black/10 dark:bg-white/10";
    document.body.appendChild(themeOverlay);

    // Set initial icon based on root class
    if (document.documentElement.classList.contains("dark")) {
      themeToggleLightIcon.classList.remove("hidden");
    } else {
      themeToggleDarkIcon.classList.remove("hidden");
    }

    themeToggleBtn.addEventListener("click", () => {
      // Prevent spam clicking during animation
      themeToggleBtn.style.pointerEvents = "none";

      // 1. Blur in (fade up the overlay)
      gsap.to(themeOverlay, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
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
          themeToggleBtn.blur(); // Force focus away to reset color manually

          // 2. Blur out (fade out the overlay)
          gsap.to(themeOverlay, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
              themeToggleBtn.style.pointerEvents = "auto";
            },
          });
        },
      });
    });
  }

  // Live OS Theme Sync
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
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

  // Interactive CLI Logic
  const cliInput = document.getElementById("cli-input");
  const cliOutput = document.getElementById("cli-output");

  if (cliInput && cliOutput) {
    let mailState = "idle"; // tracks: idle, awaiting_email, awaiting_message
    let mailData = { email: "", message: "" };

    const commands = {
      help: "Available commands: <br> - <strong>whoami</strong>: Displays my brief bio <br> - <strong>skills</strong>: Lists core engineering skills <br> - <strong>start</strong>: Restarts the boot interface <br> - <strong>neofetch</strong>: Displays system architecture <br> - <strong>theme [light/dark]</strong>: Toggles system colors <br> - <strong>mail</strong>: Send a direct message to my inbox <br> - <strong>matrix</strong>: Execute visual protocol <br> - <strong>clear</strong>: Clears the terminal output <br> - <strong>exit</strong>: Terminates the session",
      whoami:
        "Ditom Baroi Antu. 18-year-old student developer from Dhaka, Bangladesh. Currently exploring the Tech World & Planning my future in it.",
      skills:
        "HTML5, CSS3, JavaScript, GSAP, Tailwind CSS v4, Next.js, Python, C++",
      sudo: "Access denied. This incident will be reported.",
    };

    cliOutput.parentElement.addEventListener("click", () => cliInput.focus());

    cliInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const rawInput = this.value.trim();
        if (rawInput === "") return;

        const args = rawInput.split(" ").filter(Boolean);
        const cmd = args[0].toLowerCase();

        // --- STATE MACHINE: MAIL COMMAND INTERCEPTION ---
        if (mailState !== "idle") {
          // Escape Hatches: Kill state if user types these specific commands
          if (cmd === "cancel" || cmd === "exit" || cmd === "clear") {
            mailState = "idle";
            if (cmd === "cancel") {
              cliOutput.innerHTML += `<div class="mt-2"><span class="text-white">${rawInput}</span></div><div class="text-yellow-400 mt-1 ml-4">[ABORTED] Mail protocol terminated.</div>`;
              this.value = "";
              setTimeout(() => {
                cliOutput.scrollTop = cliOutput.scrollHeight;
              }, 50);
              return;
            }
            // If 'clear' or 'exit', fall through to normal command processor
          } else {
            // Standard Mail State Processing
            cliOutput.innerHTML += `<div class="mt-2"><span class="text-white">${rawInput}</span></div>`;

            if (mailState === "awaiting_email") {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(rawInput)) {
                cliOutput.innerHTML += `<div class="text-red-400 mt-1 ml-4">Invalid email format. Try again or type 'cancel':</div><div class="mt-1"><span class="text-emerald-400 font-bold mr-2">Email:</span></div>`;
                this.value = "";
                cliOutput.scrollTop = cliOutput.scrollHeight;
                return;
              }
              mailData.email = rawInput;
              mailState = "awaiting_message";
              cliOutput.innerHTML += `<div class="text-lime-400 mt-1 ml-4">Email accepted.</div><div class="mt-2"><span class="text-emerald-400 font-bold mr-2">Message:</span></div>`;
            } else if (mailState === "awaiting_message") {
              mailData.message = rawInput;
              cliOutput.innerHTML += `<div class="text-yellow-400 mt-1 ml-4">Transmitting payload to server...</div>`;
              this.disabled = true;

              fetch("https://formspree.io/f/xpqyjoyj", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: mailData.email,
                  message: mailData.message,
                  _subject: "CLI Terminal Contact",
                }),
              })
                .then((response) => {
                  if (response.ok) {
                    cliOutput.innerHTML += `<div class="text-emerald-400 font-bold mt-1 ml-4">[OK] Message delivered successfully.</div>`;
                  } else {
                    cliOutput.innerHTML += `<div class="text-red-400 mt-1 ml-4">[ERROR] Server rejected the payload.</div>`;
                  }
                })
                .catch((error) => {
                  cliOutput.innerHTML += `<div class="text-red-400 mt-1 ml-4">[ERROR] Network failure.</div>`;
                })
                .finally(() => {
                  mailState = "idle";
                  this.disabled = false;
                  this.focus();
                  cliOutput.scrollTop = cliOutput.scrollHeight;
                });
            }
            this.value = "";
            setTimeout(() => {
              cliOutput.scrollTop = cliOutput.scrollHeight;
            }, 50);
            return; // Halt standard command processing
          }
        }
        // --- END STATE MACHINE ---

        const promptPrefix =
          window.innerWidth > 768 ? "guest@xtditom:~$" : "~$";
        cliOutput.innerHTML += `<div class="mt-2"><span class="text-emerald-400 font-bold mr-2">${promptPrefix}</span><span class="text-white">${rawInput}</span></div>`;

        // Process Standard & Advanced Commands
        if (cmd === "clear") {
          cliOutput.innerHTML = "";
        } else if (cmd === "start") {
          cliOutput.innerHTML += `<div class="mt-2"><span class="text-zinc-500">XTDITOM OS [Version 0.0.0]</span></div><div><span class="text-zinc-500">(c) 2026 Ditom Baroi Antu. All rights reserved.</span></div><br><div>Type <span class="text-white font-bold">'help'</span> to see a list of available commands.</div>`;
        } else if (cmd === "theme") {
          const mode = args[1]?.toLowerCase();
          const lightIcon = document.getElementById("theme-toggle-light-icon");
          const darkIcon = document.getElementById("theme-toggle-dark-icon");

          if (mode === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            if (lightIcon) lightIcon.classList.remove("hidden");
            if (darkIcon) darkIcon.classList.add("hidden");
            cliOutput.innerHTML += `<div class="text-lime-400 mt-1 ml-4">System theme updated to: DARK.</div>`;
          } else if (mode === "light") {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            if (lightIcon) lightIcon.classList.add("hidden");
            if (darkIcon) darkIcon.classList.remove("hidden");
            cliOutput.innerHTML += `<div class="text-lime-400 mt-1 ml-4">System theme updated to: LIGHT.</div>`;
          } else if (mode) {
            cliOutput.innerHTML += `<div class="text-red-400 mt-1 ml-4">Invalid theme mode: ${mode}. Usage: theme [light/dark]</div>`;
          } else {
            cliOutput.innerHTML += `<div class="text-red-400 mt-1 ml-4">Usage: theme [light/dark]</div>`;
          }
        } else if (cmd === "neofetch") {
          cliOutput.innerHTML += `<div class="text-lime-400 mt-4 ml-4 flex flex-col md:flex-row gap-6 items-start"><pre class="text-emerald-500 leading-tight font-bold hidden md:block">\n     \\\\\\\\\n      \\\\\\\\\\\\\n       \\\\\\\\\\\\\n       //\\\\\\\\\\\\\n      //  \\\\\\\\\\\\\n     //    \\\\\\\\\\\\\n                    </pre><div><span class="text-white font-bold">ditom@sys_00</span><br><span class="text-zinc-600">-------------------------</span><br><span class="text-emerald-400 font-bold">OS:</span> XTDITOM OS v1.0<br><span class="text-emerald-400 font-bold">Host:</span> Workstation // SYS_00<br><span class="text-emerald-400 font-bold">CPU:</span> Ryzen 5 5600GT (3.6GHz - 4.4GHz)<br><span class="text-emerald-400 font-bold">GPU:</span> Radeon Vega 7 i-GPU<br><span class="text-emerald-400 font-bold">Memory:</span> 16GB Dual Channel<br><span class="text-emerald-400 font-bold">Uptime:</span> 18 Years</div></div>`;
        } else if (cmd === "mail") {
          mailState = "awaiting_email";
          cliOutput.innerHTML += `<div class="text-lime-400 mt-1 ml-4">Initializing direct message protocol...</div><div class="mt-2"><span class="text-emerald-400 font-bold mr-2">Email:</span></div>`;
        } else if (cmd === "matrix") {
          cliOutput.innerHTML += `<div class="text-lime-400 mt-1 ml-4">Initializing visual protocol...</div>`;
          const terminalUI = document.querySelector(".gsap-terminal");
          const cvs = document.createElement("canvas");
          cvs.style.position = "absolute";
          cvs.style.top = "0";
          cvs.style.left = "0";
          cvs.style.width = "100%";
          cvs.style.height = "100%";
          cvs.style.zIndex = "50";
          cvs.style.pointerEvents = "none";
          terminalUI.appendChild(cvs);

          const ctx = cvs.getContext("2d");
          cvs.width = terminalUI.offsetWidth;
          cvs.height = terminalUI.offsetHeight;
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*".split("");
          const fontSize = 14;
          const columns = cvs.width / fontSize;
          const drops = Array(Math.floor(columns)).fill(1);

          const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.fillRect(0, 0, cvs.width, cvs.height);
            ctx.fillStyle = "#4ade80";
            ctx.font = fontSize + "px monospace";
            for (let i = 0; i < drops.length; i++) {
              const text = chars[Math.floor(Math.random() * chars.length)];
              ctx.fillText(text, i * fontSize, drops[i] * fontSize);
              if (drops[i] * fontSize > cvs.height && Math.random() > 0.975)
                drops[i] = 0;
              drops[i]++;
            }
          };
          const interval = setInterval(draw, 33);
          this.disabled = true;

          setTimeout(() => {
            clearInterval(interval);
            cvs.remove();
            this.disabled = false;
            this.focus();
            cliOutput.innerHTML += `<div class="text-emerald-400 mt-1 ml-4">[OK] Protocol terminated. System restored.</div>`;
            cliOutput.scrollTop = cliOutput.scrollHeight;
          }, 5000);
        } else if (cmd === "exit") {
          cliOutput.innerHTML += `<div class="text-red-400 mt-1 ml-4">Terminating session interface...</div>`;
          this.disabled = true;
          setTimeout(() => {
            const terminalBlock = document.querySelector(".gsap-terminal");
            const startContainer = document.getElementById(
              "terminal-start-container",
            );
            gsap.to(terminalBlock, {
              height: 0,
              padding: 0,
              opacity: 0,
              duration: 0.6,
              border: 0,
              ease: "power3.inOut",
              onComplete: () => {
                terminalBlock.style.display = "none";
                if (startContainer) {
                  startContainer.classList.remove("hidden");
                  gsap.fromTo(
                    startContainer,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                  );
                }
              },
            });
          }, 800);
        } else if (commands[cmd]) {
          cliOutput.innerHTML += `<div class="text-lime-400 mt-1 ml-4">${commands[cmd]}</div>`;
        } else {
          cliOutput.innerHTML += `<div class="text-red-400 mt-1 ml-4">bash: ${cmd}: command not found. Type 'help'.</div>`;
        }

        this.value = "";
        setTimeout(() => {
          cliOutput.scrollTop = cliOutput.scrollHeight;
        }, 50);
      }
    });

    // Start Terminal Button Logic
    const startBtn = document.getElementById("start-terminal-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        const terminalBlock = document.querySelector(".gsap-terminal");
        const startContainer = document.getElementById(
          "terminal-start-container",
        );

        if (startContainer) {
          startContainer.classList.add("hidden");
        }

        if (terminalBlock) {
          // Reset CLI output
          cliOutput.innerHTML = `<div><span class="text-zinc-500">XTDITOM OS [Version 0.0.0]</span></div><div><span class="text-zinc-500">(c) 2026 Ditom Baroi Antu. All rights reserved.</span></div><br><div>Type <span class="text-white font-bold">'help'</span> to see a list of available commands.</div>`;

          // Enable Input and reset styles
          cliInput.disabled = false;
          cliInput.value = "";

          // Animate it back
          terminalBlock.style.display = "flex";

          gsap.fromTo(
            terminalBlock,
            {
              opacity: 0,
              y: 60,
              scaleY: 0.5,
              scaleX: 0.9,
              rotateX: 15,
              height: "400px",
              transformOrigin: "top center",
              perspective: 1000,
              border: "",
              padding: "",
            },
            {
              opacity: 1,
              y: 0,
              scaleY: 1,
              scaleX: 1,
              rotateX: 0,
              duration: 1.6,
              ease: "expo.out",
              onComplete: () => {
                cliInput.focus();
              },
            },
          );
        }
      });
    }
  }

  // Contact Form AJAX Submission
  const contactForm = document.getElementById("contact-form");
  const formSuccess = document.getElementById("form-success");
  const submitBtn = contactForm
    ? contactForm.querySelector("button[type='submit']")
    : null;

  if (contactForm && formSuccess && submitBtn) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Stop the native redirect

      const originalBtnText = submitBtn.innerText;
      submitBtn.innerText = "Transmitting...";
      submitBtn.disabled = true;
      submitBtn.classList.add("opacity-50", "cursor-not-allowed");

      const formData = new FormData(contactForm);

      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method,
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          // Hide form and show success message
          contactForm.style.display = "none";
          formSuccess.classList.remove("hidden");

          // Reset form and UI after 5 seconds
          setTimeout(() => {
            formSuccess.classList.add("hidden");
            contactForm.style.display = "block"; // Or '' to let CSS classes decide
            contactForm.reset();

            // Restore button state
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
          }, 3000);
        } else {
          alert("[ERROR] Server rejected the payload. Please try again.");
          submitBtn.innerText = originalBtnText;
          submitBtn.disabled = false;
          submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
        }
      } catch (error) {
        alert("[ERROR] Network failure. Please check your connection.");
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
      }
    });
  }

  // Interactive Grid Spotlight Logic
  const gridGlow = document.getElementById("os-grid-glow");
  if (gridGlow) {
    window.addEventListener("mousemove", (e) => {
      gridGlow.style.setProperty("--x", `${e.clientX}px`);
      gridGlow.style.setProperty("--y", `${e.clientY}px`);

      // Fade in on first movement
      if (gridGlow.style.opacity === "0" || gridGlow.style.opacity === "") {
        gridGlow.style.opacity = "1";
      }
    });

    // Fade out when mouse leaves the window
    document.addEventListener("mouseleave", () => {
      gridGlow.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      gridGlow.style.opacity = "1";
    });
  }
});
