/* ===================================================
   RAVENDER PRATAP SINGH — PORTFOLIO SCRIPT
   Custom cursor, animated bg, tilt, counters,
   scroll-reveals, fluid canvas, form handling
=================================================== */

(function () {
  'use strict';

  /* ── UTILS ─────────────────────────────────────── */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const raf = requestAnimationFrame.bind(window);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ── LOADER ─────────────────────────────────────── */
  window.addEventListener('load', () => {
    setTimeout(() => {
      var loader = $('#loader');
      if (loader) loader.classList.add('hidden');
    }, 2000);
  });

  /* ── CUSTOM CURSOR ──────────────────────────────── */
  var ring = $('#cursorRing');
  var dot  = $('#cursorDot');
  if (ring && dot) {
    var mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', function(e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    (function moveCursor() {
      rx = lerp(rx, mx, 0.12);
      ry = lerp(ry, my, 0.12);
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      raf(moveCursor);
    })();

    var interactables = 'a, button, [data-tilt], input, textarea, .skill-pill, .tag, .tool-badge';
    document.addEventListener('mouseover', function(e) {
      if (e.target.closest(interactables)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', function(e) {
      if (e.target.closest(interactables)) document.body.classList.remove('cursor-hover');
    });
    document.addEventListener('mousedown', function() { document.body.classList.add('cursor-active'); });
    document.addEventListener('mouseup',   function() { document.body.classList.remove('cursor-active'); });
  }

  /* ── ANIMATED MESH BACKGROUND ───────────────────── */
  (function initMesh() {
    var canvas = $('#meshCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, particles = [];
    var COUNT = 80;
    var mouseX, mouseY;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      mouseX = W / 2;
      mouseY = H / 2;
    }

    function mkParticle() {
      var hues = [260, 275, 165, 190, 45];
      return {
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r:  0.8 + Math.random() * 1.4,
        hue: hues[Math.floor(Math.random() * hues.length)],
        alpha: 0.35 + Math.random() * 0.45
      };
    }

    function init() {
      particles = [];
      for (var i = 0; i < COUNT; i++) particles.push(mkParticle());
    }

    window.addEventListener('mousemove', function(e) { mouseX = e.clientX; mouseY = e.clientY; });

    function draw() {
      ctx.clearRect(0, 0, W, H);

      var grd = ctx.createRadialGradient(mouseX, mouseY, 0, W/2, H/2, Math.max(W, H));
      grd.addColorStop(0, 'rgba(167,139,250,0.07)');
      grd.addColorStop(0.35, 'rgba(94,231,194,0.04)');
      grd.addColorStop(0.7, 'rgba(240,192,96,0.02)');
      grd.addColorStop(1, 'rgba(6,6,14,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var p = particles[i], q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(167,139,250,' + (0.07 * (1 - dist/130)) + ')';
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < particles.length; k++) {
        var pt = particles[k];
        var ddx = mouseX - pt.x, ddy = mouseY - pt.y;
        var d = Math.sqrt(ddx*ddx + ddy*ddy);
        if (d < 180 && d > 0) {
          pt.vx += ddx / d * 0.012;
          pt.vy += ddy / d * 0.012;
        }
        pt.vx *= 0.98; pt.vy *= 0.98;
        pt.x += pt.vx; pt.y += pt.vy;
        if (pt.x < 0) pt.x = W;
        if (pt.x > W) pt.x = 0;
        if (pt.y < 0) pt.y = H;
        if (pt.y > H) pt.y = 0;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI*2);
        var hueMap = [260, 280, 170, 200, 45, 55]; // lavender, violet, mint, cyan, gold, amber
        var hueChoice = hueMap[Math.floor(Math.random() * hueMap.length)];
        ctx.fillStyle = 'hsla(' + hueChoice + ',70%,75%,' + pt.alpha + ')';
        ctx.fill();
      }

      raf(draw);
    }

    window.addEventListener('resize', function() { resize(); init(); });
    resize(); init(); draw();
  })();

  /* ── HEADER SCROLL ──────────────────────────────── */
  var header = $('#header');
  if (header) {
    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 30);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── MOBILE MENU ────────────────────────────────── */
  var menuBtn    = $('#menuToggle');
  var mobileMenu = $('#mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('open');
    });
    $$('.mobile-nav-link').forEach(function(a) {
      a.addEventListener('click', function() { mobileMenu.classList.remove('open'); });
    });
  }

  /* ── INTERSECTION REVEAL ────────────────────────── */
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var delay = parseFloat(el.dataset.delay || 0);
      setTimeout(function() {
        el.classList.add('revealed');
        $$('.metric-bar', el).forEach(function(b) { b.style.width = b.style.getPropertyValue('--w'); });
        $$('.project-progress', el).forEach(function(b) { b.style.width = b.style.getPropertyValue('--w'); });
      }, delay * 1000);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.12 });

  $$('.reveal-up, .reveal-left, .reveal-right, .bento-card, .project-card').forEach(function(el) {
    revealObserver.observe(el);
  });

  /* ── COUNTER ANIMATION ──────────────────────────── */
  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.dataset.target, 10);
      var duration = 1800;
      var start = performance.now();
      function tick(now) {
        var t = Math.min((now - start) / duration, 1);
        var ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target);
        if (t < 1) raf(tick);
      }
      raf(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });

  $$('.stat-num').forEach(function(el) { counterObserver.observe(el); });

  /* ── 3D CARD TILT ───────────────────────────────── */
  $$('[data-tilt]').forEach(function(card) {
    var glow = card.querySelector('.card-glow');

    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var cx = rect.left + rect.width  / 2;
      var cy = rect.top  + rect.height / 2;
      var dx = (e.clientX - cx) / (rect.width  / 2);
      var dy = (e.clientY - cy) / (rect.height / 2);
      var rotX = clamp(dy * -12, -12, 12);
      var rotY = clamp(dx *  12, -12, 12);
      card.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.02)';

      if (glow) {
        var px = ((e.clientX - rect.left) / rect.width)  * 100;
        var py = ((e.clientY - rect.top)  / rect.height) * 100;
        glow.style.setProperty('--mx', px + '%');
        glow.style.setProperty('--my', py + '%');
      }
    });

    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });

  /* ── FLUID RIPPLE (Bento large card) ────────────── */
  $$('[data-fluid]').forEach(function(canvas) {
    var parent = canvas.closest('.bento-card');
    if (!parent) return;
    var ctx2 = canvas.getContext('2d');
    var W2 = parent.offsetWidth || 300;
    var H2 = parent.offsetHeight || 200;
    canvas.width = W2; canvas.height = H2;
    var drops = [];
    var hueBase = 220;

    function addDrop(x, y) {
      hueBase = (hueBase + 25) % 360;
      var hues = [260, 170, 45, 280, 190];
      var h = hues[Math.floor(Math.random() * hues.length)];
      drops.push({ x: x, y: y, r: 0, maxR: 55 + Math.random() * 70, alpha: 0.65, hue: h });
    }

    parent.addEventListener('mousemove', function(e) {
      if (Math.random() < 0.12) {
        var rect = canvas.getBoundingClientRect();
        addDrop(e.clientX - rect.left, e.clientY - rect.top);
      }
    });

    parent.addEventListener('click', function(e) {
      var rect = canvas.getBoundingClientRect();
      for (var n = 0; n < 5; n++) addDrop(e.clientX - rect.left, e.clientY - rect.top);
    });

    function drawFluid() {
      ctx2.clearRect(0, 0, W2, H2);
      for (var i = drops.length - 1; i >= 0; i--) {
        var d = drops[i];
        d.r += 1.8;
        d.alpha *= 0.965;
        if (d.alpha < 0.01 || d.r > d.maxR) { drops.splice(i, 1); continue; }
        ctx2.beginPath();
        ctx2.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx2.strokeStyle = 'hsla(' + d.hue + ',80%,70%,' + d.alpha + ')';
        ctx2.lineWidth = 2;
        ctx2.stroke();
      }
      raf(drawFluid);
    }
    drawFluid();
  });

  /* ── ACTIVE NAV SECTION HIGHLIGHT ───────────────── */
  var sections = $$('section[id]');
  var navLinks = $$('.nav-links a');
  var sectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;
      navLinks.forEach(function(a) {
        a.style.color = (a.getAttribute('href') === '#' + id) ? 'var(--accent)' : '';
      });
    });
  }, { threshold: 0.4 });
  sections.forEach(function(s) { sectionObserver.observe(s); });

  /* ── CONTACT FORM ───────────────────────────────── */
  var form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn   = form.querySelector('button[type="submit"]');
      var name  = form.querySelector('#name').value.trim();
      var email = form.querySelector('#email').value.trim();
      var msg   = form.querySelector('#message').value.trim();

      if (!name || !email || !msg) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.querySelector('#email').focus();
        return;
      }

      btn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;

      setTimeout(function() {
        btn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
        btn.style.background = 'linear-gradient(135deg,#10b981,#34d399)';
        form.reset();
        setTimeout(function() {
          btn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }, 1400);
    });
  }

  /* ── SMOOTH SCROLL ───────────────────────────────── */
  $$('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

})();