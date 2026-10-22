let container;

function ensureContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.className = 'pointer-events-none fixed inset-x-0 bottom-6 z-70 flex flex-col items-center gap-2 px-4';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  document.body.append(container);
  return container;
}

/** Notifikasi singkat di bawah layar. type: 'success' | 'error' */
export function toast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = `rounded-xl border-3 border-ink px-5 py-3 font-semibold shadow-chip transition duration-300 ${
    type === 'error' ? 'bg-danger text-white' : 'bg-sun text-ink'
  }`;
  el.textContent = message;
  ensureContainer().append(el);
  setTimeout(() => {
    el.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => el.remove(), 300);
  }, 2800);
}
