import { describe, it, expect } from 'vitest';
import { planCreativeProject, regenerateSceneWithAI } from '../src/services/ai/creativePlanner';
import { DEFAULT_SETTINGS } from '../src/services/settings/settingsStore';
import { Scene } from '../src/types/creatorStudio';

describe('Creative Planner & Offline Deterministic Fallback', () => {
  it('generates a full 15-second Diwali Reel storyboard offline without API keys', async () => {
    const prompt = 'Create a premium 15-second Diwali Reel for Sukh Graphix with elegant typography, custom animated diyas, glowing particles, festive music and a polished brand reveal.';

    const result = await planCreativeProject(
      prompt,
      {
        duration: 15,
        aspectRatio: '9:16',
        stylePreset: 'festive',
        brandKit: {
          name: 'Sukh Graphix',
          primaryColor: '#F59E0B',
          secondaryColor: '#B45309',
          accentColor: '#FEF08A',
          tagline: 'Illuminating Creative Excellence',
          fontFamily: 'serif'
        }
      },
      DEFAULT_SETTINGS
    );

    expect(result.usedAi).toBe(false);
    expect(result.project).toBeDefined();
    expect(result.project.duration).toBe(15);
    expect(result.project.aspectRatio).toBe('9:16');
    expect(result.project.scenes.length).toBeGreaterThanOrEqual(3);

    // Sum of durations must equal project target duration
    const totalSceneDuration = result.project.scenes.reduce((sum, s) => sum + s.duration, 0);
    expect(totalSceneDuration).toBe(15);

    // Verify Scene 1 elements include custom diya and particles
    const scene1 = result.project.scenes[0];
    expect(scene1.narration.length).toBeGreaterThan(10);
    expect(scene1.captionText).toContain('Shubh Deepavali');
    const hasDiya = scene1.elements.some(e => e.type === 'diya');
    const hasParticles = scene1.elements.some(e => e.type === 'particles');
    expect(hasDiya).toBe(true);
    expect(hasParticles).toBe(true);

    // Verify Scene 3 includes Brand Reveal for Sukh Graphix
    const scene3 = result.project.scenes[2];
    const hasBrandReveal = scene3.elements.some(e => e.type === 'brand_reveal');
    expect(hasBrandReveal).toBe(true);
  });

  it('generates a SaaS product launch storyboard offline', async () => {
    const prompt = 'Create a 15-second mobile SaaS product teaser with device mockup';
    const result = await planCreativeProject(
      prompt,
      { duration: 15, aspectRatio: '9:16', stylePreset: 'cyberpunk' },
      DEFAULT_SETTINGS
    );

    expect(result.project.scenes.length).toBe(3);
    const scene2 = result.project.scenes[1];
    expect(scene2.elements.some(e => e.type === 'device_mockup')).toBe(true);
  });

  it('regenerates a scene and sets approved flag back to false', async () => {
    const originalScene: Scene = {
      id: 'sc_test_1',
      order: 1,
      title: 'Original Title',
      label: 'SCENE 1',
      narration: 'Original voiceover script',
      captionText: 'Original Caption',
      duration: 5,
      visualType: 'motion_graphic',
      theme: 'luxury_gold',
      backgroundColor: '#000000',
      elements: [],
      assetRequirements: [],
      assignedAssetIds: {},
      transition: 'fade',
      approved: true // was approved previously
    };

    const mockProject = {
      id: 'proj_test',
      title: 'Test',
      prompt: 'Test prompt',
      description: 'Test',
      duration: 5,
      aspectRatio: '9:16' as const,
      stylePreset: 'festive' as const,
      brandKit: { name: 'Brand', primaryColor: '#FFF', secondaryColor: '#000', accentColor: '#AAA', fontFamily: 'sans' },
      scenes: [originalScene],
      status: 'planned' as const,
      createdAt: '',
      updatedAt: ''
    };

    const regenerated = await regenerateSceneWithAI(
      originalScene,
      'Make captions bolder with gold sparkle',
      mockProject,
      DEFAULT_SETTINGS
    );

    // After modification, approval must be reset so user must review before render
    expect(regenerated.approved).toBe(false);
    expect(regenerated.captionText).toContain('Make captions bolder');
  });
});
