import gsap from "gsap";
import { REVISION } from "three";

/**
 * Terminal CLI — Interactive command-line interface
 * 29 commands: system info, portfolio, communication, visual effects, games, navigation
 */
export class Terminal {
  constructor() {
    this.input = document.getElementById("cli-input");
    this.output = document.getElementById("cli-output");
    if (!this.input || !this.output) return;

    this.history = [];
    this.historyIndex = -1;
    this.mailState = "idle";
    this.mailData = { email: "", message: "" };
    this.sceneManager = null;
    this.sessionStart = Date.now();
    this.gameActive = false;

    this._bindEvents();
    this._printBanner();
  }

  setSceneManager(sceneManager) {
    this.sceneManager = sceneManager;
  }

  _printBanner() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (!isMobile) {
      this.output.innerHTML = `<pre style="color:#a3e635;line-height:1.15;font-size:0.7rem">
██╗  ██╗████████╗██████╗ ██╗████████╗ ██████╗ ███╗   ███╗
╚██╗██╔╝╚══██╔══╝██╔══██╗██║╚══██╔══╝██╔═══██╗████╗ ████║
 ╚███╔╝    ██║   ██║  ██║██║   ██║   ██║   ██║██╔████╔██║
 ██╔██╗    ██║   ██║  ██║██║   ██║   ██║   ██║██║╚██╔╝██║
██╔╝ ██╗   ██║   ██████╔╝██║   ██║   ╚██████╔╝██║ ╚═╝ ██║
╚═╝  ╚═╝   ╚═╝   ╚═════╝ ╚═╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝</pre>
<div style="color:#34d399;font-weight:700">XTDITOM OS v2.0 — Student Developer & Open-Source Contributor</div>
<div><span style="color:#71717a">──────────────────────────────────────────────────────</span></div>
<div><span style="color:#71717a">(c) 2026 Ditom Baroi Antu. All rights reserved.</span></div><br>
<div>Type <span style="color:#fff;font-weight:700">'help'</span> to see available commands.</div>`;
    } else {
      // Mobile: clean card-style banner (no block art) with a styled "[ XTDITOM ]" header
      this.output.innerHTML = `
<div style="border:1px solid #27272a;border-radius:4px;padding:0.75rem 1rem;margin-bottom:0.5rem;background:rgba(163,230,53,0.05)">
  <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.5rem">
    <div style="width:8px;height:8px;border-radius:50%;background:#a3e635;box-shadow:0 0 8px #a3e635;flex-shrink:0"></div>
    <span style="color:#a3e635;font-weight:800;font-size:1rem;letter-spacing:0.12em">[ XTDITOM ]</span>
    <span style="color:#52525b;font-size:0.7rem;margin-left:auto">OS v2.0</span>
  </div>
  <div style="color:#34d399;font-size:0.75rem;font-weight:600;margin-bottom:0.25rem">Student Developer &amp; Open-Source Contributor</div>
  <div style="color:#3f3f46;font-size:0.65rem">(c) 2026 Ditom Baroi Antu. All rights reserved.</div>
</div>
<div style="margin-top:0.25rem">Type <span style="color:#fff;font-weight:700">'help'</span> for commands.</div>`;
    }
  }

  _sanitize(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  _print(html) {
    this.output.innerHTML += html;
    requestAnimationFrame(() => {
      this.output.scrollTop = this.output.scrollHeight;
    });
  }

  _formatUptime() {
    const ms = Date.now() - this.sessionStart;
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  _bindEvents() {
    // Focus input when clicking terminal area
    this.output.parentElement.addEventListener("click", () =>
      this.input.focus(),
    );

    this.input.addEventListener("keydown", (e) => {
      if (this.gameActive) return; // Let game handle input
      if (e.key === "Enter") {
        this._processInput();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this._navigateHistory(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this._navigateHistory(1);
      } else if (e.key === "Tab") {
        e.preventDefault();
        this._autocomplete();
      }
    });
  }

  _navigateHistory(direction) {
    if (this.history.length === 0) return;

    this.historyIndex += direction;
    if (this.historyIndex < 0) this.historyIndex = 0;
    if (this.historyIndex >= this.history.length) {
      this.historyIndex = this.history.length;
      this.input.value = "";
      return;
    }
    this.input.value = this.history[this.historyIndex];
  }

  _autocomplete() {
    const partial = this.input.value.trim().toLowerCase();
    if (!partial) return;
    const allCommands = [
      "help",
      "whoami",
      "skills",
      "start",
      "neofetch",
      "theme",
      "mail",
      "matrix",
      "clear",
      "exit",
      "history",
      "goto",
      "projects",
      "socials",
      "date",
      "uptime",
      "fortune",
      "weather",
      "hack",
      "snake",
      "rickroll",
      "cat",
      "ls",
      "echo",
      "ping",
      "cowsay",
      "glitch",
    ];
    const match = allCommands.find((c) => c.startsWith(partial));
    if (match) this.input.value = match;
  }

  _processInput() {
    const rawInput = this.input.value.trim();
    if (rawInput === "") return;

    // Add to history
    this.history.push(rawInput);
    this.historyIndex = this.history.length;

    const args = rawInput.split(" ").filter(Boolean);
    const cmd = args[0].toLowerCase();

    // ── MAIL STATE MACHINE ──
    if (this.mailState !== "idle") {
      if (cmd === "cancel" || cmd === "exit" || cmd === "clear") {
        this.mailState = "idle";
        if (cmd === "cancel") {
          this._print(
            `<div class="mt-2"><span style="color:#fff">${this._sanitize(rawInput)}</span></div><div style="color:#facc15;margin-left:1rem">[ABORTED] Mail protocol terminated.</div>`,
          );
          this.input.value = "";
          return;
        }
      } else {
        this._print(
          `<div class="mt-2"><span style="color:#fff">${this._sanitize(rawInput)}</span></div>`,
        );

        if (this.mailState === "awaiting_email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(rawInput)) {
            this._print(
              `<div style="color:#f87171;margin-left:1rem">Invalid email format. Try again or type 'cancel':</div><div class="mt-1"><span style="color:#34d399;font-weight:700">Email:</span></div>`,
            );
            this.input.value = "";
            return;
          }
          this.mailData.email = rawInput;
          this.mailState = "awaiting_message";
          this._print(
            `<div style="color:#a3e635;margin-left:1rem">Email accepted.</div><div class="mt-2"><span style="color:#34d399;font-weight:700">Message:</span></div>`,
          );
        } else if (this.mailState === "awaiting_message") {
          this.mailData.message = rawInput;
          this._print(
            `<div style="color:#facc15;margin-left:1rem">Transmitting payload to server...</div>`,
          );
          this.input.disabled = true;

          fetch("https://formspree.io/f/xpqyjoyj", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: this.mailData.email,
              message: this.mailData.message,
              _subject: "CLI Terminal Contact",
            }),
          })
            .then((r) => {
              this._print(
                r.ok
                  ? `<div style="color:#34d399;font-weight:700;margin-left:1rem">[OK] Message delivered successfully.</div>`
                  : `<div style="color:#f87171;margin-left:1rem">[ERROR] Server rejected the payload.</div>`,
              );
            })
            .catch(() => {
              this._print(
                `<div style="color:#f87171;margin-left:1rem">[ERROR] Network failure.</div>`,
              );
            })
            .finally(() => {
              this.mailState = "idle";
              this.input.disabled = false;
              this.input.focus();
            });
        }
        this.input.value = "";
        return;
      }
    }

    // ── STANDARD COMMANDS ──
    const isMobilePrompt = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    const promptPrefix = !isMobilePrompt ? "guest@xtditom:~$" : "~$";
    this._print(
      `<div class="mt-2"><span style="color:#34d399;font-weight:700;margin-right:0.5rem">${promptPrefix}</span><span style="color:#fff">${this._sanitize(rawInput)}</span></div>`,
    );

    // ═══════════════════════════════════════════════════
    //  HELP
    // ═══════════════════════════════════════════════════
    if (cmd === "help") {
      this._print(`<div style="color:#a3e635;margin-left:1rem">
<span style="color:#fff;font-weight:700">═══ SYSTEM ═══</span><br>
&nbsp;&nbsp;<b>whoami</b> — Brief bio<br>
&nbsp;&nbsp;<b>neofetch</b> — System architecture<br>
&nbsp;&nbsp;<b>theme [light/dark]</b> — Toggle colors<br>
&nbsp;&nbsp;<b>date</b> — Current date &amp; time<br>
&nbsp;&nbsp;<b>uptime</b> — Session duration<br>
<br><span style="color:#fff;font-weight:700">═══ PORTFOLIO ═══</span><br>
&nbsp;&nbsp;<b>projects</b> — View my projects<br>
&nbsp;&nbsp;<b>socials</b> — Social links<br>
&nbsp;&nbsp;<b>skills</b> — Core skills<br>
&nbsp;&nbsp;<b>ls</b> — List files<br>
&nbsp;&nbsp;<b>cat [file]</b> — Read a file<br>
<br><span style="color:#fff;font-weight:700">═══ COMMUNICATION ═══</span><br>
&nbsp;&nbsp;<b>mail</b> — Send a direct message<br>
&nbsp;&nbsp;<b>echo [text]</b> — Echo text back<br>
&nbsp;&nbsp;<b>cowsay [text]</b> — Cow says your text<br>
&nbsp;&nbsp;<b>fortune</b> — Random dev quote<br>
&nbsp;&nbsp;<b>ping [host]</b> — Ping a server<br>
&nbsp;&nbsp;<b>weather [city]</b> — Weather report<br>
<br><span style="color:#fff;font-weight:700">═══ VISUAL &amp; GAMES ═══</span><br>
&nbsp;&nbsp;<b>matrix</b> — Matrix rain effect<br>
&nbsp;&nbsp;<b>hack</b> — Penetration test sim<br>
&nbsp;&nbsp;<b>snake</b> — Play Snake<br>
&nbsp;&nbsp;<b>glitch</b> — System glitch effect<br>
&nbsp;&nbsp;<b>rickroll</b> — ???<br>
<br><span style="color:#fff;font-weight:700">═══ NAVIGATION ═══</span><br>
&nbsp;&nbsp;<b>goto [section]</b> — Navigate to section<br>
&nbsp;&nbsp;<b>history</b> — Command history<br>
&nbsp;&nbsp;<b>clear</b> — Clear output<br>
&nbsp;&nbsp;<b>exit</b> — Terminate session
</div>`);

      // ═══════════════════════════════════════════════════
      //  SIMPLE COMMANDS (lookup table)
      // ═══════════════════════════════════════════════════
    } else if (cmd === "whoami") {
      this._print(
        `<div style="color:#a3e635;margin-left:1rem">Ditom Baroi Antu. 18-year-old student developer from Dhaka, Bangladesh. Currently exploring the Tech World &amp; Planning my future in it.</div>`,
      );
    } else if (cmd === "skills") {
      this._print(
        `<div style="color:#a3e635;margin-left:1rem">HTML5, CSS3, JavaScript (ES6+), Three.js, GSAP, Tailwind CSS v4, Next.js, Python, C++</div>`,
      );
    } else if (cmd === "sudo") {
      this._print(
        `<div style="color:#f87171;margin-left:1rem">Access denied. Nice try. This incident will be reported.</div>`,
      );

      // ═══════════════════════════════════════════════════
      //  CLEAR / START
      // ═══════════════════════════════════════════════════
    } else if (cmd === "clear") {
      this.output.innerHTML = "";
    } else if (cmd === "start") {
      this._printBanner();

      // ═══════════════════════════════════════════════════
      //  HISTORY
      // ═══════════════════════════════════════════════════
    } else if (cmd === "history") {
      const histLines = this.history
        .map((h, i) => `&nbsp;&nbsp;${i + 1}&nbsp;&nbsp;${this._sanitize(h)}`)
        .join("<br>");
      this._print(
        `<div style="color:#a3e635;margin-left:1rem">${histLines}</div>`,
      );

      // ═══════════════════════════════════════════════════
      //  GOTO
      // ═══════════════════════════════════════════════════
    } else if (cmd === "goto") {
      const target = args[1]?.toLowerCase();
      const sections = {
        home: "#hero",
        hero: "#hero",
        work: "#featured",
        featured: "#featured",
        tech: "#tech",
        rigs: "#rigs",
        terminal: "#terminal",
        contact: "#contact",
      };
      if (target && sections[target]) {
        document
          .querySelector(sections[target])
          ?.scrollIntoView({ behavior: "smooth" });
        this._print(
          `<div style="color:#a3e635;margin-left:1rem">Navigating to: ${this._sanitize(target)}</div>`,
        );
      } else {
        this._print(
          `<div style="color:#f87171;margin-left:1rem">Usage: goto [home|work|tech|rigs|terminal|contact]</div>`,
        );
      }

      // ═══════════════════════════════════════════════════
      //  THEME
      // ═══════════════════════════════════════════════════
    } else if (cmd === "theme") {
      const mode = args[1]?.toLowerCase();
      const lightIcon = document.getElementById("icon-sun");
      const darkIcon = document.getElementById("icon-moon");
      if (mode === "dark") {
        if (document.documentElement.classList.contains("dark")) {
          this._print(
            `<div style="color:#facc15;margin-left:1rem">System is already in Dark theme.</div>`,
          );
        } else {
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
          if (lightIcon) lightIcon.classList.remove("hidden");
          if (darkIcon) darkIcon.classList.add("hidden");
          this._print(
            `<div style="color:#a3e635;margin-left:1rem">System theme updated to: DARK.</div>`,
          );
          window.dispatchEvent(
            new CustomEvent("themechange", { detail: { dark: true } }),
          );
        }
      } else if (mode === "light") {
        if (!document.documentElement.classList.contains("dark")) {
          this._print(
            `<div style="color:#facc15;margin-left:1rem">System is already in Light theme.</div>`,
          );
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("theme", "light");
          if (lightIcon) lightIcon.classList.add("hidden");
          if (darkIcon) darkIcon.classList.remove("hidden");
          this._print(
            `<div style="color:#a3e635;margin-left:1rem">System theme updated to: LIGHT.</div>`,
          );
          window.dispatchEvent(
            new CustomEvent("themechange", { detail: { dark: false } }),
          );
        }
      } else {
        this._print(
          `<div style="color:#f87171;margin-left:1rem">${mode ? `Invalid theme: ${this._sanitize(mode)}. ` : ""}Usage: theme [light/dark]</div>`,
        );
      }

      // ═══════════════════════════════════════════════════
      //  NEOFETCH
      // ═══════════════════════════════════════════════════
    } else if (cmd === "neofetch") {
      this
        ._print(`<div style="color:#a3e635;margin:1rem 0 0 1rem;display:flex;gap:1.5rem;flex-wrap:wrap;align-items:flex-start"><pre style="color:#34d399;font-weight:700;line-height:1.2;display:none" class="neofetch-ascii">
  \\\\\\\\\\
   \\\\\\\\\\\\\\
    \\\\\\\\\\\\\\
    //\\\\\\\\\\\\\\
   //  \\\\\\\\\\\\\\
  //    \\\\\\\\\\\\\\
</pre><div><span style="color:#fff;font-weight:700">ditom@sys_00</span><br><span style="color:#52525b">-------------------------</span><br><span style="color:#34d399;font-weight:700">OS:</span> XTDITOM OS v2.0<br><span style="color:#34d399;font-weight:700">Host:</span> Workstation // SYS_00<br><span style="color:#34d399;font-weight:700">Renderer:</span> Three.js r${REVISION}<br><span style="color:#34d399;font-weight:700">CPU:</span> Ryzen 5 5600GT<br><span style="color:#34d399;font-weight:700">GPU:</span> Radeon Vega 7<br><span style="color:#34d399;font-weight:700">Memory:</span> 16GB Dual Channel<br><span style="color:#34d399;font-weight:700">Uptime:</span> 18 Years</div></div>`);
      // Show ASCII art on desktop
      const isMobileNeofetch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      if (!isMobileNeofetch) {
        const ascii = this.output.querySelector(".neofetch-ascii:last-of-type");
        if (ascii) ascii.style.display = "block";
      }

      // ═══════════════════════════════════════════════════
      //  MAIL
      // ═══════════════════════════════════════════════════
    } else if (cmd === "mail") {
      this.mailState = "awaiting_email";
      this._print(
        `<div style="color:#a3e635;margin-left:1rem">Initializing direct message protocol...</div><div class="mt-2"><span style="color:#34d399;font-weight:700">Email:</span></div>`,
      );

      // ═══════════════════════════════════════════════════
      //  MATRIX
      // ═══════════════════════════════════════════════════
    } else if (cmd === "matrix") {
      this._print(
        `<div style="color:#a3e635;margin-left:1rem">Initializing visual protocol...</div>`,
      );
      const terminal = this.output.closest(".terminal");
      const cvs = document.createElement("canvas");
      Object.assign(cvs.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        zIndex: "50",
        pointerEvents: "none",
      });
      terminal.appendChild(cvs);

      const ctx = cvs.getContext("2d");
      cvs.width = terminal.offsetWidth;
      cvs.height = terminal.offsetHeight;
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*".split("");
      const fontSize = 14;
      const columns = cvs.width / fontSize;
      const drops = Array(Math.floor(columns)).fill(1);

      this.input.disabled = true;
      const interval = setInterval(() => {
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
      }, 33);

      setTimeout(() => {
        clearInterval(interval);
        cvs.remove();
        this.input.disabled = false;
        this.input.focus();
        this._print(
          `<div style="color:#34d399;margin-left:1rem">[OK] Protocol terminated. System restored.</div>`,
        );
      }, 5000);

      // ═══════════════════════════════════════════════════
      //  EXIT
      // ═══════════════════════════════════════════════════
    } else if (cmd === "exit") {
      this._print(
        `<div style="color:#f87171;margin-left:1rem">Terminating session interface...</div>`,
      );
      this.input.disabled = true;

      setTimeout(() => {
        this._print(
          `<div style="color:#71717a;margin-left:1rem;margin-top:0.5rem">Session terminated. Type <span style="color:#fff;font-weight:700">'start'</span> to reboot.</div>`,
        );
        this.input.disabled = false;
        this.input.focus();
      }, 1200);

      // ═══════════════════════════════════════════════════
      //  PROJECTS
      // ═══════════════════════════════════════════════════
    } else if (cmd === "projects") {
      this._print(`<div style="margin-left:1rem">
<span style="color:#fff;font-weight:700">═══ PROJECTS ═══</span><br><br>
<span style="color:#a3e635;font-weight:700">01.</span> <span style="color:#fff;font-weight:700">YourDynamicDashboard</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;High-performance new tab browser extension with 100% local storage.<br>
&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://chromewebstore.google.com/detail/fckmlnagohleefboaleepppikpdkckjn" target="_blank" style="color:#60a5fa">Chrome</a> · <a href="https://addons.mozilla.org/en-US/firefox/addon/yourdynamicdashboard/" target="_blank" style="color:#60a5fa">Firefox</a> · <a href="https://microsoftedge.microsoft.com/addons/detail/yourdynamicdashboard/phhofebhbmicnfhmmdgikiddaboljnec" target="_blank" style="color:#60a5fa">Edge</a> · <a href="https://github.com/xtditom/YourDynamicDashboard" target="_blank" style="color:#60a5fa">GitHub</a> · <a href="/ydd/" target="_blank" style="color:#60a5fa">Demo</a><br><br>
<span style="color:#a3e635;font-weight:700">02.</span> <span style="color:#fff;font-weight:700">XTDITOM Portfolio v2.0</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;3D interactive OS-themed portfolio — Three.js, GSAP, Vite.<br>
&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://ditom.me" target="_blank" style="color:#60a5fa">Live</a> · <a href="https://github.com/xtditom/portfolio" target="_blank" style="color:#60a5fa">GitHub</a>
</div>`);

      // ═══════════════════════════════════════════════════
      //  SOCIALS
      // ═══════════════════════════════════════════════════
    } else if (cmd === "socials") {
      this._print(`<div style="margin-left:1rem">
<span style="color:#fff;font-weight:700">═══ CONNECT ═══</span><br><br>
<span style="color:#a3e635">GitHub</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ <a href="https://github.com/xtditom" target="_blank" style="color:#60a5fa">github.com/xtditom</a><br>
<span style="color:#a3e635">LinkedIn</span>&nbsp;&nbsp;&nbsp;→ <a href="https://linkedin.com/in/xtditom" target="_blank" style="color:#60a5fa">linkedin.com/in/xtditom</a><br>
<span style="color:#a3e635">X/Twitter</span>&nbsp;&nbsp;→ <a href="https://x.com/xtditom369" target="_blank" style="color:#60a5fa">x.com/xtditom369</a><br>
<span style="color:#a3e635">Facebook</span>&nbsp;&nbsp;&nbsp;→ <a href="https://facebook.com/xtditom" target="_blank" style="color:#60a5fa">facebook.com/xtditom</a><br>
<span style="color:#a3e635">Instagram</span>&nbsp;&nbsp;→ <a href="https://instagram.com/xtditom" target="_blank" style="color:#60a5fa">instagram.com/xtditom</a><br>
<span style="color:#a3e635">Email</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ <a href="mailto:hello@ditom.me" style="color:#60a5fa">hello@ditom.me</a><br>
<span style="color:#a3e635">Website</span>&nbsp;&nbsp;&nbsp;→ <a href="https://ditom.me" target="_blank" style="color:#60a5fa">ditom.me</a>
</div>`);

      // ═══════════════════════════════════════════════════
      //  DATE
      // ═══════════════════════════════════════════════════
    } else if (cmd === "date") {
      const now = new Date();
      const formatted = now.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZoneName: "short",
      });
      this._print(
        `<div style="color:#a3e635;margin-left:1rem">${formatted}</div>`,
      );

      // ═══════════════════════════════════════════════════
      //  UPTIME
      // ═══════════════════════════════════════════════════
    } else if (cmd === "uptime") {
      const now = new Date();
      const bootTime = new Date(this.sessionStart).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      this._print(`<div style="margin-left:1rem">
<span style="color:#34d399;font-weight:700">Session started:</span> <span style="color:#a3e635">${bootTime}</span><br>
<span style="color:#34d399;font-weight:700">Uptime:</span> <span style="color:#a3e635">${this._formatUptime()}</span><br>
<span style="color:#34d399;font-weight:700">Commands run:</span> <span style="color:#a3e635">${this.history.length}</span>
</div>`);

      // ═══════════════════════════════════════════════════
      //  FORTUNE
      // ═══════════════════════════════════════════════════
    } else if (cmd === "fortune") {
      const quotes = [
        '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
        '"First, solve the problem. Then, write the code." — John Johnson',
        '"Experience is the name everyone gives to their mistakes." — Oscar Wilde',
        '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
        '"Fix the cause, not the symptom." — Steve Maguire',
        '"Optimism is an occupational hazard of programming: feedback is the treatment." — Kent Beck',
        '"Simplicity is the soul of efficiency." — Austin Freeman',
        '"Make it work, make it right, make it fast." — Kent Beck',
        '"The best error message is the one that never shows up." — Thomas Fuchs',
        '"A language that doesn\'t affect the way you think about programming is not worth knowing." — Alan Perlis',
        "\"Programming isn't about what you know; it's about what you can figure out.\" — Chris Pine",
        '"The only way to learn a new programming language is by writing programs in it." — Dennis Ritchie',
        '"Talk is cheap. Show me the code." — Linus Torvalds',
        '"Programs must be written for people to read, and only incidentally for machines to execute." — Harold Abelson',
        "\"It's not a bug — it's an undocumented feature.\" — Anonymous",
        '"Deleted code is debugged code." — Jeff Sickel',
        '"If debugging is the process of removing bugs, then programming must be the process of putting them in." — Edsger Dijkstra',
        "\"The most dangerous phrase in the language is 'We've always done it this way.'\" — Grace Hopper",
        '"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." — Antoine de Saint-Exupéry',
        '"In theory, theory and practice are the same. In practice, they\'re not." — Yogi Berra',
      ];
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      this._print(
        `<div style="color:#a3e635;margin-left:1rem;font-style:italic">${quote}</div>`,
      );

      // ═══════════════════════════════════════════════════
      //  WEATHER
      // ═══════════════════════════════════════════════════
    } else if (cmd === "weather") {
      const city = args.slice(1).join(" ") || "Dhaka";
      this._print(
        `<div style="color:#a3e635;margin-left:1rem">Fetching weather data for ${this._sanitize(city)}...</div>`,
      );
      this.input.disabled = true;

      fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
        .then((r) => {
          if (!r.ok) throw new Error("City not found");
          return r.json();
        })
        .then((data) => {
          const c = data.current_condition[0];
          const area = data.nearest_area[0];
          const loc = area.areaName[0].value;
          const country = area.country[0].value;
          const temp = c.temp_C;
          const feels = c.FeelsLikeC;
          const desc = c.weatherDesc[0].value;
          const wind = c.windspeedKmph;
          const humidity = c.humidity;
          const windDir = c.winddir16Point;
          const uv = c.uvIndex;

          this._print(`<div style="margin-left:1rem;margin-top:0.5rem">
<span style="color:#fff;font-weight:700">${this._sanitize(loc)}, ${this._sanitize(country)}</span><br>
<span style="color:#34d399;font-weight:700">Condition:</span> ${this._sanitize(desc)}<br>
<span style="color:#34d399;font-weight:700">Temperature:</span> ${temp}°C (Feels like ${feels}°C)<br>
<span style="color:#34d399;font-weight:700">Wind:</span> ${wind} km/h ${windDir}<br>
<span style="color:#34d399;font-weight:700">Humidity:</span> ${humidity}%<br>
<span style="color:#34d399;font-weight:700">UV Index:</span> ${uv}
</div>`);
        })
        .catch(() => {
          this._print(
            `<div style="color:#f87171;margin-left:1rem">[ERROR] Could not fetch weather for "${this._sanitize(city)}". Check city name.</div>`,
          );
        })
        .finally(() => {
          this.input.disabled = false;
          this.input.focus();
        });

      // ═══════════════════════════════════════════════════
      //  HACK
      // ═══════════════════════════════════════════════════
    } else if (cmd === "hack") {
      this._print(
        `<div style="color:#a3e635;margin-left:1rem">[INIT] Penetration testing module activated...</div>`,
      );
      this.input.disabled = true;

      const rIP = () =>
        `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const rPort = () => Math.floor(Math.random() * 65535);

      const hackLines = [
        { text: `[SCAN] Enumerating network interfaces...`, color: "#a3e635" },
        {
          text: `[SCAN] Target acquired: ${rIP()}:${rPort()}`,
          color: "#a3e635",
        },
        {
          text: `[BRUTE] Attempting SSH handshake on port ${rPort()}...`,
          color: "#a3e635",
        },
        {
          text: `[CRACK] Decrypting RSA-4096 key... ████████░░ 80%`,
          color: "#facc15",
        },
        {
          text: `[CRACK] Decrypting RSA-4096 key... ██████████ 100%`,
          color: "#34d399",
        },
        {
          text: `[INJECT] SQL payload → SELECT * FROM users WHERE 1=1`,
          color: "#a3e635",
        },
        { text: `[PROXY] Routing through ${rIP()}`, color: "#a3e635" },
        {
          text: `[PROXY] Bouncing signal: Tokyo → Berlin → São Paulo`,
          color: "#a3e635",
        },
        {
          text: `[BYPASS] Firewall neutralized. Port 22 open.`,
          color: "#34d399",
        },
        {
          text: `[DUMP] Exfiltrating ${(Math.random() * 10).toFixed(1)}GB of classified data...`,
          color: "#facc15",
        },
        {
          text: `[ACCESS] Root shell obtained. Welcome, operator.`,
          color: "#34d399",
        },
        { text: ``, color: "#a3e635" },
        {
          text: `[ALERT] Just kidding. This is a portfolio, not a pentest suite. 😄`,
          color: "#facc15",
        },
      ];

      let i = 0;
      const interval = setInterval(() => {
        if (i >= hackLines.length) {
          clearInterval(interval);
          this.input.disabled = false;
          this.input.focus();
          return;
        }
        if (hackLines[i].text) {
          this._print(
            `<div style="color:${hackLines[i].color};margin-left:1rem">${hackLines[i].text}</div>`,
          );
        } else {
          this._print(`<br>`);
        }
        i++;
      }, 450);

      // ═══════════════════════════════════════════════════
      //  SNAKE
      // ═══════════════════════════════════════════════════
    } else if (cmd === "snake") {
      this._print(
        `<div style="color:#a3e635;margin-left:1rem">Starting Snake... Arrow keys to move. ESC or QUIT button to exit.</div>`,
      );
      const terminal = this.output.closest(".terminal");
      const cvs = document.createElement("canvas");
      Object.assign(cvs.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        zIndex: "50",
        background: "#0a0a0a",
      });
      terminal.appendChild(cvs);

      // Quit button (works on both desktop and mobile)
      const quitBtn = document.createElement("button");
      quitBtn.textContent = "✕ QUIT";
      Object.assign(quitBtn.style, {
        position: "absolute",
        top: "8px",
        right: "8px",
        zIndex: "51",
        background: "rgba(239,68,68,0.85)",
        color: "#fff",
        border: "none",
        padding: "6px 14px",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        cursor: "pointer",
        fontWeight: "700",
        letterSpacing: "0.1em",
      });
      terminal.appendChild(quitBtn);

      const ctx = cvs.getContext("2d");
      cvs.width = terminal.offsetWidth;
      cvs.height = terminal.offsetHeight;

      const gridSize = 20;
      const cols = Math.floor(cvs.width / gridSize);
      const rows = Math.floor(cvs.height / gridSize);

      let snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
      let dir = { x: 1, y: 0 };
      let nextDir = { x: 1, y: 0 };
      let score = 0;
      let gameOver = false;
      this.gameActive = true;
      this.input.disabled = true;

      const spawnFood = () => {
        let pos;
        do {
          pos = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows),
          };
        } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
        return pos;
      };
      let food = spawnFood();

      // Keyboard controls
      const keyHandler = (e) => {
        if (e.key === "Escape") {
          gameOver = true;
          return;
        }
        if (e.key === "ArrowUp" && dir.y !== 1) nextDir = { x: 0, y: -1 };
        else if (e.key === "ArrowDown" && dir.y !== -1)
          nextDir = { x: 0, y: 1 };
        else if (e.key === "ArrowLeft" && dir.x !== 1)
          nextDir = { x: -1, y: 0 };
        else if (e.key === "ArrowRight" && dir.x !== -1)
          nextDir = { x: 1, y: 0 };
        e.preventDefault();
      };
      document.addEventListener("keydown", keyHandler);

      // Touch controls for mobile
      let touchStartX = 0,
        touchStartY = 0;
      const touchStartHandler = (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      };
      const touchEndHandler = (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const minSwipe = 30;
        if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0 && dir.x !== -1) nextDir = { x: 1, y: 0 };
          else if (dx < 0 && dir.x !== 1) nextDir = { x: -1, y: 0 };
        } else {
          if (dy > 0 && dir.y !== -1) nextDir = { x: 0, y: 1 };
          else if (dy < 0 && dir.y !== 1) nextDir = { x: 0, y: -1 };
        }
      };
      cvs.style.pointerEvents = "auto";
      cvs.addEventListener("touchstart", touchStartHandler, { passive: true });
      cvs.addEventListener("touchend", touchEndHandler, { passive: true });

      // Quit button handler
      quitBtn.addEventListener("click", () => {
        gameOver = true;
      });

      // Cleanup function
      const cleanup = () => {
        clearInterval(gameLoop);
        document.removeEventListener("keydown", keyHandler);
        cvs.removeEventListener("touchstart", touchStartHandler);
        cvs.removeEventListener("touchend", touchEndHandler);
        cvs.remove();
        quitBtn.remove();
        this.gameActive = false;
        this.input.disabled = false;
        this.input.focus();
        this._print(
          `<div style="color:#34d399;margin-left:1rem">[GAME OVER] Final score: <span style="color:#fff;font-weight:700">${score}</span>. Snake terminated.</div>`,
        );
      };

      // Game loop
      const gameLoop = setInterval(() => {
        if (gameOver) {
          cleanup();
          return;
        }

        dir = { ...nextDir };
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        // Wall collision
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
          gameOver = true;
          cleanup();
          return;
        }

        // Self collision
        if (snake.some((s) => s.x === head.x && s.y === head.y)) {
          gameOver = true;
          cleanup();
          return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          score += 10;
          food = spawnFood();
        } else {
          snake.pop();
        }

        // Draw background
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, cvs.width, cvs.height);

        // Draw subtle grid
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= cols; x++) {
          ctx.beginPath();
          ctx.moveTo(x * gridSize, 0);
          ctx.lineTo(x * gridSize, cvs.height);
          ctx.stroke();
        }
        for (let y = 0; y <= rows; y++) {
          ctx.beginPath();
          ctx.moveTo(0, y * gridSize);
          ctx.lineTo(cvs.width, y * gridSize);
          ctx.stroke();
        }

        // Draw food
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 8;
        ctx.fillRect(
          food.x * gridSize + 2,
          food.y * gridSize + 2,
          gridSize - 4,
          gridSize - 4,
        );
        ctx.shadowBlur = 0;

        // Draw snake
        snake.forEach((seg, i) => {
          ctx.fillStyle = i === 0 ? "#a3e635" : "#4d7c0f";
          if (i === 0) {
            ctx.shadowColor = "#a3e635";
            ctx.shadowBlur = 6;
          }
          ctx.fillRect(
            seg.x * gridSize + 1,
            seg.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2,
          );
          if (i === 0) ctx.shadowBlur = 0;
        });

        // Draw score
        ctx.fillStyle = "#a3e635";
        ctx.font = "bold 14px monospace";
        ctx.fillText(`SCORE: ${score}`, 10, 22);

        // Draw controls hint
        ctx.fillStyle = "#52525b";
        ctx.font = "11px monospace";
        const isMobileSnake = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        const hint =
          !isMobileSnake
            ? "Arrow keys to move · ESC to quit"
            : "Swipe to move";
        ctx.fillText(hint, 10, cvs.height - 10);
      }, 120);

      // ═══════════════════════════════════════════════════
      //  PING
      // ═══════════════════════════════════════════════════
    } else if (cmd === "ping") {
      const target = args[1] || "ditom.me";
      const fakeIP = `${Math.floor(Math.random() * 200) + 50}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      this._print(
        `<div style="color:#a3e635;margin-left:1rem">PING ${this._sanitize(target)} (${fakeIP}): 56 data bytes</div>`,
      );
      this.input.disabled = true;

      let seq = 0;
      const latencies = [];
      const interval = setInterval(() => {
        if (seq >= 4) {
          clearInterval(interval);
          const avg = (
            latencies.reduce((a, b) => a + b, 0) / latencies.length
          ).toFixed(1);
          const min = Math.min(...latencies).toFixed(1);
          const max = Math.max(...latencies).toFixed(1);
          this._print(
            `<div style="color:#a3e635;margin-left:1rem"><br>--- ${this._sanitize(target)} ping statistics ---<br>4 packets transmitted, 4 received, <span style="color:#34d399">0% packet loss</span><br>rtt min/avg/max = ${min}/${avg}/${max} ms</div>`,
          );
          this.input.disabled = false;
          this.input.focus();
          return;
        }
        const latency = parseFloat((Math.random() * 40 + 8).toFixed(1));
        latencies.push(latency);
        this._print(
          `<div style="color:#a3e635;margin-left:1rem">64 bytes from ${this._sanitize(target)}: icmp_seq=${seq} ttl=64 time=${latency} ms</div>`,
        );
        seq++;
      }, 800);

      // ═══════════════════════════════════════════════════
      //  RICKROLL
      // ═══════════════════════════════════════════════════
    } else if (cmd === "rickroll") {
      const songs = [
        {
          title: "Rick Astley - Never Gonna Give You Up",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          lyrics: "🎵 Never gonna give you up, never gonna let you down...",
        },
        {
          title: "Darude - Sandstorm",
          url: "https://www.youtube.com/watch?v=y6120QOlsfU",
          lyrics: "🎵 DU DU DU DU DU DUUUUU...",
        },
        {
          title: "Nyan Cat",
          url: "https://www.youtube.com/watch?v=QH2-TGUlwu4",
          lyrics: "🐱 Nyan nyan nyan nyan nyan nyan nyan...",
        },
        {
          title: "Toto - Africa",
          url: "https://www.youtube.com/watch?v=FTQbiNvZqaY",
          lyrics: "🎵 I bless the rains down in Africa...",
        },
        {
          title: "A-ha - Take On Me",
          url: "https://www.youtube.com/watch?v=djV11Xbc914",
          lyrics: "🎵 Take on me... take me on...",
        },
        {
          title: "Smash Mouth - All Star",
          url: "https://www.youtube.com/watch?v=L_jWHffIx5E",
          lyrics: "🎵 Somebody once told me the world is gonna roll me...",
        },
        {
          title: "Bee Gees - Stayin' Alive",
          url: "https://www.youtube.com/watch?v=fNFzfwLM72c",
          lyrics: "🎵 Ah, ha, ha, ha, stayin' alive, stayin' alive...",
        },
        {
          title: "PSY - Gangnam Style",
          url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
          lyrics: "🎵 Oppan Gangnam Style...",
        },
        {
          title: "Daft Punk - Around the World",
          url: "https://www.youtube.com/watch?v=LKYPYj2XX80",
          lyrics: "🎵 Around the world, around the world...",
        },
        {
          title: "Europe - The Final Countdown",
          url: "https://www.youtube.com/watch?v=9jK-NcRmVcw",
          lyrics: "🎵 It's the final countdown... DUN DUN DUN DUN...",
        },
        {
          title: "Survivor - Eye of the Tiger",
          url: "https://www.youtube.com/watch?v=btPJPFnesV4",
          lyrics: "🎵 Rising up, back on the street...",
        },
        {
          title: "Bag Raiders - Shooting Stars",
          url: "https://www.youtube.com/watch?v=feA64wXhbjo",
          lyrics: "🎵 It's late and I'm awake, staring at the wall...",
        },
      ];

      this._print(
        `<div style="color:#a3e635;margin-left:1rem">[INIT] Music Roulette Protocol activated...</div>`,
      );
      this._print(
        `<div style="color:#facc15;margin-left:1rem;margin-top:0.25rem">🎰 Spinning the wheel...</div>`,
      );
      this.input.disabled = true;

      // Animated spinner effect
      let spins = 0;
      const totalSpins = 12;
      const spinInterval = setInterval(() => {
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        // Clear previous spin line and print new one
        const spinLines = this.output.querySelectorAll(".rickroll-spin");
        spinLines.forEach((el) => el.remove());
        this._print(
          `<div class="rickroll-spin" style="color:#71717a;margin-left:1rem">▶ ${randomSong.title}</div>`,
        );
        spins++;

        if (spins >= totalSpins) {
          clearInterval(spinInterval);
          // Remove spinner line
          this.output
            .querySelectorAll(".rickroll-spin")
            .forEach((el) => el.remove());

          // Pick final song
          const pick = songs[Math.floor(Math.random() * songs.length)];
          this._print(
            `<div style="color:#a3e635;margin-left:1rem;margin-top:0.5rem">🎯 <span style="color:#fff;font-weight:700">${pick.title}</span></div>`,
          );
          this._print(
            `<div style="color:#a3e635;margin-left:1rem">${pick.lyrics}</div>`,
          );

          setTimeout(() => {
            this._print(
              `<div style="color:#facc15;margin-left:1rem;margin-top:0.25rem">Opening... <a href="${pick.url}" target="_blank" style="color:#60a5fa">Click here if blocked</a></div>`,
            );
            window.open(pick.url, "_blank");
            this.input.disabled = false;
            this.input.focus();
          }, 1000);
        }
      }, 150);

      // ═══════════════════════════════════════════════════
      //  LS
      // ═══════════════════════════════════════════════════
    } else if (cmd === "ls") {
      this._print(`<div style="margin-left:1rem">
<span style="color:#60a5fa;font-weight:700">about/</span>&nbsp;&nbsp;&nbsp;
<span style="color:#60a5fa;font-weight:700">projects/</span>&nbsp;&nbsp;&nbsp;
<span style="color:#60a5fa;font-weight:700">skills/</span><br>
<span style="color:#a3e635">resume.txt</span>&nbsp;&nbsp;&nbsp;
<span style="color:#a3e635">socials.cfg</span>&nbsp;&nbsp;&nbsp;
<span style="color:#a3e635">readme.md</span><br>
<span style="color:#facc15">.env</span>&nbsp;&nbsp;&nbsp;
<span style="color:#71717a">.gitignore</span>
</div>`);

      // ═══════════════════════════════════════════════════
      //  CAT
      // ═══════════════════════════════════════════════════
    } else if (cmd === "cat") {
      const file = args[1]?.toLowerCase();
      const files = {
        "resume.txt": `<div style="margin-left:1rem">
<span style="color:#fff;font-weight:700">═══ RESUME ═══</span><br><br>
<span style="color:#34d399;font-weight:700">Name:</span> Ditom Baroi Antu<br>
<span style="color:#34d399;font-weight:700">Age:</span> 18<br>
<span style="color:#34d399;font-weight:700">Location:</span> Dhaka, Bangladesh<br>
<span style="color:#34d399;font-weight:700">Education:</span> Class XII Student<br>
<span style="color:#34d399;font-weight:700">Focus:</span> Web Development &amp; Open Source<br><br>
<span style="color:#fff;font-weight:700">EXPERIENCE</span><br>
&nbsp;&nbsp;• Creator of YourDynamicDashboard (Chrome Extension)<br>
&nbsp;&nbsp;• Open-source contributor on GitHub (@xtditom)<br>
&nbsp;&nbsp;• Self-taught developer since age 16<br><br>
<span style="color:#fff;font-weight:700">SKILLS</span><br>
&nbsp;&nbsp;• HTML5, CSS3, JavaScript (ES6+)<br>
&nbsp;&nbsp;• Three.js, GSAP, Tailwind CSS<br>
&nbsp;&nbsp;• Git, GitHub, Browser APIs<br>
&nbsp;&nbsp;• Learning: Next.js, TypeScript, Python, Node.js
</div>`,
        "readme.md": `<div style="margin-left:1rem">
<span style="color:#fff;font-weight:700"># XTDITOM OS v2.0</span><br><br>
Interactive 3D portfolio powered by Three.js, GSAP, and Vite.<br>
Built with zero frameworks — pure vanilla JavaScript.<br><br>
<span style="color:#34d399;font-weight:700">Features:</span><br>
&nbsp;&nbsp;• CyberGrid + Particle Field 3D background<br>
&nbsp;&nbsp;• Interactive CLI terminal with 29 commands<br>
&nbsp;&nbsp;• Neo-brutalist + cyberpunk design system<br>
&nbsp;&nbsp;• Responsive with mobile 2D fallback<br><br>
<span style="color:#34d399">→</span> <a href="https://github.com/xtditom" target="_blank" style="color:#60a5fa">github.com/xtditom</a>
</div>`,
        "socials.cfg": `<div style="margin-left:1rem">
<span style="color:#34d399;font-weight:700">[socials]</span><br>
github&nbsp;&nbsp;&nbsp;&nbsp;= <a href="https://github.com/xtditom" target="_blank" style="color:#60a5fa">github.com/xtditom</a><br>
linkedin&nbsp;&nbsp;= <a href="https://linkedin.com/in/xtditom" target="_blank" style="color:#60a5fa">linkedin.com/in/xtditom</a><br>
twitter&nbsp;&nbsp;&nbsp;= <a href="https://x.com/xtditom369" target="_blank" style="color:#60a5fa">x.com/xtditom369</a><br>
email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <a href="mailto:hello@ditom.me" style="color:#60a5fa">hello@ditom.me</a><br>
website&nbsp;&nbsp;&nbsp;= <a href="https://ditom.me" target="_blank" style="color:#60a5fa">ditom.me</a>
</div>`,
        ".env": `<div style="color:#f87171;margin-left:1rem">[PERMISSION DENIED] Nice try. Classified data. 🔒</div>`,
        ".gitignore": `<div style="margin-left:1rem;color:#a3e635">node_modules/<br>dist/<br>.legacy/<br>.env*.local<br>.DS_Store<br>.idea/<br>.vscode/</div>`,
      };

      if (!file) {
        this._print(
          `<div style="color:#f87171;margin-left:1rem">Usage: cat [filename] — Try 'ls' to see available files.</div>`,
        );
      } else if (files[file]) {
        this._print(files[file]);
      } else {
        this._print(
          `<div style="color:#f87171;margin-left:1rem">cat: ${this._sanitize(file)}: No such file or directory</div>`,
        );
      }

      // ═══════════════════════════════════════════════════
      //  ECHO
      // ═══════════════════════════════════════════════════
    } else if (cmd === "echo") {
      const text = args.slice(1).join(" ");
      if (text) {
        this._print(
          `<div style="color:#a3e635;margin-left:1rem">${this._sanitize(text)}</div>`,
        );
      } else {
        this._print(`<div style="margin-left:1rem"><br></div>`);
      }

      // ═══════════════════════════════════════════════════
      //  COWSAY
      // ═══════════════════════════════════════════════════
    } else if (cmd === "cowsay") {
      const message =
        args.slice(1).join(" ") || "Moo! Type something after cowsay";
      const safeMsg = this._sanitize(message);
      const len = message.length;
      const top = " " + "_".repeat(len + 2);
      const bottom = " " + "-".repeat(len + 2);
      this
        ._print(`<pre style="color:#a3e635;margin-left:1rem;line-height:1.3">${top}
&lt; ${safeMsg} &gt;
${bottom}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||</pre>`);

      // ═══════════════════════════════════════════════════
      //  GLITCH
      // ═══════════════════════════════════════════════════
    } else if (cmd === "glitch") {
      this._print(
        `<div style="color:#f87171;margin-left:1rem">[WARN] System instability detected...</div>`,
      );

      const style = document.createElement("style");
      style.id = "glitch-effect-style";
      style.textContent = `
        @keyframes glitch-anim {
          0% { transform: translate(0); filter: hue-rotate(0deg); }
          10% { transform: translate(-5px, 3px); filter: hue-rotate(90deg); }
          20% { transform: translate(3px, -5px); filter: hue-rotate(180deg); }
          30% { transform: translate(-3px, 2px); clip-path: inset(40% 0 20% 0); }
          40% { transform: translate(5px, -3px); clip-path: inset(10% 0 60% 0); }
          50% { transform: translate(-2px, 5px); filter: hue-rotate(270deg); }
          60% { transform: translate(4px, 1px); clip-path: inset(50% 0 10% 0); }
          70% { transform: translate(-4px, -2px); filter: hue-rotate(45deg); }
          80% { transform: translate(2px, -4px); clip-path: inset(0); }
          90% { transform: translate(-1px, 3px); filter: hue-rotate(135deg); }
          100% { transform: translate(0); filter: hue-rotate(0deg); clip-path: inset(0); }
        }
        @keyframes glitch-text {
          0%, 100% { text-shadow: none; }
          25% { text-shadow: 2px 0 #ef4444, -2px 0 #3b82f6; }
          50% { text-shadow: -2px 0 #ef4444, 2px 0 #3b82f6; }
          75% { text-shadow: 1px 0 #a3e635, -1px 0 #f43f5e; }
        }
        body.glitching #app {
          animation: glitch-anim 0.15s infinite;
        }
        body.glitching #webgl-canvas {
          animation: glitch-anim 0.1s infinite reverse;
        }
        body.glitching * {
          animation: glitch-text 0.2s infinite !important;
        }
      `;
      document.head.appendChild(style);
      document.body.classList.add("glitching");

      setTimeout(() => {
        document.body.classList.remove("glitching");
        style.remove();
        this._print(
          `<div style="color:#34d399;margin-left:1rem">[OK] System stabilized. All processes nominal.</div>`,
        );
      }, 3000);

      // ═══════════════════════════════════════════════════
      //  UNKNOWN COMMAND
      // ═══════════════════════════════════════════════════
    } else {
      this._print(
        `<div style="color:#f87171;margin-left:1rem">bash: ${this._sanitize(cmd)}: command not found. Type 'help'.</div>`,
      );
    }

    this.input.value = "";
  }
}
