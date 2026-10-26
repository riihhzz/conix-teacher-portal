import { mountAppShell } from '../components/app-shell.js';
import { confirmDialog, openModal } from '../components/modal.js';
import { avatar, emptyState, statusBadge } from '../components/ui.js';
import { toast } from '../components/toast.js';
import { KATEGORI_MATERI } from '../config/constants.js';
import { siswaService } from '../services/siswa.service.js';
import { $, esc } from '../utils/dom.js';
import { formatAngka, formatTanggal } from '../utils/format.js';

const user = mountAppShell('siswa');
$('[data-class-code]').textContent = user.kodeKelas;

const loadRanking = () =>
  siswaService.ranking().catch((err) => {
    toast(err.message, 'error');
    return [];
  });
let ranking = await loadRanking();
const rows = $('[data-rows]');
const searchEl = $('[data-search]');
const MEDAL = ['bg-[#ffd23f]', 'bg-[#d9d9d9]', 'bg-[#e0915a]'];
const xp = (n) => `${formatAngka(n)} XP`;

/** Nama siswa yang bisa diklik untuk membuka detail progresnya. */
const nameButton = (s, extra = '') =>
  `<button type="button" data-detail="${s.id}" title="Lihat detail ${esc(s.nama)}"
    class="cursor-pointer text-left underline decoration-ink/30 decoration-dotted underline-offset-4 transition hover:text-brand hover:decoration-brand ${extra}">${esc(s.nama)}</button>`;

/* Tiga besar */
function renderPodium() {
  $('[data-podium]').innerHTML = ranking
    .slice(0, 3)
    .map(
      (s, i) => `
      <div style="--i:${i}" class="${i === 0 ? 'panel-sun' : 'card'} flex items-center gap-4 p-5">
        <span class="grid size-14 shrink-0 place-items-center rounded-full border-3 border-ink text-2xl font-extrabold ${MEDAL[i]}">${s.rank}</span>
        <div class="min-w-0">
          <p class="truncate text-xl font-bold">${nameButton(s, 'max-w-full truncate')}</p>
          <p class="font-body text-bark">${s.misiSelesai} misi selesai</p>
          <p class="text-lg font-extrabold text-brand">${xp(s.xp)}</p>
        </div>
      </div>`,
    )
    .join('');
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  const list = ranking.filter((s) => !q || s.nama.toLowerCase().includes(q));
  rows.innerHTML = list.length
    ? list
        .map(
          (s, i) => `
        <tr style="--i:${i}">
          <td class="font-bold" data-label="Peringkat">${s.rank}</td>
          <td data-label="Nama">${nameButton(s)}</td>
          <td data-label="Misi Selesai">${s.misiSelesai}</td>
          <td data-label="Lencana">${s.lencana}</td>
          <td class="font-bold text-brand" data-label="XP">${xp(s.xp)}</td>
        </tr>`,
        )
        .join('')
    : `<tr><td colspan="5">${
        q
          ? emptyState('Siswa tidak ditemukan')
          : emptyState('Belum ada siswa', `Bagikan kode kelas ${user.kodeKelas} agar siswa bisa bergabung lewat aplikasi CONIX.`)
      }</td></tr>`;
}

/* ------------------------------------------------------ Detail siswa */

const stars = (n) =>
  `<span class="whitespace-nowrap text-lg tracking-tight" aria-label="${n} dari 3 bintang">${[1, 2, 3]
    .map((i) => `<span class="${i <= n ? 'text-[#f5b301]' : 'text-ink/20'}">★</span>`)
    .join('')}</span>`;

const tanggal = (iso) => (iso ? formatTanggal(iso) : '–');

function statBox(label, value) {
  return `
    <div class="rounded-[13px] border-2 border-ink bg-paper p-3">
      <dt class="text-sm font-semibold">${label}</dt>
      <dd class="text-2xl font-extrabold">${value}</dd>
    </div>`;
}

function detailHtml(s) {
  const misiRows = s.misi.length
    ? s.misi
        .map(
          (m) => `
        <tr>
          <td class="stack-full text-left!">
            <p class="font-bold">${esc(m.judul)}</p>
            ${m.status !== 'aktif' ? `<span class="mt-1 inline-block">${statusBadge(m.status)}</span>` : ''}
          </td>
          <td data-label="Bintang">${m.selesai ? stars(m.bintang) : '<span class="font-body text-sm text-bark">Belum selesai</span>'}</td>
          <td data-label="Percobaan">${m.percobaan}×</td>
          <td class="font-bold text-brand" data-label="XP">${formatAngka(m.xpDidapat)} / ${formatAngka(m.xp)}</td>
          <td data-label="Terakhir">${tanggal(m.terakhir)}</td>
        </tr>`,
        )
        .join('')
    : `<tr><td colspan="5">${emptyState('Belum ada misi aktif', 'Publikasikan misi agar siswa bisa mulai menyelidiki.')}</td></tr>`;

  const kuis = KATEGORI_MATERI.map(
    (k) => `
      <div class="flex items-center gap-3 rounded-[13px] border-2 border-ink bg-paper p-3">
        <img src="${k.ikon}" alt="" class="size-10 object-contain" />
        <div>
          <p class="font-bold">${k.nama}</p>
          <p class="font-body text-sm text-bark">${
            k.id in s.kuis ? `Skor terbaik: <b class="text-ink">${s.kuis[k.id]} benar</b>` : 'Belum mengerjakan kuis'
          }</p>
        </div>
      </div>`,
  ).join('');

  return `
    <div class="flex max-h-[90vh] flex-col">
      <div class="flex items-center gap-4 border-b-3 border-ink px-6 py-4">
        ${avatar(s, 'size-14')}
        <div class="min-w-0 flex-1">
          <h2 class="truncate text-2xl font-bold">${esc(s.nama)}</h2>
          <p class="truncate font-body text-sm text-bark">${esc(s.email)} · bergabung ${tanggal(s.bergabung)}</p>
        </div>
        <button type="button" class="btn-icon text-2xl font-bold" data-close aria-label="Tutup">&times;</button>
      </div>

      <div class="space-y-6 overflow-y-auto px-6 py-5">
        <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          ${statBox('Peringkat', s.rank ? `#${s.rank}` : '–')}
          ${statBox('Total XP', formatAngka(s.xp))}
          ${statBox('Misi Selesai', `${s.misiSelesai}/${s.misi.filter((m) => m.status === 'aktif').length}`)}
          ${statBox('Streak', `${s.streak} hari`)}
        </dl>
        <p class="-mt-3 font-body text-sm text-bark">
          Streak terbaik ${s.streakTerbaik} hari · terakhir aktif ${tanggal(s.terakhirAktif)}
        </p>

        <section>
          <h3 class="text-xl font-bold">Progres Misi</h3>
          <div class="mt-3 overflow-x-auto rounded-[13px] border-2 border-ink">
            <table class="table-conix table-stack w-full">
              <thead>
                <tr><th class="text-left!">Misi</th><th>Bintang</th><th>Percobaan</th><th>XP</th><th>Terakhir</th></tr>
              </thead>
              <tbody>${misiRows}</tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-bold">Kuis Kilat</h3>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">${kuis}</div>
        </section>

        <section class="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink/15 pt-4">
          <p class="font-body text-sm text-bark">Salah kelas? Keluarkan siswa ini; akunnya tetap ada dan bisa bergabung lagi.</p>
          <button type="button" class="btn btn-sm btn-danger" data-remove-student>Keluarkan dari Kelas</button>
        </section>
      </div>
    </div>`;
}

async function removeStudent(dialog, s) {
  const ok = await confirmDialog({
    title: 'Keluarkan siswa?',
    message: `${s.nama} akan dikeluarkan dari kelas ${user.kodeKelas}. Progres & akunnya tetap ada; ia bisa bergabung lagi dengan kode kelas.`,
    confirmText: 'Keluarkan',
    danger: true,
  });
  if (!ok) return;
  try {
    await siswaService.remove(s.id);
  } catch (err) {
    toast(err.message, 'error');
    return;
  }
  dialog.close();
  toast(`${s.nama} dikeluarkan dari kelas.`);
  ranking = await loadRanking();
  renderPodium();
  render();
}

async function openDetail(id) {
  const dialog = openModal(
    `<div class="flex items-center justify-center gap-3 p-10 font-bold">
       <span class="size-6 animate-spin rounded-full border-4 border-brand border-t-transparent"></span> Memuat detail siswa…
     </div>`,
    { size: 'lg' },
  );
  try {
    const detail = await siswaService.detail(id);
    if (!dialog.open) return;
    dialog.innerHTML = detailHtml(detail);
    dialog.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', () => dialog.close()));
    $('[data-remove-student]', dialog).addEventListener('click', () => removeStudent(dialog, detail));
  } catch (err) {
    dialog.close();
    toast(err.message, 'error');
  }
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-detail]');
  if (btn) openDetail(btn.dataset.detail);
});

searchEl.addEventListener('input', render);
renderPodium();
render();
