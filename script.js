// Game Variables
let money = 0;
let workers = 0;
let isCuttingMode = false;
let inZone = false;

// Player positioning
let playerX = window.innerWidth / 2;
let playerY = window.innerHeight / 2;
const speed = 5;

// Input tracking
const keys = { w: false, a: false, s: false, d: false };

// DOM Elements
const playerEl = document.getElementById('player');
const stationEl = document.getElementById('station');
const promptEl = document.getElementById('prompt');
const worldEl = document.getElementById('world');
const cuttingModeEl = document.getElementById('cutting-mode');
const moneyDisplay = document.getElementById('money-display');
const breadContainer = document.getElementById('bread-container');

// Listen for keyboard presses
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true;
    
    // Enter cutting mode
    if (e.key.toLowerCase() === 'e' && inZone && !isCuttingMode) {
        isCuttingMode = true;
        worldEl.style.display = 'none';
        cuttingModeEl.style.display = 'flex';
        promptEl.style.display = 'none';
    }
    
    // Exit cutting mode
    if (e.key === 'Escape' && isCuttingMode) {
        isCuttingMode = false;
        worldEl.style.display = 'block';
        cuttingModeEl.style.display = 'none';
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false;
});

// Simple AABB Collision Detection
function checkCollision(rect1, rect2) {
    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    );
}

// Main Game Loop (Handles movement and zone checking)
function gameLoop() {
    if (!isCuttingMode) {
        if (keys.w) playerY -= speed;
        if (keys.s) playerY += speed;
        if (keys.a) playerX -= speed;
        if (keys.d) playerX += speed;

        playerEl.style.left = playerX + 'px';
        playerEl.style.top = playerY + 'px';

        // Check if player is near the station
        const playerRect = playerEl.getBoundingClientRect();
        const stationRect = stationEl.getBoundingClientRect();

        // Expand the station rectangle slightly to create a "Trigger Zone"
        const triggerZone = {
            left: stationRect.left - 20,
            right: stationRect.right + 20,
            top: stationRect.top - 20,
            bottom: stationRect.bottom + 20
        };

        if (checkCollision(playerRect, triggerZone)) {
            inZone = true;
            promptEl.style.display = 'block';
        } else {
            inZone = false;
            promptEl.style.display = 'none';
        }
    }
    requestAnimationFrame(gameLoop);
}

// Start the loop
gameLoop();

// --- Slicing Mechanic Logic ---
let startX, startY;
let isDragging = false;

breadContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('mouseup', (e) => {
    if (!isDragging || !isCuttingMode) return;
    isDragging = false;

    let endX = e.clientX;
    let endY = e.clientY;

    // Calculate how far the mouse dragged
    let distance = Math.hypot(endX - startX, endY - startY);

    // If they dragged far enough across the bread, count it as a slice!
    if (distance > 100) {
        sliceBread();
    }
});

function sliceBread() {
    // Earn money
    money += 5;
    moneyDisplay.innerText = money;

    // Visual animation
    const halves = document.querySelectorAll('.bread-half');
    halves[1].classList.add('sliced-right');
    halves[2].classList.add('sliced-left');

    // Reset the bread after a short delay so they can slice again
    setTimeout(() => {
        halves[1].classList.remove('sliced-right');
        halves[2].classList.remove('sliced-left');
    }, 400);
}