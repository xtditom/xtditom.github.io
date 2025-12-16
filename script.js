function updateStatus() {
    const hour = new Date().getHours();
    const badge = document.getElementById('status-badge');
    let text = "Vibe Coding 💻";
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
        text = "Building / Vibe Coding 💻";
        color = "#238636"; // Green
    }

    badge.innerText = text;
    badge.style.color = color;
    badge.style.borderColor = color;
    badge.style.background = color + "20"; // Adds 20% opacity
}

// Run immediately
updateStatus();