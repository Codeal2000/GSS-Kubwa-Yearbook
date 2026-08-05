export async function convertFileToWebp(file: File, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return reject(new Error('File is empty'));

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 600;
          canvas.height = img.naturalHeight || img.height || 600;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(src);
            return;
          }
          ctx.drawImage(img, 0, 0);
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          resolve(webpDataUrl);
        } catch (err) {
          console.warn('Canvas webp conversion fallback:', err);
          resolve(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export function ensureWebpFilename(filename: string): string {
  if (!filename) return '';
  const trimmed = filename.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  let clean = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  if (clean.startsWith('photos/')) {
    clean = clean.replace(/^photos\//, '');
  }
  const nameWithoutExt = clean.replace(/\.(jpg|jpeg|png|webp|jfif|gif|svg)$/i, '');
  return `${nameWithoutExt}.webp`;
}
