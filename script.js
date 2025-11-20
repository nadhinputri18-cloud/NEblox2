// ambil elemen
const startBtn = document.getElementById("startBtn");
const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");

// Tombol Start → masuk game
startBtn.addEventListener("click", () => {
    homeScreen.style.display = "none";
    gameScreen.style.display = "block";

    startGame(); // panggil fungsi untuk mulai game
});

// ----------------------
// GAME CODE (sementara simple dulu)
// ----------------------
function startGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 500, 500);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Dimulai!", 140, 250);
}
