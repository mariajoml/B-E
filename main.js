/* B&P. Interacciones en JavaScript plano, sin dependencias. */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine    = matchMedia('(pointer: fine)').matches;

  /* ---- loader --------------------------------------------------------- */
  const loader = $('#loader');
  const hideLoader = () => {
    if (!loader || loader.classList.contains('done')) return;
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 900);
  };
  window.addEventListener('load', () => setTimeout(hideLoader, reduced ? 0 : 500));
  setTimeout(hideLoader, 2600); // red lenta: no dejar la cortina pegada

  /* ---- año + reloj local ---------------------------------------------- */
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

  /* ---- nav: ocultar al bajar ------------------------------------------ */
  const nav = $('#nav');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('hide', y > 260 && y > lastY && menu.hidden);
    lastY = y;
  }, { passive: true });

  /* ---- reveal on scroll ------------------------------------------------ */
  // el hero se revela con la intro, no al hacer scroll
  const heroReveals = $$('.hero .reveal');
  heroReveals.forEach((el, i) =>
    setTimeout(() => el.classList.add('on'), reduced ? 0 : 1150 + i * 110));

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('on'), reduced ? 0 : i * 70);
      revealIO.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => { if (!heroReveals.includes(el)) revealIO.observe(el); });

  /* ---- nav: color según la sección que cruza ---------------------------- */
  const themed = $$('[data-theme]');
  const dark = new Set(['blue', 'ink']);
  const paintNav = () => {
    const line = 44;
    let cur = themed[0];
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) cur = s;
    }
    nav.style.color = dark.has(cur.dataset.theme) ? '#fff' : '#07030F';
  };
  addEventListener('scroll', paintNav, { passive: true });
  addEventListener('resize', paintNav);
  paintNav();

  /* ---- statement: palabras que encienden al hacer scroll --------------- */
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

  /* ---- servicios: acordeón + tinte ------------------------------------- */
  const lum = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  };
  $$('.svc__row').forEach(row => {
    const tint = row.dataset.tint;
    row.style.setProperty('--tint', tint);
    row.style.setProperty('--tint-fg', lum(tint) > 0.6 ? '#07030F' : '#ffffff');

    const head = $('.svc__head', row);
    head.addEventListener('click', () => {
      const open = row.classList.toggle('open');
      head.setAttribute('aria-expanded', String(open));
      if (open) {
        $$('.svc__row.open').forEach(o => {
          if (o === row) return;
          o.classList.remove('open');
          $('.svc__head', o).setAttribute('aria-expanded', 'false');
        });
      }
    });
  });

  /* ---- cursor + botones magnéticos ------------------------------------- */
  if (fine && !reduced) {
    const cur = $('.cursor');
    const dot = $('.cursor__dot');
    const lab = $('.cursor__label');
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;

    addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      cur.classList.add('on');
    }, { passive: true });

    (function follow() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      dot.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      lab.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      requestAnimationFrame(follow);
    })();

    const bigCursor = (els, text) => els.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cur.classList.add('big');
        lab.textContent = text;
      });
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
    bigCursor($$('.work__card'), 'Ver');
    bigCursor($$('.tag'), 'Arrastrá');

    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform =
          `translate(${(e.clientX - r.left - r.width / 2) * 0.28}px,${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---- formulario: compone un mail (sin backend) ----------------------- */
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

  /* ---- riel: marca la sección que estás mirando ------------------------ */
  const railLinks = $$('.rail a');
  if (railLinks.length) {
    const spy = () => {
      const line = innerHeight * 0.4;
      let active = null;
      railLinks.forEach(a => {
        const sec = document.getElementById(a.dataset.sec);
        if (!sec) return;
        const r = sec.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) active = a;
      });
      railLinks.forEach(a => a.classList.toggle('on', a === active));
    };
    addEventListener('scroll', spy, { passive: true });
    addEventListener('resize', spy);
    spy();
  }

  /* ---- rider: etiquetas que se arrastran ------------------------------- */
  if (fine) {
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
    $$('.tag').forEach(tag => {
      const box = tag.closest('.rider__box');
      const rot = tag.dataset.rot || 0;
      let dx = 0, dy = 0, sx = 0, sy = 0, dragging = false;
      const apply = () => {
        tag.style.transform = `translate(${dx}px,${dy}px) rotate(${rot}deg)`;
      };
      tag.addEventListener('pointerdown', e => {
        dragging = true;
        sx = e.clientX - dx;
        sy = e.clientY - dy;
        tag.setPointerCapture(e.pointerId);
        tag.classList.add('drag');
      });
      tag.addEventListener('pointermove', e => {
        if (!dragging) return;
        // sin salirse del recuadro
        const pad = 6;
        const maxX = box.clientWidth - tag.offsetWidth - pad;
        const maxY = box.clientHeight - tag.offsetHeight - pad;
        dx = clamp(e.clientX - sx, pad - tag.offsetLeft, maxX - tag.offsetLeft);
        dy = clamp(e.clientY - sy, pad - tag.offsetTop, maxY - tag.offsetTop);
        apply();
      });
      const end = () => { dragging = false; tag.classList.remove('drag'); };
      tag.addEventListener('pointerup', end);
      tag.addEventListener('pointercancel', end);
    });
  }
})();
