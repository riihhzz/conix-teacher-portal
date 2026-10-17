import { formatUkuran } from './format.js';

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Lempar error jika file melebihi batas ukuran. */
export function assertFileSize(file, maxBytes) {
  if (file.size > maxBytes) throw new Error(`Ukuran file maksimal ${formatUkuran(maxBytes)}.`);
}
