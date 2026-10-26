import { describe, it, expect } from 'vitest';
import { MotionGraphicsEngine, RenderContext } from '../src/engine/motionGraphics';
import { SUKH_GRAPHIX_BENCHMARK_TEMPLATE } from '../src/services/ai/offlineTemplates';
import { RESOLUTIONS } from '../src/types/creatorStudio';

describe('Motion Graphics Engine & Benchmark Quality Verification', () => {
  it('correctly wraps long text to prevent canvas boundary clipping', () => {
    const engine = new MotionGraphicsEngine();
    
    // Create a mock canvas context
    const mockCtx = {
      measureText: (text: string) => ({ width: text.length * 10 })
    } as unknown as CanvasRenderingContext2D;

    const longText = 'DESIGN THAT COMMANDS ATTENTION IN A NOISY WORLD';
    const lines = engine.wrapText(mockCtx, longText, 150);

    expect(lines.length).toBeGreaterThan(1);
    // Every wrapped line must be within maxWidth
    lines.forEach(line => {
      expect(mockCtx.measureText(line).width).toBeLessThanOrEqual(150);
    });
  });

  it('generates the 15-second Sukh Graphix benchmark reel with distinct scene compositions', () => {
    const brand = SUKH_GRAPHIX_BENCHMARK_TEMPLATE.defaultBrand;
    const scenes = SUKH_GRAPHIX_BENCHMARK_TEMPLATE.scenes(15, brand);

    expect(scenes).toHaveLength(3);

    // Sum of durations must equal exactly 15 seconds
    const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
    expect(totalDuration).toBe(15);

    // Directive #2: Every scene must have a distinct visual concept & composition layout
    const layouts = scenes.map(s => s.compositionLayout);
    expect(new Set(layouts).size).toBe(3);
    expect(layouts).toContain('split_editorial');
    expect(layouts).toContain('metric_grid');
    expect(layouts).toContain('brand_outro');

    // Distinct background colors (no repetitive wallpaper)
    const bgColors = scenes.map(s => s.backgroundColor);
    expect(new Set(bgColors).size).toBe(3);

    // Distinct camera motions
    const cameraMotions = scenes.map(s => s.cameraMotion);
    expect(new Set(cameraMotions).size).toBe(3);
    expect(cameraMotions).toContain('zoom_in');
    expect(cameraMotions).toContain('pan_drift_up');
    expect(cameraMotions).toContain('zoom_out');

    // Scene 1 must have vector illustration and kinetic headline
    const s1Types = scenes[0].elements.map(e => e.type);
    expect(s1Types).toContain('kinetic_headline');
    expect(s1Types).toContain('vector_illustration');

    // Scene 2 must have metric grid capabilities
    const s2Types = scenes[1].elements.map(e => e.type);
    expect(s2Types).toContain('metric_grid');

    // Scene 3 must have brand outro
    const s3Types = scenes[2].elements.map(e => e.type);
    expect(s3Types).toContain('brand_outro');
  });

  it('renders all 3 benchmark scenes across progress 0.0 to 1.0 without throwing canvas errors', () => {
    const engine = new MotionGraphicsEngine();
    const brand = SUKH_GRAPHIX_BENCHMARK_TEMPLATE.defaultBrand;
    const scenes = SUKH_GRAPHIX_BENCHMARK_TEMPLATE.scenes(15, brand);
    const res = RESOLUTIONS['9:16'];

    // Mock CanvasRenderingContext2D
    const mockCtx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      bezierCurveTo: () => {},
      rect: () => {},
      roundRect: () => {},
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      clip: () => {},
      setLineDash: () => {},
      measureText: (text: string) => ({ width: text.length * 12 }),
      fillText: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      drawImage: () => {}
    } as unknown as CanvasRenderingContext2D;

    scenes.forEach((scene) => {
      [0.0, 0.25, 0.5, 0.75, 1.0].forEach((progress) => {
        const rc: RenderContext = {
          ctx: mockCtx,
          width: res.width,
          height: res.height,
          time: progress * scene.duration,
          progress,
          scene,
          aspectRatio: '9:16'
        };

        expect(() => engine.drawScene(rc)).not.toThrow();
      });
    });
  });
});
