import { db, session, uid, now } from '../data/storage.js';

const sanitize = (user) => {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
};

const findByEmail = (email) => db.data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

/** Kode kelas unik dari nama depan guru, mis. "AGUS123". */
function generateKodeKelas(nama) {
  const base = (nama.trim().split(/\s+/)[0] || 'GURU').replace(/[^a-z]/gi, '').toUpperCase().slice(0, 6) || 'GURU';
  let kode;
  do kode = `${base}${Math.floor(100 + Math.random() * 900)}`;
  while (db.data.users.some((u) => u.kodeKelas === kode));
  return kode;
}

export const authService = {
  currentUser() {
    return sanitize(db.data.users.find((u) => u.id === session.get()));
  },

  login(email, password) {
    const user = findByEmail(email);
    if (!user || user.password !== password) throw new Error('Email atau password salah.');
    if (user.role !== 'guru') throw new Error('Website ini khusus guru. Murid silakan memakai aplikasi CONIX.');
    session.set(user.id);
    return sanitize(user);
  },

  register({ nama, email, password }) {
    if (findByEmail(email)) throw new Error('Email sudah terdaftar.');
    const user = {
      id: uid('usr'),
      nama: nama.trim(),
      panggilan: nama.trim(),
      email: email.trim(),
      password,
      role: 'guru',
      kodeKelas: generateKodeKelas(nama),
      foto: '',
      bergabung: now(),
    };
    db.data.users.push(user);
    db.commit();
    session.set(user.id);
    return sanitize(user);
  },

  updateProfile(patch) {
    const user = db.data.users.find((u) => u.id === session.get());
    if (!user) throw new Error('Sesi berakhir, silakan login ulang.');
    if (patch.email && patch.email !== user.email && findByEmail(patch.email)) {
      throw new Error('Email sudah dipakai akun lain.');
    }
    Object.assign(user, patch);
    db.commit();
    return sanitize(user);
  },

  logout() {
    session.clear();
  },
};
