/**
 * Landing page publik (index.html): navbar, animasi muncul saat di-scroll,
 * angka XP berjalan, pita misi, dan tombol yang menyesuaikan status login.
 */
import { APP_DOWNLOAD_URL } from '../config/constants.js';
import { authService } from '../services/auth.service.js';
import { $, $$ } from '../utils/dom.js';
import { mountNomi } from '../components/nomi.js';

/* ---------- Sudah login? tampilkan tombol "Buka Dashboard" saja ---------- */
const loggedIn = Boolean(authService.currentUser());
$$('[data-guest-only]').forEach((el) => (el.hidden = loggedIn));
$$('[data-user-only]').forEach((el) => (el.hidden = !loggedIn));

/* ---------- Header: bayangan saat scroll + CTA muncul setelah hero lewat ---------- */
const header = $('[data-header]');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const headerCta = $('[data-header-cta]');
new IntersectionObserver(([entry]) => headerCta.classList.toggle('is-shown', !entry.isIntersecting)).observe(
  $('[data-hero-cta]'),
);

/* ---------- Menu HP: laci dari samping, tidak mendorong isi halaman ---------- */
const menuToggle = $('[data-menu-toggle]');
const mobileMenu = $('[data-mobile-menu]');
const menuBackdrop = $('[data-menu-backdrop]');
const setMenu = (open) => {
  mobileMenu.classList.toggle('is-open', open);
  menuBackdrop.classList.toggle('is-open', open);
  mobileMenu.inert = !open;
  document.documentElement.classList.toggle('overflow-hidden', open); // halaman di belakang tidak ikut ter-scroll
  menuToggle.setAttribute('aria-expanded', String(open));
  (open ? $('a', mobileMenu) : menuToggle).focus({ preventScroll: true });
};
menuToggle.addEventListener('click', () => setMenu(true));
$('[data-menu-close]').addEventListener('click', () => setMenu(false));
menuBackdrop.addEventListener('click', () => setMenu(false));
mobileMenu.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
document.addEventListener('keydown', (e) => e.key === 'Escape' && !mobileMenu.inert && setMenu(false));
matchMedia('(min-width: 48rem)').addEventListener('change', (e) => e.matches && !mobileMenu.inert && setMenu(false));

/* ---------- Tandai menu sesuai section yang sedang dilihat ---------- */
const navLinks = $$('[data-nav] a');
const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        navLinks.forEach((a) => a.setAttribute('aria-current', String(a.hash === `#${entry.target.id}`)));
      }
    }
  },
  { rootMargin: '-45% 0px -50% 0px' },
);
['beranda', 'fitur', 'tentang', 'tim'].forEach((id) => sectionObserver.observe(document.getElementById(id)));

/* ---------- Animasi muncul saat di-scroll + angka XP berjalan ---------- */
function countUp(el) {
  const target = Number(el.dataset.count);
  const start = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - start) / 1200);
    const eased = 1 - (1 - p) ** 3;
    el.textContent = `${Math.round(target * eased).toLocaleString('id-ID')} XP`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      $$('[data-count]', entry.target).forEach(countUp);
      revealObserver.unobserve(entry.target);
    }
  },
  { threshold: 0.2 },
);
$$('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------- Pita misi berjalan: gandakan isi agar putarannya mulus ---------- */
const marquee = $('[data-marquee]');
marquee.append(marquee.firstElementChild.cloneNode(true));
marquee.lastElementChild.setAttribute('aria-hidden', 'true');

/* ---------- Nomi: maskot hidup — tiap section punya adegan sendiri ---------- */
const nomis = mountNomi();
const hero = nomis.find((n) => n.el.hasAttribute('data-hero-nomi'));

// gerak-gerik tiap Nomi diatur oleh adegannya (data-scene) di components/nomi.js

// tombol utama disorot → Nomi ikut bersemangat
$$('[data-hero-cta] a, [data-header-cta]').forEach((btn) => {
  btn.addEventListener('pointerenter', () => hero.setMood('senang'));
  btn.addEventListener('pointerleave', () => hero.setMood('normal'));
});

/* ---------- Parallax saat scroll: tiap lapisan bergerak dengan kecepatan berbeda ---------- */
const layers = $$('[data-parallax]').map((el) => ({ el, speed: Number(el.dataset.parallax) }));
const MAX_SHIFT = 70; // px
let ticking = false;
function updateParallax() {
  const mid = window.innerHeight / 2;
  for (const { el, speed } of layers) {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;
    const raw = (rect.top + rect.height / 2 - mid) * speed;
    const offset = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, raw));
    el.style.setProperty('--py', `${offset.toFixed(1)}px`);
  }
  ticking = false;
}
window.addEventListener(
  'scroll',
  () => {
    if (!ticking) requestAnimationFrame(updateParallax);
    ticking = true;
  },
  { passive: true },
);
updateParallax();

/* ---------- Hero: properti bergeser mengikuti mouse (efek kedalaman) ---------- */
const scene = $('[data-hero-scene]');
const depthEls = $$('[data-depth]', scene).map((el) => ({ el, depth: Number(el.dataset.depth) }));
if (matchMedia('(pointer: fine)').matches) {
  scene.closest('section').addEventListener('pointermove', (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    for (const { el, depth } of depthEls) {
      el.style.setProperty('--mx', `${(x * depth).toFixed(1)}px`);
      el.style.setProperty('--my', `${(y * depth).toFixed(1)}px`);
    }
  });
}

/* ---------- Tombol unduh aplikasi murid ---------- */
$('[data-app-download]').innerHTML = APP_DOWNLOAD_URL
  ? `<a href="${APP_DOWNLOAD_URL}" class="btn-chunky btn-chunky-brand" target="_blank" rel="noopener">Unduh Aplikasi</a>`
  : '<span class="btn-chunky btn-chunky-light pointer-events-none whitespace-normal text-center opacity-80">Segera hadir di Android</span>';
