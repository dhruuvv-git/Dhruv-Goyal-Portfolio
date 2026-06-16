const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let activeParticles = [];
let backgroundDust = [];

const mouse = {
  x: null,
  y: null,
  radius: 170 // Interactive field radius
};

// Resize Canvas
function initCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
initCanvasSize();

window.addEventListener('resize', () => {
  initCanvasSize();
  initParticles();
});

// Capture Cursor Position
window.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

// Interactive Foreground Particle
class InteractiveParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    
    this.size = Math.random() * 2.2 + 0.8;
    this.density = (Math.random() * 25) + 10;
    
    // Orbital drift parameters
    this.angle = Math.random() * Math.PI * 2;
    this.angleSpeed = (Math.random() * 0.015) - 0.0075;
    
    const randColor = Math.random();
    if (randColor > 0.82) {
      this.color = '#D10000'; // Accent Crimson
      this.size = Math.random() * 2.8 + 1.5; // Larger accent nodes
      this.glow = true;
    } else if (randColor > 0.45) {
      this.color = 'rgba(255, 255, 255, 0.45)'; // Bright White
      this.glow = false;
    } else {
      this.color = 'rgba(255, 255, 255, 0.18)'; // Muted White
      this.glow = false;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    
    if (this.glow) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#D10000';
    } else {
      ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow immediately for next items
  }

  update() {
    // Ambient orbital float
    this.angle += this.angleSpeed;
    this.baseX += Math.sin(this.angle) * 0.12;
    this.baseY += Math.cos(this.angle) * 0.12;

    // Interaction with cursor forces
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        const pushX = dirX * force * this.density * 2.5;
        const pushY = dirY * force * this.density * 2.5;
        
        const targetX = this.baseX - pushX;
        const targetY = this.baseY - pushY;
        
        this.x += (targetX - this.x) * 0.14;
        this.y += (targetY - this.y) * 0.14;
        return;
      }
    }

    // Spring back to home coordinates
    this.x += (this.baseX - this.x) * 0.07;
    this.y += (this.baseY - this.y) * 0.07;
  }
}

// Faint Background Parallax Dust (Non-interactive, purely aesthetic)
class BackgroundDust {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.2 + 0.4;
    this.speedX = (Math.random() * 0.2) - 0.1;
    this.speedY = (Math.random() * 0.15) + 0.05; // Drifts slowly downwards
    this.color = Math.random() > 0.5 ? 'rgba(209, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.06)';
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Re-spawns at top/sides when leaving screen
    if (this.y > canvas.height) {
      this.y = 0;
      this.x = Math.random() * canvas.width;
    }
    if (this.x < 0 || this.x > canvas.width) {
      this.x = Math.random() * canvas.width;
    }
  }
}

// Populate Particles
function initParticles() {
  activeParticles = [];
  backgroundDust = [];
  
  const widthFactor = canvas.width * canvas.height;
  
  // Calculate counts based on screen surface area
  const activeCount = Math.min(Math.floor(widthFactor / 7000), 200);
  const dustCount = Math.min(Math.floor(widthFactor / 10000), 120);

  // Foreground
  for (let i = 0; i < activeCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    activeParticles.push(new InteractiveParticle(x, y));
  }

  // Background
  for (let i = 0; i < dustCount; i++) {
    backgroundDust.push(new BackgroundDust());
  }
}
initParticles();

// Connecting Network Lines
function drawConnections() {
  const maxDistance = 125;
  for (let a = 0; a < activeParticles.length; a++) {
    for (let b = a + 1; b < activeParticles.length; b++) {
      const dx = activeParticles[a].x - activeParticles[b].x;
      const dy = activeParticles[a].y - activeParticles[b].y;
      const distance = Math.hypot(dx, dy);

      if (distance < maxDistance) {
        const opacity = (1 - (distance / maxDistance)) * 0.1;
        
        if (activeParticles[a].color === '#D10000' || activeParticles[b].color === '#D10000') {
          ctx.strokeStyle = `rgba(209, 0, 0, ${opacity * 1.8})`;
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        }
        
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(activeParticles[a].x, activeParticles[a].y);
        ctx.lineTo(activeParticles[b].x, activeParticles[b].y);
        ctx.stroke();
      }
    }
  }
}

// Cursor Field Ripple Glow Aura
function drawCursorAura() {
  if (mouse.x !== null && mouse.y !== null) {
    const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
    gradient.addColorStop(0, 'rgba(209, 0, 0, 0.08)');
    gradient.addColorStop(0.4, 'rgba(209, 0, 0, 0.025)');
    gradient.addColorStop(1, 'rgba(209, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Animation Loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 1. Draw static background drift layers
  for (let i = 0; i < backgroundDust.length; i++) {
    backgroundDust[i].update();
    backgroundDust[i].draw();
  }

  // 2. Draw interactive cursor glow aura
  drawCursorAura();

  // 3. Draw active interactive network nodes
  for (let i = 0; i < activeParticles.length; i++) {
    activeParticles[i].update();
    activeParticles[i].draw();
  }
  
  // 4. Draw connecting grid lines
  drawConnections();
  
  requestAnimationFrame(animate);
}
animate();
