/**
 * Logika bersama halaman Masuk (login.html) dan Daftar (register.html).
 */
import { ROUTES, asset } from '../config/constants.js';
import { authService } from '../services/auth.service.js';
import { $, $$, validateFields, showError } from '../utils/dom.js';
import { mountNomi } from './nomi.js';

const params = new URLSearchParams(location.search);
const next = params.get('next');
let nomi = null; // maskot di ilustrasi (hanya tampil di layar lebar)

/** Setelah berhasil masuk/daftar: kembali ke halaman tujuan, atau ke Beranda guru. */
export const goNext = () => location.replace(next?.startsWith(asset('pages/')) ? next : ROUTES.dashboard);

/** Siapkan halaman auth: alihkan bila sudah login, pertahankan ?next di link, aktifkan tombol lihat password. */
export function setupAuthPage() {
  if (authService.currentUser()) {
    goNext();
    return false;
  }

  // link Masuk <-> Daftar tetap membawa ?next=... supaya tujuan awal tidak hilang
  if (next) {
    $$('[data-keep-query]').forEach((a) => (a.href += `?${new URLSearchParams({ next })}`));
  }

  // Nomi bereaksi: menutup mata saat password diketik
  [nomi] = mountNomi();
  if (nomi) {
    const mood = nomi.mood;
    $$('input[type=password]').forEach((input) => {
      input.addEventListener('focus', () => nomi.setMood('tutup'));
      input.addEventListener('blur', () => nomi.setMood(mood));
    });
  }

  $$('[data-toggle-password]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password');
      btn.classList.toggle('opacity-50', show);
    }),
  );
  return true;
}

/** Tampilkan kotak pemberitahuan kuning di atas form (bila ada di halaman). */
export function showNotice(text) {
  const notice = $('[data-notice]');
  if (!notice) return;
  $('[data-notice-text]', notice).textContent = text;
  notice.hidden = false;
}

/**
 * Validasi & kirim form. `action` menerima isi form; lempar Error untuk menampilkan pesan.
 */
export function bindAuthForm(form, action) {
  const error = $('[data-error]', form);
  const submit = $('button:not([type=button])', form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showError(error, '');
    const invalid = validateFields($$('.input', form));
    if (invalid) {
      showError(error, `${invalid.labels[0]?.textContent ?? 'Isian'}: ${invalid.validationMessage}`);
      invalid.focus();
      return;
    }
    try {
      action(Object.fromEntries(new FormData(form)));
    } catch (err) {
      showError(error, err.message);
      form.classList.remove('shake');
      void form.offsetWidth; // ulangi animasi getar
      form.classList.add('shake');
      if (nomi) {
        const mood = nomi.mood;
        nomi.setMood('sedih');
        setTimeout(() => nomi.mood === 'sedih' && nomi.setMood(mood), 2500);
      }
      return;
    }
    submit.disabled = true;
    submit.textContent = 'Memuat…';
    nomi?.play('lompat');
    setTimeout(goNext, nomi ? 700 : 0); // beri waktu Nomi melompat senang
  });
}

export { params as authParams };
