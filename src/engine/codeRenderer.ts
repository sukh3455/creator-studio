export class CodeRenderer {
  private fnCache: Map<string, Function> = new Map();

  public compile(code: string): Function | null {
    if (!code || !code.trim()) return null;
    if (this.fnCache.has(code)) {
      return this.fnCache.get(code)!;
    }

    try {
      // Compile executable canvas drawing code
      const fn = new Function('ctx', 'w', 'h', 't', 'isVertical', 'accentColor', code);
      this.fnCache.set(code, fn);
      return fn;
    } catch (err) {
      console.warn('Failed to compile AI canvas visual code:', err);
      return null;
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    code: string | undefined,
    w: number,
    h: number,
    t: number,
    isVertical: boolean,
    accentColor: string
  ): boolean {
    if (!code) return false;
    const fn = this.compile(code);
    if (!fn) return false;

    ctx.save();
    try {
      fn(ctx, w, h, t, isVertical, accentColor);
      ctx.restore();
      return true;
    } catch (err) {
      console.warn('Runtime error during AI visual execution:', err);
      ctx.restore();
      return false;
    }
  }
}
