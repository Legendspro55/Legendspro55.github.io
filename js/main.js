// Scroll suave
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}
  });
});

// ================= Starfield (constellation) background =================
(function(){
  const c = document.getElementById('starfield');
  if(!c) return;
  const ctx = c.getContext('2d');
  let w, h, particles;
  const DENSITY = 0.000045; // puntos por pixel
  const MAX_SPEED = 0.18;
  const LINK_DIST = 100; // distancia para conectar
  const LINE_ALPHA = 0.08;

  function resize(){
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    const targetCount = Math.max(60, Math.floor(w*h*DENSITY));
    particles = new Array(targetCount).fill(0).map(()=> ({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()*2-1)*MAX_SPEED,
      vy: (Math.random()*2-1)*MAX_SPEED
    }));
  }

  function step(){
    ctx.clearRect(0,0,w,h);
    // Move
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
    }
    // Draw points
    ctx.fillStyle = 'rgba(255, 215, 0, 0.55)';
    for(const p of particles){
      ctx.beginPath();
      ctx.arc(p.x, p.y, 0.9, 0, Math.PI*2);
      ctx.fill();
    }
    // Draw links
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const d = Math.hypot(dx, dy);
        if(d < LINK_DIST){
          ctx.globalAlpha = Math.max(0, LINE_ALPHA * (1 - d/LINK_DIST));
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize();
  step();
})();

// ================= Countdown (persistente por 48h) =================
(function(){
  const el = document.getElementById('countdown');
  if(!el) return;
  const KEY = 'lc_deadline_v1';
  let deadline = localStorage.getItem(KEY);
  if(!deadline){
    const d = new Date();
    d.setHours(d.getHours() + 48);
    deadline = d.toISOString();
    localStorage.setItem(KEY, deadline);
  }
  function tick(){
    const now = new Date();
    const end = new Date(deadline);
    let diff = Math.max(0, end - now);
    const h = String(Math.floor(diff/3_600_000)).padStart(2,'0');
    diff %= 3_600_000;
    const m = String(Math.floor(diff/60_000)).padStart(2,'0');
    diff %= 60_000;
    const s = String(Math.floor(diff/1000)).padStart(2,'0');
    el.textContent = `${h}:${m}:${s}`;
    if(end - now <= 0){
      // Renovar ventana 48h
      const d = new Date();
      d.setHours(d.getHours() + 48);
      deadline = d.toISOString();
      localStorage.setItem(KEY, deadline);
    }
  }
  tick();
  setInterval(tick, 1000);
})();
