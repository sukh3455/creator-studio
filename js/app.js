// js/app.js — Unified Controller for Lossless Image & Video Watermark Removal
// ─────────────────────────────────────────────────────────────

import { toast, downloadBlob, canvasToBlob } from './utils.js';
import { MaskEditor } from './maskEditor.js';
import { autoDetectWatermark } from './autoDetect.js';
import { removeWatermarkImage } from './imageProcessor.js';

// ── State ────────────────────────────────────────────────────
let activeFileType = null; // 'image' | 'video' | null
let currentImageFile = null;
let currentVideoFile = null;
let imgEditor = null;
let cleanedCanvas = null;

// ── DOM Helpers ──────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// ── Initialization ───────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initUnifiedUpload();
  initImageControls();
});

// ── Theme Management ─────────────────────────────────────────
function initTheme() {
  const btn = $('themeToggle');
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = $('themeToggle');
  if (btn) btn.textContent = theme === 'light' ? '☀️' : '🌙';
}

// ── Unified Upload & Dropzone ─────────────────────────────────
function initUnifiedUpload() {
  const dropZone = $('unifiedDropZone');
  const mediaInput = $('mediaInput');
  const changeBtn = $('mediaChangeBtn');

  // Click dropzone to open file picker
  dropZone.addEventListener('click', (e) => {
    if (e.target !== mediaInput && !e.target.classList.contains('link-label')) {
      mediaInput.click();
    }
  });

  mediaInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleIncomingFile(e.target.files[0]);
    }
  });

  // Drag & drop handlers
  ['dragenter', 'dragover'].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'dragend', 'drop'].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleIncomingFile(e.dataTransfer.files[0]);
    }
  });

  // Global paste support (Ctrl+V / Cmd+V)
  window.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          handleIncomingFile(file);
          toast('Pasted media loaded', 'info', 2000);
          break;
        }
      }
    }
  });

  // Upload Another File button
  changeBtn.addEventListener('click', () => {
    resetToUploadState();
  });
}

// ── File Routing (Image vs Video) ─────────────────────────────
export function handleIncomingFile(file) {
  if (!file) return;

  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|m4v)$/i.test(file.name);
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif)$/i.test(file.name);

  if (isVideo) {
    loadActiveVideo(file);
  } else if (isImage) {
    loadActiveImage(file);
  } else {
    toast('Unsupported format. Please select an image or video file.', 'error', 3500);
  }
}

function resetToUploadState() {
  activeFileType = null;
  currentImageFile = null;
  currentVideoFile = null;
  cleanedCanvas = null;

  $('mediaTopBar').classList.add('hidden');
  $('imageWorkspace').classList.add('hidden');
  $('videoWorkspace').classList.add('hidden');
  $('unifiedDropZone').classList.remove('hidden');

  const mediaInput = $('mediaInput');
  if (mediaInput) mediaInput.value = '';

  if (imgEditor) {
    imgEditor.clear();
  }
}

// ── Image Handling ───────────────────────────────────────────
async function loadActiveImage(file) {
  activeFileType = 'image';
  currentImageFile = file;

  $('mediaTypeBadge').textContent = 'IMAGE';
  $('mediaTypeBadge').style.background = '#4f6ef7';
  $('mediaFileName').textContent = file.name;
  $('mediaSpecs').textContent = 'Loading…';

  $('unifiedDropZone').classList.add('hidden');
  $('videoWorkspace').classList.add('hidden');
  $('mediaTopBar').classList.remove('hidden');
  $('imageWorkspace').classList.remove('hidden');
  $('imgResult').classList.add('hidden');

  try {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to decode image file'));
      img.src = objectUrl;
    });

    URL.revokeObjectURL(objectUrl);

    // Update specs badge
    $('mediaSpecs').textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;

    // Setup source canvas
    const canvas = $('imgCanvas');
    const maskCanvas = $('imgMaskCanvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    maskCanvas.width = img.naturalWidth;
    maskCanvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Initialize draggable selection box overlay
    const selBox = $('imgSelBox');
    imgEditor = new MaskEditor(canvas, maskCanvas, selBox);

    // Auto-detect watermark position
    runImageAutoDetect();

    toast('Image ready. Watermark box positioned.', 'info', 2000);
  } catch (err) {
    console.error('Image load error:', err);
    toast('Could not open image: ' + err.message, 'error', 4000);
    resetToUploadState();
  }
}

async function runImageAutoDetect() {
  const canvas = $('imgCanvas');
  if (!canvas || !imgEditor) return;

  try {
    const region = await autoDetectWatermark(canvas);
    if (region && region.w > 0 && region.h > 0) {
      imgEditor.setRect(region.x, region.y, region.w, region.h);
    }
  } catch (e) {
    console.warn('Auto detect failed:', e);
  }
}

// ── Video Handling ───────────────────────────────────────────
function loadActiveVideo(file) {
  activeFileType = 'video';
  currentVideoFile = file;

  $('mediaTypeBadge').textContent = 'VIDEO';
  $('mediaTypeBadge').style.background = '#10b981';
  $('mediaFileName').textContent = file.name;
  $('mediaSpecs').textContent = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

  $('unifiedDropZone').classList.add('hidden');
  $('imageWorkspace').classList.add('hidden');
  $('mediaTopBar').classList.remove('hidden');
  $('videoWorkspace').classList.remove('hidden');

  const iframe = $('videoRuntimeIframe');
  if (iframe) {
    const sendToIframe = () => {
      try {
        iframe.contentWindow.postMessage({ type: 'LOAD_VIDEO_FILE', file: file }, '*');
      } catch (err) {
        console.warn('Error posting file to video iframe:', err);
      }
    };

    // If iframe already loaded, send immediately; otherwise listen for load
    sendToIframe();
    iframe.addEventListener('load', sendToIframe, { once: true });
  }

  toast('Video loaded into player', 'info', 2500);
}

// ── Image Controls & Processing ──────────────────────────────
function initImageControls() {
  const autoDetectBtn = $('imgAutoDetect');
  const clearMaskBtn = $('imgClearMask');
  const processBtn = $('imgProcess');
  const downloadBtn = $('imgDownload');
  const copyBtn = $('imgCopy');
  const alphaSlider = $('imgAlphaGain');
  const alphaValBadge = $('imgAlphaGainVal');

  if (alphaSlider && alphaValBadge) {
    alphaSlider.addEventListener('input', () => {
      alphaValBadge.textContent = parseFloat(alphaSlider.value).toFixed(2);
    });
  }

  if (autoDetectBtn) {
    autoDetectBtn.addEventListener('click', () => {
      runImageAutoDetect();
      toast('Auto-detected watermark position', 'info', 1500);
    });
  }

  if (clearMaskBtn) {
    clearMaskBtn.addEventListener('click', () => {
      if (imgEditor) {
        imgEditor.clear();
        toast('Selection box reset', 'info', 1500);
      }
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', async () => {
      await executeImageRemoval();
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      downloadCleanedImage();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      await copyCleanedImageToClipboard();
    });
  }
}

async function executeImageRemoval() {
  const srcCanvas = $('imgCanvas');
  const processBtn = $('imgProcess');
  const progressWrap = $('imgProgress');
  const progressBar = $('imgProgressBar');
  const progressText = $('imgProgressText');

  if (!srcCanvas) return;

  const rect = imgEditor ? imgEditor.getRect() : null;
  const alphaGain = parseFloat($('imgAlphaGain')?.value || '1.0');

  processBtn.disabled = true;
  processBtn.textContent = 'Processing…';
  progressWrap.classList.remove('hidden');
  progressBar.style.width = '25%';
  progressText.textContent = 'Calculating inverse alpha blend…';

  try {
    const resultCanvas = await removeWatermarkImage(srcCanvas, rect, {
      alphaGain,
      onProgress: (p) => {
        progressBar.style.width = Math.round(p * 100) + '%';
        if (p >= 0.9) progressText.textContent = 'Finalizing restoration…';
      }
    });

    cleanedCanvas = resultCanvas;

    // Display Before and After comparison canvases
    const beforeCanvas = $('imgBeforeCanvas');
    const afterCanvas = $('imgAfterCanvas');

    beforeCanvas.width = srcCanvas.width;
    beforeCanvas.height = srcCanvas.height;
    beforeCanvas.getContext('2d').drawImage(srcCanvas, 0, 0);

    afterCanvas.width = resultCanvas.width;
    afterCanvas.height = resultCanvas.height;
    afterCanvas.getContext('2d').drawImage(resultCanvas, 0, 0);

    $('imgResult').classList.remove('hidden');
    $('imgResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    toast('Watermark removed losslessly with zero blur! ✨', 'success', 3500);
  } catch (err) {
    console.error('Removal error:', err);
    toast('Error removing watermark: ' + err.message, 'error', 4000);
  } finally {
    processBtn.disabled = false;
    processBtn.textContent = '✦ Remove Watermark';
    setTimeout(() => {
      progressWrap.classList.add('hidden');
      progressBar.style.width = '0%';
    }, 600);
  }
}

async function downloadCleanedImage() {
  const canvasToUse = $('imgAfterCanvas') || cleanedCanvas;
  if (!canvasToUse) {
    toast('No processed image to download', 'error', 2000);
    return;
  }

  const formatSelect = $('imgFormat');
  const chosenFormat = formatSelect ? formatSelect.value : 'png';

  let mimeType = 'image/png';
  let ext = 'png';
  let quality = 0.95;

  if (chosenFormat === 'jpeg') {
    mimeType = 'image/jpeg';
    ext = 'jpg';
  } else if (chosenFormat === 'webp') {
    mimeType = 'image/webp';
    ext = 'webp';
  } else if (chosenFormat === 'source' && currentImageFile) {
    if (/\.jpe?g$/i.test(currentImageFile.name)) {
      mimeType = 'image/jpeg';
      ext = 'jpg';
    } else if (/\.webp$/i.test(currentImageFile.name)) {
      mimeType = 'image/webp';
      ext = 'webp';
    }
  }

  try {
    const blob = await canvasToBlob(canvasToUse, mimeType, quality);
    const originalName = currentImageFile ? currentImageFile.name.replace(/\.[^/.]+$/, '') : 'gemini-cleaned';
    const outputName = `${originalName}-clean.${ext}`;
    downloadBlob(blob, outputName);
    toast(`Downloaded ${outputName}`, 'success', 2500);
  } catch (e) {
    console.error('Download error:', e);
    toast('Download failed: ' + e.message, 'error', 3000);
  }
}

async function copyCleanedImageToClipboard() {
  const canvasToUse = $('imgAfterCanvas') || cleanedCanvas;
  if (!canvasToUse) return;

  try {
    const blob = await canvasToBlob(canvasToUse, 'image/png');
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API not supported in this browser');
    }
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    toast('Image copied to clipboard! 📋', 'success', 2500);
  } catch (err) {
    console.warn('Clipboard write error:', err);
    toast('Could not copy to clipboard (try downloading instead)', 'warn', 3000);
  }
}
