/* ============================================================
   LyD — interacciones de la landing
   ============================================================ */

(() => {
  'use strict';

  /* ---------- TextAnimate rollIn (replica cult-ui) ----------
     Cada línea del hero se divide letra por letra. Para .title-accent
     reconstruimos el gradiente sobre las letras: cada char muestra
     su porción del gradiente vía background-position calculado. */
  const makeChar = (ch, extraClass = '') => {
    const span = document.createElement('span');
    if (ch === ' ') {
      span.className = ('char char--space ' + extraClass).trim();
      span.innerHTML = '&nbsp;';
    } else {
      span.className = ('char ' + extraClass).trim();
      span.textContent = ch;
    }
    return span;
  };

  const splitTextNode = (textNode, extraClass = '') => {
    const frag = document.createDocumentFragment();
    const out = [];
    for (const ch of textNode.textContent) {
      const span = makeChar(ch, extraClass);
      frag.appendChild(span);
      out.push(span);
    }
    textNode.parentNode.replaceChild(frag, textNode);
    return out;
  };

  const splitElementChars = (el, extraClass = '') => {
    const out = [];
    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        out.push(...splitTextNode(node, extraClass));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        out.push(...splitElementChars(node, extraClass));
      }
    });
    return out;
  };

  const heroLines = document.querySelectorAll('.hero__title .hero__line');
  if (heroLines.length) {
    let globalIdx = 0;
    const charDelay = 35;
    const lineGap   = 120;

    heroLines.forEach((line, lineIdx) => {
      const units = [];

      Array.from(line.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          units.push(...splitTextNode(node));
        } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('title-accent')) {
          // Dividimos en letras y marcamos como acentuadas para aplicar el gradiente continuo
          const accentChars = splitElementChars(node, 'char--accent');
          // El gradiente se "estira" sobre todas las letras: cada una muestra su slice
          const total = accentChars.length;
          const sizePct = total * 100;
          accentChars.forEach((c, i) => {
            const pos = total > 1 ? (i / (total - 1)) * 100 : 50;
            c.style.backgroundSize = `${sizePct}% 100%`;
            c.style.backgroundPosition = `${pos}% 50%`;
          });
          units.push(...accentChars);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          units.push(...splitElementChars(node));
        }
      });

      units.forEach((u) => {
        u.style.animationDelay = `${lineIdx * lineGap + globalIdx * charDelay}ms`;
        globalIdx++;
      });
    });
  }

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  // Cierre al clickear un link del menú (mobile)
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Pequeño stagger para grupos cercanos
          const idx = Array.from(entry.target.parentNode.children).indexOf(entry.target);
          entry.target.style.transitionDelay = `${Math.min(idx * 60, 240)}ms`;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* (Parallax del hero removido: producía un efecto de zoom no deseado al scrollear) */

  /* ---------- Cerrar nav al hacer scroll en mobile ---------- */
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (Math.abs(window.scrollY - lastY) > 80 && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    lastY = window.scrollY;
  }, { passive: true });

})();
