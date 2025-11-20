// --- START SCREEN ---
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameStarted = false;

// ▶ KETIKA TOMBOL START DIKLIK
startBtn.addEventListener("click", () => {
    startScreen.style.display = "none";  // hilangkan start screen
    canvas.style.display = "block";      // munculkan canvas
    gameStarted = true;                  // FIX ➜ game baru bisa jalan
    startGame();
});

// --- GAME VARIABLES ---
const player = {
    x: 100,
    y: 350,
    width: 50,
    height: 60,
    dy: 0,
    speed: 5,
    jumping: false,
    gravity: 1,
};

// Images
let background = new Image();
background.src = "bg1.jpeg";

let keyImg = new Image();
keyImg.src = "key.png";

let doorImg = new Image();
doorImg.src = "door.png";

let playerImg = new Image();
playerImg.src = "karakter.png";

// Objects
const keyObject = { x: 600, y: 360, width: 40, height: 40, taken: false };
const doorObject = { x: 800, y: 320, width: 70, height: 100 };

// Input
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// --- START GAME ---
function startGame() {
    requestAnimationFrame(updateGame);
}

// --- DRAW ---
function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawKey() {
    if (!keyObject.taken)
        ctx.drawImage(keyImg, keyObject.x, keyObject.y, keyObject.width, keyObject.height);
}

function drawDoor() {
    ctx.drawImage(doorImg, doorObject.x, doorObject.y, doorObject.width, doorObject.height);
}

// --- MOVEMENT ---
function movePlayer() {
    if (keys["ArrowRight"]) player.x += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;

    // Jump
    if (keys[" "] && !player.jumping) {
        player.dy = -15;
        player.jumping = true;
    }

    // Gravity
    player.dy += player.gravity;
    player.y += player.dy;

    // Floor
    if (player.y + player.height >= 430) {
        player.y = 430 - player.height;
        player.jumping = false;
        player.dy = 0;
    }
}

// --- COLLISION ---
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// --- MAIN LOOP ---
function updateGame() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    movePlayer();
    drawPlayer();
    drawKey();
    drawDoor();

    // Ambil kunci
    if (!keyObject.taken && isColliding(player, keyObject)) {
        keyObject.taken = true;
        alert("Kamu dapat kunci! Nanti muncul pertanyaan level 1 di sini.");
    }

    requestAnimationFrame(updateGame);
}
