import { db, uid, now, clone } from '../data/storage.js';
import { authService } from './auth.service.js';

/**
 * CRUD untuk koleksi milik guru yang sedang login (materi, misi).
 * Setiap guru hanya melihat dan mengubah datanya sendiri.
 */
export function ownedCollection(name, prefix) {
  const owner = () => authService.currentUser()?.id;
  const mine = () => db.data[name].filter((item) => item.dibuatOleh === owner());

  return {
    list() {
      return clone(mine()).sort((a, b) => b.diubah.localeCompare(a.diubah));
    },

    get(id) {
      const item = mine().find((x) => x.id === id);
      return item ? clone(item) : null;
    },

    save(data) {
      const existing = data.id && mine().find((x) => x.id === data.id);
      if (existing) {
        Object.assign(existing, clone(data), { diubah: now() });
        db.commit();
        return clone(existing);
      }
      const item = { ...clone(data), id: uid(prefix), dibuatOleh: owner(), dibuat: now(), diubah: now() };
      db.data[name].push(item);
      db.commit();
      return clone(item);
    },

    remove(id) {
      db.data[name] = db.data[name].filter((x) => !(x.id === id && x.dibuatOleh === owner()));
      db.commit();
    },
  };
}
