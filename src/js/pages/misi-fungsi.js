/**
 * Bagian editor untuk misi "Hitung Fungsi": guru memilih topik dan mengisi data pasar,
 * server menghitung gembok, kunci, petunjuk, dan grafiknya (tidak bisa salah ketik).
 */
import { grafikFungsi } from '../components/grafik-fungsi.js';
import { misiService } from '../services/misi.service.js';
import { $, esc } from '../utils/dom.js';

const IKON_TOPIK = {
  'fungsi-permintaan': '📉',
  'fungsi-penawaran': '📈',
  keseimbangan: '⚖️',
  elastisitas: '📏',
  'kebijakan-harga': '🏷️',
  pajak: '🧾',
  subsidi: '🤝',
};

const angka = (x) => {
  const r = Math.round(x * 100) / 100;
  return String(r).replace('.', ',').replace('-', '−');
};

let topik = null; // daftar topik dari server (dimuat sekali)
let jeda = null;

async function daftarTopik() {
  topik ??= await misiService.topikFungsi();
  return topik;
}

/** Langkah 2 (fungsi): pilih topik dan isi data, dengan pemeriksaan otomatis. */
export async function renderDataFungsi(misi, onUbah) {
  const wadah = $('[data-fungsi-data]');
  let daftar;
  try {
    daftar = await daftarTopik();
  } catch (err) {
    wadah.innerHTML = `<p class="font-body text-danger">${esc(err.message)}</p>`;
    return;
  }
  const pilihan = daftar[misi.fungsi.topik] ? misi.fungsi.topik : 'keseimbangan';
  misi.fungsi.topik = pilihan;
  const t = daftar[pilihan];

  wadah.innerHTML = `
    <div>
      <span class="label" id="topik-label">Topik Hitungan</span>
      <div role="radiogroup" aria-labelledby="topik-label" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        ${Object.entries(daftar)
          .map(
            ([id, d]) => `
          <label class="cursor-pointer rounded-[18px] border-3 border-ink bg-white p-3 shadow-soft transition hover:-translate-y-0.5 has-checked:border-brand has-checked:bg-sun-light has-checked:ring-4 has-checked:ring-brand/30">
            <input type="radio" name="topik-fungsi" value="${id}" class="sr-only" ${id === pilihan ? 'checked' : ''} />
            <span class="text-2xl" aria-hidden="true">${IKON_TOPIK[id] ?? '🔢'}</span>
            <span class="block font-bold">${esc(d.nama)}</span>
            <span class="block font-body text-sm text-bark">${esc(d.ringkas)}</span>
          </label>`,
          )
          .join('')}
      </div>
    </div>

    <div class="grid gap-5 lg:grid-cols-[1fr_380px] lg:gap-10">
      <div class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <label>
            <span class="label">Nama barang</span>
            <input class="input" maxlength="30" placeholder="Contoh: es kopi" data-fungsi-field="barang" value="${esc(misi.fungsi.data.barang ?? '')}" />
          </label>
          <label>
            <span class="label">Satuan</span>
            <input class="input" maxlength="15" placeholder="Contoh: gelas" data-fungsi-field="satuan" value="${esc(misi.fungsi.data.satuan ?? '')}" />
          </label>
        </div>
        <p class="font-body text-bark">Isi data pasar. Harga dalam <b>ribu rupiah</b>. Gunakan tanda minus untuk angka negatif (mis. −20).</p>
        <div class="grid gap-4 sm:grid-cols-2">
          ${t.isian
            .map(
              (f) => `
            <label>
              <span class="mb-1 block text-sm font-semibold">${esc(f.label)}</span>
              <input class="input font-sans text-xl font-semibold" inputmode="decimal" placeholder="${angka(f.contoh)}" data-fungsi-field="${f.kunci}" value="${esc(misi.fungsi.data[f.kunci] ?? '')}" />
            </label>`,
            )
            .join('')}
        </div>
        <button type="button" class="btn btn-sm btn-secondary" data-isi-contoh>Isi dengan contoh</button>
      </div>
      <div class="card-frame" data-fungsi-hasil aria-live="polite"></div>
    </div>`;

  const periksa = async () => {
    try {
      misi.rancangan = await misiService.pratinjauFungsi(misi.fungsi.topik, misi.fungsi.data);
    } catch (err) {
      misi.rancangan = { masalah: [err.message], langkah: [], peringatan: [] };
    }
    renderHasilSingkat(misi);
    onUbah?.();
  };

  wadah.oninput = (e) => {
    const field = e.target.dataset.fungsiField;
    if (!field) return;
    const v = e.target.value.trim().replace('−', '-').replace(',', '.');
    misi.fungsi.data[field] = ['barang', 'satuan'].includes(field) ? e.target.value : v === '' ? '' : Number(v);
    clearTimeout(jeda);
    jeda = setTimeout(periksa, 350);
  };
  wadah.onchange = (e) => {
    if (e.target.name !== 'topik-fungsi') return;
    misi.fungsi.topik = e.target.value;
    renderDataFungsi(misi, onUbah);
  };
  $('[data-isi-contoh]', wadah).onclick = () => {
    for (const f of t.isian) misi.fungsi.data[f.kunci] = f.contoh;
    misi.fungsi.data.barang ||= 'es kopi';
    misi.fungsi.data.satuan ||= 'gelas';
    renderDataFungsi(misi, onUbah);
  };

  await periksa();
}

/** Ringkasan hasil pemeriksaan di samping formulir data. */
function renderHasilSingkat(misi) {
  const r = misi.rancangan;
  const wadah = $('[data-fungsi-hasil]');
  if (!wadah) return;
  if (r.masalah?.length) {
    wadah.innerHTML = `
      <p class="font-bold text-danger">Data belum bisa dipakai:</p>
      <ul class="mt-1 list-disc pl-5 font-body text-danger">${r.masalah.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>`;
    return;
  }
  wadah.innerHTML = `
    <p class="font-bold text-success-text">✓ Kunci dihitung otomatis: ${r.langkah.length} gembok</p>
    <div class="mt-2">${grafikFungsi(r.grafik, { tinggi: 220 })}</div>
    <ol class="mt-2 list-decimal space-y-1 pl-5 font-body text-sm">
      ${r.langkah.map((l) => `<li><b>${esc(l.judul.replace(/^Gembok \d+: /, ''))}</b>: ${l.isian.map(isiKunci).join(', ')}</li>`).join('')}
    </ol>
    ${peringatanHtml(r)}`;
}

const isiKunci = (i) => (i.pilihan ? `${esc(i.label)} = ${esc(i.pilihan[i.nilai])}` : `${esc(i.label)} = ${angka(i.nilai)}`);

const peringatanHtml = (r) =>
  r.peringatan?.length
    ? `<div class="mt-3 rounded-xl border-2 border-warn bg-warn/20 p-2 font-body text-sm">
        <b>Perhatian:</b> ${r.peringatan.map(esc).join(' ')}
        <br />Pertimbangkan angka yang hasilnya bulat agar siswa fokus pada cara, bukan kalkulator.
      </div>`
    : '';

const NAMA_ELEMEN = {
  garis: (e) => `kurva ${e.label}`,
  titik: (e) => `titik ${e.label}`,
  harga: () => 'garis harga',
  celah: (e) => e.label,
};

/** Bagian grafik yang baru muncul di aplikasi siswa setelah gembok ini terbuka. */
function munculSetelah(r, id) {
  const baru = r.grafik.elemen.filter((e) => e.setelah === id).map((e) => NAMA_ELEMEN[e.jenis]?.(e) ?? '');
  return baru.length
    ? `<p class="mt-1 text-xs text-bark">📈 Saat terbuka, grafik siswa menampilkan: ${esc(baru.join(', '))}.</p>`
    : '';
}

/** Langkah 3 (fungsi): semua gembok dengan kunci, petunjuk bertahap, dan penjelasannya. */
export function renderKunciFungsi(misi) {
  const r = misi.rancangan;
  const wadah = $('[data-fungsi-kunci]');
  if (!r || r.masalah?.length) {
    wadah.innerHTML = `<p class="font-body text-danger">Lengkapi data di langkah sebelumnya dulu.${
      r?.masalah?.length ? ` ${esc(r.masalah[0])}` : ''
    }</p>`;
    return;
  }
  wadah.innerHTML = `
    <div class="grid gap-6 lg:grid-cols-[1fr_380px]">
      <ol class="space-y-4">
        ${r.langkah
          .map(
            (l) => `
          <li class="card-frame">
            <p class="text-sm font-bold text-brand">🔒 ${esc(l.judul)}</p>
            <p class="mt-1 font-body">${esc(l.soal)}</p>
            <p class="mt-2 inline-block rounded-lg bg-step/20 px-2 py-1 font-bold text-success-text">Kunci: ${l.isian.map(isiKunci).join(' · ')}</p>
            <details class="mt-2 font-body text-sm">
              <summary class="cursor-pointer font-semibold">Petunjuk & penjelasan untuk siswa</summary>
              <p class="mt-1">💡 Salah 1×: ${esc(l.petunjuk[0])}</p>
              <p>💡 Salah 2×: ${esc(l.petunjuk[1])}</p>
              <p class="mt-1">✓ Setelah terbuka: ${esc(l.penjelasan)}</p>
            </details>
            ${munculSetelah(r, l.id)}
          </li>`,
          )
          .join('')}
      </ol>
      <div class="space-y-4">
        <div class="card-frame">
          <p class="font-bold">Grafik lengkap</p>
          ${grafikFungsi(r.grafik)}
        </div>
        <div class="card-frame font-body text-sm">
          <p class="font-sans font-bold">Penjelasan otomatis</p>
          <p class="mt-1">${esc(r.penjelasan)}</p>
        </div>
        ${peringatanHtml(r)}
      </div>
    </div>`;
}

/** Langkah 4 (fungsi): pratinjau seperti di aplikasi siswa. */
export function pratinjauFungsi(misi) {
  const r = misi.rancangan;
  if (!r || r.masalah?.length) return '<article class="card-frame">Data fungsi belum lengkap.</article>';
  return `
    <article class="card-frame">
      <h2 class="text-center text-2xl font-bold sm:text-[30px]">Kartu Data</h2>
      <div class="mt-4 space-y-3">
        ${r.kartu
          .map(
            (k) => `<div class="rounded-2xl border-3 border-ink bg-linear-to-b from-sun to-sun-light p-3 shadow-soft">
              <p class="font-bold">${esc(k.judul)}</p><p class="font-body">${esc(k.isi)}</p></div>`,
          )
          .join('')}
      </div>
    </article>
    <article class="card-frame">
      <h2 class="text-center text-2xl font-bold sm:text-[30px]">Gembok Hitungan</h2>
      <ol class="mt-4 space-y-2">
        ${r.langkah
          .map(
            (l) => `<li class="rounded-2xl border-2 border-ink bg-white p-3">
              <p class="font-bold">🔒 ${esc(l.judul)}</p>
              <p class="font-body text-sm">${esc(l.soal)}</p>
              <div class="mt-2 flex flex-wrap gap-2">${l.isian
                .map((i) =>
                  i.pilihan
                    ? i.pilihan.map((o) => `<span class="chip-card cursor-default py-1 text-sm hover:translate-y-0">${esc(o)}</span>`).join('')
                    : `<span class="slot min-h-10 w-28 text-sm text-ink/40">${esc(i.label)}</span>`,
                )
                .join('')}</div>
            </li>`,
          )
          .join('')}
      </ol>
      <p class="mt-3 text-center font-body text-sm text-bark">Bintang: tanpa salah = 3, salah 1× = 2, lebih dari itu = 1.</p>
    </article>`;
}
