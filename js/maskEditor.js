// js/maskEditor.js
// Provides a draggable + resizable selection box overlaid on a canvas.
// Also manages painting the selection region onto a mask canvas.
// ─────────────────────────────────────────────────────────────

export class MaskEditor {
  /**
   * @param {HTMLCanvasElement} displayCanvas  — shows the image/frame
   * @param {HTMLCanvasElement} maskCanvas     — alpha mask for inpainting
   * @param {HTMLElement}       selBox         — the draggable <div>
   */
  constructor(displayCanvas, maskCanvas, selBox) {
    this.dc   = displayCanvas;
    this.mc   = maskCanvas;
    this.box  = selBox;
    this.rect = { x: 0, y: 0, w: 0, h: 0 }; // in canvas-pixel coords
    this._drag = null;   // { type, ox, oy, rx, ry, rw, rh }
    this._enabled = true;

    this._bindEvents();
  }

  // ── Public API ─────────────────────────────────────────────

  /** Set box to given canvas-pixel rect and show it */
  setRect(x, y, w, h) {
    this.rect = { x, y, w, h };
    this._syncBoxUI();
    this._paintMask();
    this.box.classList.remove('hidden');
  }

  /** Return current rect in canvas-pixel coords */
  getRect() { return { ...this.rect }; }

  /** Clear mask and hide selection box */
  clear() {
    this.rect = { x: 0, y: 0, w: 0, h: 0 };
    this.box.classList.add('hidden');
    this._clearMaskCanvas();
  }

  /** Enable/disable interaction */
  setEnabled(v) { this._enabled = v; }

  /** Returns true if a non-trivial region is selected */
  hasSelection() { return this.rect.w > 4 && this.rect.h > 4; }

  // ── Internal ───────────────────────────────────────────────

  _bindEvents() {
    const box  = this.box;
    const wrap = this.dc.parentElement; // canvas-wrap div

    // Pointer events on the selection box itself (move)
    box.addEventListener('mousedown',  e => this._onBoxDown(e, 'move'));
    box.addEventListener('touchstart', e => this._onBoxDown(e, 'move'), { passive: false });

    // Pointer events on handles (resize)
    box.querySelectorAll('.sel-handle').forEach(h => {
      h.addEventListener('mousedown',  e => { e.stopPropagation(); this._onBoxDown(e, h.className.split(' ')[1]); });
      h.addEventListener('touchstart', e => { e.stopPropagation(); this._onBoxDown(e, h.className.split(' ')[1]); }, { passive: false });
    });

    // Click on canvas-wrap to start drawing a new rect
    wrap.addEventListener('mousedown',  e => this._onWrapDown(e));
    wrap.addEventListener('touchstart', e => this._onWrapDown(e), { passive: false });

    document.addEventListener('mousemove',  e => this._onMove(e));
    document.addEventListener('touchmove',  e => this._onMove(e), { passive: false });
    document.addEventListener('mouseup',    () => this._onUp());
    document.addEventListener('touchend',   () => this._onUp());
  }

  _onWrapDown(e) {
    if (!this._enabled) return;
    // Only start drawing when clicking directly on the wrap (not on box/handles)
    if (e.target === this.box || this.box.contains(e.target)) return;
    if (e.target !== this.mc && e.target !== this.dc) return;
    e.preventDefault();

    const { x, y } = this._wrapXY(e);
    this._drag = { type: 'draw', sx: x, sy: y };
    this.rect  = { x, y, w: 0, h: 0 };
    this.box.classList.remove('hidden');
  }

  _onBoxDown(e, type) {
    if (!this._enabled) return;
    e.preventDefault();
    const { x, y } = this._wrapXY(e);
    this._drag = {
      type,
      ox: x, oy: y,
      rx: this.rect.x, ry: this.rect.y,
      rw: this.rect.w, rh: this.rect.h,
    };
  }

  _onMove(e) {
    if (!this._drag) return;
    e.preventDefault();
    const { x, y } = this._wrapXY(e);
    const d = this._drag;
    const cw = this.dc.width, ch = this.dc.height;

    if (d.type === 'draw') {
      const nx = Math.min(x, d.sx), ny = Math.min(y, d.sy);
      const nw = Math.abs(x - d.sx), nh = Math.abs(y - d.sy);
      this.rect = { x: nx, y: ny, w: nw, h: nh };

    } else if (d.type === 'move') {
      const dx = x - d.ox, dy = y - d.oy;
      this.rect.x = Math.max(0, Math.min(cw - d.rw, d.rx + dx));
      this.rect.y = Math.max(0, Math.min(ch - d.rh, d.ry + dy));

    } else {
      // resize handles
      const dx = x - d.ox, dy = y - d.oy;
      let { rx, ry, rw, rh } = d;
      const MIN = 10;

      if (d.type === 'se') { rw = Math.max(MIN, rw + dx); rh = Math.max(MIN, rh + dy); }
      else if (d.type === 'nw') { const nrw = Math.max(MIN, rw - dx); const nrh = Math.max(MIN, rh - dy); rx += rw - nrw; ry += rh - nrh; rw = nrw; rh = nrh; }
      else if (d.type === 'ne') { rw = Math.max(MIN, rw + dx); const nrh = Math.max(MIN, rh - dy); ry += rh - nrh; rh = nrh; }
      else if (d.type === 'sw') { const nrw = Math.max(MIN, rw - dx); rx += rw - nrw; rw = nrw; rh = Math.max(MIN, rh + dy); }
      else if (d.type === 'n')  { const nrh = Math.max(MIN, rh - dy); ry += rh - nrh; rh = nrh; }
      else if (d.type === 's')  { rh = Math.max(MIN, rh + dy); }
      else if (d.type === 'e')  { rw = Math.max(MIN, rw + dx); }
      else if (d.type === 'w')  { const nrw = Math.max(MIN, rw - dx); rx += rw - nrw; rw = nrw; }

      // clamp to canvas
      rx = Math.max(0, Math.min(cw - rw, rx));
      ry = Math.max(0, Math.min(ch - rh, ry));
      this.rect = { x: rx, y: ry, w: rw, h: rh };
    }

    this._syncBoxUI();
    this._paintMask();
  }

  _onUp() {
    if (!this._drag) return;
    this._drag = null;
    if (this.rect.w < 4 || this.rect.h < 4) {
      this.box.classList.add('hidden');
    }
    this._paintMask();
  }

  /** Convert pointer event → canvas-pixel coordinates via the canvas-wrap */
  _wrapXY(e) {
    const rect   = this.dc.getBoundingClientRect();
    const scaleX = this.dc.width  / rect.width;
    const scaleY = this.dc.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  }

  /** Sync the CSS-positioned box div to match current canvas-pixel rect */
  _syncBoxUI() {
    const cr    = this.dc.getBoundingClientRect();
    const wrapR = this.dc.parentElement.getBoundingClientRect();
    const scaleX = cr.width  / this.dc.width;
    const scaleY = cr.height / this.dc.height;

    const left  = (cr.left - wrapR.left) + this.rect.x * scaleX;
    const top   = (cr.top  - wrapR.top)  + this.rect.y * scaleY;
    const width = this.rect.w * scaleX;
    const height= this.rect.h * scaleY;

    this.box.style.left   = `${left}px`;
    this.box.style.top    = `${top}px`;
    this.box.style.width  = `${width}px`;
    this.box.style.height = `${height}px`;
  }

  /** Paint white rectangle onto the mask canvas at the selection rect */
  _paintMask() {
    const mc  = this.mc;
    mc.width  = this.dc.width;
    mc.height = this.dc.height;
    mc.style.width  = this.dc.style.width  || this.dc.width  + 'px';
    mc.style.height = this.dc.style.height || this.dc.height + 'px';

    const ctx = mc.getContext('2d');
    ctx.clearRect(0, 0, mc.width, mc.height);
    if (this.rect.w < 2 || this.rect.h < 2) return;
    ctx.fillStyle = 'rgba(255,80,80,0.55)';
    ctx.fillRect(
      Math.round(this.rect.x), Math.round(this.rect.y),
      Math.round(this.rect.w), Math.round(this.rect.h)
    );
  }

  _clearMaskCanvas() {
    const ctx = this.mc.getContext('2d');
    ctx.clearRect(0, 0, this.mc.width, this.mc.height);
  }
}
