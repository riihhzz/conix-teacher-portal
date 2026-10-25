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
