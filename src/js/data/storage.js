/**
 * Penyimpanan sementara di localStorage (frontend-only).
 * Ganti modul ini dengan pemanggilan API/backend saat database sudah tersedia.
 */
import { createSeed } from './seed.js';

const DB_KEY = 'conix:db:v3';
const SESSION_KEY = 'conix:session';

function read() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* data rusak atau storage diblokir: pakai data contoh */
  }
  const fresh = createSeed();
  write(fresh);
  return fresh;
}

function write(data) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (err) {
    if (err?.name === 'QuotaExceededError') {
      throw new Error('Penyimpanan browser penuh. Gunakan file yang lebih kecil.');
    }
    throw err;
  }
}

export const db = {
  data: read(),
  commit() {
    write(this.data);
  },
  reset() {
    this.data = createSeed();
    this.commit();
  },
};

export const session = {
  get() {
    try {
      return localStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  },
  set(userId) {
    localStorage.setItem(SESSION_KEY, userId);
  },
  clear() {
    localStorage.removeItem(SESSION_KEY);
  },
};

export const uid = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
export const now = () => new Date().toISOString();
export const clone = (value) => structuredClone(value);
