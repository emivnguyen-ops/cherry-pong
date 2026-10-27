let ball;
let trail = [];
const MAX_TRAIL = 20;

function setup() {
  let canvas = createCanvas(windowWidth - 40, windowHeight - 40);
  canvas.parent('canvas-container');
  ball = {
    x: width / 2,
    y: height / 2,
    vx: random(3, 6) * (random() > 0.5 ? 1 : -1),
    vy: random(3, 6) * (random() > 0.5 ? 1 : -1),
    radius: 25,
    hue: 0
  };
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  background(240, 20, 12, 30);

  // Update hue
  ball.hue = (ball.hue + 1) % 360;

  // Apply gravity
  ball.vy += 0.15;

  // Update position
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Bounce off walls
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx *= -0.98;
  } else if (ball.x + ball.radius > width) {
    ball.x = width - ball.radius;
    ball.vx *= -0.98;
  }

  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy *= -0.98;
  } else if (ball.y + ball.radius > height) {
    ball.y = height - ball.radius;
    ball.vy *= -0.98;

    // Add a little random energy on floor bounce to keep it lively
    if (abs(ball.vy) < 2) {
      ball.vy -= random(3, 6);
    }
  }

  // Store trail
  trail.push({ x: ball.x, y: ball.y, hue: ball.hue });
  if (trail.length > MAX_TRAIL) trail.shift();

  // Draw trail
  noStroke();
  for (let i = 0; i < trail.length; i++) {
    let alpha = map(i, 0, trail.length, 5, 50);
    let size = map(i, 0, trail.length, 5, ball.radius * 2);
    fill(trail[i].hue, 80, 90, alpha);
    ellipse(trail[i].x, trail[i].y, size);
  }

  // Draw ball with glow
  for (let r = ball.radius * 3; r > ball.radius; r -= 4) {
    let alpha = map(r, ball.radius, ball.radius * 3, 30, 0);
    fill(ball.hue, 70, 95, alpha);
    ellipse(ball.x, ball.y, r * 2);
  }

  // Main ball
  fill(ball.hue, 80, 100);
  ellipse(ball.x, ball.y, ball.radius * 2);

  // Highlight
  fill(0, 0, 100, 40);
  ellipse(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.8);
}

function windowResized() {
  resizeCanvas(windowWidth - 40, windowHeight - 40);
}

