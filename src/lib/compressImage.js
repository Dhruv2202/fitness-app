const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

// Phone photos are several megabytes, far larger than the app ever displays.
// Shrinking before upload keeps pages fast on mobile data. Returns the original
// file if the browser can't decode it (e.g. HEIC in some browsers).
export async function compressImage(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
    );

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY)
    );

    if (!blob || blob.size >= file.size) return file;
    return blob;
  } catch {
    return file;
  }
}
