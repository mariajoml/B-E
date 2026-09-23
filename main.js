/* B&P. Interacciones en JavaScript plano, sin dependencias. */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine    = matchMedia('(pointer: fine)').matches;

  /* ---- loader ---------------------------------------------------------- */
  const loader = $('#loader');
  const hideLoader = () => {
    if (!loader || loader.classList.contains('done')) return;
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 1100);
  };
  window.addEventListener('load', () => setTimeout(hideLoader, reduced ? 0 : 620));
  setTimeout(hideLoader, 2800); // red lenta: no dejar la cortina pegada

  /* ---- año y hora local ------------------------------------------------ */
  $('#year').textContent = new Date().getFullYear();
  const clock = $('#clock');
  const tick = () => {
    clock.textContent = 'Hora local ' + new Date().toLocaleTimeString('es', {
      hour: '2-digit', minute: '2-digit'
    });
  };
  tick();
  setInterval(tick, 30000);

  /* ---- menú móvil ------------------------------------------------------ */
  const burger = $('#burger');
  const menu   = $('#menu');
  const setMenu = (open) => {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* ---- nav: se esconde al bajar --------------------------------------- */
  const nav = $('#nav');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('hide', y > 280 && y > lastY && menu.hidden);
    lastY = y;
  }, { passive: true });

  /* ---- reveals --------------------------------------------------------- */
  const heroReveals = $$('.hero .reveal');
  heroReveals.forEach((el, i) =>
    setTimeout(() => el.classList.add('on'), reduced ? 0 : 1400 + i * 130));

  const revealIO = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('on'), reduced ? 0 : i * 90);
      revealIO.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => { if (!heroReveals.includes(el)) revealIO.observe(el); });

  /* ---- nav y riel: color según la sección que cruzan -------------------- */
  const themed = $$('[data-theme]');
  const railLinks = $$('.rail a');
  const rail = $('.rail');
  const light = new Set(['cream']);

  const themeAt = (y) => {
    let cur = themed[0];
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) cur = s;
    }
    return cur?.dataset.theme;
  };

  const paintChrome = () => {
    nav.style.color = light.has(themeAt(46)) ? '#0A0A0C' : '#F2EFE6';
    if (rail) rail.style.color = light.has(themeAt(innerHeight / 2)) ? '#0A0A0C' : '#F2EFE6';

    const line = innerHeight * 0.42;
    let active = null;
    railLinks.forEach(a => {
      const sec = document.getElementById(a.dataset.sec);
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) active = a;
    });
    railLinks.forEach(a => a.classList.toggle('on', a === active));
  };
  addEventListener('scroll', paintChrome, { passive: true });
  addEventListener('resize', paintChrome);
  paintChrome();

  /* ---- manifiesto: las palabras se encienden al hacer scroll ----------- */
  const statement = $('[data-words]');
  if (statement) {
    const words = statement.textContent.trim().split(/\s+/);
    statement.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      statement.append(s, i < words.length - 1 ? ' ' : '');
    });
    const spans = $$('.w', statement);
    const paint = () => {
      const r = statement.getBoundingClientRect();
      const p = (innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.25);
      const n = Math.round(Math.min(Math.max(p, 0), 1) * spans.length);
      spans.forEach((s, i) => s.classList.toggle('on', i < n));
    };
    addEventListener('scroll', paint, { passive: true });
    paint();
  }

  /* ---- cursor y botones magnéticos ------------------------------------- */
  if (fine && !reduced) {
    const cur = $('.cursor');
    const ring = $('.cursor__ring');
    const lab = $('.cursor__label');
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;

    addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      cur.classList.add('on');
    }, { passive: true });

    (function follow() {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      const t = `translate3d(${cx}px,${cy}px,0)`;
      ring.style.transform = t;
      lab.style.transform = t;
      requestAnimationFrame(follow);
    })();

    const bigCursor = (els, text) => els.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cur.classList.add('big');
        lab.textContent = text;
      });
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
    bigCursor($$('.reel__frame'), 'Ver');

    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform =
          `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.32}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---- formulario: arma un mail, no hay backend ------------------------ */
  const form = $('#form');
  const note = $('#form-note');
  const DESTINO = 'hola@byp.events'; // REEMPLAZAR por el correo real
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.nombre?.trim() || !/^\S+@\S+\.\S+$/.test(d.email || '')) {
      note.textContent = 'Falta tu nombre o un email válido.';
      return;
    }
    const body = [
      `Nombre: ${d.nombre}`,
      `Email: ${d.email}`,
      `Tipo de evento: ${d.tipo}`,
      `Fecha tentativa: ${d.fecha || 'por definir'}`,
      '',
      d.mensaje || ''
    ].join('\n');
    location.href = `mailto:${DESTINO}?subject=${encodeURIComponent(`Cotización de ${d.tipo}`)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Abrimos tu correo con el mensaje listo para enviar.';
  });

  /* ---- parallax de las imágenes --------------------------------------- */
  if (!reduced) {
    const layers = $$('[data-parallax]');
    let ticking = false;
    const move = () => {
      layers.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const mid = r.top + r.height / 2 - innerHeight / 2;
        el.style.transform = `translate3d(0,${(-mid * +el.dataset.parallax).toFixed(1)}px,0)`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(move);
    }, { passive: true });
    addEventListener('resize', move);
    move();
  }
})();
