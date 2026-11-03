// ── Cherry on Neapolitan ──────────────────────────────────────
// Pure vanilla JS + Canvas — no libraries!

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

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
  ctx.fillRect(0, third * 2, W, third);

  // subtle divider lines (like ice cream layers)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, third);
  ctx.lineTo(W, third);
  ctx.moveTo(0, third * 2);
  ctx.lineTo(W, third * 2);
  ctx.stroke();
}

// ── Cherry ───────────────────────────────────────────────────
const cherry = {
  x: W / 2,
  y: H * 0.3,
  radius: 22,
  vx: 4,
  vy: -2,
  rotation: 0,    // stem rotation
  spinSpeed: 0,
};

function updateCherry() {
  cherry.vy += 0.15; // gravity
  cherry.x += cherry.vx;
  cherry.y += cherry.vy;

  // spin based on horizontal velocity
  cherry.spinSpeed = cherry.vx * 0.03;
  cherry.rotation += cherry.spinSpeed;

  // bounce off walls
  if (cherry.x - cherry.radius <= 0) {
    cherry.x = cherry.radius;
    cherry.vx = Math.abs(cherry.vx);
  } else if (cherry.x + cherry.radius >= W) {
    cherry.x = W - cherry.radius;
    cherry.vx = -Math.abs(cherry.vx);
  }

  if (cherry.y - cherry.radius - 20 <= 0) { // extra space for stem
    cherry.y = cherry.radius + 20;
    cherry.vy = Math.abs(cherry.vy);
  }

  // floor bounce — keep it alive
  if (cherry.y + cherry.radius >= H) {
    cherry.y = H - cherry.radius;
    cherry.vy = -(Math.abs(cherry.vy) * 0.82 + 2.5);
    if (Math.abs(cherry.vy) < 5) cherry.vy = -7;
    if (Math.abs(cherry.vx) < 2) cherry.vx = (Math.random() > 0.5 ? 1 : -1) * 3.5;
  }
}

function drawCherry() {
  const { x, y, radius, rotation } = cherry;

  ctx.save();
  ctx.translate(x, y);

  // ── Stem ──
  ctx.save();
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, -radius + 2);
  // curved stem
  ctx.bezierCurveTo(
    -4, -radius - 15,
    8, -radius - 25,
    3, -radius - 35
  );
  ctx.strokeStyle = '#3a6b2a';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // ── Leaf ──
  ctx.beginPath();
  ctx.ellipse(-4, -radius - 22, 9, 5, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = '#4a8b3a';
  ctx.fill();
  // leaf vein
  ctx.beginPath();
  ctx.moveTo(-9, -radius - 23);
  ctx.lineTo(1, -radius - 21);
  ctx.strokeStyle = '#3a7a2a';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.restore();

  // ── Shadow on surface ──
  ctx.beginPath();
  ctx.ellipse(3, radius - 2, radius * 0.7, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.fill();

  // ── Cherry body ──
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

  // ── Shiny highlight ──
  ctx.beginPath();
  ctx.ellipse(-radius * 0.3, -radius * 0.35, radius * 0.32, radius * 0.22, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fill();

  // tiny secondary highlight
  ctx.beginPath();
  ctx.arc(radius * 0.25, radius * 0.2, radius * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fill();

  ctx.restore();
}

// ── Animation loop ────────────────────────────────────────────
function animate() {
  drawBackground();
  updateCherry();
  drawCherry();
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
