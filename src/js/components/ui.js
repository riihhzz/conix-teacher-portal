/** Potongan UI kecil yang dipakai di banyak halaman. */
import { IMG, STATUS_MISI, STATUS_MATERI } from '../config/constants.js';
import { esc } from '../utils/dom.js';

export function statusBadge(status, map = STATUS_MISI) {
  const s = map[status] ?? map.draft;
  return `<span class="badge ${s.badge}">${s.label}</span>`;
}

export const materiBadge = (status) => statusBadge(status, STATUS_MATERI);

export function avatar(user, size = 'size-10') {
  const src = user.foto || IMG.avatar;
  return `<img src="${esc(src)}" alt="" class="${size} shrink-0 rounded-full border-2 border-ink bg-sun-light object-cover" />`;
}

/** Tampilan kosong dengan maskot sedih. */
export function emptyState(title, message = '') {
  return `
    <div class="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <img src="${IMG.mascotSad}" alt="" class="h-28 w-auto" />
      <p class="text-xl font-bold">${esc(title)}</p>
      ${message ? `<p class="max-w-md font-body text-bark">${esc(message)}</p>` : ''}
    </div>`;
}

