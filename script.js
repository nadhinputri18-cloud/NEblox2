// SELECT ELEMENTS
const homeScreen = document.getElementById("home-screen");
const gameScreen = document.getElementById("game-screen");
const startBtn = document.getElementById("startBtn");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// IMAGE ASSETS
const playerImg = new Image();
playerImg.src = "karakter.png";

const keyImg = new Image();
keyImg.src = "key.png";

const doorImg = new Image();
doorImg.src = "door.png";

// PLAYER
let player = {
    x: 50,
    y: 50,
    size: 40,
    speed: 4
};

// KEY
let key = {
    x: 300,
    y: 200,
    size: 40,
    collected: false
};

// DOOR
let door = {
    x: 700,
    y: 400,
    size: 50
};

// SWITCH SCREEN
startBtn.onclick = () => {
    homeScreen.style.display = "none";
    gameScreen.style.display = "flex";
    startGame();
};

// GAME LOOP
function startGame() {
    document.addEventListener("keydown", movePlayer);
    requestAnimationFrame(update);
}

function movePlayer(e) {
    if (e.key === "w" || e.key === "ArrowUp") player.y -= player.speed;
    if (e.key === "s" || e.key === "ArrowDown") player.y += player.speed;
    if (e.key === "a" || e.key === "ArrowLeft") player.x -= player.speed;
    if (e.key === "d" || e.key === "ArrowRight") player.x += player.speed;
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // DRAW PLAYER
    ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

    // DRAW KEY
    if (!key.collected) {
        ctx.drawImage(keyImg, key.x, key.y, key.size, key.size);
    }

    // DRAW DOOR
    ctx.drawImage(doorImg, door.x, door.y, door.size, door.size);

    // COLLISION WITH KEY
    if (!key.collected &&
        player.x < key.x + key.size &&
        player.x + player.size > key.x &&
        player.y < key.y + key.size &&
        player.y + player.size > key.y
    ) {
        key.collected = true;
        alert("Kunci didapat!");
    }

    // COLLISION WITH DOOR
    if (player.x < door.x + door.size &&
        player.x + player.size > door.x &&
        player.y < door.y + door.size &&
        player.y + player.size > door.y
    ) {
        if (key.collected) {
            alert("Level Selesai!");
        } else {
            alert("Butuh kunci untuk keluar!");
        }
    }

    requestAnimationFrame(update);
}
