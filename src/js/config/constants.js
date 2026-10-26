/** Konstanta aplikasi. Nilai disamakan dengan aplikasi mobile murid (conix_app). */

/**
 * Base URL situs: "/" saat development, "/conix-teacher-portal/" di GitHub Pages.
 * Semua path gambar & halaman di JavaScript wajib lewat asset() agar tetap benar di kedua lingkungan.
 */
export const BASE = import.meta.env.BASE_URL;
export const asset = (path) => BASE + path.replace(/^\//, '');

/**
 * Alamat API backend CONIX. Diatur lewat VITE_API_URL (file .env / variabel GitHub Actions);
 * bawaan: server Laravel lokal (`php artisan serve`).
 */
export const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');

export const ROUTES = {
  landing: asset('/index.html'),
  login: asset('/auth/login.html'),
  register: asset('/auth/register.html'),
  dashboard: asset('/pages/dashboard.html'),
  materi: asset('/pages/materi.html'),
  misi: asset('/pages/misi.html'),
  misiEditor: asset('/pages/misi-editor.html'),
  siswa: asset('/pages/siswa.html'),
  profil: asset('/pages/profil.html'),
};

/** Link unduh aplikasi murid (APK). Kosong = tombol tampil sebagai "Segera hadir". */
export const APP_DOWNLOAD_URL = 'https://github.com/riihhzz/conix-teacher-portal/releases/latest/download/CONIX.apk';

export const IMG = {
  logotype: asset('/images/brand/logotype.webp'),
  logoMark: asset('/images/brand/logo-mark.webp'),
  mascot: asset('/images/mascot/nomi.webp'),
  mascotSad: asset('/images/mascot/nomi-sedih.webp'),
  missionList: asset('/images/mission/daftar-misi.webp'),
  missionDaily: asset('/images/mission/misi-harian.webp'),
  avatar: asset('/images/icons/avatar.webp'),
  arrow: asset('/images/icons/arrow.svg'),
};

export const KATEGORI_MATERI = [
  {
    id: 'permintaan',
    nama: 'Permintaan',
    deskripsi: 'Selidiki bagaimana harga memengaruhi jumlah barang yang diminta.',
    ikon: asset('/images/topics/permintaan.webp'),
  },
  {
    id: 'penawaran',
    nama: 'Penawaran',
    deskripsi: 'Temukan hubungan harga dengan jumlah barang yang ditawarkan.',
    ikon: asset('/images/topics/penawaran.webp'),
  },
];

/** Ikon petunjuk = gambar clue di aplikasi murid (assets/images/clues). */
export const IKON_PETUNJUK = [
  { id: 'tiket', label: 'Tiket' },
  { id: 'pembeli', label: 'Pembeli' },
  { id: 'data', label: 'Data' },
  { id: 'harga', label: 'Harga' },
  { id: 'stok', label: 'Stok' },
  { id: 'sosmed', label: 'Media Sosial' },
  { id: 'pesan', label: 'Pesan' },
].map((ikon) => ({ ...ikon, src: asset(`images/clues/${ikon.id}.webp`) }));

export const LENCANA = [
  { id: 'lencana-1', label: 'Lencana Oranye 1' },
  { id: 'lencana-2', label: 'Lencana Oranye 2' },
  { id: 'lencana-3', label: 'Lencana Oranye 3' },
].map((l) => ({ ...l, src: asset(`images/badges/${l.id}.webp`) }));

/** Pilihan kartu analisis default (sama dengan _choices di mission_flow_screen.dart). */
export const KARTU_DEFAULT = ['Permintaan', 'Penawaran', 'Tetap', 'Naik', 'Harga', 'Turun'];

export const JUMLAH_PETUNJUK = 3;
export const JUMLAH_SLOT = 4;

export const STATUS_MISI = {
  aktif: { label: 'Aktif', badge: 'badge-aktif' },
  draft: { label: 'Draft', badge: 'badge-draft' },
  nonaktif: { label: 'Non Aktif', badge: 'badge-nonaktif' },
};

export const STATUS_MATERI = {
  terbit: { label: 'Terbit', badge: 'badge-aktif' },
  draft: { label: 'Draft', badge: 'badge-draft' },
};

export const BATAS_UKURAN = {
  lampiran: 2 * 1024 * 1024,
  foto: 1024 * 1024,
};

export const ikonSrc = (id) => (IKON_PETUNJUK.find((i) => i.id === id) ?? IKON_PETUNJUK[0]).src;
export const lencanaSrc = (id) => (LENCANA.find((l) => l.id === id) ?? LENCANA[0]).src;
