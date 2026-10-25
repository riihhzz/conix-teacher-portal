import { mountAppShell } from '../components/app-shell.js';
import { statusBadge, emptyState } from '../components/ui.js';
import { toast } from '../components/toast.js';
import { IMG, ROUTES } from '../config/constants.js';
import { misiService } from '../services/misi.service.js';
import { statistikKelas } from '../services/siswa.service.js';
import { $, esc } from '../utils/dom.js';

const user = mountAppShell('dashboard');

$('[data-user-name]').textContent = user.panggilan || user.nama;
$('[data-class-code]').textContent = user.kodeKelas;

$('[data-copy-code]').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(user.kodeKelas);
    toast(`Kode kelas ${user.kodeKelas} disalin.`);
  } catch {
    toast('Gagal menyalin. Salin kode secara manual.', 'error');
  }
});

const [stat, semuaMisi] = await Promise.all([statistikKelas(), misiService.list()]).catch((err) => {
  toast(err.message, 'error');
  return [{ totalMisi: 0, jumlahSiswa: 0, totalMateri: 0, rataSelesai: 0 }, []];
});

/* Statistik (4 kartu krem) */
$('[data-stats]').innerHTML = [
  ['Total Misi', stat.totalMisi],
  ['Jumlah Siswa', stat.jumlahSiswa],
  ['Total Materi', stat.totalMateri],
  ['Penyelesaian', `${stat.rataSelesai}%`],
]
  .map(
    ([label, value], i) => `
    <div style="--i:${i}" class="card flex min-h-40 flex-col p-4 sm:min-h-52 sm:p-5">
      <span class="size-10 rounded-sm border border-ink bg-linear-to-b from-sun to-sun-light shadow-sm" aria-hidden="true"></span>
      <p class="mt-3 text-lg font-semibold sm:text-[27px]">${label}</p>
      <p class="mt-auto text-5xl font-extrabold sm:text-[64px] sm:leading-none">${value}</p>
    </div>`,
  )
  .join('');

/* Daftar misi (baris kuning + badge status) */
const missions = semuaMisi.slice(0, 6);
$('[data-missions]').innerHTML = missions.length
  ? missions
      .map(
        (m, i) => `
      <li style="--i:${i}">
        <a href="${ROUTES.misiEditor}?id=${m.id}"
          class="row-honey flex min-h-19.5 items-center gap-4 px-4 py-3 transition hover:-translate-y-0.5">
          <img src="${IMG.missionList}" alt="" class="size-13 shrink-0" />
          <span class="min-w-0 flex-1 truncate text-lg font-bold sm:text-[22px]">${esc(m.judul)}</span>
          ${statusBadge(m.status)}
        </a>
      </li>`,
      )
      .join('')
  : `<li class="card lg:col-span-2">${emptyState('Belum ada misi', 'Buat misi investigasi pertama untuk kelas Anda.')}</li>`;
