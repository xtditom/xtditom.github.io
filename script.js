/* --- GLITCH USERNAME BOX --- */
const glitchBox = document.getElementById('glitch-box');
const username = "xtditom";

function glitchUsername() {
    const modes = [
        username.toUpperCase(), // XTDITOM
        username.toLowerCase(), // xtditom
        username.charAt(0).toUpperCase() + username.slice(1), // Xtditom
        "XtDiToM", // Mixed
        "xTdItOm"  // Mixed
    ];
    
    // Pick a random variation
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    
    // Apply text
    glitchBox.innerText = randomMode;
    
    // Randomize font weight for "jitter" feel
    const weights = ['400', '700', '800'];
    glitchBox.style.fontWeight = weights[Math.floor(Math.random() * weights.length)];
}

// Run Glitch every 800ms
setInterval(glitchUsername, 800);


/* --- STATUS BADGE LOGIC --- */
function updateStatus() {
    const hour = new Date().getHours();
    const statusText = document.getElementById('status-text');
    const badge = document.getElementById('status-badge');
    const dot = document.querySelector('.status-dot');
    
    let text = "Vibe Coding 💻";
    let color = "#38bdf8"; 

    if (hour >= 0 && hour < 8) {
        text = "Recharging 😴";
        color = "#94a3b8";
    } else if (hour >= 8 && hour < 14) {
        text = "At College (Class XII) 🏫";
        color = "#c084fc";
    } else if (hour >= 14 && hour < 18) {
        text = "Gaming / Sports 🎮";
        color = "#f87171";
    } else {
        text = "Building / Coding ⚡";
        color = "#4ade80";
    }

    statusText.innerText = text;
    badge.style.color = color;
    badge.style.borderColor = color;
    badge.style.backgroundColor = "rgba(0,0,0,0.2)"; 
    dot.style.backgroundColor = color;
}

/* --- TYPING EFFECT LOGIC --- */
const textElement = document.getElementById('typing-text');
const phrases = [
    "Student (Class XII) 🎓",
    "Developer 💻",
    "Tech Enthusiast ⚡",
    "Gamer 🎮"
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function typeWriter() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        textElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50; 
    } else {
        textElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100; 
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typeSpeed = 2000; 
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length; 
        typeSpeed = 500; 
    }

    setTimeout(typeWriter, typeSpeed);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateStatus();
    typeWriter();
});