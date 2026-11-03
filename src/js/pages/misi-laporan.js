/**
 * Laporan satu misi: ringkasan kelas, langkah yang paling sering salah, dan hasil per siswa.
 * Misi fungsi dilaporkan per gembok; misi analisis per kotak kartu.
 */
import { mountAppShell } from '../components/app-shell.js';
import { toast } from '../components/toast.js';
import { emptyState } from '../components/ui.js';
import { misiService } from '../services/misi.service.js';
import { $, esc } from '../utils/dom.js';

mountAppShell('misi');

const id = new URLSearchParams(location.search).get('id');

const bintang = (n) =>
  `<span class="whitespace-nowrap text-lg tracking-tight" aria-label="${n} bintang">${'★'.repeat(n)}<span class="text-ink/20">${'★'.repeat(3 - n)}</span></span>`;

const kartuAngka = (label, nilai, catatan = '') => `
  <div class="card-frame text-center">
    <p class="text-4xl font-bold">${nilai}</p>
    <p class="font-semibold">${label}</p>
    ${catatan ? `<p class="font-body text-sm text-bark">${catatan}</p>` : ''}
  </div>`;

function render(lap) {
  const fungsi = lap.misi.jenis === 'fungsi';
  document.title = `Laporan ${lap.misi.judul} · CONIX Teacher Portal`;
  $('[data-judul]').textContent = lap.misi.judul;
  $('[data-jenis]').textContent = fungsi ? 'LAPORAN MISI · HITUNG FUNGSI' : 'LAPORAN MISI · ANALISIS';
  $('[data-langkah-hint]').textContent = fungsi
    ? 'Jumlah siswa yang pernah salah di setiap gembok hitungan.'
    : 'Jumlah siswa yang pernah salah mengisi setiap kotak kartu.';

  const r = lap.ringkasan;
  $('[data-ringkasan]').innerHTML = [
    kartuAngka('Siswa di kelas', r.anggota_kelas),
    kartuAngka('Sudah mencoba', r.mencoba, `${r.anggota_kelas ? Math.round((r.mencoba / r.anggota_kelas) * 100) : 0}% kelas`),
    kartuAngka('Berhasil', r.selesai),
    kartuAngka('Rata-rata bintang', String(r.rata_bintang).replace('.', ','), 'dari siswa yang berhasil'),
  ].join('');

  const maks = Math.max(1, ...lap.langkah.map((l) => l.siswa_salah));
  $('[data-langkah]').innerHTML = lap.langkah
    .map((l) => {
      const persen = (l.siswa_salah / maks) * 100;
      const warna = l.siswa_salah === maks && l.siswa_salah > 0 ? 'bg-danger' : 'bg-brand';
      return `
        <div>
          <div class="flex items-baseline justify-between gap-3">
            <p class="font-bold">${esc(l.judul)}</p>
            <p class="font-body text-sm text-bark">${l.siswa_salah} siswa · ${l.salah}× salah</p>
          </div>
          <div class="mt-1 h-4 overflow-hidden rounded-full border-2 border-ink bg-paper">
            <div class="h-full ${warna}" style="width:${persen}%"></div>
          </div>
        </div>`;
    })
    .join('');

  const tersulit = [...lap.langkah].sort((a, b) => b.siswa_salah - a.siswa_salah)[0];
  $('[data-saran]').innerHTML =
    !tersulit || tersulit.siswa_salah === 0
      ? `<h2 class="text-2xl font-bold">Saran</h2>
         <p class="mt-2 font-body">${r.mencoba ? 'Belum ada langkah yang sering salah. Kelas sudah menguasai misi ini!' : 'Belum ada siswa yang mencoba misi ini.'}</p>`
      : `<h2 class="text-2xl font-bold">Saran untuk Kelas</h2>
         <p class="mt-2 font-body"><b>${esc(tersulit.judul)}</b> paling sulit: ${tersulit.siswa_salah} siswa pernah salah di sini.</p>
         <p class="mt-2 font-body">${
           fungsi
             ? 'Bahas ulang langkah ini di kelas dengan satu contoh angka, lalu minta siswa mencoba lagi. Siswa juga bisa berlatih materi yang sama di Lab Rumus pada aplikasi.'
             : 'Diskusikan hubungan sebab-akibat di kotak ini: faktor apa yang berubah, dan ke arah mana?'
         }</p>`;

  $('[data-head]').innerHTML = `
    <tr>
      <th class="text-left!">Siswa</th>
      <th class="w-28">Bintang</th>
      <th class="w-24">${fungsi ? 'Dimainkan' : 'Percobaan'}</th>
      ${lap.langkah.map((l) => `<th class="w-28" title="${esc(l.judul)}">${esc(l.judul.replace(/^Gembok (\d+):.*/, 'Gembok $1'))}</th>`).join('')}
    </tr>`;
  $('[data-rows]').innerHTML = lap.siswa.length
    ? lap.siswa
        .map(
          (s) => `
        <tr>
          <td class="text-left! font-bold">${esc(s.nama)}</td>
          <td>${s.bintang ? bintang(s.bintang) : '<span class="font-body text-sm text-bark">Belum</span>'}</td>
          <td>${s.percobaan}</td>
          ${lap.langkah
            .map((l) => {
              const n = s.salah[l.id] ?? 0;
              return `<td><span class="inline-block min-w-8 rounded-lg px-2 py-0.5 font-bold ${n ? 'bg-danger/15 text-danger' : 'text-success-text'}">${n ? `${n}× salah` : '✓'}</span></td>`;
            })
            .join('')}
        </tr>`,
        )
        .join('')
    : `<tr><td colspan="${3 + lap.langkah.length}">${emptyState('Belum ada yang mencoba', 'Hasil siswa muncul di sini setelah mereka mengerjakan misi.')}</td></tr>`;
}

if (!id) {
  toast('Misi tidak ditemukan.', 'error');
} else {
  try {
    render(await misiService.laporan(id));
  } catch (err) {
    $('[data-judul]').textContent = 'Laporan tidak bisa dimuat';
    toast(err.message, 'error');
  }
}
