import { mountAppShell } from '../components/app-shell.js';
import { openTemplateModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { avatar } from '../components/ui.js';
import { BATAS_UKURAN, asset } from '../config/constants.js';
import { authService } from '../services/auth.service.js';
import { statistikKelas } from '../services/siswa.service.js';
import { $, $$, esc, validateFields, showError } from '../utils/dom.js';
import { formatTanggal } from '../utils/format.js';
import { readFileAsDataURL, assertFileSize } from '../utils/file.js';

let user = mountAppShell('profil');

/* Ikon informasi akun (Figma: Desktop - 3) */
const ICONS = {
  nama: '<svg viewBox="0 0 24 24" class="size-11" fill="none" stroke="#3a1f15" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21v-1.5A5.5 5.5 0 0 1 10 14h4a5.5 5.5 0 0 1 5.5 5.5V21z"/></svg>',
  email: `<img src="${asset('images/icons/mail.svg')}" alt="" class="h-9 w-12" />`,
  status:
    `<img src="${asset('images/icons/check-circle.svg')}" alt="" class="size-12" /><img src="${asset('images/icons/check.svg')}" alt="" class="absolute inset-0 m-auto h-5 w-7" />`,
  kelas:
    '<svg viewBox="0 0 24 24" class="size-11" fill="none" stroke="#3a1f15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg>',
  tanggal:
    '<svg viewBox="0 0 24 24" class="size-12" fill="none" stroke="#3a1f15" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4" stroke-linecap="round"/><rect x="6" y="13" width="4" height="4" fill="#3a1f15" stroke="none"/></svg>',
};

function render() {
  $('[data-avatar]').innerHTML = avatar(user, 'size-41 border-4 shadow-card');
  $('[data-display-name]').textContent = user.panggilan || user.nama;
  $('[data-display-email]').textContent = user.email;
  $('[data-photo-remove]').hidden = !user.foto;

  $('[data-account-info]').innerHTML = [
    ['nama', 'Nama', user.nama],
    ['status', 'Status', 'Guru'],
    ['email', 'Email', user.email],
    ['tanggal', 'Bergabung Sejak', formatTanggal(user.bergabung)],
    ['kelas', 'Kode Kelas', user.kodeKelas],
  ]
    .map(
      ([icon, label, value]) => `
      <div class="flex items-center gap-3">
        <span class="relative grid size-14 shrink-0 place-items-center">${ICONS[icon]}</span>
        <div class="min-w-0">
          <dt class="text-xl font-semibold sm:text-[24px]">${label}</dt>
          <dd class="text-lg break-all sm:text-[22px]">${esc(value)}</dd>
        </div>
      </div>`,
    )
    .join('');
}

const stat = statistikKelas();
$('[data-summary]').innerHTML = [
  ['Misi Dibuat', stat.totalMisi],
  ['Misi Aktif', stat.misiAktif],
  ['Materi', stat.totalMateri],
  ['Siswa', stat.jumlahSiswa],
]
  .map(
    ([label, value]) => `
    <div class="rounded-[13px] border-2 border-ink bg-cream p-3">
      <dt class="font-semibold">${label}</dt>
      <dd class="text-3xl font-extrabold">${value}</dd>
    </div>`,
  )
  .join('');

$('[data-photo-input]').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    assertFileSize(file, BATAS_UKURAN.foto);
    user = authService.updateProfile({ foto: await readFileAsDataURL(file) });
    toast('Foto profil diperbarui.');
    render();
  } catch (err) {
    toast(err.message, 'error');
  }
});

$('[data-photo-remove]').addEventListener('click', () => {
  user = authService.updateProfile({ foto: '' });
  toast('Foto profil dihapus.');
  render();
});

$('[data-edit-profile]').addEventListener('click', () => {
  const dialog = openTemplateModal('profile-form');
  const form = $('form', dialog);
  const error = $('[data-error]', form);
  form.elements.nama.value = user.nama;
  form.elements.panggilan.value = user.panggilan ?? '';
  form.elements.email.value = user.email;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = validateFields($$('.input', form));
    if (invalid) {
      showError(error, invalid.validationMessage);
      invalid.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    try {
      user = authService.updateProfile({
        nama: data.nama.trim(),
        panggilan: data.panggilan.trim(),
        email: data.email.trim(),
      });
    } catch (err) {
      showError(error, err.message);
      return;
    }
    dialog.close();
    toast('Profil disimpan.');
    render();
  });
});

render();
