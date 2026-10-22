/**
 * Editor misi 4 langkah: Informasi → Petunjuk → Analisis → Publikasi.
 * Struktur data mengikuti model Mission di aplikasi murid (conix_app).
 */
import { mountAppShell } from '../components/app-shell.js';
import { toast } from '../components/toast.js';
import {
  ROUTES,
  IMG,
  IKON_PETUNJUK,
  LENCANA,
  KARTU_DEFAULT,
  JUMLAH_PETUNJUK,
  JUMLAH_SLOT,
  BATAS_UKURAN,
  ikonSrc,
  lencanaSrc,
} from '../config/constants.js';
import { misiService, cekKelengkapanMisi } from '../services/misi.service.js';
import { $, $$, esc, validateFields } from '../utils/dom.js';
import { formatXP } from '../utils/format.js';
import { readFileAsDataURL, assertFileSize } from '../utils/file.js';

mountAppShell('misi');

const STEPS = ['Informasi', 'Petunjuk', 'Analisis', 'Publikasi'];
const form = $('[data-wizard]');
const params = new URLSearchParams(location.search);

/* ------------------------------------------------------------ State */

const blankClue = () => ({ judul: '', ikon: IKON_PETUNJUK[0].id, simulasi: '', tipe: 'angka', awal: '', akhir: '', pesan: '' });

function loadMisi() {
  const id = params.get('id');
  const existing = id ? misiService.get(id) : null;
  if (id && !existing) toast('Misi tidak ditemukan, membuat misi baru.', 'error');

  const misi = existing ?? {
    judul: '',
    deskripsi: '',
    foto: '',
    xp: '',
    status: 'draft',
    lencana: { nama: '', gambar: LENCANA[0].id },
    petunjuk: [],
    analisis: { kartu: [...KARTU_DEFAULT], kunci: [], penjelasan: '' },
  };
  misi.lencana = { nama: '', gambar: LENCANA[0].id, ...misi.lencana };
  misi.petunjuk = Array.from({ length: JUMLAH_PETUNJUK }, (_, i) => ({ ...blankClue(), ...misi.petunjuk[i] }));
  misi.analisis.kunci = Array.from({ length: JUMLAH_SLOT }, (_, i) => misi.analisis.kunci[i] ?? '');
  return misi;
}

const misi = loadMisi();
let step = Math.min(STEPS.length, Math.max(1, Number(params.get('step')) || 1));
let activeClue = 0;
let activeSlot = Math.max(0, misi.analisis.kunci.findIndex((k) => !k));
let previewIndex = 0;

if (misi.id) {
  document.title = `Edit ${misi.judul} · CONIX Teacher Portal`;
  $('[data-heading]').textContent = 'Edit Misi';
}

/* ---------------------------------------------------------- Stepper */

function renderStepper() {
  $('[data-stepper]').innerHTML = STEPS.map(
    (label, i) => `
      ${i ? '<li aria-hidden="true" class="mx-1 h-1.75 w-6 rounded-full bg-ink sm:w-10"></li>' : ''}
      <li>
        <button type="button" data-goto="${i + 1}" ${i + 1 === step ? 'aria-current="step"' : ''}
          class="flex cursor-pointer items-center gap-2 rounded-full pr-2 text-base font-semibold sm:gap-3 sm:text-[22px]">
          <span class="size-11 shrink-0 rounded-full border-2 border-ink transition sm:size-16 ${i + 1 <= step ? 'bg-step' : 'bg-cream'}"></span>
          ${label}
        </button>
      </li>`,
  ).join('');
  // di layar kecil stepper bisa digeser; pastikan langkah aktif terlihat
  $('[aria-current=step]').scrollIntoView({ inline: 'center', block: 'nearest' });
}

/* ------------------------------------------------ Langkah 1: Info */

const photo = {
  preview: $('[data-photo-preview]'),
  name: $('[data-photo-name]'),
  clear: $('[data-photo-clear]'),
  input: $('[data-photo-input]'),
};

function renderPhoto(fileName) {
  photo.preview.classList.toggle('hidden', !misi.foto);
  if (misi.foto) photo.preview.src = misi.foto;
  photo.name.textContent = misi.foto ? fileName || 'Foto terpasang' : 'Belum ada foto';
  photo.clear.hidden = !misi.foto;
}

function renderBadges() {
  $('[data-badge-list]').innerHTML = LENCANA.map(
    (l) => `
    <label class="grid size-24 cursor-pointer place-items-center rounded-2xl border-3 border-ink bg-white shadow-soft transition hover:-translate-y-0.5 has-checked:border-brand has-checked:bg-sun-light has-checked:ring-4 has-checked:ring-brand/30">
      <input type="radio" name="badge" value="${l.id}" class="sr-only" ${misi.lencana.gambar === l.id ? 'checked' : ''} />
      <img src="${l.src}" alt="${l.label}" class="size-20 object-contain" />
    </label>`,
  ).join('');
}

function fillInfo() {
  form.elements.judul.value = misi.judul;
  form.elements.deskripsi.value = misi.deskripsi;
  form.elements.xp.value = misi.xp;
  form.elements.lencana.value = misi.lencana.nama;
  renderPhoto();
  renderBadges();
}

function readInfo() {
  misi.judul = form.elements.judul.value.trim();
  misi.deskripsi = form.elements.deskripsi.value.trim();
  misi.xp = Number(form.elements.xp.value) || '';
  misi.lencana.nama = form.elements.lencana.value.trim();
}

function validateInfo() {
  readInfo();
  const invalid = validateFields(['judul', 'deskripsi', 'xp'].map((n) => form.elements[n]));
  if (invalid) {
    invalid.focus();
    toast(`${invalid.labels[0].textContent}: ${invalid.validationMessage}`, 'error');
  }
  return !invalid;
}

photo.input.addEventListener('change', async () => {
  const file = photo.input.files[0];
  if (!file) return;
  try {
    assertFileSize(file, BATAS_UKURAN.foto);
    misi.foto = await readFileAsDataURL(file);
    renderPhoto(file.name);
  } catch (err) {
    toast(err.message, 'error');
  }
  photo.input.value = '';
});
photo.clear.addEventListener('click', () => {
  misi.foto = '';
  renderPhoto();
});
$('[data-badge-list]').addEventListener('change', (e) => (misi.lencana.gambar = e.target.value));

/* -------------------------------------------- Langkah 2: Petunjuk */

const clueForm = $('[data-clue-form]');

function renderClueTabs() {
  $('[data-clue-tabs]').innerHTML = misi.petunjuk
    .map(
      (p, i) => `
      <button type="button" role="tab" data-clue-tab="${i}" aria-selected="${i === activeClue}"
        class="btn flex-1 flex-col gap-0 bg-paper px-3 text-lg text-ink shadow-soft aria-selected:bg-brand aria-selected:text-cream lg:flex-none lg:text-[22px]">
        Petunjuk ${i + 1}
        <span class="max-w-full truncate text-xs font-semibold opacity-75">${esc(p.judul) || 'kosong'}</span>
      </button>`,
    )
    .join('');
}

function renderIcons() {
  const current = misi.petunjuk[activeClue].ikon;
  $('[data-icon-list]').innerHTML = IKON_PETUNJUK.map(
    (ik) => `
    <label title="${ik.label}" class="grid size-16 cursor-pointer place-items-center rounded-xl border-2 border-transparent bg-paper transition hover:border-ink has-checked:border-brand has-checked:bg-sun-light has-checked:ring-2 has-checked:ring-brand">
      <input type="radio" name="clue-icon" value="${ik.id}" class="sr-only" ${ik.id === current ? 'checked' : ''} />
      <img src="${ik.src}" alt="${ik.label}" class="size-12 object-contain" />
    </label>`,
  ).join('');
}

function fillClue() {
  const clue = misi.petunjuk[activeClue];
  $$('[data-field]', clueForm).forEach((el) => (el.value = clue[el.dataset.field] ?? ''));
  $$('[data-clue-type]', clueForm).forEach((r) => (r.checked = r.value === clue.tipe));
  $$('[data-type-panel]', clueForm).forEach((p) => (p.hidden = p.dataset.typePanel !== clue.tipe));
  renderIcons();
  renderClueTabs();
}

clueForm.addEventListener('input', (e) => {
  const field = e.target.dataset.field;
  if (!field) return;
  misi.petunjuk[activeClue][field] = e.target.value;
  if (field === 'judul') renderClueTabs();
});

clueForm.addEventListener('change', (e) => {
  const clue = misi.petunjuk[activeClue];
  if (e.target.name === 'clue-icon') clue.ikon = e.target.value;
  if (e.target.matches('[data-clue-type]')) {
    clue.tipe = e.target.value;
    fillClue();
  }
});

$('[data-clue-tabs]').addEventListener('click', (e) => {
  const tab = e.target.closest('[data-clue-tab]');
  if (!tab) return;
  activeClue = Number(tab.dataset.clueTab);
  fillClue();
});

/* -------------------------------------------- Langkah 3: Analisis */

const ARROW_ROTATION = { right: '', down: 'rotate-90', left: '-scale-x-100' };
const ARROW_LABEL = { right: 'menuju', down: 'lalu', left: 'menuju' };
const arrow = (dir, size = 'h-8') =>
  `<img src="${IMG.arrow}" alt="${ARROW_LABEL[dir]}" class="mx-auto ${size} w-auto ${ARROW_ROTATION[dir]}" />`;

/** Tata letak kotak sesuai Figma & aplikasi: [1] > [2] ↓ [4] < [3] */
const slotGrid = (slot, arrowSize) => `
  ${slot(0)} ${arrow('right', arrowSize)} ${slot(1)}
  <span></span><span></span> ${arrow('down', arrowSize)}
  ${slot(3)} ${arrow('left', arrowSize)} ${slot(2)}`;

function editableSlot(i) {
  const value = misi.analisis.kunci[i];
  return `
    <div class="relative">
      <button type="button" data-slot="${i}" aria-pressed="${i === activeSlot}" aria-label="Kotak ${i + 1}: ${esc(value) || 'kosong'}"
        class="slot cursor-pointer aria-pressed:ring-4 aria-pressed:ring-sun ${value ? '' : 'text-ink/35'}">${esc(value) || `Kotak ${i + 1}`}</button>
      ${
        value
          ? `<button type="button" data-clear-slot="${i}" aria-label="Kosongkan kotak ${i + 1}"
              class="absolute -top-2 -right-2 grid size-6 cursor-pointer place-items-center rounded-full border-2 border-ink bg-danger text-sm leading-none font-bold text-white">×</button>`
          : ''
      }
    </div>`;
}

function renderAnalysis() {
  $('[data-slots]').innerHTML = slotGrid(editableSlot);
  $('[data-cards]').innerHTML = misi.analisis.kartu
    .map(
      (card) => `
      <span class="group relative">
        <button type="button" class="chip-card" data-card="${esc(card)}">${esc(card)}</button>
        <button type="button" data-remove-card="${esc(card)}" aria-label="Hapus kartu ${esc(card)}"
          class="absolute -top-2 -right-2 hidden size-6 cursor-pointer place-items-center rounded-full border-2 border-ink bg-cream text-sm font-bold group-hover:grid group-focus-within:grid">×</button>
      </span>`,
    )
    .join('');
  $('[data-explanation]').value = misi.analisis.penjelasan ?? '';
}

$('[data-slots]').addEventListener('click', (e) => {
  const clear = e.target.closest('[data-clear-slot]');
  const slot = e.target.closest('[data-slot]');
  if (clear) {
    activeSlot = Number(clear.dataset.clearSlot);
    misi.analisis.kunci[activeSlot] = '';
  } else if (slot) {
    activeSlot = Number(slot.dataset.slot);
  } else return;
  renderAnalysis();
});

$('[data-cards]').addEventListener('click', (e) => {
  const remove = e.target.closest('[data-remove-card]');
  if (remove) {
    const card = remove.dataset.removeCard;
    misi.analisis.kartu = misi.analisis.kartu.filter((c) => c !== card);
    misi.analisis.kunci = misi.analisis.kunci.map((k) => (k === card ? '' : k));
    renderAnalysis();
    return;
  }
  const card = e.target.closest('[data-card]');
  if (!card) return;
  misi.analisis.kunci[activeSlot] = card.dataset.card;
  // lompat ke kotak kosong berikutnya
  for (let n = 1; n <= JUMLAH_SLOT; n++) {
    const next = (activeSlot + n) % JUMLAH_SLOT;
    if (!misi.analisis.kunci[next]) {
      activeSlot = next;
      break;
    }
  }
  renderAnalysis();
});

function addCard() {
  const input = $('[data-new-card]');
  const value = input.value.trim();
  if (!value) return;
  if (misi.analisis.kartu.some((c) => c.toLowerCase() === value.toLowerCase())) {
    toast('Kartu sudah ada.', 'error');
    return;
  }
  misi.analisis.kartu.push(value);
  input.value = '';
  renderAnalysis();
  input.focus();
}

$('[data-add-card]').addEventListener('click', addCard);
$('[data-new-card]').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  addCard();
});
$('[data-explanation]').addEventListener('input', (e) => (misi.analisis.penjelasan = e.target.value));

/* ------------------------------------------- Langkah 4: Pratinjau */

const previewCard = 'card-frame';
const filledClues = () => misi.petunjuk.filter((p) => p.judul.trim());

function cluePreview(clue, total) {
  if (!clue) return '<p class="py-16 text-center font-body text-lg">Belum ada petunjuk.</p>';
  const detail =
    clue.tipe === 'angka'
      ? `<p>Awal<br />${esc(clue.awal) || '-'}</p><p class="mt-2">Baru<br />${esc(clue.akhir) || '-'}</p>`
      : `<p class="text-lg italic">${esc(clue.pesan) || '-'}</p>`;
  return `
    <h2 class="text-center text-2xl font-bold sm:text-[34px]">${esc(clue.judul)}</h2>
    <div class="mt-4 flex items-center gap-5">
      <div class="grid size-36 shrink-0 place-items-center rounded-[14px] border-2 border-ink bg-linear-to-b from-sun to-sun-light shadow-card sm:size-44">
        <img src="${ikonSrc(clue.ikon)}" alt="" class="figure-shadow size-28 object-contain sm:size-32" />
      </div>
      <div class="min-w-0 self-stretch border-l-3 border-ink pl-5 font-body text-xl text-bark sm:text-2xl">${detail}</div>
    </div>
    ${clue.simulasi ? `<p class="mt-3 font-body text-sm text-bark">Simulasi: ${esc(clue.simulasi)}</p>` : ''}
    ${
      total > 1
        ? `<div class="mt-4 flex items-center justify-center gap-3">
            <button type="button" class="btn btn-sm btn-secondary" data-preview-prev aria-label="Petunjuk sebelumnya">‹</button>
            <span class="font-semibold">Petunjuk ${previewIndex + 1} / ${total}</span>
            <button type="button" class="btn btn-sm btn-secondary" data-preview-next aria-label="Petunjuk berikutnya">›</button>
          </div>`
        : ''
    }`;
}

function renderPreview() {
  const clues = filledClues();
  previewIndex = Math.min(previewIndex, Math.max(0, clues.length - 1));
  const miniSlot = (i) => `<span class="slot min-h-11 rounded-2xl border-[3px] text-base sm:text-lg">${esc(misi.analisis.kunci[i]) || '—'}</span>`;

  $('[data-preview]').innerHTML = `
    <article class="${previewCard} text-center">
      <h2 class="text-2xl font-bold sm:text-[34px]">${esc(misi.judul) || 'Judul misi'}</h2>
      <div class="mx-auto mt-4 grid size-36 place-items-center overflow-hidden rounded-xl border-2 border-ink bg-linear-to-b from-sun to-sun-light shadow-card">
        <img src="${misi.foto || ikonSrc(misi.petunjuk[0].ikon)}" alt="" class="${misi.foto ? 'size-full object-cover' : 'size-28 object-contain'}" />
      </div>
      <p class="mt-4 rounded-[23px] border-4 border-ink px-4 py-3 text-left font-body">${esc(misi.deskripsi) || 'Deskripsi kasus...'}</p>
      <div class="mt-4 flex items-center justify-center gap-3">
        <img src="${lencanaSrc(misi.lencana.gambar)}" alt="" class="size-12" />
        <p class="text-left font-bold">
          <span class="block text-brand">${formatXP(misi.xp)}</span>
          <span class="block text-sm">${esc(misi.lencana.nama) || 'Lencana belum diberi nama'}</span>
        </p>
      </div>
    </article>

    <article class="${previewCard}">${cluePreview(clues[previewIndex], clues.length)}</article>

    <article class="${previewCard}">
      <h2 class="text-center text-2xl font-bold sm:text-[34px]">Apa yang terjadi</h2>
      <div class="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">${slotGrid(miniSlot, 'h-6')}</div>
      ${misi.analisis.penjelasan ? `<p class="mt-5 rounded-2xl bg-paper p-3 font-body text-sm text-bark">💡 ${esc(misi.analisis.penjelasan)}</p>` : ''}
    </article>

    <article class="${previewCard}">
      <h2 class="text-center text-2xl font-bold sm:text-[34px]">Card Pilihan</h2>
      <div class="mx-auto mt-5 flex max-w-sm flex-wrap justify-center gap-2.5">
        ${misi.analisis.kartu.map((c) => `<span class="chip-card min-w-28 cursor-default py-1.5 text-base hover:translate-y-0">${esc(c)}</span>`).join('')}
      </div>
    </article>`;

  const masalah = cekKelengkapanMisi(misi);
  $('[data-checklist]').innerHTML = masalah.length
    ? `<p class="font-sans font-bold text-danger">Lengkapi dulu sebelum publikasi:</p>
       <ul class="mt-1 list-disc pl-6">${masalah.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>`
    : '<p class="font-sans font-bold text-success-text">✓ Misi siap dipublikasikan ke aplikasi siswa.</p>';
}

$('[data-preview]').addEventListener('click', (e) => {
  const total = filledClues().length;
  if (e.target.closest('[data-preview-prev]')) previewIndex = (previewIndex - 1 + total) % total;
  else if (e.target.closest('[data-preview-next]')) previewIndex = (previewIndex + 1) % total;
  else return;
  renderPreview();
});

/* -------------------------------------------------------- Navigasi */

const RENDER_STEP = { 1: () => {}, 2: fillClue, 3: renderAnalysis, 4: renderPreview };

function syncUrl() {
  const query = new URLSearchParams({ ...(misi.id && { id: misi.id }), step });
  history.replaceState(null, '', `?${query}`);
}

function goTo(target) {
  if (step === 1) readInfo();
  step = target;
  $$('[data-step]', form).forEach((s) => (s.hidden = Number(s.dataset.step) !== step));
  RENDER_STEP[step]();
  $('[data-back]').textContent = step === 1 ? 'Batal' : 'Kembali';
  $('[data-next]').textContent = step === STEPS.length ? 'Publikasikan' : 'Lanjut';
  renderStepper();
  syncUrl();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function persist(status) {
  readInfo();
  try {
    const saved = misiService.save({ ...misi, status, xp: Number(misi.xp) || 0 });
    misi.id = saved.id;
    misi.status = saved.status;
    syncUrl();
    return true;
  } catch (err) {
    toast(err.message, 'error');
    return false;
  }
}

$('[data-stepper]').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-goto]');
  if (!btn) return;
  const target = Number(btn.dataset.goto);
  if (step === 1 && target > 1 && !validateInfo()) return;
  goTo(target);
});

$('[data-back]').addEventListener('click', () => {
  if (step === 1) location.href = ROUTES.misi;
  else goTo(step - 1);
});

$('[data-next]').addEventListener('click', () => {
  if (step === 1 && !validateInfo()) return;
  if (step < STEPS.length) return goTo(step + 1);

  const masalah = cekKelengkapanMisi(misi);
  if (masalah.length) {
    toast(masalah[0], 'error');
    renderPreview();
    return;
  }
  if (persist('aktif')) {
    toast('Misi dipublikasikan! Siswa sudah bisa melihatnya.');
    setTimeout(() => (location.href = ROUTES.misi), 900);
  }
});

$('[data-save-draft]').addEventListener('click', () => {
  readInfo();
  if (!misi.judul) {
    if (step !== 1) goTo(1);
    form.elements.judul.setAttribute('aria-invalid', 'true');
    form.elements.judul.focus();
    toast('Isi judul misi dulu untuk menyimpan draft.', 'error');
    return;
  }
  const keepActive = misi.status === 'aktif' && !cekKelengkapanMisi(misi).length;
  if (persist(keepActive ? 'aktif' : 'draft')) toast(keepActive ? 'Perubahan disimpan.' : 'Draft tersimpan.');
});

form.addEventListener('submit', (e) => e.preventDefault());

fillInfo();
goTo(step);
