// =====================
// NEblox v3.0 — GAME SCRIPT
// =====================

// Ambil elemen dari HTML
const startBtn = document.getElementById("startBtn");
const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");

// Tombol start → masuk game
startBtn.addEventListener("click", () => {
    homeScreen.style.display = "none";
    gameScreen.style.display = "block";

    startGame();
});

// =====================
// GAME START
// =====================
function startGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const tileSize = 50; // ukuran kotak labirin

    // Maze 2D (1 tembok, 0 jalan)
    const maze = [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,1],
        [1,0,1,0,1,0,1,1,0,1],
        [1,0,1,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,1,0,1,0,1],
        [1,1,1,1,0,1,0,1,0,1],
        [1,0,0,1,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,1],
        [1,1,1,1,1,1,1,1,1,1],
    ];

    // Player posisi awal
    let playerX = 1;
    let playerY = 1;

    // =====================
    // Render Maze
    // =====================
    function drawMaze() {
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                if (maze[y][x] === 1) {
                    ctx.fillStyle = "#111"; // tembok
                } else {
                    ctx.fillStyle = "#eee"; // jalan
                }
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }

        // Player
        ctx.fillStyle = "red";
        ctx.fillRect(playerX * tileSize, playerY * tileSize, tileSize, tileSize);
    }

    // =====================
    // Kontrol pemain
    // =====================
    document.addEventListener("keydown", (e) => {
        let moveX = 0;
        let moveY = 0;

        if (e.key === "ArrowUp") moveY = -1;
        if (e.key === "ArrowDown") moveY = 1;
        if (e.key === "ArrowLeft") moveX = -1;
        if (e.key === "ArrowRight") moveX = 1;

        // Cek apakah jalan boleh dilewati
        if (maze[playerY + moveY][playerX + moveX] === 0) {
            playerX += moveX;
            playerY += moveY;
        }

        drawMaze();
    });

    drawMaze(); // render pertama kali
}
