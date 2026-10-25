/**
 * Klien HTTP ke backend CONIX (Laravel). Menyimpan token login guru di localStorage
 * dan mengubah respons error menjadi Error dengan pesan yang siap ditampilkan.
 */
import { API_URL, ROUTES } from '../config/constants.js';

const TOKEN_KEY = 'conix:token';
const USER_KEY = 'conix:user';

function bacaStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Token & profil guru yang sedang login (profil disimpan agar halaman bisa tampil tanpa menunggu). */
export const session = {
  token: () => bacaStorage(TOKEN_KEY),
  user() {
    try {
      return JSON.parse(bacaStorage(USER_KEY));
    } catch {
      return null;
    }
  },
  set(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* storage diblokir: tidak ada yang perlu dihapus */
    }
  },
};

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

/** Pesan pertama dari respons validasi Laravel ({ message, errors: { field: [..] } }). */
function pesanError(body, status) {
  const pertama = Object.values(body?.errors ?? {})[0];
  if (Array.isArray(pertama) && pertama.length) return pertama[0];
  if (status === 403) return 'Anda tidak punya akses ke data ini.';
  if (status === 404) return 'Data tidak ditemukan. Mungkin sudah dihapus.';
  if (status === 413) return 'Ukuran file terlalu besar.';
  if (status === 429) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
  if (status >= 500) return 'Server sedang bermasalah. Coba lagi beberapa saat lagi.';
  return body?.message || 'Terjadi kesalahan. Coba lagi.';
}

/** Sesi kedaluwarsa / token dicabut: kembali ke halaman login. */
function keLogin() {
  session.clear();
  if (!location.pathname.startsWith(ROUTES.login)) {
    location.replace(`${ROUTES.login}?next=${encodeURIComponent(location.pathname + location.search)}`);
  }
}

/**
 * Kirim request ke API. `body` berupa objek (dikirim sebagai JSON) atau FormData (upload file).
 * Mengembalikan isi JSON respons, atau null untuk 204.
 */
export async function api(method, path, body) {
  const headers = { Accept: 'application/json' };
  const token = session.token();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload = body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError('Tidak bisa terhubung ke server CONIX. Periksa koneksi internet Anda.', 0);
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);

  if (response.status === 401 && token) {
    keLogin();
    throw new ApiError('Sesi berakhir, silakan masuk lagi.', 401);
  }
  if (!response.ok) throw new ApiError(pesanError(data, response.status), response.status, data?.errors);
  return data;
}

/** FormData berisi satu file, untuk endpoint upload. */
export function formFile(field, file) {
  const form = new FormData();
  form.append(field, file);
  return form;
}
