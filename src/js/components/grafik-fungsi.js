/**
 * Grafik harga–jumlah (SVG) untuk misi "Hitung Fungsi": Q mendatar, P tegak,
 * sama dengan grafik di aplikasi murid. `grafik` = rancangan.grafik dari server.
 */
import { esc } from '../utils/dom.js';

const WARNA = {
  permintaan: '#3d7bd9',
  penawaran: '#f37021',
  baru: '#d63a3a',
  setimbang: '#2e9e6a',
  data: '#3a1f15',
};

const angka = (x) => {
  const r = Math.round(x * 100) / 100;
  return String(r).replace('.', ',').replace('-', '−');
};

export function grafikFungsi(grafik, { tinggi = 260 } = {}) {
  if (!grafik?.q_maks || !grafik?.p_maks) return '';
  const W = 360;
  const H = tinggi;
  const kiri = 38;
  const bawah = 26;
  const atas = 12;
  const kanan = 16;
  const lebar = W - kiri - kanan;
  const tinggiPlot = H - atas - bawah;
  const { q_maks: qMaks, p_maks: pMaks } = grafik;
  const x = (q) => kiri + (q / qMaks) * lebar;
  const y = (p) => atas + tinggiPlot - (p / pMaks) * tinggiPlot;

  const grid = [1, 2, 3, 4]
    .map((i) => {
      const q = (qMaks * i) / 4;
      const p = (pMaks * i) / 4;
      return `<line x1="${x(q)}" y1="${y(0)}" x2="${x(q)}" y2="${y(pMaks)}" stroke="#3a1f1514" />
        <line x1="${x(0)}" y1="${y(p)}" x2="${x(qMaks)}" y2="${y(p)}" stroke="#3a1f1514" />
        <text x="${x(q)}" y="${y(0) + 16}" font-size="10" text-anchor="middle" fill="#757575">${angka(q)}</text>
        <text x="${x(0) - 5}" y="${y(p) + 3}" font-size="10" text-anchor="end" fill="#757575">${angka(p)}</text>`;
    })
    .join('');

  const elemen = (grafik.elemen ?? [])
    .map((e) => {
      const warna = WARNA[e.warna] ?? '#3a1f15';
      switch (e.jenis) {
        case 'garis': {
          // Q = tetap + miring × P, dipotong ke dalam kotak grafik.
          let lo = 0;
          let hi = pMaks;
          if (e.miring !== 0) {
            const pA = -e.tetap / e.miring;
            const pB = (qMaks - e.tetap) / e.miring;
            lo = Math.max(0, Math.min(pA, pB));
            hi = Math.min(pMaks, Math.max(pA, pB));
          }
          if (lo >= hi) return '';
          const q = (p) => e.tetap + e.miring * p;
          return `<line x1="${x(q(lo))}" y1="${y(lo)}" x2="${x(q(hi))}" y2="${y(hi)}" stroke="${warna}" stroke-width="3" stroke-linecap="round" ${e.putus ? 'stroke-dasharray="6 5" opacity=".5"' : ''} />
            <text x="${x(q(hi)) + 6}" y="${y(hi) + 4}" font-size="12" font-weight="800" fill="${warna}">${esc(e.label)}</text>`;
        }
        case 'titik':
          return `<line x1="${x(e.q)}" y1="${y(e.p)}" x2="${x(e.q)}" y2="${y(0)}" stroke="#3a1f1555" stroke-dasharray="3 4" />
            <line x1="${x(e.q)}" y1="${y(e.p)}" x2="${x(0)}" y2="${y(e.p)}" stroke="#3a1f1555" stroke-dasharray="3 4" />
            <circle cx="${x(e.q)}" cy="${y(e.p)}" r="6" fill="${warna}" stroke="#3a1f15" stroke-width="2" />
            <text x="${x(e.q) + 9}" y="${y(e.p) - 6}" font-size="11" font-weight="800" fill="#3a1f15">${esc(e.label)}</text>`;
        case 'harga':
          return `<line x1="${x(0)}" y1="${y(e.p)}" x2="${x(qMaks)}" y2="${y(e.p)}" stroke="#d63a3a" stroke-width="2" stroke-dasharray="7 5" />`;
        case 'celah':
          return `<line x1="${x(e.dari)}" y1="${y(e.p)}" x2="${x(e.ke)}" y2="${y(e.p)}" stroke="#d63a3abb" stroke-width="8" stroke-linecap="round" />
            <text x="${(x(e.dari) + x(e.ke)) / 2}" y="${y(e.p) - 9}" font-size="11" font-weight="800" text-anchor="middle" fill="#d63a3a">${esc(e.label)}</text>`;
        default:
          return '';
      }
    })
    .join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" class="h-auto w-full" role="img" aria-label="Grafik harga dan jumlah">
      ${grid}
      <line x1="${x(0)}" y1="${y(0)}" x2="${x(qMaks)}" y2="${y(0)}" stroke="#3a1f15" stroke-width="2" />
      <line x1="${x(0)}" y1="${y(0)}" x2="${x(0)}" y2="${y(pMaks)}" stroke="#3a1f15" stroke-width="2" />
      <text x="${x(0) + 6}" y="${y(pMaks) + 2}" font-size="12" font-weight="900" fill="#3a1f15">P</text>
      <text x="${x(qMaks) - 4}" y="${y(0) - 6}" font-size="12" font-weight="900" text-anchor="end" fill="#3a1f15">Q</text>
      ${elemen}
    </svg>`;
}
