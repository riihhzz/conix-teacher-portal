/**
 * Data contoh awal. Isinya disamakan dengan data hardcode di aplikasi murid
 * (conix_app/lib/core/data/class_database.dart & leaderboard_data.dart)
 * supaya website guru dan aplikasi murid menceritakan kelas yang sama.
 */
import { KARTU_DEFAULT } from '../config/constants.js';

const GURU_AGUS = 'usr_agus';
const GURU_NUR = 'usr_nur';

const angka = (id, judul, ikon, awal, akhir, simulasi = '') => ({ id, judul, ikon, simulasi, tipe: 'angka', awal, akhir, pesan: '' });
const pesan = (id, judul, ikon, isi, simulasi = '') => ({ id, judul, ikon, simulasi, tipe: 'pesan', awal: '', akhir: '', pesan: isi });

function misi(data) {
  return {
    foto: '',
    status: 'aktif',
    dibuatOleh: GURU_AGUS,
    dibuat: '2026-10-08T08:00:00.000Z',
    diubah: '2026-10-08T08:00:00.000Z',
    ...data,
    analisis: { kartu: [...KARTU_DEFAULT], kunci: ['', '', '', ''], penjelasan: '', ...data.analisis },
  };
}

function misiSegera(id, judul, xp, tanggal) {
  return misi({
    id,
    judul,
    xp,
    deskripsi: '',
    status: 'draft',
    lencana: { nama: '', gambar: 'lencana-1' },
    petunjuk: [],
    dibuat: tanggal,
    diubah: tanggal,
  });
}

export function createSeed() {
  return {
    users: [
      {
        id: GURU_AGUS,
        nama: 'Agus Juhana',
        panggilan: 'Pak Agus',
        email: 'agus@conix.id',
        password: 'guru123',
        role: 'guru',
        kodeKelas: 'AGUS123',
        foto: '',
        bergabung: '2026-10-01T00:00:00.000Z',
      },
      {
        id: GURU_NUR,
        nama: 'Nurhidaytullah',
        panggilan: 'Pak Nur',
        email: 'nur@conix.id',
        password: 'guru123',
        role: 'guru',
        kodeKelas: 'NUR123',
        foto: '',
        bergabung: '2026-10-02T00:00:00.000Z',
      },
    ],

    misi: [
      misi({
        id: 'msn_tiket',
        judul: 'Misteri Tiket Konser',
        xp: 500,
        deskripsi:
          'Semua orang langsung memburu tiketnya. Tapi beberapa saat kemudian, terjadi sesuatu yang bikin penjualan tiket berubah. Apa yang sebenarnya terjadi?',
        lencana: { nama: 'Detektif Permintaan', gambar: 'lencana-1' },
        petunjuk: [
          angka('ptj_t1', 'Tiket', 'tiket', 'Rp 100k', 'Rp 150k'),
          angka('ptj_t2', 'Pembeli', 'pembeli', '50 orang', '20 orang'),
          angka('ptj_t3', 'Data', 'data', '100 terjual', '40 terjual'),
        ],
        analisis: {
          kunci: ['Harga', 'Naik', 'Permintaan', 'Turun'],
          penjelasan:
            'Saat harga tiket naik dari Rp 100k ke Rp 150k, jumlah pembeli turun. Inilah hukum permintaan: harga naik, permintaan turun.',
        },
        dibuat: '2026-10-05T08:00:00.000Z',
        diubah: '2026-10-12T08:00:00.000Z',
      }),
      misi({
        id: 'msn_tws',
        judul: 'Misteri TWS Viral',
        xp: 2000,
        deskripsi:
          'TWS ini tiba-tiba ramai dipakai dan dibicarakan di media sosial. Harganya tetap, tapi jumlah orang yang ingin membelinya meningkat. Apa yang sebenarnya terjadi?',
        lencana: { nama: 'Pemburu Tren', gambar: 'lencana-2' },
        petunjuk: [
          angka('ptj_w1', 'Media Sosial', 'sosmed', '24 k views', '125 k views'),
          angka('ptj_w2', 'Harga', 'harga', 'Rp 200k', 'Rp 250k'),
          angka('ptj_w3', 'Pembeli', 'pembeli', '20 orang', '60 orang'),
        ],
        analisis: {
          kunci: ['Permintaan', 'Naik', 'Harga', 'Naik'],
          penjelasan:
            'Viral di media sosial membuat banyak orang ingin membeli TWS. Permintaan yang naik akhirnya mendorong harga ikut naik.',
        },
        dibuat: '2026-10-06T08:00:00.000Z',
        diubah: '2026-10-11T08:00:00.000Z',
      }),
      misi({
        id: 'msn_tumbler',
        judul: 'Misteri Tumbler',
        xp: 1000,
        deskripsi:
          'Semua orang memburu tumbler edisi terbatas ini karena tren baru. Bagaimana pengaruhnya terhadap stok dan penjualan?',
        lencana: { nama: 'Pelacak Penawaran', gambar: 'lencana-3' },
        petunjuk: [
          angka('ptj_b1', 'Harga', 'harga', 'Rp 80k', 'Rp 100k'),
          angka('ptj_b2', 'Stok', 'stok', '30 tumbler', '60 tumbler'),
          pesan('ptj_b3', 'Pesan', 'pesan', '“Harga sedang naik, jadi kami menambah stok untuk memenuhi peluang penjualan”'),
        ],
        analisis: {
          kunci: ['Harga', 'Naik', 'Penawaran', 'Naik'],
          penjelasan:
            'Penjual menambah stok karena harga tumbler naik. Inilah hukum penawaran: harga naik, jumlah yang ditawarkan ikut naik.',
        },
        dibuat: '2026-10-07T08:00:00.000Z',
        diubah: '2026-10-10T08:00:00.000Z',
      }),
      misiSegera('msn_coffee', 'Misteri Coffee Shop', 1000, '2026-10-04T08:00:00.000Z'),
      misiSegera('msn_festival', 'Misteri Festival', 1000, '2026-10-03T08:00:00.000Z'),
      misiSegera('msn_sepatu', 'Misteri Sepatu', 500, '2026-10-02T08:00:00.000Z'),
    ],

    materi: [
      {
        id: 'mtr_permintaan',
        judul: 'Pengertian Permintaan',
        kategori: 'permintaan',
        ringkasan: 'Jumlah barang yang ingin dan mampu dibeli konsumen pada harga tertentu.',
        konten:
          'Permintaan adalah jumlah barang atau jasa yang ingin dan mampu dibeli konsumen pada tingkat harga tertentu.\n\nContoh: waktu harga boba Rp 10.000, kamu beli 3 gelas seminggu. Saat harganya naik jadi Rp 20.000, kamu cuma beli 1 gelas.\n\nHukum permintaan: semakin tinggi harga, semakin sedikit jumlah barang yang diminta (ceteris paribus).',
        videoUrl: '',
        lampiran: null,
        status: 'terbit',
        dibuatOleh: GURU_AGUS,
        dibuat: '2026-10-05T09:00:00.000Z',
        diubah: '2026-10-05T09:00:00.000Z',
      },
      {
        id: 'mtr_faktor',
        judul: 'Faktor yang Memengaruhi Permintaan',
        kategori: 'permintaan',
        ringkasan: 'Harga barang, pendapatan, selera & tren, serta harga barang lain.',
        konten:
          'Faktor-faktor yang memengaruhi permintaan:\n• Harga barang — harga naik, pembeli berkurang.\n• Pendapatan — uang jajan naik, bisa beli lebih banyak.\n• Selera & tren — barang viral jadi banyak dicari.\n• Harga barang lain — kopi mahal? Orang beralih ke teh.',
        videoUrl: '',
        lampiran: null,
        status: 'terbit',
        dibuatOleh: GURU_AGUS,
        dibuat: '2026-10-06T09:00:00.000Z',
        diubah: '2026-10-06T09:00:00.000Z',
      },
      {
        id: 'mtr_penawaran',
        judul: 'Pengertian Penawaran',
        kategori: 'penawaran',
        ringkasan: 'Jumlah barang yang ingin dan mampu dijual produsen pada harga tertentu.',
        konten:
          'Penawaran adalah jumlah barang atau jasa yang ingin dan mampu dijual produsen pada tingkat harga tertentu.\n\nHukum penawaran: semakin tinggi harga, semakin banyak jumlah barang yang ditawarkan (ceteris paribus).',
        videoUrl: '',
        lampiran: null,
        status: 'draft',
        dibuatOleh: GURU_AGUS,
        dibuat: '2026-10-07T09:00:00.000Z',
        diubah: '2026-10-07T09:00:00.000Z',
      },
    ],

    siswa: [
      ['Alya', 4200, 3],
      ['Bima', 3650, 3],
      ['Citra', 3100, 3],
      ['Dimas', 2400, 2],
      ['Eka', 1800, 2],
      ['Fajar', 1250, 2],
      ['Gita', 900, 1],
      ['Hana', 450, 1],
      ['Indra', 200, 0],
    ].map(([nama, xp, misiSelesai], i) => ({
      id: `sis_${i + 1}`,
      nama,
      kodeKelas: 'AGUS123',
      xp,
      misiSelesai,
      lencana: misiSelesai,
      bergabung: '2026-10-08T00:00:00.000Z',
    })),
  };
}
