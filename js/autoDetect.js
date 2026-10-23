// js/autoDetect.js
// Automatic detection of Gemini watermark position based on image dimensions catalog
// ─────────────────────────────────────────────────────────────

import { detectWatermarkConfig, calculateWatermarkPosition } from './engine/watermarkEngine.js';

/**
 * Auto-detect the exact Gemini watermark region in a canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {Object} [opts]
 * @returns {Promise<{ x: number, y: number, w: number, h: number, isGeminiExact: boolean }>}
 */
export async function autoDetectWatermark(canvas, opts = {}) {
  const W = canvas.width, H = canvas.height;

  try {
    const config = detectWatermarkConfig(W, H);
    if (config) {
      const pos = calculateWatermarkPosition(W, H, config);
      if (pos && pos.x >= 0 && pos.y >= 0 && pos.width > 0 && pos.height > 0) {
        return {
          x: pos.x,
          y: pos.y,
          w: pos.width,
          h: pos.height,
          isGeminiExact: true
        };
      }
    }
  } catch (e) {
    console.warn('Gemini catalog lookup warning:', e);
  }

  // Fallback: bottom-right standard margin
  const size = (W >= 1500 || H >= 1500) ? 96 : 48;
  const margin = size === 96 ? 64 : 32;
  return {
    x: Math.max(0, W - size - margin),
    y: Math.max(0, H - size - margin),
    w: size,
    h: size,
    isGeminiExact: false
  };
}
