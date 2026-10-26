import { api, session, formFile } from './api.js';

/** Profil guru dari API → bentuk yang dipakai halaman. */
const keUser = (g) => ({
  id: g.id,
  nama: g.nama,
  panggilan: g.panggilan,
  email: g.email,
  foto: g.foto_url ?? '',
  kodeKelas: g.kode_kelas,
  bergabung: g.bergabung,
});

function simpanSesi({ token, guru }) {
  const user = keUser(guru);
  session.set(token, user);
  return user;
}

function perbaruiUser({ data }) {
  const user = keUser(data);
  session.set(null, user);
  return user;
}

export const authService = {
  /** Guru yang sedang login (dari cache lokal), atau null. */
  currentUser() {
    return session.token() ? session.user() : null;
  },

  /** Ambil ulang profil dari server (mis. setelah diubah di perangkat lain). */
  async refresh() {
    return perbaruiUser(await api('GET', '/guru/profil'));
  },

  async login(email, password) {
    return simpanSesi(await api('POST', '/guru/masuk', { email: email.trim(), password }));
  },

  async register({ nama, email, password }) {
    return simpanSesi(await api('POST', '/guru/daftar', { nama: nama.trim(), email: email.trim(), password }));
  },

  async updateProfile({ nama, panggilan, email }) {
    return perbaruiUser(await api('PUT', '/guru/profil', { nama, panggilan: panggilan || null, email }));
  },

  /** Ganti password; sesi di perangkat lain ikut dikeluarkan oleh server. */
  async changePassword({ password_lama, password, password_confirmation }) {
    await api('PUT', '/guru/profil/password', { password_lama, password, password_confirmation });
  },

  async uploadFoto(file) {
    return perbaruiUser(await api('POST', '/guru/profil/foto', formFile('foto', file)));
  },

  async hapusFoto() {
    return perbaruiUser(await api('DELETE', '/guru/profil/foto'));
  },

  async logout() {
    try {
      await api('POST', '/guru/keluar');
    } catch {
      /* token sudah tidak berlaku: tetap keluar di sisi browser */
    }
    session.clear();
  },
};
