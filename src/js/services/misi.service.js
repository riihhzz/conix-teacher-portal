import { api, formFile } from './api.js';
import { JUMLAH_PETUNJUK } from '../config/constants.js';

/** Misi dari API → bentuk yang dipakai halaman (mengikuti model Mission di aplikasi murid). */
const keMisi = (m) => ({
  id: m.id,
  judul: m.judul,
  deskripsi: m.deskripsi ?? '',
  foto: m.foto_url ?? '',
  xp: m.xp,
  status: m.status,
  lencana: { nama: m.lencana_nama ?? '', gambar: m.lencana_gambar },
  petunjuk: (m.petunjuk ?? []).map((p) => ({
    judul: p.judul ?? '',
    ikon: p.ikon,
    simulasi: p.simulasi ?? '',
    tipe: p.tipe,
    awal: p.nilai_awal ?? '',
    akhir: p.nilai_akhir ?? '',
    pesan: p.pesan ?? '',
  })),
  analisis: { kartu: m.kartu ?? [], kunci: m.kunci ?? [], penjelasan: m.penjelasan ?? '' },
  diubah: m.diubah,
});

/** Bentuk halaman → isi request SimpanMisiRequest di backend. */
const keBody = (misi) => ({
  judul: misi.judul,
  deskripsi: misi.deskripsi || null,
  xp: Number(misi.xp) || 0,
  status: misi.status,
  lencana_nama: misi.lencana.nama || null,
  lencana_gambar: misi.lencana.gambar,
  penjelasan: misi.analisis.penjelasan || null,
  petunjuk: misi.petunjuk.map((p) => ({
    judul: p.judul || null,
    ikon: p.ikon,
    simulasi: p.simulasi || null,
    tipe: p.tipe,
    nilai_awal: p.awal || null,
    nilai_akhir: p.akhir || null,
    pesan: p.pesan || null,
  })),
  kartu: misi.analisis.kartu,
  kunci: misi.analisis.kunci.map((k) => k || null),
});

/** Data Misi (DFD 3.0 Input Misi & Max XP). */
export const misiService = {
  async list() {
    const { data } = await api('GET', '/guru/misi');
    return data.map(keMisi);
  },

  async get(id) {
    const { data } = await api('GET', `/guru/misi/${id}`);
    return keMisi(data);
  },

  /** Simpan misi beserta petunjuk, kartu, dan kunci. Tanpa id = misi baru. */
  async save(misi) {
    const body = keBody(misi);
    const { data } = misi.id ? await api('PUT', `/guru/misi/${misi.id}`, body) : await api('POST', '/guru/misi', body);
    return keMisi(data);
  },

  /** Server menolak status "aktif" bila misi belum lengkap. */
  async setStatus(id, status) {
    const { data } = await api('PATCH', `/guru/misi/${id}/status`, { status });
    return keMisi(data);
  },

  async remove(id) {
    await api('DELETE', `/guru/misi/${id}`);
  },

  async uploadFoto(id, file) {
    const { data } = await api('POST', `/guru/misi/${id}/foto`, formFile('foto', file));
    return keMisi(data);
  },

  async hapusFoto(id) {
    const { data } = await api('DELETE', `/guru/misi/${id}/foto`);
    return keMisi(data);
  },
};

/**
 * Daftar hal yang belum lengkap agar misi boleh dipublikasikan (status "aktif").
 * Array kosong = misi siap tayang di aplikasi murid. Aturan yang sama juga diperiksa di server.
 */
export function cekKelengkapanMisi(misi) {
  const masalah = [];
  if (!misi.judul?.trim()) masalah.push('Judul misi belum diisi.');
  if (!misi.deskripsi?.trim()) masalah.push('Deskripsi kasus belum diisi.');
  if (!(Number(misi.xp) > 0)) masalah.push('Jumlah XP harus lebih dari 0.');
  if (!misi.lencana?.nama?.trim()) masalah.push('Nama lencana reward belum diisi.');

  for (let i = 0; i < JUMLAH_PETUNJUK; i++) {
    const p = misi.petunjuk?.[i];
    if (!p?.judul?.trim()) masalah.push(`Judul Petunjuk ${i + 1} belum diisi.`);
    else if (p.tipe === 'angka' && (!String(p.awal).trim() || !String(p.akhir).trim()))
      masalah.push(`Petunjuk ${i + 1}: nilai Awal dan Akhir wajib diisi.`);
    else if (p.tipe === 'pesan' && !p.pesan?.trim()) masalah.push(`Petunjuk ${i + 1}: pesan wajib diisi.`);
  }

  if (!misi.analisis?.kunci?.every(Boolean)) masalah.push('Keempat kotak kunci jawaban belum terisi.');
  if (!misi.analisis?.penjelasan?.trim()) masalah.push('Penjelasan jawaban belum diisi.');
  return masalah;
}
