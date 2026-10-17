import { mountAppShell } from '../components/app-shell.js';
import { emptyState } from '../components/ui.js';
import { siswaService } from '../services/siswa.service.js';
import { $, esc } from '../utils/dom.js';
import { formatAngka } from '../utils/format.js';

const user = mountAppShell('siswa');
$('[data-class-code]').textContent = user.kodeKelas;

const ranking = siswaService.ranking();
const rows = $('[data-rows]');
const searchEl = $('[data-search]');
const MEDAL = ['bg-[#ffd23f]', 'bg-[#d9d9d9]', 'bg-[#e0915a]'];
const xp = (n) => `${formatAngka(n)} XP`;

/* Tiga besar */
$('[data-podium]').innerHTML = ranking
  .slice(0, 3)
  .map(
    (s, i) => `
    <div style="--i:${i}" class="${i === 0 ? 'panel-sun' : 'card'} flex items-center gap-4 p-5">
      <span class="grid size-14 shrink-0 place-items-center rounded-full border-3 border-ink text-2xl font-extrabold ${MEDAL[i]}">${s.rank}</span>
      <div class="min-w-0">
        <p class="truncate text-xl font-bold">${esc(s.nama)}</p>
        <p class="font-body text-bark">${s.misiSelesai} misi selesai</p>
        <p class="text-lg font-extrabold text-brand">${xp(s.xp)}</p>
      </div>
    </div>`,
  )
  .join('');

function render() {
  const q = searchEl.value.trim().toLowerCase();
  const list = ranking.filter((s) => !q || s.nama.toLowerCase().includes(q));
  rows.innerHTML = list.length
    ? list
        .map(
          (s, i) => `
        <tr style="--i:${i}">
          <td class="font-bold">${s.rank}</td>
          <td>${esc(s.nama)}</td>
          <td>${s.misiSelesai}</td>
          <td>${s.lencana}</td>
          <td class="font-bold text-brand">${xp(s.xp)}</td>
        </tr>`,
        )
        .join('')
    : `<tr><td colspan="5">${
        q
          ? emptyState('Siswa tidak ditemukan')
          : emptyState('Belum ada siswa', `Bagikan kode kelas ${user.kodeKelas} agar siswa bisa bergabung lewat aplikasi CONIX.`)
      }</td></tr>`;
}

searchEl.addEventListener('input', render);
render();
