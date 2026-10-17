const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape teks sebelum disisipkan ke template HTML. */
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c]);

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/** Tandai field yang tidak valid; kembalikan field pertama yang gagal (atau null). */
export function validateFields(fields) {
  let firstInvalid = null;
  for (const field of fields) {
    const valid = field.checkValidity();
    field.setAttribute('aria-invalid', String(!valid));
    if (!valid && !firstInvalid) firstInvalid = field;
  }
  return firstInvalid;
}

/** Tampilkan / sembunyikan pesan error di elemen [data-error]. */
export function showError(el, message) {
  el.textContent = message ?? '';
  el.hidden = !message;
}
