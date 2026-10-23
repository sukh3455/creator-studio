# WatermarkOut 🎨

**AI-powered watermark remover that runs 100% locally in your browser.**  
No uploads. No servers. No data leaves your device.

## Features
- 🖼 **Image watermark removal** — PNG, JPG, WebP, BMP
- 🎬 **Video watermark removal** — MP4, MOV, WebM, AVI (output MP4/WebM with audio)
- 🔍 **Auto-detection** — heuristic edge-density + alpha-channel analysis
- ✏️ **Manual box** — drag & resize 8-handle selection overlay
- 🧠 **Dual inpainting** — OpenCV.js Telea + Navier-Stokes blended
- ⚡ **Frame-by-frame video** — FFmpeg.wasm extraction + OpenCV inpainting per frame
- 🎵 **Audio preserved** — original audio muxed into output
- 📱 **Responsive** — works on mobile & desktop
- 🌙 **Dark / Light theme**

## Tech Stack
| Library | Purpose |
|---|---|
| [OpenCV.js 4.9](https://docs.opencv.org/4.9.0/opencv.js) | Telea & Navier-Stokes inpainting |
| [FFmpeg.wasm 0.12](https://github.com/ffmpegwasm/ffmpeg.wasm) | Video frame extraction & encoding |
| Vanilla JS (ES Modules) | No framework required |

## Deploy to Vercel

```bash
npx vercel --prod
```

The `vercel.json` sets required `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers so FFmpeg.wasm SharedArrayBuffer works.

## Deploy to Netlify

```bash
npx netlify deploy --prod --dir .
```

The `netlify.toml` and `_headers` files handle the COOP/COEP headers.

## Local Development

```bash
npx serve . --cors -p 3000
```

Then open `http://localhost:3000`.

> **Note:** The COOP/COEP headers are required for FFmpeg.wasm SharedArrayBuffer.  
> `npx serve` does not add them by default; use Vercel/Netlify for full functionality, or a local proxy that sets those headers.

## Watermark Removal Quality

1. **Stage 1 – Mask building**: Selection box → dilated binary mask (configurable radius)
2. **Stage 2 – Telea inpainting**: Fast marching method, great for thin logos/text
3. **Stage 3 – NS inpainting**: Navier-Stokes, great for solid coloured regions
4. **Stage 4 – Blend**: 55% Telea + 45% NS weighted average for best of both
5. **Stage 5 – Edge feathering**: Gaussian gradient blend at selection boundary

## File Structure

```
watermarkremove2/
├── index.html          Main page
├── style.css           Responsive styles (dark/light)
├── js/
│   ├── app.js          Application controller
│   ├── maskEditor.js   Drag-resize selection overlay
│   ├── imageProcessor.js  OpenCV inpainting for images
│   ├── videoProcessor.js  FFmpeg + OpenCV for video
│   ├── autoDetect.js      Heuristic watermark detection
│   └── utils.js           Shared helpers
├── vercel.json         COOP/COEP headers for Vercel
├── netlify.toml        COOP/COEP headers for Netlify
├── _headers            Netlify flat headers file
└── package.json        npm scripts
```
