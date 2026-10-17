import { db, clone } from '../data/storage.js';
import { authService } from './auth.service.js';
import { materiService } from './materi.service.js';
import { misiService } from './misi.service.js';

/** Data Total XP & Peringkat siswa di kelas guru (DFD 7.0). */
export const siswaService = {
  ranking() {
    const kode = authService.currentUser()?.kodeKelas;
    return clone(db.data.siswa.filter((s) => s.kodeKelas === kode))
      .sort((a, b) => b.xp - a.xp)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  },
};

export function statistikKelas() {
  const misi = misiService.list();
  const siswa = siswaService.ranking();
  const aktif = misi.filter((m) => m.status === 'aktif').length;
  const rataSelesai =
    siswa.length && aktif
      ? Math.round((siswa.reduce((n, s) => n + Math.min(s.misiSelesai, aktif), 0) / (siswa.length * aktif)) * 100)
      : 0;

  return {
    totalMisi: misi.length,
    misiAktif: aktif,
    totalMateri: materiService.list().length,
    jumlahSiswa: siswa.length,
    rataSelesai,
  };
}
