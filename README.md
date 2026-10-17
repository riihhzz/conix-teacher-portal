# CONIX – Teacher Portal

Website untuk **guru**: upload materi, menyusun misi investigasi ekonomi, dan memantau XP/peringkat siswa.
Aplikasi mobile CONIX (`../APK/CONNIX/conix_app`) dipakai oleh **murid**.

Acuan desain: Figma *Pemograman desain* · Acuan alur: `../DrawIO` (use case, DFD, flow sistem).

## Teknologi

- [Vite](https://vite.dev) — dev server & build multi-halaman
- [Tailwind CSS v4](https://tailwindcss.com) — styling (design token CONIX di `src/styles/theme.css`)
- JavaScript (ES Modules) tanpa framework

## Menjalankan

> ⚠️ Jangan buka file HTML dengan **Live Server** atau klik dua kali — Tailwind hanya diproses oleh Vite.

```bash
npm install      # sekali saja
npm run dev      # browser otomatis terbuka di http://localhost:5173
```

Build produksi: `npm run build` (hasil di `dist/`), cek hasil build dengan `npm run preview`.

**Akun demo:** `agus@conix.id` / `guru123` (kelas `AGUS123`, sama dengan data di aplikasi murid).

## Struktur Folder

```
Web/
├── index.html                  # Halaman login / daftar guru
├── pages/                      # Halaman setelah login
│   ├── dashboard.html          #   Beranda: statistik, misi kelas, kode kelas
│   ├── materi.html             #   Upload & kelola materi           (DFD 2.0)
│   ├── misi.html               #   Manajemen misi                   (DFD 3.0)
│   ├── misi-editor.html        #   Wizard: Informasi → Petunjuk → Analisis → Publikasi
│   ├── siswa.html              #   Hasil siswa / leaderboard XP     (DFD 7.0)
│   └── profil.html             #   Profil guru
├── public/                     # Aset statis (disalin apa adanya)
│   ├── favicon.png
│   └── images/
│       ├── brand/              #   logotype, logo
│       ├── mascot/             #   Nomi (maskot) & versi sedih
│       ├── nav/                #   ikon menu sidebar
│       ├── topics/             #   ikon Permintaan / Penawaran
│       ├── clues/              #   ikon petunjuk misi (tiket, harga, stok, ...)
│       ├── badges/             #   gambar lencana
│       ├── mission/            #   ikon daftar misi & misi harian
│       └── icons/              #   ikon UI (menu, panah, email, ...)
├── src/
│   ├── styles/
│   │   ├── main.css            # entry: font + tailwind + partial di bawah
│   │   ├── theme.css           # design token (warna, font, shadow)
│   │   ├── base.css            # style dasar elemen
│   │   └── components.css      # komponen: .btn, .card, .panel-sun, .badge, .slot, ...
│   └── js/
│       ├── config/constants.js # route, kategori, ikon, lencana, kartu analisis
│       ├── data/               # seed.js (data contoh) & storage.js (localStorage)
│       ├── services/           # auth, materi, misi, siswa (lapisan akses data)
│       ├── components/         # app-shell (header+sidebar), modal, toast, ui
│       ├── utils/              # dom, format, file
│       └── pages/              # logika per halaman
├── vite.config.js
└── package.json
```

Aset gambar diambil dari `conix_app/assets/images` agar tampilan web dan aplikasi murid seragam.

## Menghubungkan ke Backend

Data saat ini tersimpan di **localStorage** browser (frontend-only), sehingga belum terkirim ke aplikasi murid.
Semua halaman hanya mengakses data lewat `src/js/services/*`. Untuk memakai database bersama
(Supabase / Firebase / Laravel API), cukup ganti isi `src/js/data/storage.js` dan service terkait.

Struktur data mengikuti model di aplikasi murid (`lib/core/models/mission.dart`):

| Web (misi)                         | Aplikasi (Mission)          |
| ---------------------------------- | --------------------------- |
| `judul`, `xp`, `deskripsi`         | `title`, `xpReward`, `description` |
| `petunjuk[]` (`judul`, `ikon`, `awal`, `akhir`, `pesan`) | `clues[]` (`title`, `image`, `leftLabel`, `rightLabel`, `customText`) |
| `analisis.kunci[4]`                | `answerKey`                 |
| `analisis.penjelasan`              | `explanation`               |
| `lencana.nama`, `lencana.gambar`   | `badgeName`, `badgeImage`   |
| `status: draft`                    | `Mission.comingSoon`        |

Untuk mengulang data contoh: buka DevTools → Console → `localStorage.clear()` lalu muat ulang.
