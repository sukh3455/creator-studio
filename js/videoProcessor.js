// js/videoProcessor.js
// Frame-by-frame video watermark removal.
//
// Pipeline (FFmpeg.wasm single-thread, no SharedArrayBuffer needed):
//   1. Write source video to FFmpeg virtual FS
//   2. Extract metadata (fps, duration, codec)
//   3. Extract audio track separately
//   4. Extract frames as PNG images (batched to limit RAM)
//   5. Process each frame with OpenCV inpainting
//   6. Write processed frames back to FFmpeg FS
//   7. Encode frames + audio → MP4 / WebM
//   8. Return Blob URL for playback & download
//
// Progress is reported smoothly at every stage.
// Processing can be cancelled at any point.
// ─────────────────────────────────────────────────────────────

import { waitForCV } from './utils.js';

// FFmpeg.wasm lazy-loaded
let ffmpegInstance = null;
let ffmpegLoading  = false;
let ffmpegReady    = false;
const ffmpegQueue  = [];

async function getFFmpeg() {
  if (ffmpegReady) return ffmpegInstance;

  if (!ffmpegLoading) {
    ffmpegLoading = true;
    try {
      let FFmpeg, toBlobURL;
      try {
        const ffmpegModule = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm/index.js');
        const utilModule   = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js');
        FFmpeg = ffmpegModule.FFmpeg;
        toBlobURL = utilModule.toBlobURL;
      } catch (cdnErr) {
        console.warn('jsDelivr failed for FFmpeg, trying unpkg mirror...', cdnErr);
        const ffmpegModule = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/esm/index.js');
        const utilModule   = await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js');
        FFmpeg = ffmpegModule.FFmpeg;
        toBlobURL = utilModule.toBlobURL;
      }

      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
      ffmpegInstance = new FFmpeg();

      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`,   'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      ffmpegReady = true;
      ffmpegQueue.forEach(r => r(ffmpegInstance));
      ffmpegQueue.length = 0;
    } catch (err) {
      ffmpegLoading = false;
      throw err;
    }
  }

  return new Promise((resolve, reject) => {
    if (ffmpegReady) { resolve(ffmpegInstance); return; }
    ffmpegQueue.push(resolve);
  });
}

// ─────────────────────────────────────────────────────────────

/**
 * Remove watermark from a video file.
 *
 * @param {File}    file        source video
 * @param {{ x,y,w,h }} maskRect  in FULL-RES canvas-pixel coords
 * @param {Object}  opts
 * @param {number}  [opts.radius=5]
 * @param {'blend'|'telea'|'ns'} [opts.algo='blend']
 * @param {number}  [opts.dilation=3]
 * @param {boolean} [opts.feather=true]
 * @param {boolean} [opts.audio=true]
 * @param {'mp4'|'webm'} [opts.format='mp4']
 * @param {'high'|'medium'|'low'} [opts.quality='medium']
 * @param {Function} [opts.onProgress]  ({ pct, stage, fps, eta, frame, total }) => void
 * @param {{ cancelled: boolean }} [opts.cancelToken]
 * @returns {Promise<{ blob, name, url }>}
 */
export async function removeWatermarkVideo(file, maskRect, opts = {}) {
  await waitForCV();
  const ff = await getFFmpeg();

  const radius   = opts.radius   ?? 5;
  const algo     = opts.algo     ?? 'blend';
  const dilation = opts.dilation ?? 3;
  const feather  = opts.feather  ?? true;
  const keepAudio= opts.audio    ?? true;
  const format   = opts.format   ?? 'mp4';
  const quality  = opts.quality  ?? 'medium';
  const onProg   = opts.onProgress ?? (() => {});
  const ct       = opts.cancelToken ?? { cancelled: false };

  const check = () => { if (ct.cancelled) throw new Error('cancelled'); };

  // ── Stage 1: Write to FS ──────────────────────────────────
  onProg({ pct: 1, stage: 'Writing video…' });
  const srcBuf = new Uint8Array(await file.arrayBuffer());
  await ff.writeFile('input.mp4', srcBuf);
  check();

  // ── Stage 2: Get video info ───────────────────────────────
  onProg({ pct: 3, stage: 'Reading metadata…' });
  const { fps, duration, width, height } = await probeVideo(ff);
  const totalFrames = Math.ceil(fps * duration);
  check();

  // ── Stage 3: Extract audio ────────────────────────────────
  if (keepAudio) {
    onProg({ pct: 5, stage: 'Extracting audio…' });
    await ff.exec(['-i','input.mp4','-vn','-acodec','copy','-y','audio.aac'])
      .catch(() => ff.exec(['-i','input.mp4','-vn','-acodec','aac','-y','audio.aac']));
  }
  check();

  // ── Stage 4: Extract & process frames ────────────────────
  const BATCH = batchSize(width, height);
  let processed = 0;
  const startTime = Date.now();

  for (let batchStart = 0; batchStart < totalFrames; batchStart += BATCH) {
    check();
    const batchEnd = Math.min(batchStart + BATCH, totalFrames);

    // Extract batch of frames
    const ssec = batchStart / fps;
    const batchDur = (batchEnd - batchStart) / fps;

    await ff.exec([
      '-ss', String(ssec),
      '-i', 'input.mp4',
      '-t', String(batchDur + 0.1),
      '-vf', `fps=${fps}`,
      '-start_number', String(batchStart + 1),
      'frame_%06d.png',
      '-y',
    ]);
    check();

    // Process each frame in this batch
    for (let fi = batchStart + 1; fi <= batchEnd; fi++) {
      check();
      const fname = `frame_${String(fi).padStart(6, '0')}.png`;

      try {
        const pngData = await ff.readFile(fname);
        const imgBitmap = await blobToImageBitmap(new Blob([pngData], { type: 'image/png' }));

        // Save dimensions BEFORE closing the bitmap
        const bmpW = imgBitmap.width;
        const bmpH = imgBitmap.height;
        const inCanvas  = offscreenCanvas(bmpW, bmpH);
        inCanvas.getContext('2d').drawImage(imgBitmap, 0, 0);
        if (typeof imgBitmap.close === 'function') imgBitmap.close();

        // maskRect is already in full video-pixel coords (passed scaled from app.js)
        const outCanvas = inpaintFrame(inCanvas, maskRect, { radius, algo, dilation, feather });

        // Encode back to PNG
        const blob   = await canvasToBlob(outCanvas);
        const outBuf = new Uint8Array(await blob.arrayBuffer());
        await ff.writeFile(`proc_${String(fi).padStart(6, '0')}.png`, outBuf);

        // Delete source frame from FS to save RAM
        await ff.deleteFile(fname).catch(() => {});
      } catch (err) {
        if (err.message === 'cancelled') throw err;
        // On error copy source frame untouched
        console.warn(`Frame ${fi} processing failed, using original`, err);
      }

      processed++;
      const elapsed = (Date.now() - startTime) / 1000;
      const fps_proc = processed / elapsed;
      const remaining = (totalFrames - processed) / Math.max(fps_proc, 0.1);
      onProg({
        pct:   5 + Math.round((processed / totalFrames) * 80),
        stage: `Processing frame ${processed} / ${totalFrames}`,
        fps:   fps_proc.toFixed(1) + ' fps',
        eta:   fmtETA(remaining),
        frame: processed,
        total: totalFrames,
      });
    }
  }

  check();

  // ── Stage 5: Encode output ────────────────────────────────
  onProg({ pct: 86, stage: 'Encoding output video…' });

  const qMap = { high: '18', medium: '23', low: '28' };
  const crf  = qMap[quality] ?? '23';

  let encArgs;
  if (format === 'webm') {
    encArgs = keepAudio
      ? ['-framerate', String(fps), '-i', 'proc_%06d.png', '-i', 'audio.aac',
         '-c:v', 'libvpx', '-b:v', '0', '-crf', crf, '-c:a', 'libvorbis',
         '-pix_fmt', 'yuv420p', '-y', 'output.webm']
      : ['-framerate', String(fps), '-i', 'proc_%06d.png',
         '-c:v', 'libvpx', '-b:v', '0', '-crf', crf,
         '-pix_fmt', 'yuv420p', '-y', 'output.webm'];
  } else {
    encArgs = keepAudio
      ? ['-framerate', String(fps), '-i', 'proc_%06d.png', '-i', 'audio.aac',
         '-c:v', 'libx264', '-crf', crf, '-preset', 'fast',
         '-c:a', 'aac', '-movflags', '+faststart',
         '-pix_fmt', 'yuv420p', '-y', 'output.mp4']
      : ['-framerate', String(fps), '-i', 'proc_%06d.png',
         '-c:v', 'libx264', '-crf', crf, '-preset', 'fast',
         '-movflags', '+faststart',
         '-pix_fmt', 'yuv420p', '-y', 'output.mp4'];
  }

  await ff.exec(encArgs);
  check();

  // ── Stage 6: Read & clean up ──────────────────────────────
  onProg({ pct: 96, stage: 'Finalising…' });
  const outFile = format === 'webm' ? 'output.webm' : 'output.mp4';
  const outData = await ff.readFile(outFile);
  const mime    = format === 'webm' ? 'video/webm' : 'video/mp4';
  const blob    = new Blob([outData.buffer], { type: mime });
  const ext     = format === 'webm' ? 'webm' : 'mp4';
  const name    = file.name.replace(/\.[^.]+$/, '') + `_nowm.${ext}`;
  const url     = URL.createObjectURL(blob);

  // Clean up FS
  await cleanFFmpegFS(ff, totalFrames);

  onProg({ pct: 100, stage: 'Done!' });
  return { blob, name, url };
}

// ── Frame inpainting (sync, for use in videoProcessor) ────────

function inpaintFrame(canvas, maskRect, opts) {
  const { radius, algo, dilation, feather } = opts;
  const srcRgba = cv.imread(canvas);
  const srcRgb  = new cv.Mat();
  cv.cvtColor(srcRgba, srcRgb, cv.COLOR_RGBA2RGB);

  const mask = buildMask(srcRgb.rows, srcRgb.cols, maskRect, dilation);

  let resultRgb;
  if (algo === 'telea') {
    resultRgb = new cv.Mat();
    cv.inpaint(srcRgb, mask, resultRgb, radius, cv.INPAINT_TELEA);
  } else if (algo === 'ns') {
    resultRgb = new cv.Mat();
    cv.inpaint(srcRgb, mask, resultRgb, radius, cv.INPAINT_NS);
  } else {
    const t = new cv.Mat(), n = new cv.Mat();
    cv.inpaint(srcRgb, mask, t, radius, cv.INPAINT_TELEA);
    cv.inpaint(srcRgb, mask, n, radius, cv.INPAINT_NS);
    resultRgb = new cv.Mat();
    cv.addWeighted(t, 0.55, n, 0.45, 0, resultRgb);
    t.delete(); n.delete();
  }

  const resultRgba = new cv.Mat();
  cv.cvtColor(resultRgb, resultRgba, cv.COLOR_RGB2RGBA);

  if (feather && dilation >= 2) {
    applyEdgeFeather(srcRgba, resultRgba, mask, maskRect, dilation);
  }

  const out = offscreenCanvas(canvas.width, canvas.height);
  cv.imshow(out, resultRgba);

  srcRgba.delete(); srcRgb.delete(); mask.delete(); resultRgb.delete(); resultRgba.delete();
  return out;
}

function buildMask(rows, cols, rect, dilation) {
  const mask = cv.Mat.zeros(rows, cols, cv.CV_8UC1);
  const x = Math.round(Math.max(0, rect.x));
  const y = Math.round(Math.max(0, rect.y));
  const w = Math.round(Math.min(cols - x, rect.w));
  const h = Math.round(Math.min(rows - y, rect.h));
  for (let r = y; r < y + h; r++)
    for (let c = x; c < x + w; c++)
      mask.ucharPtr(r, c)[0] = 255;

  if (dilation > 0) {
    const k = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(dilation * 2 + 1, dilation * 2 + 1));
    cv.dilate(mask, mask, k);
    k.delete();
  }
  return mask;
}

function applyEdgeFeather(src, dst, mask, rect, dilation) {
  const rows = src.rows, cols = src.cols;
  const bw = dilation + 2;
  const x1 = Math.max(0, Math.round(rect.x) - bw);
  const y1 = Math.max(0, Math.round(rect.y) - bw);
  const x2 = Math.min(cols, Math.round(rect.x + rect.w) + bw);
  const y2 = Math.min(rows, Math.round(rect.y + rect.h) + bw);
  const sd  = src.data, dd = dst.data, mk = mask.data;
  const ch  = src.channels();

  for (let r = y1; r < y2; r++) {
    for (let c = x1; c < x2; c++) {
      const idx = r * cols + c;
      if (!mk[idx]) continue;
      const dX = Math.min(Math.abs(c - rect.x), Math.abs(c - (rect.x + rect.w)));
      const dY = Math.min(Math.abs(r - rect.y), Math.abs(r - (rect.y + rect.h)));
      const dist = Math.min(dX, dY);
      if (dist > bw) continue;
      const alpha = dist / bw;
      const pi = idx * ch;
      for (let k = 0; k < Math.min(ch, 3); k++)
        dd[pi + k] = Math.round(sd[pi + k] * (1 - alpha) + dd[pi + k] * alpha);
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────

/** Probe video for fps, duration, resolution */
async function probeVideo(ff) {
  let fps = 30, duration = 10, width = 1280, height = 720;

  ff.on('log', ({ message }) => {
    // fps
    let m = message.match(/(\d+(?:\.\d+)?)\s*fps/);
    if (m) fps = parseFloat(m[1]);

    // duration
    m = message.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (m) duration = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);

    // resolution
    m = message.match(/(\d{2,5})x(\d{2,5})/);
    if (m) { width = parseInt(m[1]); height = parseInt(m[2]); }
  });

  await ff.exec(['-i', 'input.mp4']).catch(() => {});
  return { fps, duration, width, height };
}

function batchSize(w, h) {
  // Limit RAM: rough estimate 3MB per frame
  const mpx = w * h / 1e6;
  if (mpx > 8) return 10;
  if (mpx > 4) return 20;
  return 40;
}

function offscreenCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function blobToImageBitmap(blob) {
  if (typeof createImageBitmap !== 'undefined') return createImageBitmap(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

function canvasToBlob(canvas, mime = 'image/png') {
  return new Promise(r => canvas.toBlob(r, mime));
}

async function cleanFFmpegFS(ff, total) {
  const toDelete = ['input.mp4', 'audio.aac', 'output.mp4', 'output.webm'];
  for (let i = 1; i <= total; i++) {
    toDelete.push(`proc_${String(i).padStart(6, '0')}.png`);
  }
  for (const f of toDelete) { await ff.deleteFile(f).catch(() => {}); }
}

function fmtETA(sec) {
  if (!isFinite(sec) || sec < 0) return '…';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/** Export a single-frame preview (for live canvas display) */
export { inpaintFrame };

/** Initialise FFmpeg in advance (call during page load) */
export async function initFFmpeg(onLog) {
  try {
    const ff = await getFFmpeg();
    if (onLog) ff.on('log', ({ message }) => onLog(message));
    return true;
  } catch (e) {
    console.warn('FFmpeg.wasm failed to init:', e);
    return false;
  }
}
