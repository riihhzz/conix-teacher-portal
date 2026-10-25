import { formatUkuran } from './format.js';

/** Lempar error jika file melebihi batas ukuran. */
export function assertFileSize(file, maxBytes) {
  if (file.size > maxBytes) throw new Error(`Ukuran file maksimal ${formatUkuran(maxBytes)}.`);
}
