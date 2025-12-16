/* --- STATUS BADGE LOGIC --- */
function updateStatus() {
    const hour = new Date().getHours();
    const badge = document.getElementById('status-badge');
    let text = "Coding 💻";
    let color = "#58a6ff"; // Blue default

    // LOGIC: Adjusts based on user's schedule (24-hour format)
    if (hour >= 0 && hour < 7) {
        text = "Recharging / Sleeping 😴";
        color = "#8b949e"; // Grey
    } else if (hour >= 7 && hour < 14) {
        text = "At College (Class XII) 🏫";
        color = "#d2a8ff"; // Purple
    } else if (hour >= 14 && hour < 18) {
        text = "Gaming (RDR2 / GTA V) 🤠";
        color = "#ff7b72"; // Red
    } else {
        text = "Building / Coding 💻";
        color = "#238636"; // Green
    }

    badge.innerText = text;
    badge.style.color = color;
    badge.style.borderColor = color;
    badge.style.background = color + "20"; // Adds 20% opacity
}

/* --- TYPING EFFECT LOGIC --- */
const textElement = document.getElementById('typing-text');
const phrases = [
    "Student (Class XII) 🎓",
    "Web Developer 💻",
    "Hardware Enthusiast 🖥️",
    "Open Source Contributor 🌐"
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function typeWriter() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        // Deleting text
        textElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50; // Delete faster
    } else {
        // Typing text
        textElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100; // Type normal speed
    }

    // Logic to switch between typing and deleting
    if (!isDeleting && charIndex === currentPhrase.length) {
        // Finished typing the phrase, pause before deleting
        isDeleting = true;
        typeSpeed = 2000; // Wait 2 seconds before deleting
    } else if (isDeleting && charIndex === 0) {
        // Finished deleting, switch to next phrase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length; // Loop back to 0
        typeSpeed = 500; // Pause before typing next
    }

    setTimeout(typeWriter, typeSpeed);
}

// Run functions when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateStatus();
    typeWriter();
});