/**
 * Kerangka halaman guru: header sticky (menu + logo + akun) dan sidebar oranye seperti di Figma.
 * Juga memastikan hanya guru yang sudah login yang bisa membuka halaman.
 */
import { ROUTES, IMG, asset } from '../config/constants.js';
import { authService } from '../services/auth.service.js';
import { esc } from '../utils/dom.js';
import { avatar } from './ui.js';
import { confirmDialog } from './modal.js';

const NAV = [
  { key: 'dashboard', label: 'Beranda', href: ROUTES.dashboard, icon: asset('/images/nav/beranda.png') },
  { key: 'materi', label: 'Materi', href: ROUTES.materi, icon: asset('/images/nav/materi.png') },
  { key: 'misi', label: 'Misi', href: ROUTES.misi, icon: asset('/images/nav/misi.png') },
  { key: 'siswa', label: 'Peringkat', href: ROUTES.siswa, icon: asset('/images/nav/peringkat.png') },
  { key: 'profil', label: 'Profil', href: ROUTES.profil, icon: asset('/images/nav/profil.png') },
];

const LOGOUT_ICON = `<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"/></svg>`;

/** Redirect ke login bila belum masuk. Mengembalikan user aktif. */
export function requireAuth() {
  const user = authService.currentUser();
  if (!user) {
    document.documentElement.style.visibility = 'hidden';
    location.replace(`${ROUTES.login}?next=${encodeURIComponent(location.pathname + location.search)}`);
    throw new Error('Belum login, dialihkan ke halaman login.');
  }
  return user;
}

/** Konfirmasi lalu keluar. Dipanggil oleh semua tombol [data-logout]. */
export async function logout() {
  const ok = await confirmDialog({
    title: 'Keluar dari CONIX?',
    message: 'Anda perlu login lagi untuk mengelola materi dan misi.',
    confirmText: 'Keluar',
  });
  if (!ok) return;
  await authService.logout();
  location.href = `${ROUTES.login}?keluar=1`;
}

function headerTemplate(user) {
  const name = esc(user.panggilan || user.nama);
  return `
    <div class="page flex items-center gap-3 py-2.5">
      <button type="button" class="btn-icon size-12" data-sidebar-open aria-label="Buka menu" aria-controls="sidebar" aria-expanded="false">
        <img src="${asset('images/icons/menu.svg')}" alt="" class="h-7.5 w-10" />
      </button>
      <a href="${ROUTES.dashboard}" aria-label="CONIX — Beranda" class="transition hover:scale-[1.03]">
        <img src="${IMG.logotype}" alt="CONIX" class="h-10 w-auto sm:h-12" />
      </a>

      <div class="relative ml-auto" data-user-menu>
        <button type="button" data-user-toggle aria-haspopup="menu" aria-expanded="false" aria-controls="user-menu"
          class="flex cursor-pointer items-center gap-2 rounded-full border-2 border-ink bg-paper py-1 pr-3 pl-1 font-semibold transition hover:bg-sun-light">
          ${avatar(user, 'size-8')}
          <span class="hidden max-w-40 truncate sm:inline">${name}</span>
          <svg viewBox="0 0 24 24" class="size-4 transition-transform" data-chevron fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        <div id="user-menu" role="menu" hidden data-user-dropdown
          class="dropdown absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border-3 border-ink bg-cream shadow-card">
          <div class="flex items-center gap-3 border-b-2 border-ink/15 px-4 py-3">
            ${avatar(user, 'size-10')}
            <div class="min-w-0">
              <p class="truncate font-bold">${esc(user.nama)}</p>
              <p class="truncate font-body text-sm text-bark">${esc(user.email)}</p>
            </div>
          </div>
          <a role="menuitem" href="${ROUTES.profil}" class="flex items-center gap-3 px-4 py-2.5 font-semibold transition hover:bg-sun-light">
            <img src="${asset('images/nav/profil.png')}" alt="" class="size-5 brightness-0" /> Profil Saya
          </a>
          <button type="button" role="menuitem" data-logout
            class="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left font-semibold text-danger transition hover:bg-danger/10">
            ${LOGOUT_ICON} Keluar
          </button>
        </div>
      </div>
    </div>`;
}

function sidebarTemplate(active) {
  return `
    <div data-sidebar-backdrop class="pointer-events-none fixed inset-0 z-40 bg-ink/40 opacity-0 transition-opacity duration-300"></div>
    <nav id="sidebar" aria-label="Menu utama" inert
      class="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] -translate-x-full flex-col rounded-r-[15px] border-3 border-l-0 border-ink bg-brand px-8 pt-10 pb-8 text-white transition-transform duration-300 ease-out">
      <button type="button" data-sidebar-close class="mb-8 flex cursor-pointer items-center gap-5 text-[28px] font-bold">
        <img src="${asset('images/icons/menu-white.svg')}" alt="" class="h-7.5 w-10" />
        Beranda
      </button>
      <ul class="flex flex-col gap-2">
        ${NAV.map(
          (item, i) => `
          <li class="sidebar-item" style="--i:${i}">
            <a href="${item.href}" ${item.key === active ? 'aria-current="page"' : ''}
              class="flex items-center gap-5 rounded-xl px-2 py-2.5 text-[26px] font-bold transition hover:translate-x-1 hover:bg-white/15 aria-[current=page]:bg-white/25">
              <img src="${item.icon}" alt="" class="size-12 object-contain" />
              ${item.label}
            </a>
          </li>`,
        ).join('')}
      </ul>
      <button type="button" data-logout class="btn btn-secondary btn-lg mt-auto w-full">${LOGOUT_ICON} Keluar</button>
    </nav>`;
}

function setupSidebar(header, drawer) {
  const sidebar = drawer.querySelector('#sidebar');
  const backdrop = drawer.querySelector('[data-sidebar-backdrop]');
  const openBtn = header.querySelector('[data-sidebar-open]');

  const setOpen = (open) => {
    sidebar.classList.toggle('-translate-x-full', !open);
    sidebar.classList.toggle('is-open', open);
    sidebar.inert = !open;
    backdrop.classList.toggle('opacity-0', !open);
    backdrop.classList.toggle('pointer-events-none', !open);
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('overflow-hidden', open);
    (open ? sidebar.querySelector('a') : openBtn).focus();
  };

  openBtn.addEventListener('click', () => setOpen(true));
  backdrop.addEventListener('click', () => setOpen(false));
  drawer.querySelector('[data-sidebar-close]').addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sidebar.inert) setOpen(false);
  });
}

function setupUserMenu(header) {
  const wrap = header.querySelector('[data-user-menu]');
  const toggle = wrap.querySelector('[data-user-toggle]');
  const menu = wrap.querySelector('[data-user-dropdown]');
  const chevron = wrap.querySelector('[data-chevron]');

  const setOpen = (open) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    chevron.classList.toggle('rotate-180', open);
  };

  toggle.addEventListener('click', () => setOpen(menu.hidden));
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/** Header menempel di atas; beri bayangan setelah halaman di-scroll. */
function setupStickyHeader(header) {
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/**
 * Pasang header + sidebar pada halaman.
 * @param {string} active key menu yang sedang aktif
 * @returns user yang sedang login
 */
export function mountAppShell(active) {
  const user = requireAuth();

  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = headerTemplate(user);
  document.body.prepend(header);

  const drawer = document.createElement('div');
  drawer.innerHTML = sidebarTemplate(active);
  document.body.append(drawer);

  setupSidebar(header, drawer);
  setupUserMenu(header);
  setupStickyHeader(header);

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-logout]')) logout();
  });

  // pastikan token masih berlaku (401 otomatis dialihkan ke login oleh api.js)
  authService.refresh().catch(() => {});

  // animasi berurutan hanya saat halaman dibuka, tidak diulang ketika daftar difilter/dicari
  setTimeout(() => document.querySelectorAll('[data-stagger]').forEach((el) => el.removeAttribute('data-stagger')), 1200);

  return user;
}
