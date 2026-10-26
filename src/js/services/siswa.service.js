import { api } from './api.js';

/** Data Total XP & Peringkat siswa di kelas guru (DFD 7.0). */
export const siswaService = {
  async ranking() {
    const { data } = await api('GET', '/guru/siswa');
    return data.map((s) => ({
      id: s.id,
      rank: s.peringkat,
      nama: s.nama,
      foto: s.foto_url ?? '',
      xp: s.total_xp,
      misiSelesai: s.misi_selesai,
      lencana: s.lencana,
    }));
  },

  /** Keluarkan siswa dari kelas (akun & progresnya tetap ada). */
  async remove(id) {
    await api('DELETE', `/guru/siswa/${id}`);
  },

  /** Detail satu siswa: progres per misi kelas dan skor kuis kilat. */
  async detail(id) {
    const { data: s } = await api('GET', `/guru/siswa/${id}`);
    return {
      id: s.id,
      nama: s.nama,
      email: s.email,
      foto: s.foto_url ?? '',
      xp: s.total_xp,
      streak: s.streak,
      streakTerbaik: s.streak_terbaik,
      terakhirAktif: s.terakhir_aktif,
      bergabung: s.bergabung_kelas,
      rank: s.peringkat,
      misiSelesai: s.misi_selesai,
      misi: s.misi.map((m) => ({
        id: m.id,
        judul: m.judul,
        xp: m.xp,
        status: m.status,
        bintang: m.bintang,
        selesai: m.selesai,
        percobaan: m.percobaan,
        xpDidapat: m.xp_didapat,
        terakhir: m.terakhir,
      })),
      kuis: s.kuis ?? {},
    };
  },
};

/** Ringkasan beranda: jumlah misi, materi, siswa, dan rata-rata penyelesaian (%). */
export async function statistikKelas() {
  const { data } = await api('GET', '/guru/statistik');
  return {
    totalMisi: data.total_misi,
    misiAktif: data.misi_aktif,
    totalMateri: data.total_materi,
    jumlahSiswa: data.jumlah_siswa,
    rataSelesai: data.rata_selesai,
  };
}
