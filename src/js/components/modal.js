import { esc } from '../utils/dom.js';

/**
 * Buka <dialog> modal dari string HTML.
 * Elemen ber-atribut [data-close] otomatis menutup modal.
 */
export function openModal(html, { size = 'md' } = {}) {
  const width = { md: 'max-w-md', lg: 'max-w-3xl' }[size];
  const dialog = document.createElement('dialog');
  dialog.className = `m-auto w-[calc(100%-2rem)] ${width} rounded-[23px] border-4 border-ink bg-cream p-0 text-ink shadow-card backdrop:bg-ink/50 backdrop:backdrop-blur-[2px]`;
  dialog.innerHTML = html;
  document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove());
  dialog.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', () => dialog.close()));
  dialog.showModal();
  return dialog;
}

/** Modal yang membuka konten dari <template id="...">. */
export function openTemplateModal(templateId, options) {
  return openModal(document.getElementById(templateId).innerHTML, options);
}

/** Dialog konfirmasi. Resolve true jika pengguna menekan tombol konfirmasi. */
export function confirmDialog({ title, message, confirmText = 'Ya', danger = false }) {
  return new Promise((resolve) => {
    const dialog = openModal(`
      <form method="dialog" class="p-6">
        <h2 class="text-2xl font-bold">${esc(title)}</h2>
        <p class="mt-2 font-body text-bark">${esc(message)}</p>
        <div class="mt-6 flex justify-end gap-3">
          <button value="cancel" class="btn btn-secondary">Batal</button>
          <button value="ok" class="btn ${danger ? 'btn-danger' : 'btn-primary'}">${esc(confirmText)}</button>
        </div>
      </form>`);
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'ok'));
  });
}
