import { api, formFile } from './api.js';

/** Materi dari API → bentuk yang dipakai halaman. */
const keMateri = (m) => ({
  id: m.id,
  judul: m.judul,
  kategori: m.kategori,
  status: m.status,
  ringkasan: m.ringkasan ?? '',
  konten: m.konten ?? '',
  videoUrl: m.video_url ?? '',
  lampiran: m.lampiran,
  diubah: m.diubah,
});

/** Data Materi (DFD 2.0 Input Materi). */
export const materiService = {
  async list() {
    const { data } = await api('GET', '/guru/materi');
    return data.map(keMateri);
  },

  /** Simpan materi baru / perubahan. Tanpa id = materi baru. */
  async save({ id, judul, kategori, status, ringkasan, konten, videoUrl }) {
    const body = { judul, kategori, status, ringkasan: ringkasan || null, konten, video_url: videoUrl || null };
    const { data } = id ? await api('PUT', `/guru/materi/${id}`, body) : await api('POST', '/guru/materi', body);
    return keMateri(data);
  },

  async remove(id) {
    await api('DELETE', `/guru/materi/${id}`);
  },

  async uploadLampiran(id, file) {
    const { data } = await api('POST', `/guru/materi/${id}/lampiran`, formFile('lampiran', file));
    return keMateri(data);
  },

  async hapusLampiran(id) {
    const { data } = await api('DELETE', `/guru/materi/${id}/lampiran`);
    return keMateri(data);
  },
};
