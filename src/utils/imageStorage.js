/**
 * imageStorage.js — Frontend-only image handling.
 *
 * ── The Problem with Images in localStorage ───────────────────────────────────
 * localStorage is a STRING store with a ~5 MB limit per origin.
 * A single JPEG product photo can easily be 2-4 MB.
 * Store images as raw base64 and you'll fill the quota with 2-3 products.
 *
 * ── Our Solution: Compress Before Storing ─────────────────────────────────────
 * 1. Draw the uploaded file onto an off-screen <canvas>
 * 2. Resize it to a max dimension (default: 800px)
 * 3. Re-encode as JPEG at 75% quality
 * 4. Store the compressed base64 string
 *
 * Result: a 3 MB photo → ~60 KB. You can store ~80 product images before
 * hitting the localStorage limit. For more images, you'd need IndexedDB
 * (which stores Blobs, not strings) — see the IndexedDB note at the bottom.
 *
 * ── Security Note ─────────────────────────────────────────────────────────────
 * Base64 images stored in localStorage are:
 *  - Readable by any JS running on the same origin (XSS risk)
 *  - NOT protected by HttpOnly cookies (no such concept here)
 *  - Visible in DevTools Storage tab to anyone with browser access
 * This is acceptable for a local admin tool. Do NOT store sensitive documents.
 */

const MAX_DIMENSION = 800;   // max width or height in pixels
const JPEG_QUALITY  = 0.75;  // 75% quality — good visual / size tradeoff
const MAX_FILE_SIZE_MB = 5;  // reject files larger than 5 MB before processing

/**
 * Validates, compresses, and returns a base64 data URL.
 * @param {File} file — the raw File object from <input type="file">
 * @returns {Promise<string>} — compressed base64 data URL
 * @throws {Error} with a human-readable message on validation failure
 */
export async function processImageFile(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('الملف المرفق ليس صورة. يرجى اختيار ملف صورة صالح.');
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    throw new Error(`حجم الصورة كبير جداً (${sizeMB.toFixed(1)} MB). الحد الأقصى هو ${MAX_FILE_SIZE_MB} MB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل في قراءة الملف.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('فشل في تحميل الصورة.'));
      img.onload = () => {
        try {
          const { width, height } = resizeDimensions(img.width, img.height);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
        } catch (err) {
          reject(new Error('فشل في معالجة الصورة: ' + err.message));
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/** Scales dimensions down while preserving aspect ratio. Never upscales. */
function resizeDimensions(w, h) {
  if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) return { width: w, height: h };
  const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

/**
 * Returns true if the string looks like a base64 data URL
 * (i.e. an image stored locally) vs an external https:// URL.
 */
export const isLocalImage = (src) =>
  typeof src === 'string' && src.startsWith('data:image/');

/**
 * Returns the approximate size of a base64 image in KB.
 * Useful for debugging quota issues.
 */
export const base64SizeKB = (b64) =>
  b64 ? (b64.length * 0.75 / 1024).toFixed(1) : 0;

/*
 * ── When to switch to IndexedDB for images ────────────────────────────────────
 *
 * Switch when ANY of these are true:
 *  - You need to store more than ~50-80 compressed product images
 *  - You need to store original-quality images (for download/print)
 *  - Users upload design reference images (which can be very large)
 *  - You're seeing QuotaExceededError in production
 *
 * IndexedDB stores Blob objects directly (no base64 conversion needed),
 * has no practical size limit (browser allows up to ~50% of free disk space),
 * and uses async APIs so it never blocks the main thread.
 *
 * The migration path: replace processImageFile's resolve() to store to
 * IndexedDB via idb-keyval (1KB wrapper), then read back as an object URL.
 * All consuming components stay identical — they still receive a URL string.
 */
