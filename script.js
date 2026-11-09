(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header state, progress bar, floating button */
  const header = document.getElementById('header');
  const progress = document.getElementById('progress');
  const fab = document.getElementById('fab');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    fab.classList.toggle('show', y > 600);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const burger = document.getElementById('burger');
  const toggleMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggleMenu(!document.body.classList.contains('menu-open')));
  document.querySelectorAll('#mobileMenu a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });

  /* Marquee: duplicate content for seamless loop */
  const track = document.getElementById('marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, #steps').forEach((el) => io.observe(el));

  /* Counters */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      counterIO.unobserve(el);
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const fmt = (v) => v.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      if (reduceMotion) { el.textContent = fmt(target); return; }
      const dur = 1800;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach((el) => counterIO.observe(el));

  /* Card spotlight following cursor */
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* Magnetic buttons (desktop only) */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.2;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* Service details */
  document.querySelectorAll('.service .toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.service');
      const open = card.classList.toggle('open');
      btn.firstChild.textContent = open ? 'Свернуть ' : 'Что входит ';
    });
  });

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((o) => {
        o.classList.remove('open');
        o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* Reviews slider */
  const rev = document.getElementById('reviewsTrack');
  const step = () => {
    const card = rev.querySelector('.review');
    return card ? card.getBoundingClientRect().width + 20 : 300;
  };
  document.getElementById('revNext').addEventListener('click', () => {
    const atEnd = rev.scrollLeft + rev.clientWidth >= rev.scrollWidth - 10;
    rev.scrollTo({ left: atEnd ? 0 : rev.scrollLeft + step(), behavior: 'smooth' });
  });
  document.getElementById('revPrev').addEventListener('click', () => {
    rev.scrollBy({ left: -step(), behavior: 'smooth' });
  });

  /* Year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Hero: electric sparks canvas */
  const canvas = document.getElementById('sparks');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particles = [];
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, (w * h) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.1 - Math.random() * 0.35,
        r: 0.6 + Math.random() * 1.6,
        a: 0.2 + Math.random() * 0.6,
        hue: Math.random() > 0.5 ? '47,243,164' : '24,200,255',
      }));
    };
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
    const draw = () => {
      if (visible) {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx; p.y += p.vy;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
          if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.hue},${p.a})`;
          ctx.shadowBlur = 12; ctx.shadowColor = `rgba(${p.hue},0.9)`;
          ctx.fill();
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j];
            const dx = p.x - q.x, dy = p.y - q.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 120 * 120) {
              ctx.shadowBlur = 0;
              ctx.strokeStyle = `rgba(${p.hue},${0.12 * (1 - Math.sqrt(d2) / 120)})`;
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
            }
          }
        }
      }
      requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
  }
})();
