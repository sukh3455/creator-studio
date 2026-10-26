import { Project, Scene, AspectRatio, StylePreset, BrandKit, ProviderSettings } from '../../types/creatorStudio';
import { callOpenRouter } from './openrouterClient';
import { matchOfflineTemplate } from './offlineTemplates';

export interface PlanProjectOptions {
  duration?: number;
  aspectRatio?: AspectRatio;
  stylePreset?: StylePreset;
  brandKit?: BrandKit;
}

const SYSTEM_PLANNER_PROMPT = `You are the Lead Creative Director and Motion Graphics Architect for Creator Studio.
Your role is to transform natural language creative ideas into an exact, production-ready scene-by-scene storyboard and motion-graphics specification.

CRITICAL JSON OUTPUT RULES:
You must return ONLY a single valid JSON object matching this schema. Do NOT include markdown code blocks or explanatory commentary outside the JSON:
{
  "title": "Short punchy project title",
  "description": "Brief 1-2 sentence description",
  "stylePreset": "festive | corporate | cyberpunk | minimal | luxury_gold | neon_glow",
  "brandKit": {
    "name": "Brand Name",
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "tagline": "Short brand motto",
    "fontFamily": "serif | sans | mono"
  },
  "scenes": [
    {
      "order": 1,
      "title": "Scene title",
      "label": "SCENE 1: HOOK",
      "narration": "Full spoken voiceover script for this scene",
      "captionText": "Punchy 1-3 line kinetic caption overlay",
      "duration": 5,
      "visualType": "motion_graphic",
      "theme": "diwali_festive | luxury_gold | high_tech | cyberpunk | minimalist",
      "backgroundColor": "#170E05",
      "elements": [
        {
          "id": "elem_1",
          "type": "diya | typography | particles | device_mockup | brand_reveal | geometric",
          "props": { ... }
        }
      ],
      "assetRequirements": ["List of suggested media assets"],
      "transition": "fade | slide_left | slide_right | zoom_in | particle_dissolve | wipe"
    }
  ]
}

Total duration of all scenes combined must equal exactly the requested target duration.
Every scene must have engaging narration and visually rich elements (particles, typography, custom icons, brand reveal).`;

export async function planCreativeProject(
  prompt: string,
  options: PlanProjectOptions = {},
  settings: ProviderSettings
): Promise<{ project: Project; usedAi: boolean; note?: string }> {
  const duration = options.duration || 15;
  const aspectRatio = options.aspectRatio || '9:16';
  const stylePreset = options.stylePreset || 'festive';
  const defaultBrand: BrandKit = options.brandKit || {
    name: 'Sukh Graphix',
    primaryColor: '#F59E0B',
    secondaryColor: '#B45309',
    accentColor: '#FEF08A',
    tagline: 'Illuminating Creative Excellence',
    fontFamily: 'serif'
  };

  // Check if OpenRouter is configured
  if (settings.openRouterApiKey && settings.openRouterApiKey.trim().length > 0) {
    try {
      const userMessage = `Creative Idea Prompt: "${prompt}"
Target Duration: ${duration} seconds.
Aspect Ratio: ${aspectRatio}.
Preferred Style Preset: ${stylePreset}.
Brand Info: ${JSON.stringify(defaultBrand)}.

Break this into 3 high-impact scenes that perfectly fit the ${duration}-second duration.`;

      const responseText = await callOpenRouter(
        [
          { role: 'system', content: SYSTEM_PLANNER_PROMPT },
          { role: 'user', content: userMessage }
        ],
        settings,
        {
          temperature: 0.6,
          responseFormat: { type: 'json_object' }
        }
      );

      // Clean potential JSON markdown fence
      let cleaned = responseText.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
      else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();

      const parsed = JSON.parse(cleaned);

      const scenes: Scene[] = (parsed.scenes || []).map((s: any, idx: number) => ({
        id: `sc_${Date.now()}_${idx + 1}`,
        order: s.order || idx + 1,
        title: s.title || `Scene ${idx + 1}`,
        label: s.label || `SCENE ${idx + 1}`,
        narration: s.narration || '',
        captionText: s.captionText || s.title || '',
        duration: Number(s.duration) || Math.round(duration / 3),
        visualType: s.visualType || 'motion_graphic',
        theme: s.theme || 'luxury_gold',
        backgroundColor: s.backgroundColor || '#0F0902',
        elements: s.elements || [],
        assetRequirements: s.assetRequirements || [],
        assignedAssetIds: {},
        transition: s.transition || 'fade',
        approved: false
      }));

      // Validate durations
      let totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);
      if (totalDuration !== duration && scenes.length > 0) {
        scenes[scenes.length - 1].duration += (duration - totalDuration);
      }

      const project: Project = {
        id: `proj_${Date.now()}`,
        title: parsed.title || prompt.slice(0, 35),
        prompt,
        description: parsed.description || prompt,
        duration,
        aspectRatio,
        stylePreset: (parsed.stylePreset as StylePreset) || stylePreset,
        brandKit: parsed.brandKit || defaultBrand,
        scenes,
        status: 'planned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return { project, usedAi: true };
    } catch (err: any) {
      console.warn('OpenRouter creative planning error, falling back to deterministic template:', err);
      // Fall through to offline template
    }
  }

  // Offline deterministic fallback
  const fallbackScenes = matchOfflineTemplate(prompt, duration, defaultBrand);
  const project: Project = {
    id: `proj_${Date.now()}`,
    title: prompt.length > 40 ? `${prompt.slice(0, 38)}...` : prompt,
    prompt,
    description: `Generated via offline motion-graphics template for: "${prompt}"`,
    duration,
    aspectRatio,
    stylePreset,
    brandKit: defaultBrand,
    scenes: fallbackScenes,
    status: 'planned',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return {
    project,
    usedAi: false,
    note: 'Generated with built-in creative template engine (100% offline & zero API tokens used).'
  };
}

export async function regenerateSceneWithAI(
  scene: Scene,
  instruction: string,
  project: Project,
  settings: ProviderSettings
): Promise<Scene> {
  if (settings.openRouterApiKey && settings.openRouterApiKey.trim().length > 0) {
    try {
      const prompt = `Regenerate the following video scene based on this modification request: "${instruction}".
Original scene JSON:
${JSON.stringify(scene, null, 2)}

Overall Project Context:
Brand: ${project.brandKit.name}
Style: ${project.stylePreset}
Target Duration: ${scene.duration} seconds.

Return ONLY a single updated Scene JSON object matching the exact schema.`;

      const responseText = await callOpenRouter(
        [
          { role: 'system', content: SYSTEM_PLANNER_PROMPT },
          { role: 'user', content: prompt }
        ],
        settings,
        {
          temperature: 0.7,
          responseFormat: { type: 'json_object' }
        }
      );

      let cleaned = responseText.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
      else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();

      const parsed = JSON.parse(cleaned);
      return {
        ...scene,
        title: parsed.title || scene.title,
        label: parsed.label || scene.label,
        narration: parsed.narration || scene.narration,
        captionText: parsed.captionText || scene.captionText,
        elements: parsed.elements || scene.elements,
        visualType: parsed.visualType || scene.visualType,
        backgroundColor: parsed.backgroundColor || scene.backgroundColor,
        transition: parsed.transition || scene.transition,
        approved: false // Re-approval required after regeneration
      };
    } catch (err) {
      console.warn('AI Scene regeneration fallback:', err);
    }
  }

  // Fallback: apply rule-based modification
  return {
    ...scene,
    title: `${scene.title} (Revised)`,
    captionText: `${scene.captionText}\n* ${instruction.slice(0, 30)}`,
    approved: false
  };
}
