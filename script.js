/* NEblox Game v3.0
   HTML5 Canvas - Pure JS
   Features: menu, levels, coins, traps, timer, score, lives, particles
*/

// ============ CONFIG ============
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 500; // px
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

const TILE = 50; // tile size (fits 10x10)
const ROWS = 10;
const COLS = 10;

// HUD elements
const btnStart = document.getElementById('btnStart');
const btnHow = document.getElementById('btnHow');
const levelLabel = document.getElementById('levelLabel');
const timerLabel = document.getElementById('timerLabel');
const scoreLabel = document.getElementById('scoreLabel');
const lifeLabel = document.getElementById('lifeLabel');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-msg');
const overlayButtons = document.getElementById('overlay-buttons');

// Game state
let state = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER, WIN
let level = 1;
let score = 0;
let lives = 3;
let timeLeft = 60;
let timerInterval = null;

// Player
const PLAYER_SIZE = 28;
let player = { x: TILE + (TILE-PLAYER_SIZE)/2, y: TILE + (TILE-PLAYER_SIZE)/2, speed: 160, vx:0, vy:0 };

// Controls
let keys = {};

// Particles (neon trail)
let particles = [];

// Map legend:
// "1" = wall
// "0" = empty path
// "P" = player start
// "E" = exit
// "C" = coin collectible
// "T" = trap (spike)
const levels = {
  1: [
    "1111111111",
    "1P00000C11",
    "1011101011",
    "1000100011",
    "1110101011",
    "1C00101011",
    "1011010101",
    "1000000T01",
    "1C011100E1",
    "1111111111"
  ],
  2: [
    "1111111111",
    "1P00100011",
    "1011010101",
    "10C0000101",
    "1011110101",
    "1000T00101",
    "1010111101",
    "1000000C01",
    "101011100E",
    "1111111111"
  ],
  3: [
    "1111111111",
    "1P0T0000C1",
    "1010111011",
    "10C0000001",
    "1011110101",
    "1000T00101",
    "1010010101",
    "10C0000101",
    "10001110E1",
    "1111111111"
  ]
};

// Derived map runtime
let currentMap = [];

// Utilities
function showOverlay(title, msg, buttons) {
  overlay.classList.remove('hidden');
  overlayTitle.innerText = title;
  overlayMsg.innerText = msg;
  overlayButtons.innerHTML = '';
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.innerText = b.text;
    btn.className = 'btn ' + (b.primary ? 'btn-primary' : 'btn-ghost');
    btn.onclick = () => { b.onClick(); overlay.classList.add('hidden'); };
    overlayButtons.appendChild(btn);
  });
}
function hideOverlay(){ overlay.classList.add('hidden'); }

// Load level into runtime map (2D array)
function loadLevel(lv){
  const raw = levels[lv];
  currentMap = [];
  for(let r=0;r<ROWS;r++){
    currentMap[r] = raw[r].split('');
  }

  // find player start & exit
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const ch = currentMap[r][c];
      if(ch === 'P'){
        player.x = c*TILE + (TILE-PLAYER_SIZE)/2;
        player.y = r*TILE + (TILE-PLAYER_SIZE)/2;
        currentMap[r][c] = '0';
      }
      if(ch === 'E'){
        // leave as E
      }
    }
  }

  // set time depending on level
  timeLeft = 55 - (lv-1)*10; if(timeLeft < 20) timeLeft = 20;
  levelLabel.innerText = "Level: " + lv;
  timerLabel.innerText = "Time: " + timeLeft;
  scoreLabel.innerText = "Score: " + score;
  lifeLabel.innerText = "❤ x" + lives;
  // start timer
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    if(state === 'PLAYING'){
      timeLeft--;
      timerLabel.innerText = "Time: " + timeLeft;
      if(timeLeft <= 0){
        clearInterval(timerInterval);
        loseLife('Time up!');
      }
    }
  },1000);
}

// Collision check: given rectangle, check if overlaps a wall tile
function isWallAtRect(x,y,w,h){
  // check four corners
  const cellsToCheck = [
    {x:x,y:y},
    {x:x+w-1,y:y},
    {x:x,y:y+h-1},
    {x:x+w-1,y:y+h-1}
  ];
  for(let p of cellsToCheck){
    const col = Math.floor(p.x / TILE);
    const row = Math.floor(p.y / TILE);
    if(row<0||row>=ROWS||col<0||col>=COLS) return true;
    if(currentMap[row][col] === '1') return true;
  }
  return false;
}

function collectAtPlayer(){
  const col = Math.floor((player.x + PLAYER_SIZE/2)/TILE);
  const row = Math.floor((player.y + PLAYER_SIZE/2)/TILE);
  const ch = currentMap[row][col];
  if(ch === 'C'){
    currentMap[row][col] = '0';
    score += 10;
    timeLeft += 5;
    scoreLabel.innerText = "Score: " + score;
    // spawn little burst
    for(let i=0;i<12;i++){
      particles.push({ x: player.x+PLAYER_SIZE/2, y: player.y+PLAYER_SIZE/2,
                       vx: (Math.random()-0.5)*2, vy:(Math.random()-0.5)*2,
                       life: Math.random()*30+20 });
    }
  } else if(ch === 'T'){ // trap
    // make trap stay; hitting reduces life and respawns player
    loseLife('Hit trap!');
  } else if(ch === 'E'){
    // reached exit
    nextLevel();
  }
}

// Lose life
function loseLife(msg){
  lives--;
  lifeLabel.innerText = "❤ x" + lives;
  showOverlay('Oops!', msg, [
    { text: 'Retry level', primary:true, onClick: ()=> {
        resetLevel();
        state='PLAYING';
      }},
    { text: 'Quit to Menu', primary:false, onClick: ()=> { state='MENU'; showMenu(); } }
  ]);
  clearInterval(timerInterval);
  if(lives <= 0){
    state='GAMEOVER';
    showOverlay('Game Over', 'You lost all lives. Score: ' + score, [
      { text:'Restart Game', primary:true, onClick: ()=> { restartGame(); } },
      { text:'Back to Menu', primary:false, onClick: ()=> { state='MENU'; showMenu(); } }
    ]);
  } else {
    // respawn player to start
    setTimeout(()=> {
      // find any P? we converted P to 0. Let's respawn to (1,1) or first empty tile:
      for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
          // find a safe empty tile near corner
          if(levels[level][r][c] === 'P'){ // original map still has P in levels object
            player.x = c*TILE + (TILE-PLAYER_SIZE)/2;
            player.y = r*TILE + (TILE-PLAYER_SIZE)/2;
            return;
          }
        }
      }
      // fallback
      player.x = TILE + (TILE-PLAYER_SIZE)/2; player.y = TILE + (TILE-PLAYER_SIZE)/2;
    }, 300);
  }
}

// Next level
function nextLevel(){
  level++;
  if(!levels[level]){
    // game finished
    state='WIN';
    clearInterval(timerInterval);
    showOverlay('You Win!','Selamat! Kamu menyelesaikan NEblox Game. Score: '+score,[
      { text:'Play Again', primary:true, onClick: ()=> { restartGame(); } },
      { text:'Back to Menu', primary:false, onClick: ()=> { state='MENU'; showMenu(); } }
    ]);
    return;
  }
  currentMap = []; // reload
  loadLevel(level);
  state='PLAYING';
}

// Reset level (same level)
function resetLevel(){
  // reload original string map (so collectibles and traps reset)
  // reload by copying from levels[level]
  const raw = levels[level];
  currentMap = [];
  for(let r=0;r<ROWS;r++) currentMap[r] = raw[r].split('');
  // reposition player
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      if(currentMap[r][c] === 'P'){
        player.x = c*TILE + (TILE-PLAYER_SIZE)/2;
        player.y = r*TILE + (TILE-PLAYER_SIZE)/2;
        currentMap[r][c] = '0';
      }
    }
  }
  // reset timer for this level
  timeLeft = 55 - (level-1)*10; if(timeLeft < 20) timeLeft = 20;
  timerLabel.innerText = "Time: " + timeLeft;
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    if(state === 'PLAYING'){
      timeLeft--;
      timerLabel.innerText = "Time: " + timeLeft;
      if(timeLeft <= 0){ clearInterval(timerInterval); loseLife('Time up!'); }
    }
  },1000);
}

// Restart whole game
function restartGame(){
  level = 1; score = 0; lives = 3;
  loadLevel(level);
  state='PLAYING';
}

// ============ RENDERING ============

function drawMap(){
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const ch = currentMap[r][c];
      const x = c*TILE, y = r*TILE;
      // floor
      ctx.fillStyle = '#07101a';
      ctx.fillRect(x,y,TILE,TILE);

      if(ch === '1'){ // wall
        // neon effect: gradient + inner shine
        const g = ctx.createLinearGradient(x,y,x+TILE,y+TILE);
        g.addColorStop(0,'#08243b');
        g.addColorStop(1,'#0b3250');
        ctx.fillStyle = g;
        ctx.fillRect(x,y,TILE,TILE);
        // outline glow
        ctx.strokeStyle = 'rgba(102,178,255,0.08)';
        ctx.strokeRect(x+2,y+2,TILE-4,TILE-4);
        // inner neon highlight
        ctx.fillStyle = 'rgba(110,200,255,0.05)';
        ctx.fillRect(x+6,y+6,TILE-12,TILE-12);
      } else if(ch === 'C'){ // coin
        // coin background
        ctx.fillStyle = '#0f2836';
        ctx.fillRect(x+8,y+8,TILE-16,TILE-16);
        // coin
        ctx.beginPath();
        ctx.fillStyle = '#ffd46b';
        ctx.arc(x+TILE/2,y+TILE/2,10,0,Math.PI*2);
        ctx.fill();
      } else if(ch === 'T'){ // trap spike
        ctx.fillStyle = '#14060a';
        ctx.fillRect(x,y,TILE,TILE);
        // draw spikes
        for(let i=0;i<3;i++){
          ctx.beginPath();
          ctx.moveTo(x + 10 + i*14, y + TILE - 6);
          ctx.lineTo(x + 17 + i*14, y + 10);
          ctx.lineTo(x + 24 + i*14, y + TILE - 6);
          ctx.closePath();
          ctx.fillStyle = '#ff6b6b';
          ctx.fill();
        }
      } else if(ch === 'E'){ // exit
        ctx.fillStyle = '#080a0f';
        ctx.fillRect(x,y,TILE,TILE);
        // glowing portal
        ctx.beginPath();
        const grad = ctx.createRadialGradient(x+TILE/2,y+TILE/2,6,x+TILE/2,y+TILE/2,28);
        grad.addColorStop(0,'#ff6bff');
        grad.addColorStop(1,'rgba(255,107,255,0)');
        ctx.fillStyle = grad;
        ctx.arc(x+TILE/2,y+TILE/2,28,0,Math.PI*2);
        ctx.fill();
      }
      // grid lines (subtle)
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.strokeRect(x,y,TILE,TILE);
    }
  }
}

// draw player
function drawPlayer(dt){
  // neon trail (particles)
  particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life/60);
    ctx.fillStyle = 'rgba(110,220,255,0.6)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(1, p.life/8),0,Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  // player body
  const px = player.x, py = player.y;
  ctx.fillStyle = '#00ffd1';
  roundRect(ctx, px, py, PLAYER_SIZE, PLAYER_SIZE, 6, true, false);

  // inner glow
  ctx.fillStyle = 'rgba(0,255,200,0.22)';
  roundRect(ctx, px+6, py+6, PLAYER_SIZE-12, PLAYER_SIZE-12, 4, true, false);
}

// small helper: rounded rect
function roundRect(ctx, x, y, w, h, r, fill, stroke){
  if (typeof r === 'undefined') r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if(fill) ctx.fill();
  if(stroke) ctx.stroke();
}

// ============ GAME LOOP ============
let lastTime = 0;
function gameLoop(ts){
  const dt = (ts - lastTime)/1000;
  lastTime = ts;

  if(state === 'PLAYING'){
    // handle input & physics
    handleInput(dt);
    // update particles
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.x += p.vx * 40 * dt;
      p.y += p.vy * 40 * dt;
      p.life -= 30 * dt;
      if(p.life <= 0) particles.splice(i,1);
    }
    // check collect
    collectAtPlayer();
  }

  // render
  ctx.clearRect(0,0,CANVAS_SIZE,CANVAS_SIZE);
  drawMap();
  drawPlayer(dt);

  // draw HUD cross-check in canvas center if needed (not necessary)
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// ============ INPUT HANDLING ============
window.addEventListener('keydown', (e)=>{
  keys[e.key.toLowerCase()] = true;
  if(e.key === 'r' || e.key === 'R') {
    restartGame();
  }
});
window.addEventListener('keyup', (e)=>{ keys[e.key.toLowerCase()] = false; });

function handleInput(dt){
  let mx = 0, my = 0;
  if(keys['arrowleft'] || keys['a']) mx = -1;
  if(keys['arrowright'] || keys['d']) mx = 1;
  if(keys['arrowup'] || keys['w']) my = -1;
  if(keys['arrowdown'] || keys['s']) my = 1;

  // normalize diagonal
  if(mx!==0 && my!==0){
    const v = Math.sqrt(2)/2;
    mx *= v; my *= v;
  }

  const vx = mx * player.speed * dt;
  const vy = my * player.speed * dt;

  // try move X
  const newX = player.x + vx;
  if(!isWallAtRect(newX, player.y, PLAYER_SIZE, PLAYER_SIZE)){
    player.x = newX;
  }
  // try move Y
  const newY = player.y + vy;
  if(!isWallAtRect(player.x, newY, PLAYER_SIZE, PLAYER_SIZE)){
    player.y = newY;
  }

  // neon trail spawn
  if(Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1){
    particles.push({ x: player.x+PLAYER_SIZE/2, y: player.y+PLAYER_SIZE/2,
                     vx: (Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4, life: 30 });
  }
}

// ============ UI / Menu handling ============
btnStart.onclick = ()=>{
  if(state === 'MENU' || state === 'GAMEOVER' || state === 'WIN'){
    score = 0; lives = 3; level = 1;
    loadLevel(level);
    state='PLAYING';
  } else if(state === 'PAUSED'){
    state='PLAYING';
  } else if(state === 'PLAYING'){
    // pause
    state='PAUSED';
    showOverlay('Paused','Game paused',[
      { text:'Resume', primary:true, onClick: ()=>{ state='PLAYING'; timerInterval = setInterval(()=>{ if(state === 'PLAYING') { timeLeft--; timerLabel.innerText = "Time: "+timeLeft; if(timeLeft<=0){ clearInterval(timerInterval; ); loseLife('Time up!'); } } },1000); } },
      { text:'Quit', primary:false, onClick: ()=>{ state='MENU'; showMenu(); } }
    ]);
  }
};

btnHow.onclick = ()=>{
  showOverlay('How to Play', 'Controls: Arrow keys / WASD to move. Collect coins (C) to gain points and +5 seconds. Avoid traps (T). Reach the exit (E) to progress to next level. Press R to restart.', [
    { text:'Got it', primary:true, onClick: ()=>{} }
  ]);
};

function showMenu(){
  showOverlay('NEblox Game', 'Welcome to NEblox! Start your maze adventure.', [
    { text:'Start Game', primary:true, onClick: ()=>{ score=0; lives=3; level=1; loadLevel(level); state='PLAYING'; } },
    { text:'How to Play', primary:false, onClick: ()=>{ btnHow.click(); } }
  ]);
}

// initial menu
showMenu();

// ============ STARTUP ============
loadLevel(level);

// ============ END of script ============
const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const playBtn = document.getElementById("playBtn");

// Saat PLAY ditekan → masuk game
playBtn.addEventListener("click", () => {
    menuScreen.style.display = "none";    // hilangkan menu
    gameScreen.style.display = "block";   // tampilkan game

    startGame(); // fungsi mulai game
});
function startGame() {
    resetPlayer();
    resetTimer();
    level = 1;
    currentMap = maps[level];
    gameLoop();
}

