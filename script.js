// ===== 1. COUNTDOWN =====
// Counts down to 16 Dec 2026, 9:00 AM (India time)
const target = new Date('2026-12-16T09:00:00+05:30').getTime();

function updateCountdown() {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const seconds = Math.floor(diff / 1000) % 60;

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ===== 2. CARDS (each one links to its page on techfest.org) =====
const events = [
  { icon: '🛠️', title: 'Workshops', link: 'https://techfest.org/workshops' },
  { icon: '🏆', title: 'Competitions', link: 'https://techfest.org/competitions' },
  { icon: '🤖', title: 'Robowars', link: 'https://techfest.org/robowars' },
  { icon: '🎤', title: 'Lectures', link: 'https://techfest.org/lectures' },
  { icon: '🔭', title: 'Exhibitions', link: 'https://techfest.org/exhibitions' },
  { icon: '🤝', title: 'Social Initiative', link: 'https://techfest.org/social-initiative' },
  { icon: '🌍', title: 'Techfest World MUN', link: 'https://techfest.org/twmun' }
];

const grid = document.getElementById('eventGrid');
events.forEach(function (ev, i) {
  const card = document.createElement('a');
  card.className = 'card';
  card.href = ev.link;
  card.target = '_blank';
  card.rel = 'noopener';
  card.style.transitionDelay = i * 0.08 + 's';   // cards appear one after another
  card.innerHTML = '<div class="icon">' + ev.icon + '</div><h3>' + ev.title + '</h3><span class="more">Open page →</span>';
  grid.appendChild(card);
});

// ===== 3. FLY IN WHEN SCROLLED INTO VIEW =====
document.querySelectorAll('.section h2, .card').forEach(function (el) {
  el.classList.add('hidden');
});

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.remove('hidden');
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.hidden').forEach(function (el) { observer.observe(el); });

// ===== 4. PARTICLE BACKGROUND (2D canvas) =====
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
const particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

for (let i = 0; i < 70; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(function (p, i) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(34, 211, 238, 0.8)';
    ctx.fill();

    // join nearby dots with a line
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dist = Math.hypot(p.x - q.x, p.y - q.y);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = 'rgba(139, 92, 246,' + (1 - dist / 120) * 0.4 + ')';
        ctx.stroke();
      }
    }
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== 5. 3D GLOBE =====
// Dots are placed on a sphere in 3D (x, y, z). Each frame they are rotated with
// sin/cos and then projected onto the 2D canvas. Far dots are smaller and dimmer.
const globe = document.getElementById('globe');
const g = globe.getContext('2d');
const SIZE = 760;
globe.width = SIZE;
globe.height = SIZE;

const points = [];
const COUNT = 450;
for (let i = 0; i < COUNT; i++) {
  const y = 1 - (i / (COUNT - 1)) * 2;              // from 1 down to -1
  const radius = Math.sqrt(1 - y * y);
  const theta = Math.PI * (3 - Math.sqrt(5)) * i;   // golden angle spreads points evenly
  points.push({ x: Math.cos(theta) * radius, y: y, z: Math.sin(theta) * radius });
}

let angleY = 0;
let angleX = 0.4;
let mouseX = 0, mouseY = 0;
let burst = 0;           // grows to 1 when the globe is clicked, then fades back to 0
let scrollProgress = 0;  // 0 at the top of the page, 1 at the bottom

window.addEventListener('mousemove', function (e) {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;   // -1 (left) to 1 (right)
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;  // -1 (top) to 1 (bottom)
});

// clicking on empty space (not a link or the cube) makes the globe burst outward
window.addEventListener('click', function (e) {
  if (e.target.closest('a, #cubeScene')) return;
  burst = 1;
});

function drawGlobe() {
  g.clearRect(0, 0, SIZE, SIZE);

  angleY += 0.003 + mouseX * 0.004;                          // mouse changes spin speed and direction
  angleX += (0.4 + mouseY * 0.5 - angleX) * 0.05;            // ease towards the mouse tilt
  burst *= 0.95;

  // scrolling also turns the globe, moves it left/right and changes its size
  const rotation = angleY + scrollProgress * Math.PI * 4;
  const R = SIZE * 0.4 * (1 + burst * 0.5) * (1 - 0.3 * Math.sin(scrollProgress * Math.PI));
  const fov = 3;

  points.forEach(function (p) {
    // rotate around the Y axis
    const x = p.x * Math.cos(rotation) - p.z * Math.sin(rotation);
    let z = p.x * Math.sin(rotation) + p.z * Math.cos(rotation);
    // rotate around the X axis
    const y = p.y * Math.cos(angleX) - z * Math.sin(angleX);
    z = p.y * Math.sin(angleX) + z * Math.cos(angleX);

    // perspective: farther points (bigger z) are scaled down
    const scale = fov / (fov + z);
    const sx = SIZE / 2 + x * R * scale;
    const sy = SIZE / 2 + y * R * scale;

    const depth = (z + 1) / 2;   // 0 = near, 1 = far
    g.beginPath();
    g.arc(sx, sy, 2.4 * scale + burst * 2, 0, Math.PI * 2);
    g.fillStyle = 'rgba(34, 211, 238,' + (1 - depth * 0.8) + ')';
    g.fill();
  });
  requestAnimationFrame(drawGlobe);
}
drawGlobe();

// ===== 6. SCROLL-DRIVEN 3D =====
const sections = document.querySelectorAll('.section');
const hero = document.querySelector('.hero');

function onScroll() {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  // move the globe sideways as the page scrolls (it swings left and right)
  const shift = Math.sin(scrollProgress * Math.PI * 2) * window.innerWidth * 0.22;
  globe.style.transform = 'translate(calc(-50% + ' + shift + 'px), -50%)';

  // each section tilts back and sinks into the screen as it moves away from the centre
  sections.forEach(function (sec) {
    const box = sec.getBoundingClientRect();
    const d = (box.top + box.height / 2 - window.innerHeight / 2) / window.innerHeight; // 0 = centred
    const far = Math.min(Math.abs(d), 1);
    sec.style.transform = 'perspective(1000px) rotateX(' + (-d * 14) + 'deg) translateZ(' + (-far * 150) + 'px)';
    sec.style.opacity = 1 - far * 0.55;
  });

  // the hero tilts away as you scroll past it
  const heroAmount = Math.min(window.scrollY / window.innerHeight, 1);
  hero.style.transform = 'perspective(1000px) rotateX(' + (heroAmount * 25) + 'deg) translateZ(' + (-heroAmount * 200) + 'px)';
  hero.style.opacity = 1 - heroAmount * 0.8;
}
window.addEventListener('scroll', onScroll);
window.addEventListener('resize', onScroll);
onScroll();

// ===== 7. HERO TEXT FOLLOWS THE MOUSE =====
const heroText = document.querySelector('.hero-text');
window.addEventListener('mousemove', function (e) {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  heroText.style.transform = 'perspective(900px) rotateY(' + x * 5 + 'deg) rotateX(' + -y * 4 + 'deg)';
});

// ===== 8. 3D TILT ON CARDS =====
document.querySelectorAll('.card').forEach(function (card) {
  card.addEventListener('mousemove', function (e) {
    const box = card.getBoundingClientRect();
    const px = (e.clientX - box.left) / box.width;    // 0 to 1 across the card
    const py = (e.clientY - box.top) / box.height;    // 0 to 1 down the card
    card.style.transition = 'border-color 0.25s, box-shadow 0.25s';   // no delay while tilting
    card.style.transform = 'rotateY(' + (px - 0.5) * 20 + 'deg) rotateX(' + (0.5 - py) * 20 + 'deg) translateY(-6px)';
    card.style.setProperty('--mx', px * 100 + '%');
    card.style.setProperty('--my', py * 100 + '%');
  });
  card.addEventListener('mouseleave', function () {
    card.style.transition = 'transform 0.4s, border-color 0.25s, box-shadow 0.25s';
    card.style.transform = '';
  });
});

// ===== 9. DRAGGABLE CUBE =====
const cube = document.getElementById('cube');
const cubeScene = document.getElementById('cubeScene');
let rotX = -20, rotY = 30;
let dragging = false, lastX = 0, lastY = 0;

cubeScene.addEventListener('mousedown', function (e) { dragging = true; lastX = e.clientX; lastY = e.clientY; });
window.addEventListener('mouseup', function () { dragging = false; });
window.addEventListener('mousemove', function (e) {
  if (!dragging) return;
  rotY += (e.clientX - lastX) * 0.6;
  rotX -= (e.clientY - lastY) * 0.6;
  lastX = e.clientX;
  lastY = e.clientY;
});
cubeScene.addEventListener('touchstart', function (e) { dragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; });
cubeScene.addEventListener('touchmove', function (e) {
  rotY += (e.touches[0].clientX - lastX) * 0.6;
  rotX -= (e.touches[0].clientY - lastY) * 0.6;
  lastX = e.touches[0].clientX;
  lastY = e.touches[0].clientY;
});
cubeScene.addEventListener('touchend', function () { dragging = false; });

function spinCube() {
  if (!dragging) rotY += 0.4;   // slow spin when not being dragged
  cube.style.transform = 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
  requestAnimationFrame(spinCube);
}
spinCube();

// ===== 10. REMOVE THE INTRO DOORS WHEN THEIR ANIMATION ENDS =====
setTimeout(function () { document.getElementById('intro').classList.add('done'); }, 2700);
