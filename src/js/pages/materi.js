import { mountAppShell } from '../components/app-shell.js';
import { openTemplateModal, confirmDialog } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { materiBadge, emptyState } from '../components/ui.js';
import { KATEGORI_MATERI, BATAS_UKURAN } from '../config/constants.js';
import { materiService } from '../services/materi.service.js';
import { $, $$, esc, validateFields, showError } from '../utils/dom.js';
import { formatTanggal, formatUkuran } from '../utils/format.js';
import { readFileAsDataURL, assertFileSize } from '../utils/file.js';

mountAppShell('materi');

const listEl = $('[data-list]');
const searchEl = $('[data-search]');
const filterEl = $('[data-filter]');
let activeFilter = '';

const kategori = (id) => KATEGORI_MATERI.find((k) => k.id === id) ?? KATEGORI_MATERI[0];

/* ---------------------------------------------------------- Render */

function renderCategories() {
  const all = materiService.list();
  $('[data-categories]').innerHTML = KATEGORI_MATERI.map(
    (k, i) => `
    <button style="--i:${i}" type="button" data-category="${k.id}" aria-pressed="${activeFilter === k.id}"
      class="panel-sun flex cursor-pointer flex-col items-center px-5 py-5 text-center transition hover:-translate-y-1 aria-pressed:ring-4 aria-pressed:ring-brand">
      <img src="${k.ikon}" alt="" class="size-27.5 object-contain" />
      <span class="mt-2 text-[26px] font-bold">${k.nama}</span>
      <span class="mt-1 font-body text-lg text-bark">${k.deskripsi}</span>
      <span class="mt-3 rounded-full border-2 border-ink bg-cream px-3 py-0.5 text-sm font-bold">
        ${all.filter((m) => m.kategori === k.id).length} materi
      </span>
    </button>`,
  ).join('');
}

function materiCard(m, i) {
  const k = kategori(m.kategori);
  return `
    <li style="--i:${i}" class="card flex flex-col p-5 transition hover:-translate-y-1 hover:shadow-card">
      <div class="flex items-start gap-4">
        <span class="grid size-16 shrink-0 place-items-center rounded-xl border-2 border-ink bg-linear-to-b from-sun to-sun-light">
          <img src="${k.ikon}" alt="" class="size-12 object-contain" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-brand uppercase">${k.nama}</p>
          <h3 class="text-xl leading-snug font-bold">${esc(m.judul)}</h3>
        </div>
        ${materiBadge(m.status)}
      </div>
      <p class="mt-3 line-clamp-3 font-body text-bark">${esc(m.ringkasan || m.konten)}</p>
      <div class="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
        ${m.lampiran ? `<span class="rounded-full border-2 border-ink bg-paper px-2.5 py-0.5">📎 ${esc(m.lampiran.nama)}</span>` : ''}
        ${m.videoUrl ? `<a href="${esc(m.videoUrl)}" target="_blank" rel="noopener" class="rounded-full border-2 border-ink bg-paper px-2.5 py-0.5 hover:bg-sun-light">🎬 Video</a>` : ''}
      </div>
      <div class="mt-auto flex items-center justify-between gap-2 pt-4">
        <span class="font-body text-sm text-bark">${formatTanggal(m.diubah)}</span>
        <div class="flex gap-2">
          <button type="button" class="btn btn-sm btn-secondary" data-edit="${m.id}">Edit</button>
          <button type="button" class="btn btn-sm btn-danger" data-delete="${m.id}">Hapus</button>
        </div>
      </div>
    </li>`;
}

function renderList() {
  const q = searchEl.value.trim().toLowerCase();
  const items = materiService
    .list()
    .filter((m) => !activeFilter || m.kategori === activeFilter)
    .filter((m) => !q || `${m.judul} ${m.ringkasan}`.toLowerCase().includes(q));

  listEl.innerHTML = items.length
    ? items.map(materiCard).join('')
    : `<li class="card col-span-full">${
        q || activeFilter
          ? emptyState('Materi tidak ditemukan', 'Coba kata kunci atau kategori lain.')
          : emptyState('Belum ada materi', 'Klik "Upload Materi" untuk menambahkan materi pertama.')
      }</li>`;
}

function render() {
  renderCategories();
  renderList();
}

function setFilter(value) {
  activeFilter = activeFilter === value && value ? '' : value;
  $$('[role=tab]', filterEl).forEach((t) => t.setAttribute('aria-selected', String(t.dataset.value === activeFilter)));
  render();
}

/* ------------------------------------------------------ Form modal */

function openForm(materi = null) {
  const dialog = openTemplateModal('materi-form', { size: 'lg' });
  const form = $('form', dialog);
  const error = $('[data-error]', form);
  const fileInput = $('input[type=file]', form);
  const fileName = $('[data-file-name]', form);
  const fileClear = $('[data-file-clear]', form);
  const dropzone = $('[data-dropzone]', form);
  let lampiran = materi?.lampiran ?? null;

  const showFile = () => {
    fileName.textContent = lampiran ? `${lampiran.nama} (${formatUkuran(lampiran.ukuran)})` : 'Belum ada file dipilih';
    fileClear.hidden = !lampiran;
  };

  if (materi) {
    $('[data-title]', form).textContent = 'Edit Materi';
    for (const key of ['judul', 'kategori', 'status', 'ringkasan', 'konten', 'videoUrl']) {
      form.elements[key].value = materi[key] ?? '';
    }
  } else if (activeFilter) {
    form.elements.kategori.value = activeFilter;
  }
  showFile();

  async function pickFile(file) {
    if (!file) return;
    try {
      assertFileSize(file, BATAS_UKURAN.lampiran);
      lampiran = { nama: file.name, tipe: file.type, ukuran: file.size, dataUrl: await readFileAsDataURL(file) };
      showFile();
    } catch (err) {
      fileInput.value = '';
      toast(err.message, 'error');
    }
  }

  fileInput.addEventListener('change', () => pickFile(fileInput.files[0]));
  fileClear.addEventListener('click', () => {
    lampiran = null;
    fileInput.value = '';
    showFile();
  });
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('bg-sun-light');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('bg-sun-light'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('bg-sun-light');
    pickFile(e.dataTransfer.files[0]);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = validateFields($$('.input', form));
    if (invalid) {
      showError(error, invalid.validationMessage);
      invalid.focus();
      return;
    }
    const { file, ...data } = Object.fromEntries(new FormData(form));
    try {
      materiService.save({ ...materi, ...data, judul: data.judul.trim(), lampiran });
    } catch (err) {
      showError(error, err.message);
      return;
    }
    dialog.close();
    toast(materi ? 'Materi berhasil diperbarui.' : 'Materi berhasil diupload!');
    render();
  });
}

/* ---------------------------------------------------------- Events */

$('[data-upload]').addEventListener('click', () => openForm());
searchEl.addEventListener('input', renderList);

$('[data-categories]').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-category]');
  if (btn) setFilter(btn.dataset.category);
});

filterEl.addEventListener('click', (e) => {
  const tab = e.target.closest('[role=tab]');
  if (tab) setFilter(tab.dataset.value);
});

listEl.addEventListener('click', async (e) => {
  const edit = e.target.closest('[data-edit]');
  const del = e.target.closest('[data-delete]');
  if (edit) openForm(materiService.get(edit.dataset.edit));
  if (!del) return;

  const m = materiService.get(del.dataset.delete);
  const ok = await confirmDialog({
    title: 'Hapus materi?',
    message: `"${m.judul}" akan dihapus dan tidak tampil lagi di aplikasi siswa.`,
    confirmText: 'Hapus',
    danger: true,
  });
  if (!ok) return;
  materiService.remove(m.id);
  toast('Materi dihapus.');
  render();
});

render();
if (new URLSearchParams(location.search).has('upload')) openForm();
