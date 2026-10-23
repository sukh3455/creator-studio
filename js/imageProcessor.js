// js/imageProcessor.js
// Lossless Gemini Watermark Removal via Mathematical Reverse Alpha Blending
// Formula: Original = (Watermarked - alpha * Logo) / (1 - alpha)
// ─────────────────────────────────────────────────────────────

import {
  WatermarkEngine,
  detectWatermarkConfig,
  calculateWatermarkPosition
} from './engine/watermarkEngine.js';
import { removeWatermark } from './engine/blendModes.js';
import { interpolateAlphaMap } from './engine/adaptiveDetector.js';

let engineInstance = null;

export async function getWatermarkEngine() {
  if (!engineInstance) {
    engineInstance = await WatermarkEngine.create();
  }
  return engineInstance;
}

/**
 * Remove Gemini watermark from image losslessly.
 * @param {HTMLCanvasElement} srcCanvas
 * @param {{ x: number, y: number, w: number, h: number }} [maskRect]
 * @param {Object} [opts]
 * @param {number} [opts.alphaGain=1.0]
 * @param {Function} [opts.onProgress]
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function removeWatermarkImage(srcCanvas, maskRect, opts = {}) {
  const onProg = opts.onProgress ?? (() => {});
  onProg(0.15);

  const engine = await getWatermarkEngine();
  onProg(0.35);

  // 1. Try automated multi-pass pipeline from WatermarkEngine
  try {
    const pipelineCanvas = await engine.removeWatermarkFromImage(srcCanvas, {
      debugTimings: false
    });
    if (pipelineCanvas && pipelineCanvas.__watermarkMeta && pipelineCanvas.__watermarkMeta.applied) {
      onProg(1.0);
      return pipelineCanvas;
    }
  } catch (err) {
    console.warn('Auto pipeline did not apply:', err);
  }

  // 2. Direct Reverse Alpha Blending at target rectangle (lossless, zero blur)
  onProg(0.60);
  const outCanvas = document.createElement('canvas');
  outCanvas.width = srcCanvas.width;
  outCanvas.height = srcCanvas.height;
  const ctx = outCanvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(srcCanvas, 0, 0);

  // Calculate or use provided position
  let rect = maskRect;
  if (!rect || !rect.w || !rect.h) {
    const config = detectWatermarkConfig(srcCanvas.width, srcCanvas.height);
    const pos = calculateWatermarkPosition(srcCanvas.width, srcCanvas.height, config);
    rect = { x: pos.x, y: pos.y, w: pos.width, h: pos.height };
  }

  const rectW = Math.round(rect.w);
  const rectH = Math.round(rect.h);
  const size = Math.max(rectW, rectH);
  const rectX = Math.max(0, Math.min(srcCanvas.width - size, Math.round(rect.x)));
  const rectY = Math.max(0, Math.min(srcCanvas.height - size, Math.round(rect.y)));

  // Retrieve matching or interpolated alpha map
  let alphaMap;
  if (size === 48) {
    alphaMap = await engine.getAlphaMap(48);
  } else if (size === 96) {
    alphaMap = await engine.getAlphaMap(96);
  } else {
    const base96 = await engine.getAlphaMap(96);
    alphaMap = interpolateAlphaMap(base96, 96, size);
  }

  const imgData = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height);
  const alphaGain = Number.isFinite(opts.alphaGain) && opts.alphaGain > 0 ? opts.alphaGain : 1.0;

  removeWatermark(imgData, alphaMap, {
    x: rectX,
    y: rectY,
    width: size,
    height: size
  }, { alphaGain });

  ctx.putImageData(imgData, 0, 0);
  outCanvas.__watermarkMeta = { applied: true, losslessReverseAlpha: true };
  onProg(1.0);
  return outCanvas;
}
