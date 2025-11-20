// === DOM ELEMENTS ===
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameStarted = false;

// === START BUTTON ===
startBtn.addEventListener("click", () => {
    startScreen.style.display = "none";  // Hilangkan menu start
    canvas.style.display = "block";      // Tampilkan canvas
    gameStarted = true;
    startGame();
});

// === PLAYER ===
const player = {
    x: 100,
    y: 350,
    width: 40,
    height: 50,
    dy: 0,
    speed: 5,
    jumping: false,
    gravity: 1,
};

const playerImg = new Image();
playerImg.src = "karakter.png";

// === BACKGROUND ===
const background = new Image();
background.src = "bg1.jpeg";

// === OBJECTS ===
const keyImg = new Image();
keyImg.src = "key.png";

const doorImg = new Image();
doorImg.src = "door.png";

const keyObject = { x: 600, y: 360, width: 40, height: 40, taken: false };
const doorObject = { x: 800, y: 320, width: 60, height: 90 };

let keys = {};

// === KEY HANDLING ===
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// === GAME LOOP ===
function startGame() {
    requestAnimationFrame(updateGame);
}

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
        alert("Kamu dapat kunci! Kuis muncul nanti.");
    }

    requestAnimationFrame(updateGame);
}

// === DRAW FUNCTIONS ===
function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawKey() {
    if (!keyObject.taken) {
        ctx.drawImage(keyImg, keyObject.x, keyObject.y, keyObject.width, keyObject.height);
    }
}

function drawDoor() {
    ctx.drawImage(doorImg, doorObject.x, doorObject.y, doorObject.width, doorObject.height);
}

// === PLAYER MOVEMENT ===
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
    if (player.y + player.height >= 420) {
        player.y = 420 - player.height;
        player.dy = 0;
        player.jumping = false;
    }
}

// === COLLISION FUNCTION ===
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
