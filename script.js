// --- START SCREEN ---
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameStarted = false;

startBtn.addEventListener("click", () => {
    document.body.classList.add("started"); 
    gameStarted = true; // ⬅ WAJIB
    startGame();
});

// --- GAME VARIABLES ---
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

let background = new Image();
background.src = "bg1.jpeg";

let keyImg = new Image();
keyImg.src = "key.png";

let doorImg = new Image();
doorImg.src = "door.png";

const keyObject = { x: 600, y: 360, width: 40, height: 40, taken: false };
const doorObject = { x: 800, y: 330, width: 60, height: 80 };

let keys = {};

document.addEventListener("keydown", (e) => { keys[e.key] = true; });
document.addEventListener("keyup", (e) => { keys[e.key] = false; });

// --- START GAME ---
function startGame() {
    requestAnimationFrame(updateGame);
}

// --- DRAW PLAYER ---
function drawPlayer() {
    let img = new Image();
    img.src = "karakter.png";
    ctx.drawImage(img, player.x, player.y, player.width, player.height);
}

// --- DRAW BACKGROUND ---
function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

// --- DRAW KEY ---
function drawKey() {
    if (!keyObject.taken) {
        ctx.drawImage(keyImg, keyObject.x, keyObject.y, keyObject.width, keyObject.height);
    }
}

// --- DRAW DOOR ---
function drawDoor() {
    ctx.drawImage(doorImg, doorObject.x, doorObject.y, doorObject.width, doorObject.height);
}

// --- PLAYER MOVEMENT ---
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

    // Floor Collision
    if (player.y + player.height >= 400) {
        player.y = 400 - player.height;
        player.jumping = false;
        player.dy = 0;
    }
}

// --- COLLISION DETECTION ---
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// --- MAIN UPDATE LOOP ---
function updateGame() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    movePlayer();
    drawPlayer();
    drawKey();
    drawDoor();

    // If player touches key → take key
    if (!keyObject.taken && isColliding(player, keyObject)) {
        keyObject.taken = true;
        alert("Kunci diambil! Pertanyaan Level 1 muncul nanti.");
    }

    // If player reaches door → must have key
    if (keyObject.taken && isColliding(player, doorObject)) {
        alert("Level Selesai! Siap lanjut Level 2!");
    }

    requestAnimationFrame(updateGame);
}
