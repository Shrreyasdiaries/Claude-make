import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import './style.css';
import { createWatch, startClock } from './watch.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ---------------- build watches ---------------- */
$$('[data-watch]').forEach((el) => (el.innerHTML = createWatch({ variant: el.dataset.watch })));
$$('[data-layer]').forEach((el) => (el.innerHTML = createWatch({ variant: 'midnight', parts: [el.dataset.layer] })));
startClock();

/* ---------------- text splitting ---------------- */
$$('[data-split="chars"]').forEach((el) => {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.innerHTML = [...text].map((c) => `<span class="char" aria-hidden="true">${c}</span>`).join('');
});
$$('[data-split="words"]').forEach((el) => {
  el.innerHTML = el.textContent
    .trim()
    .split(/\s+/)
    .map((w) => `<span class="word">${w}</span>`)
    .join(' ');
});
$$('[data-split="lines"] > span').forEach((line) => (line.innerHTML = `<span>${line.innerHTML}</span>`));

/* ---------------- smooth scroll ---------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

$$('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const target = a.getAttribute('href');
    if (target === '#') return;
    e.preventDefault();
    const el = target === '#top' ? 0 : $(target);
    if (lenis) lenis.scrollTo(el, { duration: 2, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else if (el === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    else el?.scrollIntoView({ behavior: 'smooth' });
  })
);

/* ---------------- nav hide/show ---------------- */
const nav = $('.nav');
let lastY = 0;
const onScroll = (y) => {
  nav.classList.toggle('is-hidden', y > lastY && y > 200);
  lastY = y;
};
if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });

/* ---------------- cursor + magnetic ---------------- */
if (finePointer) {
  const ring = $('.cursor');
  const dot = $('.cursor-dot');
  const label = $('.cursor__label');
  const rx = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3' });
  const dx = gsap.quickTo(dot, 'x', { duration: 0.1 });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.1 });
  window.addEventListener('mousemove', (e) => {
    rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
  });
  $$('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => { label.textContent = el.dataset.cursor; ring.classList.add('is-label'); });
    el.addEventListener('mouseleave', () => ring.classList.remove('is-label'));
  });
  $$('a:not([data-cursor])').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
  $$('[data-magnetic]').forEach((el) => {
    const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.35);
      my((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' });
    });
  });

  // Hero watch follows the pointer in 3D
  const tilt = $('.hero__tilt');
  const tx = gsap.quickTo(tilt, 'rotationY', { duration: 1.2, ease: 'power3' });
  const ty = gsap.quickTo(tilt, 'rotationX', { duration: 1.2, ease: 'power3' });
  const glow = $('.hero__glow');
  const gx = gsap.quickTo(glow, 'xPercent', { duration: 2, ease: 'power3' });
  const gy = gsap.quickTo(glow, 'yPercent', { duration: 2, ease: 'power3' });
  $('.hero').addEventListener('mousemove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    tx(nx * 24); ty(-ny * 18);
    gx(-50 + nx * 16); gy(-50 + ny * 16);
  });
}

/* ---------------- loader → intro ---------------- */
const chars = $$('.hero__title .char');
gsap.set(chars, { yPercent: 110 });
gsap.set('.hero__tilt', { autoAlpha: 0, scale: 0.6, rotation: -35, y: 60 });
gsap.set(['.hero__meta', '.hero__tag', '.hero__scroll', '.nav'], { autoAlpha: 0 });
gsap.set('.hero__rings span', { scale: 0.6, autoAlpha: 0 });
document.body.classList.add('is-loading');

const counter = { v: 0 };
const intro = gsap.timeline({ paused: true });
intro
  .to(chars, { yPercent: 0, duration: 1.6, ease: 'expo.out', stagger: 0.06 })
  .to('.hero__rings span', { scale: 1, autoAlpha: 1, duration: 2, ease: 'expo.out', stagger: 0.12 }, 0)
  .to('.hero__tilt', { autoAlpha: 1, scale: 1, rotation: 0, y: 0, duration: 2.2, ease: 'expo.out' }, 0.2)
  .to(['.hero__tag', '.hero__meta', '.hero__scroll', '.nav'], { autoAlpha: 1, duration: 1.2, stagger: 0.1 }, 0.9)
  .from(['.hero__tag', '.hero__meta'], { y: 24, duration: 1.2, ease: 'expo.out', stagger: 0.1 }, 0.9);

gsap
  .timeline({
    onComplete: () => {
      document.body.classList.remove('is-loading');
      lenis?.start();
    },
  })
  .to(counter, {
    v: 100,
    duration: reduced ? 0.4 : 1.8,
    ease: 'power2.inOut',
    onUpdate: () => ($('.loader__num').textContent = Math.round(counter.v)),
  })
  .to('.loader__bar span', { scaleX: 1, duration: reduced ? 0.4 : 1.8, ease: 'power2.inOut' }, 0)
  .to('.loader__brand', { letterSpacing: '1.2em', autoAlpha: 0, duration: 0.8, ease: 'power2.in' }, '-=0.3')
  .to('.loader', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=0.2')
  .add(() => intro.play(), '-=0.6')
  .set('.loader', { display: 'none' });

/* ---------------- scroll scenes ---------------- */
const mm = gsap.matchMedia();

mm.add({ desktop: '(min-width: 821px)', mobile: '(max-width: 820px)' }, (ctx) => {
  const { desktop } = ctx.conditions;

  // HERO — pinned, watch drifts and grows while the wordmark disperses
  const hero = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=160%', scrub: 1, pin: true },
  });
  const mid = (chars.length - 1) / 2;
  hero
    .to(chars, {
      x: (i) => (i - mid) * (desktop ? 70 : 30),
      y: (i) => (i % 2 ? -1 : 1) * 80,
      rotation: (i) => (i - mid) * 4,
      opacity: 0,
      stagger: { each: 0.02, from: 'center' },
      duration: 0.5,
    }, 0)
    .fromTo(['.hero__tag', '.hero__meta', '.hero__scroll'], { autoAlpha: 1 }, { autoAlpha: 0, y: -30, duration: 0.25, immediateRender: false }, 0)
    .to('.hero__rings span', { scale: 1.6, opacity: 0, stagger: 0.04, duration: 0.6 }, 0)
    .to('.hero__watch', {
      x: desktop ? '22vw' : 0,
      y: desktop ? 0 : '-12vh',
      scale: desktop ? 1.3 : 1.05,
      rotation: -10,
      duration: 1,
      ease: 'power1.inOut',
    }, 0)
    .to('.hero__glow', { scale: 1.4, duration: 1 }, 0)
    .fromTo('.hero__reveal', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.55);

  // CALIBRE — exploded view
  const layers = $$('.layer');
  const depth = desktop ? 1 : 0.6;
  const calibre = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: { trigger: '.calibre', start: 'top top', end: '+=260%', scrub: 1.2, pin: true },
  });
  calibre
    .from('.calibre__head', { autoAlpha: 0, y: 50, duration: 0.3 }, 0)
    .to('.stack', { rotationX: 60, rotationZ: -30, scale: desktop ? 0.9 : 0.85, duration: 0.5 }, 0.1)
    .to(layers, { z: (i, el) => Number(el.dataset.z) * depth, duration: 0.7, stagger: 0.03 }, 0.3);
  if (desktop) {
    calibre.to('.calibre__labels li', { opacity: 1, duration: 0.15, stagger: 0.1 }, 0.55)
      .from('.calibre__labels li', { x: -30, duration: 0.15, stagger: 0.1 }, 0.55);
  }
  calibre.to('.stack', { rotationZ: -50, duration: 0.4 }, 1.0);

  // COLLECTION — horizontal pinned scroll on desktop
  if (desktop) {
    const track = $('.collection__track');
    const dist = () => track.scrollWidth - window.innerWidth;
    gsap.timeline({
      scrollTrigger: {
        trigger: '.collection',
        start: 'top top',
        end: () => '+=' + dist(),
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
      },
    })
      .to(track, { x: () => -dist(), ease: 'none' }, 0)
      .to('.collection__progress span', { scaleX: 1, ease: 'none' }, 0)
      .fromTo('.card__watch', { rotation: 8 }, { rotation: -8, ease: 'none', stagger: 0.02 }, 0);
  } else {
    $$('.card').forEach((card) =>
      gsap.from(card, { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 85%' } })
    );
  }
});

// MANIFESTO — words light up as you read
gsap.to('.manifesto__text .word', {
  opacity: 1,
  stagger: 0.1,
  ease: 'none',
  scrollTrigger: { trigger: '.manifesto__text', start: 'top 75%', end: 'bottom 55%', scrub: true },
});

// MARQUEE — infinite loop that reacts to scroll velocity
const marquee = gsap.to('.marquee__inner', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
const skew = gsap.quickTo('.marquee__inner', 'skewX', { duration: 0.6, ease: 'power3' });
ScrollTrigger.create({
  trigger: '.marquee',
  start: 'top bottom',
  end: 'bottom top',
  onUpdate: (self) => {
    const v = self.getVelocity();
    gsap.to(marquee, { timeScale: (self.direction || 1) * (1 + Math.min(Math.abs(v) / 250, 5)), duration: 0.3, overwrite: true });
    skew(gsap.utils.clamp(-12, 12, v / -150));
  },
  onLeave: () => skew(0),
});
ScrollTrigger.addEventListener('scrollEnd', () => {
  gsap.to(marquee, { timeScale: marquee.timeScale() < 0 ? -1 : 1, duration: 0.8, overwrite: true });
  skew(0);
});

// NUMBERS — count up
$$('[data-count]').forEach((el) => {
  const end = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const o = { v: 0 };
  gsap.to(o, {
    v: end,
    duration: 2.2,
    ease: 'expo.out',
    onUpdate: () => (el.textContent = Math.round(o.v) + suffix),
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
  });
});

// HERITAGE — drawn timeline + staggered milestones
gsap.to('.heritage__line span', {
  scaleY: 1,
  ease: 'none',
  scrollTrigger: { trigger: '.heritage__list', start: 'top 60%', end: 'bottom 60%', scrub: true },
});
$$('.milestone').forEach((m) =>
  gsap.from(m.children, {
    y: 60,
    opacity: 0,
    duration: 1.4,
    ease: 'expo.out',
    stagger: 0.12,
    scrollTrigger: { trigger: m, start: 'top 80%' },
  })
);

// VISIT — title reveal + rotating ghost watch
gsap.from('.visit__title > span > span', {
  yPercent: 110,
  duration: 1.4,
  ease: 'expo.out',
  stagger: 0.12,
  scrollTrigger: { trigger: '.visit__title', start: 'top 80%' },
});
gsap.fromTo(
  '.visit__watch',
  { rotation: -25, scale: 0.8 },
  { rotation: 20, scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.visit', start: 'top bottom', end: 'bottom top', scrub: true } }
);
gsap.from('.footer__brand', {
  yPercent: 40,
  opacity: 0,
  ease: 'none',
  scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 40%', scrub: true },
});

document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());
