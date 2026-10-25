import { mountAppShell } from '../components/app-shell.js';
import { confirmDialog } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { emptyState } from '../components/ui.js';
import { IMG, ROUTES, STATUS_MISI, JUMLAH_PETUNJUK } from '../config/constants.js';
import { misiService, cekKelengkapanMisi } from '../services/misi.service.js';
import { $, esc } from '../utils/dom.js';
import { formatXP } from '../utils/format.js';

mountAppShell('misi');

const rows = $('[data-rows]');
const searchEl = $('[data-search]');
const statusEl = $('[data-status-filter]');
const STATUS_BG = { aktif: 'bg-ok', draft: 'bg-warn', nonaktif: 'bg-danger' };
let semua = []; // semua misi milik guru, dimuat dari server

async function muat() {
  try {
    semua = await misiService.list();
  } catch (err) {
    toast(err.message, 'error');
  }
  render();
}

const cari = (id) => semua.find((m) => String(m.id) === String(id));

function statusSelect(m) {
  return `
    <select data-set-status="${m.id}" aria-label="Status ${esc(m.judul)}"
      class="cursor-pointer rounded-[9px] border-2 border-bark px-2 py-1 font-bold shadow-chip ${STATUS_BG[m.status]}">
      ${Object.entries(STATUS_MISI)
        .map(([value, s]) => `<option value="${value}" ${m.status === value ? 'selected' : ''}>${s.label}</option>`)
        .join('')}
    </select>`;
}

function row(m, i) {
  const terisi = m.petunjuk.filter((p) => p.judul?.trim()).length;
  return `
    <tr style="--i:${i}">
      <td class="stack-hide">${i + 1}</td>
      <td class="stack-full text-left!">
        <div class="flex items-center gap-3">
          <img src="${IMG.missionList}" alt="" class="size-10 shrink-0" />
          <div class="min-w-0">
            <p class="font-bold">${esc(m.judul)}</p>
            <p class="line-clamp-1 font-body text-sm font-normal text-bark">${esc(m.deskripsi) || '<i>Belum ada deskripsi</i>'}</p>
          </div>
        </div>
      </td>
      <td class="text-brand" data-label="XP">${formatXP(m.xp)}</td>
      <td data-label="Petunjuk">${terisi}/${JUMLAH_PETUNJUK}</td>
      <td data-label="Status">${statusSelect(m)}</td>
      <td class="stack-full">
        <div class="flex flex-wrap justify-center gap-2">
          <a href="${ROUTES.misiEditor}?id=${m.id}" class="btn btn-sm btn-secondary">Edit</a>
          <a href="${ROUTES.misiEditor}?id=${m.id}&step=4" class="btn btn-sm btn-secondary">Pratinjau</a>
          <button type="button" class="btn btn-sm btn-danger" data-delete="${m.id}">Hapus</button>
        </div>
      </td>
    </tr>`;
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  const status = statusEl.value;
  const items = semua
    .filter((m) => !status || m.status === status)
    .filter((m) => !q || m.judul.toLowerCase().includes(q));

  rows.innerHTML = items.length
    ? items.map(row).join('')
    : `<tr><td colspan="6">${
        q || status ? emptyState('Misi tidak ditemukan') : emptyState('Belum ada misi', 'Klik "+Misi Baru" untuk membuat misi.')
      }</td></tr>`;
}

rows.addEventListener('change', async (e) => {
  const select = e.target.closest('[data-set-status]');
  if (!select) return;
  const m = cari(select.dataset.setStatus);
  if (select.value === 'aktif') {
    const masalah = cekKelengkapanMisi(m);
    if (masalah.length) {
      toast(`Belum bisa diaktifkan: ${masalah[0]}`, 'error');
      select.value = m.status;
      return;
    }
  }
  select.disabled = true;
  try {
    const saved = await misiService.setStatus(m.id, select.value);
    Object.assign(m, saved);
    toast(`Status "${m.judul}" menjadi ${STATUS_MISI[saved.status].label}.`);
  } catch (err) {
    toast(`Belum bisa diubah: ${err.message}`, 'error');
  }
  render();
});

rows.addEventListener('click', async (e) => {
  const del = e.target.closest('[data-delete]');
  if (!del) return;
  const m = cari(del.dataset.delete);
  const ok = await confirmDialog({
    title: 'Hapus misi?',
    message: `"${m.judul}" beserta petunjuk dan kunci jawabannya akan dihapus.`,
    confirmText: 'Hapus',
    danger: true,
  });
  if (!ok) return;
  try {
    await misiService.remove(m.id);
    toast('Misi dihapus.');
  } catch (err) {
    toast(err.message, 'error');
  }
  muat();
});

searchEl.addEventListener('input', render);
statusEl.addEventListener('change', render);
muat();
