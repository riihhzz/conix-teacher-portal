export const formatAngka = (n) => Number(n || 0).toLocaleString('id-ID');

export const formatXP = (n) => `+${formatAngka(n)} XP`;

export const formatTanggal = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatUkuran = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
