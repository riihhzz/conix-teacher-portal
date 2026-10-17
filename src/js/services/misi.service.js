import { ownedCollection } from './collection.js';
import { JUMLAH_PETUNJUK } from '../config/constants.js';

/** Data Misi (DFD 3.0 Input Misi & Max XP). */
export const misiService = ownedCollection('misi', 'msn');

/**
 * Daftar hal yang belum lengkap agar misi boleh dipublikasikan (status "aktif").
 * Array kosong = misi siap tayang di aplikasi murid.
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
