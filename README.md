# CONIX – Teacher Portal

Website untuk **guru**: upload materi, menyusun misi investigasi ekonomi, dan memantau XP/peringkat siswa.
Aplikasi mobile CONIX (`../APK/CONNIX/conix_app`) dipakai oleh **murid**.

🌐 **Website:** https://riihhzz.github.io/conix-teacher-portal/

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

**Deploy:** setiap `git push` ke branch `main` otomatis di-build dan dipublikasikan ke GitHub Pages
(`.github/workflows/deploy.yml`). Progresnya bisa dilihat di tab **Actions** repo.

**Akun demo:** `agus@conix.id` / `guru123` (kelas `AGUS123`, sama dengan data di aplikasi murid).

## Struktur Folder

```
Web/
├── index.html                  # Landing page publik: Beranda, Fitur, Tentang, Tim (animasi)
├── auth/                       # Halaman publik untuk akun guru
│   ├── login.html              #   Masuk
│   └── register.html           #   Daftar
├── pages/                      # Halaman setelah login (authenticated)
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
│       ├── mascot/             #   Nomi versi gambar utuh (dipakai di ikon kecil)
│       ├── nomi/               #   Nomi per bagian (tubuh + ekspresi/) dari tim aset, untuk animasi
│       ├── anim/               #   ilustrasi SVG 2D beranimasi (koin, kaca pembesar, bohlam, ...)
│       ├── partners/           #   logo UPI & Pendidikan Multimedia (footer)
│       ├── team/               #   foto anggota tim
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
│   │   ├── components.css      # komponen: .btn, .card, .panel-sun, .badge, .slot, ...
│   │   ├── landing.css         # halaman publik: tombol chunky 3D, animasi melayang & scroll
│   │   └── nomi.css            # gerakan maskot Nomi (bernapas, mengangguk, melompat)
│   └── js/
│       ├── config/constants.js # route, kategori, ikon, lencana, kartu analisis, link APK
│       ├── services/           # api (klien HTTP + token), auth, materi, misi, siswa
│       ├── components/         # app-shell (header+sidebar), auth-form, nomi (maskot hidup), modal, toast, ui
│       ├── utils/              # dom, format, file
│       └── pages/              # logika per halaman (landing, login, register, dashboard, ...)
├── vite.config.js
└── package.json
```

Aset gambar diambil dari `conix_app/assets/images` agar tampilan web dan aplikasi murid seragam.

## Backend

Semua data (akun guru, materi, misi, peringkat siswa) disimpan di **CONIX Backend** (Laravel + MySQL,
repo `conix-backend`), database yang sama dengan aplikasi murid. Halaman hanya mengakses data lewat
`src/js/services/*`; `services/api.js` mengirim request beserta token login guru.

Alamat API diatur lewat variabel `VITE_API_URL`:

- **Lokal:** jalankan backend dengan `php artisan serve`. Tanpa pengaturan apa pun, web memakai
  `http://127.0.0.1:8000/api/v1`. Untuk alamat lain, salin `.env.example` menjadi `.env` lalu ubah isinya.
- **GitHub Pages:** isi variabel repo **Settings → Secrets and variables → Actions → Variables**
  bernama `VITE_API_URL` (mis. `https://conix.alwaysdata.net/api/v1`), lalu jalankan ulang workflow deploy.

Struktur data di web mengikuti model di aplikasi murid (`lib/core/models/mission.dart`); service menerjemahkan
format JSON API ke bentuk ini:

| Web (misi)                         | Aplikasi (Mission)          |
| ---------------------------------- | --------------------------- |
| `judul`, `xp`, `deskripsi`         | `title`, `xpReward`, `description` |
| `petunjuk[]` (`judul`, `ikon`, `awal`, `akhir`, `pesan`) | `clues[]` (`title`, `image`, `leftLabel`, `rightLabel`, `customText`) |
| `analisis.kunci[4]`                | `answerKey`                 |
| `analisis.penjelasan`              | `explanation`               |
| `lencana.nama`, `lencana.gambar`   | `badgeName`, `badgeImage`   |
| `status: draft`                    | `Mission.comingSoon`        |

Untuk mengulang data contoh, jalankan `php artisan migrate:fresh --seed` di backend.
