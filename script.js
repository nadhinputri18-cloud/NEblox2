const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load Images
const playerImg = new Image();
playerImg.src = "karakter.png";

const enemyImg = new Image();
enemyImg.src = "enemy.png";

// Player object
const player = {
    x: 100,
    y: 350,
    width: 60,
    height: 60,
    dy: 0,
    gravity: 1,
    jumpForce: -17,
    onGround: true
};

// Enemy object
const enemy = {
    x: 600,
    y: 350,
    width: 60,
    height: 60,
    speed: 2
};

// Keyboard input
let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Start button event
startBtn.onclick = () => {
    startScreen.style.display = "none";
    canvas.style.display = "block";
    gameLoop();
};

// Game Loop
function gameLoop() {
    requestAnimationFrame(gameLoop);
    update();
    draw();
}

function update() {
    // Move left
    if (keys["ArrowLeft"]) player.x -= 5;

    // Move right
    if (keys["ArrowRight"]) player.x += 5;

    // Jump
    if (keys[" "] && player.onGround) {
        player.dy = player.jumpForce;
        player.onGround = false;
    }

    // Apply gravity
    player.y += player.dy;
    player.dy += player.gravity;

    // Ground collision
    if (player.y > 350) {
        player.y = 350;
        player.dy = 0;
        player.onGround = true;
    }

    // Enemy movement (patrol)
    enemy.x -= enemy.speed;
    if (enemy.x < -50) {
        enemy.x = 950; // respawn
    }

    // Collision check
    if (
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
    ) {
        alert("GAME OVER!");
        window.location.reload();
    }
}

// DRAWING
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Enemy
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
}
