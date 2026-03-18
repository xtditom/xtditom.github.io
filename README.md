# XTDITOM // SYS 🖥️

A Neo-Brutalist, OS-themed interactive developer portfolio engineered with a focus on DOM manipulation, physics-based animations, and local-first architecture.

**Live Deployment:** [ditom.me](https://ditom.me)

## Core Architecture

This portfolio ditches standard web templates in favor of a tactical, operating-system environment. It treats the browser as a terminal and the visitor as a user.

### Key Engineering Features

* **Interactive CLI Terminal:** A fully functional command-line interface built with Vanilla JS. It parses arguments, executes DOM manipulation (`theme dark`), processes asynchronous API requests (`mail`), and renders HTML5 Canvas animations (`matrix`).
* **Physics-Based UI:** Utilizes GSAP for advanced scroll-velocity distortion (momentum physics) and magnetic UI hitboxes that react to cursor proximity.
* **Asynchronous Mail Client:** A custom AJAX contact form that intercepts native POST requests, delivering payloads via the Fetch API to Formspree without page reloads.
* **Hardware-Level Visuals:** Features dynamic page-visibility API hooks for background tab awareness, and a cursor-tracked CSS spotlight grid.
* **Persistent State Management:** Seamless Light/Dark mode toggling that saves to `localStorage` and syncs live with the user's system preferences.

## Tech Stack

* **Structure:** HTML5 / Semantic DOM
* **Styling:** Tailwind CSS v4 (Custom Neo-Brutalist configuration)
* **Logic:** Vanilla JavaScript (ES6+)
* **Motion Engine:** GSAP (GreenSock Animation Platform) + ScrollTrigger
* **Data Routing:** Formspree API
