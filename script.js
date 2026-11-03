// ── Ice Cream Pong 🍨 ──────────────────────────────────────────
// Neapolitan-themed Pong with a sundae glass dish paddle & cherry ball

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ── Game state ────────────────────────────────────────────────
const PADDLE_BOTTOM_MARGIN = 60;
const BALL_RADIUS = 18;
const BRICK_ROWS = 0; // unused but leaving placeholder

let score = 0;
let lives = 3;
let gameState = 'start'; // 'start' | 'playing' | 'gameover'
let combo = 0;
let lastHitTime = 0;
let screenShake = 0;
let particles = [];
let sprinkles = []; // background sprinkles

// ── Paddle (sundae glass dish) ────────────────────────────────
const paddle = {
  x: 0,
  y: 0,
  width: 160,
  height: 40,
  targetX: 0,
};

// ── Ball (cherry) ─────────────────────────────────────────────
const ball = {
  x: W / 2,
  y: H / 2,
  radius: BALL_RADIUS,
  vx: 4,
  vy: -5,
  rotation: 0,
  spinSpeed: 0,
  trail: [],
};

// ── AI opponent paddle (top) ──────────────────────────────────
const aiPaddle = {
  x: W / 2,
  y: 50,
  width: 140,
  height: 35,
  speed: 4.5,
};

// ── Sprinkles (decorative background) ─────────────────────────
function initSprinkles() {
  sprinkles = [];
  for (let i = 0; i < 50; i++) {
    sprinkles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 3 + Math.random() * 5,
      rotation: Math.random() * Math.PI * 2,
      color: ['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#e83e8c'][Math.floor(Math.random() * 6)],
      speed: 0.2 + Math.random() * 0.5,
    });
  }
}
initSprinkles();

// ── Mouse / Touch input ───────────────────────────────────────
canvas.addEventListener('mousemove', (e) => {
  paddle.targetX = e.clientX;
});
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  paddle.targetX = e.touches[0].clientX;
}, { passive: false });
canvas.addEventListener('click', () => {
  if (gameState === 'start') startGame();
  else if (gameState === 'gameover') resetGame();
});
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  paddle.targetX = e.touches[0].clientX;
  if (gameState === 'start') startGame();
  else if (gameState === 'gameover') resetGame();
}, { passive: false });

function startGame() {
  gameState = 'playing';
  ball.x = W / 2;
  ball.y = H / 2;
  ball.vx = (Math.random() > 0.5 ? 1 : -1) * 4;
  ball.vy = -5;
  score = 0;
  lives = 3;
  combo = 0;
}

function resetGame() {
  startGame();
}

// ── Neapolitan background ────────────────────────────────────
function drawBackground() {
  const third = H / 3;

  // Strawberry
  const pink = ctx.createLinearGradient(0, 0, 0, third);
  pink.addColorStop(0, '#f4a0b0');
  pink.addColorStop(1, '#e8899a');
  ctx.fillStyle = pink;
  ctx.fillRect(0, 0, W, third);

  // Vanilla
  const vanilla = ctx.createLinearGradient(0, third, 0, third * 2);
  vanilla.addColorStop(0, '#fef3d0');
  vanilla.addColorStop(1, '#f5e6b8');
  ctx.fillStyle = vanilla;
  ctx.fillRect(0, third, W, third);

  // Chocolate
  const choco = ctx.createLinearGradient(0, third * 2, 0, H);
  choco.addColorStop(0, '#6b3a2a');
  choco.addColorStop(1, '#4a2518');
  ctx.fillStyle = choco;
  ctx.fillRect(0, third * 2, W, third + 1);

  // Subtle divider lines (like ice cream layers)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, third);
  ctx.lineTo(W, third);
  ctx.moveTo(0, third * 2);
  ctx.lineTo(W, third * 2);
  ctx.stroke();

  // Sprinkles
  sprinkles.forEach(s => {
    s.y += s.speed;
    s.rotation += 0.01;
    if (s.y > H + 10) { s.y = -10; s.x = Math.random() * W; }
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(-s.size / 2, -1.5, s.size, 3);
    ctx.globalAlpha = 1;
    ctx.restore();
  });
}

// ── Draw sundae glass dish paddle ─────────────────────────────
function drawSundaeDish(px, py, pw, ph, flipped) {
  ctx.save();
  ctx.translate(px, py);
  if (flipped) ctx.scale(1, -1);

  const w = pw;
  const h = ph;

  // Glass dish shadow
  ctx.beginPath();
  ctx.ellipse(0, h * 0.1, w * 0.55, h * 0.18, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fill();

  // Stem / base of sundae dish
  ctx.beginPath();
  ctx.moveTo(-12, h * 0.7);
  ctx.lineTo(12, h * 0.7);
  ctx.lineTo(8, h * 0.3);
  ctx.lineTo(-8, h * 0.3);
  ctx.closePath();
  const stemGrad = ctx.createLinearGradient(-12, 0, 12, 0);
  stemGrad.addColorStop(0, 'rgba(200, 220, 240, 0.5)');
  stemGrad.addColorStop(0.5, 'rgba(230, 240, 255, 0.7)');
  stemGrad.addColorStop(1, 'rgba(200, 220, 240, 0.5)');
  ctx.fillStyle = stemGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(180, 200, 230, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Foot / base
  ctx.beginPath();
  ctx.ellipse(0, h * 0.75, 18, 5, 0, 0, Math.PI * 2);
  const footGrad = ctx.createLinearGradient(-18, h * 0.7, 18, h * 0.8);
  footGrad.addColorStop(0, 'rgba(200, 220, 240, 0.5)');
  footGrad.addColorStop(0.5, 'rgba(240, 250, 255, 0.7)');
  footGrad.addColorStop(1, 'rgba(200, 220, 240, 0.5)');
  ctx.fillStyle = footGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(180, 200, 230, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Bowl of the dish (the catching part)
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h * 0.1);
  // Left side curve up and out
  ctx.bezierCurveTo(
    -w / 2, h * 0.3,
    -w * 0.2, h * 0.35,
    0, h * 0.3
  );
  // Right side curve
  ctx.bezierCurveTo(
    w * 0.2, h * 0.35,
    w / 2, h * 0.3,
    w / 2, -h * 0.1
  );

  // Top rim of bowl
  ctx.lineTo(w / 2 + 5, -h * 0.15);
  ctx.bezierCurveTo(
    w * 0.3, -h * 0.35,
    -w * 0.3, -h * 0.35,
    -w / 2 - 5, -h * 0.15
  );
  ctx.closePath();

  // Glass gradient
  const glassGrad = ctx.createLinearGradient(-w / 2, -h * 0.3, w / 2, h * 0.3);
  glassGrad.addColorStop(0, 'rgba(200, 230, 255, 0.35)');
  glassGrad.addColorStop(0.3, 'rgba(220, 240, 255, 0.25)');
  glassGrad.addColorStop(0.7, 'rgba(200, 230, 255, 0.3)');
  glassGrad.addColorStop(1, 'rgba(180, 210, 245, 0.35)');
  ctx.fillStyle = glassGrad;
  ctx.fill();

  // Glass edge highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner shine
  ctx.beginPath();
  ctx.moveTo(-w * 0.35, -h * 0.05);
  ctx.bezierCurveTo(
    -w * 0.3, h * 0.1,
    -w * 0.05, h * 0.12,
    w * 0.05, h * 0.05
  );
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Rim highlight
  ctx.beginPath();
  ctx.moveTo(-w / 2 - 3, -h * 0.14);
  ctx.bezierCurveTo(
    -w * 0.2, -h * 0.3,
    w * 0.2, -h * 0.3,
    w / 2 + 3, -h * 0.14
  );
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Scoops of ice cream in the dish!
  // Strawberry scoop (left)
  ctx.beginPath();
  ctx.arc(-w * 0.2, -h * 0.25, 14, 0, Math.PI * 2);
  const strawGrad = ctx.createRadialGradient(-w * 0.2 - 3, -h * 0.25 - 3, 2, -w * 0.2, -h * 0.25, 14);
  strawGrad.addColorStop(0, '#ffb6c8');
  strawGrad.addColorStop(1, '#e8899a');
  ctx.fillStyle = strawGrad;
  ctx.fill();
  // highlight
  ctx.beginPath();
  ctx.arc(-w * 0.2 - 4, -h * 0.25 - 4, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();

  // Vanilla scoop (center)
  ctx.beginPath();
  ctx.arc(0, -h * 0.32, 15, 0, Math.PI * 2);
  const vanGrad = ctx.createRadialGradient(-3, -h * 0.32 - 4, 2, 0, -h * 0.32, 15);
  vanGrad.addColorStop(0, '#fff8e7');
  vanGrad.addColorStop(1, '#f5e6b8');
  ctx.fillStyle = vanGrad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-4, -h * 0.32 - 5, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fill();

  // Chocolate scoop (right)
  ctx.beginPath();
  ctx.arc(w * 0.2, -h * 0.25, 14, 0, Math.PI * 2);
  const chocoGrad = ctx.createRadialGradient(w * 0.2 - 3, -h * 0.25 - 3, 2, w * 0.2, -h * 0.25, 14);
  chocoGrad.addColorStop(0, '#8B5E3C');
  chocoGrad.addColorStop(1, '#5a3520');
  ctx.fillStyle = chocoGrad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w * 0.2 - 4, -h * 0.25 - 4, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fill();

  ctx.restore();
}

// ── Update paddle ─────────────────────────────────────────────
function updatePaddle() {
  paddle.x += (paddle.targetX - paddle.x) * 0.15;
  paddle.x = Math.max(paddle.width / 2, Math.min(W - paddle.width / 2, paddle.x));
  paddle.y = H - PADDLE_BOTTOM_MARGIN;
}

// ── Update AI paddle ─────────────────────────────────────────
function updateAI() {
  const target = ball.x + ball.vx * 8;
  const diff = target - aiPaddle.x;
  const maxSpeed = aiPaddle.speed + Math.min(score * 0.05, 3);
  aiPaddle.x += Math.sign(diff) * Math.min(Math.abs(diff) * 0.08, maxSpeed);
  aiPaddle.x = Math.max(aiPaddle.width / 2, Math.min(W - aiPaddle.width / 2, aiPaddle.x));
}

// ── Ball / Cherry ─────────────────────────────────────────────
function updateBall() {
  if (gameState !== 'playing') return;

  ball.x += ball.vx;
  ball.y += ball.vy;

  ball.spinSpeed = ball.vx * 0.03;
  ball.rotation += ball.spinSpeed;

  // Trail
  ball.trail.push({ x: ball.x, y: ball.y, alpha: 1 });
  if (ball.trail.length > 12) ball.trail.shift();
  ball.trail.forEach(t => t.alpha *= 0.85);

  // Wall bounces
  if (ball.x - ball.radius <= 0) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx);
    spawnParticles(ball.x, ball.y, 5, '#ffb6c8');
  } else if (ball.x + ball.radius >= W) {
    ball.x = W - ball.radius;
    ball.vx = -Math.abs(ball.vx);
    spawnParticles(ball.x, ball.y, 5, '#ffb6c8');
  }

  // Player paddle collision (bottom)
  const pH = paddle.height;
  const pTop = paddle.y - pH * 0.35;
  if (ball.vy > 0 &&
      ball.y + ball.radius >= pTop &&
      ball.y + ball.radius <= pTop + pH &&
      ball.x >= paddle.x - paddle.width / 2 - ball.radius &&
      ball.x <= paddle.x + paddle.width / 2 + ball.radius) {
    ball.y = pTop - ball.radius;
    const hitPos = (ball.x - paddle.x) / (paddle.width / 2);
    ball.vx = hitPos * 7;
    ball.vy = -Math.abs(ball.vy);

    // Speed up slightly each hit
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    const newSpeed = Math.min(speed * 1.03, 14);
    const angle = Math.atan2(ball.vy, ball.vx);
    ball.vx = Math.cos(angle) * newSpeed;
    ball.vy = Math.sin(angle) * newSpeed;

    combo++;
    score += combo;
    lastHitTime = Date.now();
    screenShake = 5;
    spawnParticles(ball.x, ball.y, 15, '#ffd93d');
    spawnSprinkleParticles(ball.x, ball.y);
  }

  // AI paddle collision (top)
  const aiBottom = aiPaddle.y + aiPaddle.height * 0.35;
  if (ball.vy < 0 &&
      ball.y - ball.radius <= aiBottom &&
      ball.y - ball.radius >= aiBottom - aiPaddle.height &&
      ball.x >= aiPaddle.x - aiPaddle.width / 2 - ball.radius &&
      ball.x <= aiPaddle.x + aiPaddle.width / 2 + ball.radius) {
    ball.y = aiBottom + ball.radius;
    const hitPos = (ball.x - aiPaddle.x) / (aiPaddle.width / 2);
    ball.vx = hitPos * 6;
    ball.vy = Math.abs(ball.vy);
    spawnParticles(ball.x, ball.y, 8, '#c8a0ff');
  }

  // Ball goes past bottom → lose a life
  if (ball.y - ball.radius > H + 30) {
    lives--;
    combo = 0;
    screenShake = 10;
    if (lives <= 0) {
      gameState = 'gameover';
    } else {
      ball.x = W / 2;
      ball.y = H / 2;
      ball.vx = (Math.random() > 0.5 ? 1 : -1) * 4;
      ball.vy = -5;
    }
  }

  // Ball goes past top → score!
  if (ball.y + ball.radius < -30) {
    score += 10;
    combo++;
    screenShake = 6;
    spawnParticles(ball.x, 10, 20, '#6bcb77');
    ball.x = W / 2;
    ball.y = H / 2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.vy = 5;
  }

  // Ensure minimum speed
  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  if (speed < 4) {
    ball.vx *= 4 / speed;
    ball.vy *= 4 / speed;
  }
}

// ── Draw cherry ball ──────────────────────────────────────────
function drawCherry() {
  const { x, y, radius, rotation } = ball;

  // Trail
  ball.trail.forEach(t => {
    ctx.beginPath();
    ctx.arc(t.x, t.y, radius * 0.6 * t.alpha, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 60, 80, ${t.alpha * 0.3})`;
    ctx.fill();
  });

  ctx.save();
  ctx.translate(x, y);

  // Stem
  ctx.save();
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, -radius + 2);
  ctx.bezierCurveTo(-4, -radius - 12, 8, -radius - 20, 3, -radius - 28);
  ctx.strokeStyle = '#3a6b2a';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Leaf
  ctx.beginPath();
  ctx.ellipse(-4, -radius - 17, 7, 4, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = '#4a8b3a';
  ctx.fill();
  ctx.restore();

  // Cherry body
  const bodyGrad = ctx.createRadialGradient(
    -radius * 0.3, -radius * 0.3, radius * 0.1,
    0, 0, radius
  );
  bodyGrad.addColorStop(0, '#ff3040');
  bodyGrad.addColorStop(0.5, '#d42030');
  bodyGrad.addColorStop(0.85, '#a01520');
  bodyGrad.addColorStop(1, '#7a1018');
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Highlight
  ctx.beginPath();
  ctx.ellipse(-radius * 0.3, -radius * 0.35, radius * 0.3, radius * 0.2, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fill();

  ctx.restore();
}

// ── Particles ─────────────────────────────────────────────────
function spawnParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 4,
      color,
      alpha: 1,
      life: 1,
    });
  }
}

function spawnSprinkleParticles(x, y) {
  const colors = ['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#e83e8c'];
  for (let i = 0; i < 8; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const speed = 3 + Math.random() * 5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      life: 1,
      isSprinkle: true,
      rotation: Math.random() * Math.PI,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // gravity
    p.life -= 0.025;
    p.alpha = p.life;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    if (p.isSprinkle) {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.radius, -1.5, p.radius * 2, 3);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.restore();
  });
}

// ── HUD ───────────────────────────────────────────────────────
function drawHUD() {
  // Score
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 28px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`🍨 ${score}`, 20, 40);

  // Lives (ice cream cones)
  ctx.textAlign = 'right';
  let livesStr = '';
  for (let i = 0; i < lives; i++) livesStr += '🍦';
  ctx.fillText(livesStr, W - 20, 40);

  // Combo
  if (combo > 1 && Date.now() - lastHitTime < 2000) {
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
    const comboAlpha = Math.max(0, 1 - (Date.now() - lastHitTime) / 2000);
    ctx.fillStyle = `rgba(255, 217, 61, ${comboAlpha})`;
    ctx.fillText(`${combo}x COMBO! 🍒`, W / 2, H / 2);
  }

  ctx.restore();
}

// ── Start / Game Over screens ─────────────────────────────────
function drawStartScreen() {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';

  ctx.font = 'bold 56px "Trebuchet MS", sans-serif';
  ctx.fillText('🍨 Ice Cream Pong 🍨', W / 2, H / 2 - 60);

  ctx.font = '22px "Trebuchet MS", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('Move your sundae dish to bounce the cherry!', W / 2, H / 2);

  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.fillStyle = '#ffd93d';
  const pulse = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
  ctx.globalAlpha = pulse;
  ctx.fillText('🍒 Click or Tap to Start 🍒', W / 2, H / 2 + 60);

  ctx.restore();
}

function drawGameOverScreen() {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';

  ctx.font = 'bold 50px "Trebuchet MS", sans-serif';
  ctx.fillText('🫠 Game Over!', W / 2, H / 2 - 60);

  ctx.font = '28px "Trebuchet MS", sans-serif';
  ctx.fillStyle = '#ffd93d';
  ctx.fillText(`Final Score: ${score}`, W / 2, H / 2);

  ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  const pulse = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
  ctx.globalAlpha = pulse;
  ctx.fillText('Click or Tap to Play Again', W / 2, H / 2 + 60);

  ctx.restore();
}

// ── Animation loop ────────────────────────────────────────────
function animate() {
  // Screen shake
  ctx.save();
  if (screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * screenShake;
    const shakeY = (Math.random() - 0.5) * screenShake;
    ctx.translate(shakeX, shakeY);
    screenShake *= 0.85;
    if (screenShake < 0.5) screenShake = 0;
  }

  drawBackground();

  if (gameState === 'playing') {
    updatePaddle();
    updateAI();
    updateBall();
    updateParticles();
  }

  // Draw AI dish (flipped, top)
  drawSundaeDish(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height, true);

  // Draw player dish (bottom)
  drawSundaeDish(paddle.x, paddle.y, paddle.width, paddle.height, false);

  drawCherry();
  drawParticles();
  drawHUD();

  ctx.restore();

  if (gameState === 'start') drawStartScreen();
  if (gameState === 'gameover') drawGameOverScreen();

  requestAnimationFrame(animate);
}

// Init paddle position
paddle.x = W / 2;
paddle.targetX = W / 2;

requestAnimationFrame(animate);
