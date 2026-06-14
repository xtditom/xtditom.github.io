import gsap from "gsap";
import { REVISION } from "three";

/**
 * Terminal CLI — Interactive command-line interface
 * Ported from legacy app.js with XSS protection, command history,
 * and new 3D-aware commands.
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

    this._bindEvents();
  }

  setSceneManager(sceneManager) {
    this.sceneManager = sceneManager;
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

  _bindEvents() {
    // Focus input when clicking terminal area
    this.output.parentElement.addEventListener("click", () => this.input.focus());

    this.input.addEventListener("keydown", (e) => {
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
      "help", "whoami", "skills", "start", "neofetch", "theme",
      "mail", "matrix", "clear", "exit", "history", "goto", "wireframe", "glitch"
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
          this._print(`<div class="mt-2"><span style="color:#fff">${this._sanitize(rawInput)}</span></div><div style="color:#facc15;margin-left:1rem">[ABORTED] Mail protocol terminated.</div>`);
          this.input.value = "";
          return;
        }
      } else {
        this._print(`<div class="mt-2"><span style="color:#fff">${this._sanitize(rawInput)}</span></div>`);

        if (this.mailState === "awaiting_email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(rawInput)) {
            this._print(`<div style="color:#f87171;margin-left:1rem">Invalid email format. Try again or type 'cancel':</div><div class="mt-1"><span style="color:#34d399;font-weight:700">Email:</span></div>`);
            this.input.value = "";
            return;
          }
          this.mailData.email = rawInput;
          this.mailState = "awaiting_message";
          this._print(`<div style="color:#a3e635;margin-left:1rem">Email accepted.</div><div class="mt-2"><span style="color:#34d399;font-weight:700">Message:</span></div>`);
        } else if (this.mailState === "awaiting_message") {
          this.mailData.message = rawInput;
          this._print(`<div style="color:#facc15;margin-left:1rem">Transmitting payload to server...</div>`);
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
              this._print(r.ok
                ? `<div style="color:#34d399;font-weight:700;margin-left:1rem">[OK] Message delivered successfully.</div>`
                : `<div style="color:#f87171;margin-left:1rem">[ERROR] Server rejected the payload.</div>`
              );
            })
            .catch(() => {
              this._print(`<div style="color:#f87171;margin-left:1rem">[ERROR] Network failure.</div>`);
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
    const promptPrefix = window.innerWidth > 768 ? "guest@xtditom:~$" : "~$";
    this._print(`<div class="mt-2"><span style="color:#34d399;font-weight:700;margin-right:0.5rem">${promptPrefix}</span><span style="color:#fff">${this._sanitize(rawInput)}</span></div>`);

    const commands = {
      help: `Available commands:<br>
        &nbsp;&nbsp;<b>whoami</b> — Brief bio<br>
        &nbsp;&nbsp;<b>skills</b> — Core engineering skills<br>
        &nbsp;&nbsp;<b>neofetch</b> — System architecture<br>
        &nbsp;&nbsp;<b>theme [light/dark]</b> — Toggle colors<br>
        &nbsp;&nbsp;<b>mail</b> — Send a direct message<br>
        &nbsp;&nbsp;<b>matrix</b> — Visual protocol<br>
        &nbsp;&nbsp;<b>history</b> — Command history<br>
        &nbsp;&nbsp;<b>goto [section]</b> — Navigate to section<br>
        &nbsp;&nbsp;<b>clear</b> — Clear output<br>
        &nbsp;&nbsp;<b>exit</b> — Terminate session`,
      whoami: "Ditom Baroi Antu. 18-year-old student developer from Dhaka, Bangladesh. Currently exploring the Tech World & Planning my future in it.",
      skills: "HTML5, CSS3, JavaScript (ES6+), Three.js, GSAP, Tailwind CSS v4, Next.js, Python, C++",
      sudo: "Access denied. Nice try. This incident will be reported.",
    };

    if (cmd === "clear") {
      this.output.innerHTML = "";
    } else if (cmd === "start") {
      this.output.innerHTML = `<div><span style="color:#71717a">XTDITOM OS [Version 2.0.0]</span></div><div><span style="color:#71717a">(c) 2026 Ditom Baroi Antu. All rights reserved.</span></div><br><div>Type <span style="color:#fff;font-weight:700">'help'</span> to see a list of available commands.</div>`;
    } else if (cmd === "history") {
      const histLines = this.history.map((h, i) => `&nbsp;&nbsp;${i + 1}&nbsp;&nbsp;${this._sanitize(h)}`).join("<br>");
      this._print(`<div style="color:#a3e635;margin-left:1rem">${histLines}</div>`);
    } else if (cmd === "goto") {
      const target = args[1]?.toLowerCase();
      const sections = { home: "#hero", hero: "#hero", work: "#featured", featured: "#featured", tech: "#tech", rigs: "#rigs", terminal: "#terminal", contact: "#contact" };
      if (target && sections[target]) {
        document.querySelector(sections[target])?.scrollIntoView({ behavior: "smooth" });
        this._print(`<div style="color:#a3e635;margin-left:1rem">Navigating to: ${this._sanitize(target)}</div>`);
      } else {
        this._print(`<div style="color:#f87171;margin-left:1rem">Usage: goto [home|work|tech|rigs|terminal|contact]</div>`);
      }
    } else if (cmd === "theme") {
      const mode = args[1]?.toLowerCase();
      const lightIcon = document.getElementById("icon-sun");
      const darkIcon = document.getElementById("icon-moon");
      if (mode === "dark") {
        if (document.documentElement.classList.contains("dark")) {
          this._print(`<div style="color:#facc15;margin-left:1rem">System is already in Dark theme.</div>`);
        } else {
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
          if (lightIcon) lightIcon.classList.remove("hidden");
          if (darkIcon) darkIcon.classList.add("hidden");
          this._print(`<div style="color:#a3e635;margin-left:1rem">System theme updated to: DARK.</div>`);
          window.dispatchEvent(new CustomEvent("themechange", { detail: { dark: true } }));
        }
      } else if (mode === "light") {
        if (!document.documentElement.classList.contains("dark")) {
          this._print(`<div style="color:#facc15;margin-left:1rem">System is already in Light theme.</div>`);
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("theme", "light");
          if (lightIcon) lightIcon.classList.add("hidden");
          if (darkIcon) darkIcon.classList.remove("hidden");
          this._print(`<div style="color:#a3e635;margin-left:1rem">System theme updated to: LIGHT.</div>`);
          window.dispatchEvent(new CustomEvent("themechange", { detail: { dark: false } }));
        }
      } else {
        this._print(`<div style="color:#f87171;margin-left:1rem">${mode ? `Invalid theme: ${this._sanitize(mode)}. ` : ""}Usage: theme [light/dark]</div>`);
      }
    } else if (cmd === "neofetch") {
      this._print(`<div style="color:#a3e635;margin:1rem 0 0 1rem;display:flex;gap:1.5rem;flex-wrap:wrap;align-items:flex-start"><pre style="color:#34d399;font-weight:700;line-height:1.2;display:none" class="neofetch-ascii">
  \\\\\\\\\\
   \\\\\\\\\\\\\\
    \\\\\\\\\\\\\\
    //\\\\\\\\\\\\\\
   //  \\\\\\\\\\\\\\
  //    \\\\\\\\\\\\\\
</pre><div><span style="color:#fff;font-weight:700">ditom@sys_00</span><br><span style="color:#52525b">-------------------------</span><br><span style="color:#34d399;font-weight:700">OS:</span> XTDITOM OS v2.0<br><span style="color:#34d399;font-weight:700">Host:</span> Workstation // SYS_00<br><span style="color:#34d399;font-weight:700">Renderer:</span> Three.js r${REVISION}<br><span style="color:#34d399;font-weight:700">CPU:</span> Ryzen 5 5600GT<br><span style="color:#34d399;font-weight:700">GPU:</span> Radeon Vega 7<br><span style="color:#34d399;font-weight:700">Memory:</span> 16GB Dual Channel<br><span style="color:#34d399;font-weight:700">Uptime:</span> 18 Years</div></div>`);
      // Show ASCII art on desktop
      if (window.innerWidth > 768) {
        const ascii = this.output.querySelector(".neofetch-ascii:last-of-type");
        if (ascii) ascii.style.display = "block";
      }
    } else if (cmd === "mail") {
      this.mailState = "awaiting_email";
      this._print(`<div style="color:#a3e635;margin-left:1rem">Initializing direct message protocol...</div><div class="mt-2"><span style="color:#34d399;font-weight:700">Email:</span></div>`);
    } else if (cmd === "matrix") {
      this._print(`<div style="color:#a3e635;margin-left:1rem">Initializing visual protocol...</div>`);
      const terminal = this.output.closest(".terminal");
      const cvs = document.createElement("canvas");
      Object.assign(cvs.style, { position: "absolute", top: "0", left: "0", width: "100%", height: "100%", zIndex: "50", pointerEvents: "none" });
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
          if (drops[i] * fontSize > cvs.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      }, 33);

      setTimeout(() => {
        clearInterval(interval);
        cvs.remove();
        this.input.disabled = false;
        this.input.focus();
        this._print(`<div style="color:#34d399;margin-left:1rem">[OK] Protocol terminated. System restored.</div>`);
      }, 5000);
    } else if (cmd === "exit") {
      // Graceful exit: show shutdown message, then offer restart
      this._print(`<div style="color:#f87171;margin-left:1rem">Terminating session interface...</div>`);
      this.input.disabled = true;
      const terminal = this.output.closest(".terminal");

      setTimeout(() => {
        this._print(`<div style="color:#71717a;margin-left:1rem;margin-top:0.5rem">Session terminated. Type <span style="color:#fff;font-weight:700">'start'</span> to reboot.</div>`);
        this.input.disabled = false;
        this.input.focus();
      }, 1200);
    } else if (commands[cmd]) {
      this._print(`<div style="color:#a3e635;margin-left:1rem">${commands[cmd]}</div>`);
    } else {
      this._print(`<div style="color:#f87171;margin-left:1rem">bash: ${this._sanitize(cmd)}: command not found. Type 'help'.</div>`);
    }

    this.input.value = "";
  }
}
