// js/utils.js — shared helpers
// ─────────────────────────────────────────────────────────────

/**
 * Show a toast notification
 * @param {string} msg
 * @param {'info'|'success'|'error'} type
 * @param {number} ms duration
 */
export function toast(msg, type = 'info', ms = 3500) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => el.remove(), 320);
  }, ms);
}

/**
 * Format seconds to M:SS
 */
export function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Wait until condition() returns true, polling every `interval` ms
 */
export function waitUntil(condition, interval = 100, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const id = setInterval(() => {
      if (condition()) { clearInterval(id); resolve(); }
      else if (Date.now() - start > timeout) {
        clearInterval(id);
        reject(new Error('waitUntil timeout'));
      }
    }, interval);
  });
}

/**
 * Wait for OpenCV.js to be ready (cv.Mat must be callable)
 */
export async function waitForCV() {
  // cv may be defined but WASM not yet compiled — check cv.Mat exists
  await waitUntil(
    () => window._cvReady || (typeof cv !== 'undefined' && cv.Mat !== undefined),
    150,
    90000
  );
  // Sync the global flag in case polling found it first
  window._cvReady = true;
}

/**
 * Clamp a number between min and max
 */
export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/**
 * Canvas → Blob Promise (supports both HTMLCanvasElement and OffscreenCanvas)
 */
export async function canvasToBlob(canvas, mime = 'image/png', quality = 0.95) {
  if (!canvas) throw new Error('No canvas provided to canvasToBlob');

  // OffscreenCanvas uses convertToBlob()
  if (typeof canvas.convertToBlob === 'function') {
    return await canvas.convertToBlob({ type: mime, quality });
  }

  // HTMLCanvasElement uses toBlob(callback)
  if (typeof canvas.toBlob === 'function') {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to encode canvas to blob'));
        },
        mime,
        quality
      );
    });
  }

  // Universal DOM fallback: draw onto standard canvas
  if (typeof document !== 'undefined') {
    const temp = document.createElement('canvas');
    temp.width = canvas.width;
    temp.height = canvas.height;
    const ctx = temp.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    return new Promise((resolve, reject) => {
      temp.toBlob(
        blob => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to encode canvas to blob'));
        },
        mime,
        quality
      );
    });
  }

  throw new Error('Canvas element does not support toBlob or convertToBlob');
}

/**
 * Download a Blob as file
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
}

/**
 * Scale a rect to fit within (maxW, maxH) while preserving aspect ratio.
 * Returns { w, h, scale }
 */
export function fitRect(srcW, srcH, maxW, maxH) {
  const scale = Math.min(maxW / srcW, maxH / srcH, 1);
  return { w: Math.round(srcW * scale), h: Math.round(srcH * scale), scale };
}

/**
 * Get canvas-relative pointer position accounting for CSS scaling
 */
export function getCanvasXY(canvas, e) {
  const rect  = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
  const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top)  * scaleY,
  };
}
