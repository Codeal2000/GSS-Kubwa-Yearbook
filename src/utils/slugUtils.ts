export function generatePublicShareSlug(fullName: string, seed?: string): string {
  const cleanName = (fullName || 'student')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'student';

  let suffix = '';
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 4; i++) {
      suffix += chars[Math.abs(hash + i * 37) % chars.length];
      hash = Math.floor(Math.abs(hash) / 3) + i;
    }
  } else {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 4; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return `${cleanName}-${suffix}`;
}
