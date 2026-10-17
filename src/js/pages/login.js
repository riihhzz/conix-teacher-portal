import { ROUTES, asset } from '../config/constants.js';
import { authService } from '../services/auth.service.js';
import { $, $$, validateFields, showError } from '../utils/dom.js';

const params = new URLSearchParams(location.search);
const next = params.get('next');
const goNext = () => location.replace(next?.startsWith(asset('pages/')) ? next : ROUTES.dashboard);

if (authService.currentUser()) goNext();

/* ------------------------------------------------ Pemberitahuan */

const notice = $('[data-notice]');
function showNotice(text) {
  $('[data-notice-text]').textContent = text;
  notice.hidden = false;
}
if (params.has('keluar')) showNotice('Anda sudah keluar. Sampai jumpa lagi!');
else if (next) showNotice('Silakan masuk terlebih dahulu untuk membuka halaman itu.');

/* ------------------------------------------------ Tab Masuk / Daftar */

const tabs = $$('[data-tab]');
const forms = $$('[data-form]');
const indicator = $('[data-tab-indicator]');

function showTab(name, { focus = true } = {}) {
  tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
  indicator.style.transform = name === 'register' ? 'translateX(100%)' : '';
  for (const form of forms) {
    const active = form.dataset.form === name;
    form.hidden = !active;
    if (active) {
      form.classList.remove('animate-fade-up');
      void form.offsetWidth; // ulangi animasi
      form.classList.add('animate-fade-up');
      if (focus) $('input', form).focus();
    }
  }
  history.replaceState(null, '', `${location.pathname}${location.search}#${name === 'register' ? 'daftar' : 'masuk'}`);
}

tabs.forEach((tab) => tab.addEventListener('click', () => showTab(tab.dataset.tab)));
$$('[data-switch]').forEach((link) =>
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showTab(link.dataset.switch);
  }),
);
if (location.hash === '#daftar') showTab('register', { focus: false });

/* ------------------------------------------------ Lihat password */

$$('[data-toggle-password]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password');
    btn.classList.toggle('opacity-50', show);
  }),
);

/* ------------------------------------------------ Submit */

function bindForm(form, action) {
  const error = $('[data-error]', form);
  const submit = $('button.btn-primary', form);

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
      void form.offsetWidth;
      form.classList.add('shake');
      return;
    }
    submit.disabled = true;
    submit.textContent = 'Memuat…';
    goNext();
  });
}

bindForm($('[data-form="login"]'), ({ email, password }) => authService.login(email, password));

bindForm($('[data-form="register"]'), ({ password2, ...data }) => {
  if (data.password !== password2) {
    $('#reg-password2').setAttribute('aria-invalid', 'true');
    throw new Error('Konfirmasi password tidak sama.');
  }
  authService.register(data);
});
