# XTDITOM OS v2.0 🖥️

An immersive, OS-themed 3D portfolio built with Three.js, GSAP, and Vanilla JavaScript. Features a cyberpunk aesthetic, interactive CLI terminal, and scroll-reactive 3D environment.

**Live:** [ditom.me](https://ditom.me)

---

## ✨ Highlights

- **Three.js 3D Background** — CyberGrid + ParticleField rendered on a WebGL canvas, with scroll-driven 180° rotation and mouse-tracked camera parallax
- **27-Command CLI Terminal** — Fully interactive command-line interface with system info, portfolio data, games (Snake), weather API, ASCII art, and visual effects (Matrix rain, hack sim, glitch)
- **Staggered Hero Animations** — Each hero element (greeting → name → tagline → bio → button) reveals one-by-one using GSAP stagger
- **Scroll-Reactive Scene** — The 3D background rotates a full 180° as the user scrolls, with smoothly interpolated fog density, camera depth, and lighting shifts
- **Cross-Browser Extension** — Featured project (YourDynamicDashboard) available on Chrome Web Store, Firefox Add-ons, and Edge Add-ons
- **Lenis Smooth Scroll** — Buttery-smooth scrolling with GSAP ScrollTrigger integration
- **Dark/Light Theme** — Persistent theme with `localStorage`, OS preference sync, and live terminal command (`theme dark/light`)
- **No Link Previews** — Browser statusbar URL previews are hidden for a cleaner experience
- **Contact Form** — Async form submission via Formspree API, plus a `mail` command in the terminal
- **Custom Cursor** — Hardware-accelerated dot + ring cursor with hover detection (desktop only)
- **Magnetic Buttons** — Physics-based buttons that attract toward the cursor on hover
- **Responsive Design** — Full 3D on desktop, graceful 2D fallback on mobile with touch-optimized interactions

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **3D Engine** | Three.js (WebGL2) |
| **Animations** | GSAP + ScrollTrigger |
| **Smooth Scroll** | Lenis |
| **Bundler** | Vite |
| **Styling** | Custom CSS (CSS Variables, Neo-Brutalist + Cyberpunk) |
| **Logic** | Vanilla JavaScript (ES6+ Modules) |
| **Contact** | Formspree API |
| **Deployment** | GitHub Pages via GitHub Actions |

## 📁 Project Structure

```
portfolio/
├── index.html              # Main HTML (all sections)
├── src/
│   ├── main.js             # Entry point — orchestrates everything
│   ├── styles/
│   │   └── index.css       # Full design system + components
│   ├── scene/
│   │   └── SceneManager.js # Three.js scene, camera, lighting, scroll
│   ├── objects/
│   │   ├── CyberGrid.js    # Animated wireframe grid
│   │   └── ParticleField.js# Floating particle system
│   └── ui/
│       └── Terminal.js     # CLI terminal (27 commands)
├── public/
│   └── favicons/           # Dynamic favicons
├── vite.config.js          # Vite configuration
└── package.json
```

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/xtditom/portfolio.git
cd portfolio

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 💻 Terminal Commands

| Category | Commands |
|---|---|
| **System** | `whoami`, `neofetch`, `theme`, `date`, `uptime`, `history` |
| **Portfolio** | `projects`, `socials`, `skills`, `ls`, `cat [file]` |
| **Communication** | `mail`, `echo`, `cowsay`, `fortune`, `ping`, `weather` |
| **Visual & Games** | `matrix`, `hack`, `snake`, `glitch`, `rickroll` |
| **Navigation** | `goto [section]`, `help`, `clear`, `start`, `exit` |

## 🌐 Featured Project

**YourDynamicDashboard** — A high-performance new tab browser extension with 100% local-storage architecture.

- [Chrome Web Store](https://chromewebstore.google.com/detail/fckmlnagohleefboaleepppikpdkckjn)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/yourdynamicdashboard/)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/yourdynamicdashboard/phhofebhbmicnfhmmdgikiddaboljnec)
- [GitHub](https://github.com/xtditom/YourDynamicDashboard)
- [Live Demo](https://ditom.me/YourDynamicDashboard)

## 📄 License

© 2026 Ditom Baroi Antu. All rights reserved.
