import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from './constants';

/** Returns an error code, or null when the file is acceptable. */
export function validateImageFile(file) {
  if (!file) return 'INVALID_IMAGE';
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'INVALID_IMAGE';
  if (file.size > MAX_IMAGE_BYTES) return 'IMAGE_TOO_LARGE';
  return null;
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const dataUriBytes = (dataUri) => {
  const base64 = dataUri.slice(dataUri.indexOf(',') + 1);
  return Math.floor((base64.length * 3) / 4) - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
};

/**
 * Validates the file, then downsizes it in the browser before Base64 encoding.
 * A 1.8 MB phone photo typically becomes ~120 KB, which keeps MongoDB documents
 * small and the customer menu fast on mobile data.
 */
export async function prepareImage(file, { maxSize = 1200, quality = 0.82 } = {}) {
  const error = validateImageFile(file);
  if (error) throw Object.assign(new Error(error), { code: error });

  const original = await fileToBase64(file);
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    let optimized = canvas.toDataURL('image/webp', quality);
    if (!optimized.startsWith('data:image/webp')) optimized = canvas.toDataURL('image/jpeg', quality);

    const before = file.size;
    const after = dataUriBytes(optimized);
    return after < before
      ? { dataUri: optimized, originalBytes: before, bytes: after }
      : { dataUri: original, originalBytes: before, bytes: before };
  } catch {
    return { dataUri: original, originalBytes: file.size, bytes: file.size };
  }
}
