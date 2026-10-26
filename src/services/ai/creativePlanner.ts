import { Project, Scene, AspectRatio, StylePreset, BrandKit, ProviderSettings, CompositionLayout, CameraMotion } from '../../types/creatorStudio';
import { callOpenRouter } from './openrouterClient';
import { matchOfflineTemplate } from './offlineTemplates';

export interface PlanProjectOptions {
  duration?: number;
  aspectRatio?: AspectRatio;
  stylePreset?: StylePreset;
  brandKit?: BrandKit;
}

const SYSTEM_PLANNER_PROMPT = `You are the Lead Creative Director and Motion Graphics Architect for Creator Studio.
You do NOT merely write lines of text over a plain background. You architect a complete, high-end motion graphics film with deliberate visual pacing, narrative progression, distinct scene compositions, and clear typography hierarchy.

CORE CREATIVE DIRECTIVES:
1. NARRATIVE ARC & 3-ACT STRUCTURE:
   - Scene 1 (Hook / Dawn): layout "split_editorial", camera "zoom_in". Compelling thesis/question, kicker tag, bold kinetic typography, vector coordinate guidelines.
   - Scene 2 (Craft / Proof / Value): layout "metric_grid" or "hero_badge", camera "pan_drift_up". 3 structured value pillars or glassmorphic hero card showing concrete benefits/features.
   - Scene 3 (Climax / Grand Outro): layout "brand_outro", camera "zoom_out". High-authority brand crest monogram, travelling specular metallic light sweep, elegant tagline, and actionable CTA button.

2. VISUAL DIVERSITY (NO REPETITIVE BACKGROUNDS):
   - Never use the same background color or layout across scenes.
   - Provide contrasting deep background colors for each scene (e.g. Scene 1 #0B0F19, Scene 2 #080E1C, Scene 3 #0D0801).
   - Assign cameraMotion to each scene ("zoom_in", "zoom_out", "pan_drift_up", "pan_drift_down").

3. TYPOGRAPHY & LAYOUT SAFETY:
   - Headlines must be punchy (3-6 words), kickers (2-4 words).
   - Do NOT invent fake phone numbers, URLs, or factual claims.

CRITICAL JSON OUTPUT RULES:
Return ONLY a valid JSON object matching this schema without markdown codeblocks or commentary:
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
      "theme": "luxury_gold | high_tech | cyberpunk | minimalist",
      "backgroundColor": "#0B0F19",
      "compositionLayout": "split_editorial | metric_grid | hero_badge | brand_outro | geometric_focus",
      "cameraMotion": "zoom_in | zoom_out | pan_drift_up | pan_drift_down | steady",
      "focalConcept": "Specific visual focal point concept",
      "elements": [
        {
          "id": "elem_1",
          "type": "kinetic_headline | metric_grid | hero_card | vector_illustration | geometric_focus | brand_outro | particles",
          "props": { ... }
        }
      ],
      "assetRequirements": ["List of suggested media assets"],
      "transition": "fade | slide_left | slide_right | zoom_in"
    }
  ]
}

Total duration of all scenes must equal the requested target duration.`;

export async function planCreativeProject(
  prompt: string,
  options: PlanProjectOptions = {},
  settings: ProviderSettings
): Promise<{ project: Project; usedAi: boolean; note?: string }> {
  const duration = options.duration || 15;
  const aspectRatio = options.aspectRatio || '9:16';
  const stylePreset = options.stylePreset || 'luxury_gold';
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
      const userMessage = `Act as Creative Director for this project.
Creative Idea Prompt: "${prompt}"
Target Duration: ${duration} seconds.
Aspect Ratio: ${aspectRatio}.
Preferred Style Preset: ${stylePreset}.
Brand Info: ${JSON.stringify(defaultBrand)}.

Design a cohesive 3-scene motion graphics sequence:
- Scene 1: Hook with split_editorial layout, zoom_in camera, kinetic_headline element.
- Scene 2: Craft/Proof with metric_grid or hero_card layout, pan_drift_up camera, metric_grid element.
- Scene 3: Climax with brand_outro layout, zoom_out camera, brand_outro element.
Ensure each scene has distinct background colors and rich visual concepts.`;

      const responseText = await callOpenRouter(
        [
          { role: 'system', content: SYSTEM_PLANNER_PROMPT },
          { role: 'user', content: userMessage }
        ],
        settings,
        {
          temperature: 0.5,
          responseFormat: { type: 'json_object' }
        }
      );

      // Clean LLM response (handling thoughts, markdown fences, preambles)
      let cleaned = responseText.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
      const codeFence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeFence && codeFence[1]) {
        cleaned = codeFence[1].trim();
      }
      const bracketMatch = cleaned.match(/\{[\s\S]*\}/);
      if (bracketMatch) {
        cleaned = bracketMatch[0].trim();
      }

      const parsed = JSON.parse(cleaned);
      const rawScenes = parsed.scenes || parsed.storyboard || parsed.scenesList || [];

      const scenes: Scene[] = rawScenes.map((s: any, idx: number) => {
        const title = s.title || s.label || s.sceneName || `Scene ${idx + 1}`;
        const narration = s.narration || s.audio || s.speech || s.voiceover || s.script || s.description || '';
        const captionText = s.captionText || s.caption || s.text || title;
        const sceneDuration = Number(s.duration) || Math.round(duration / Math.max(1, rawScenes.length));
        
        // Theme & contrasting background colors per scene
        const pLower = (prompt + ' ' + title).toLowerCase();
        let theme: any = s.theme || (idx === 0 ? 'luxury_gold' : idx === 1 ? 'high_tech' : 'luxury_gold');
        let bg = s.backgroundColor;
        if (!bg) {
          if (idx === 0) bg = '#0B0F19';
          else if (idx === 1) bg = '#080E1C';
          else bg = '#0D0801';
        }

        // Distinct layouts per scene
        const layout: CompositionLayout = s.compositionLayout || (
          idx === 0 ? 'split_editorial' : idx === 1 ? 'metric_grid' : 'brand_outro'
        );

        const cameraMotion: CameraMotion = s.cameraMotion || (
          idx === 0 ? 'zoom_in' : idx === 1 ? 'pan_drift_up' : 'zoom_out'
        );

        const focalConcept = s.focalConcept || (
          idx === 0 ? 'Editorial Headline & Vector Guides' :
          idx === 1 ? '3-Tier Value Proposition Grid' :
          'Brand Monogram Crest & Specular Sheen'
        );

        // Guarantee rich motion-graphics elements
        let elements = s.elements;
        if (!elements || !Array.isArray(elements) || elements.length === 0) {
          if (idx === 0) {
            elements = [
              {
                id: `elem_kh_${idx}_${Date.now()}`,
                type: 'kinetic_headline',
                props: {
                  kicker: `✦ 01 // ${defaultBrand.name.toUpperCase()}`,
                  headline: captionText.replace(/\n.*/, ''),
                  subtitle: narration.slice(0, 75) || 'Engineered for maximum visual authority.',
                  accentColor: defaultBrand.primaryColor || '#F59E0B'
                }
              },
              {
                id: `elem_p_${idx}`,
                type: 'particles',
                props: { count: 45, color: '#FBBF24', speed: 1.0 }
              }
            ];
          } else if (idx === 1) {
            elements = [
              {
                id: `elem_mg_${idx}_${Date.now()}`,
                type: 'metric_grid',
                props: {
                  headline: 'CRAFT & CAPABILITIES',
                  items: [
                    { num: '01', title: 'Brand Identity Systems', desc: 'Distinctive logos & typography' },
                    { num: '02', title: '60 FPS Motion Graphics', desc: 'Cinematic visual storytelling' },
                    { num: '03', title: 'High-Converting Creatives', desc: 'Engineered for viral retention' }
                  ]
                }
              },
              {
                id: `elem_p_${idx}`,
                type: 'particles',
                props: { count: 50, color: '#38BDF8', speed: 1.2 }
              }
            ];
          } else {
            elements = [
              {
                id: `elem_bo_${idx}_${Date.now()}`,
                type: 'brand_outro',
                props: {
                  brandName: defaultBrand.name,
                  tagline: defaultBrand.tagline || 'Illuminating Creative Excellence',
                  emblem: defaultBrand.name.slice(0, 2).toUpperCase() || 'SG',
                  cta: 'START YOUR PROJECT →',
                  glowColor: defaultBrand.primaryColor || '#F59E0B'
                }
              },
              {
                id: `elem_p_${idx}`,
                type: 'particles',
                props: { count: 65, color: '#FEF08A', speed: 1.5 }
              }
            ];
          }
        }

        return {
          id: `sc_${Date.now()}_${idx + 1}`,
          order: s.order || idx + 1,
          title,
          label: s.label || (idx === 0 ? 'SCENE 1: HOOK' : idx === 1 ? 'SCENE 2: VALUE & PROOF' : 'SCENE 3: BRAND CLIMAX'),
          narration,
          captionText,
          duration: sceneDuration,
          visualType: 'motion_graphic',
          theme,
          backgroundColor: bg,
          compositionLayout: layout,
          cameraMotion,
          focalConcept,
          elements,
          assetRequirements: s.assetRequirements || [],
          assignedAssetIds: {},
          transition: s.transition || (idx === 0 ? 'fade' : idx === 1 ? 'slide_left' : 'zoom_in'),
          approved: false
        };
      });

      // Validate durations
      let totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);
      if (totalDuration !== duration && scenes.length > 0) {
        scenes[scenes.length - 1].duration += (duration - totalDuration);
      }

      const project: Project = {
        id: `proj_${Date.now()}`,
        title: parsed.title || parsed.concept || prompt.slice(0, 35),
        prompt,
        description: parsed.description || prompt,
        duration,
        aspectRatio,
        stylePreset: (parsed.stylePreset as StylePreset) || stylePreset,
        brandKit: parsed.brandKit || defaultBrand,
        scenes: scenes.length > 0 ? scenes : matchOfflineTemplate(prompt, duration, defaultBrand),
        status: 'planned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return { project, usedAi: true };
    } catch (err: any) {
      console.warn('OpenRouter creative planning error, falling back to bespoke template generator:', err);
    }
  }

  // Offline deterministic fallback
  const fallbackScenes = matchOfflineTemplate(prompt, duration, defaultBrand);
  const project: Project = {
    id: `proj_${Date.now()}`,
    title: prompt.length > 40 ? `${prompt.slice(0, 38)}...` : prompt,
    prompt,
    description: `Generated via motion-graphics creative engine for: "${prompt}"`,
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
      const prompt = `Regenerate the following video scene based on this creative modification request: "${instruction}".
Original scene JSON:
${JSON.stringify(scene, null, 2)}

Overall Project Context:
Brand: ${project.brandKit.name}
Style: ${project.stylePreset}
Target Duration: ${scene.duration} seconds.

Return ONLY a single updated Scene JSON object matching the exact schema with distinct compositionLayout, cameraMotion, and visual elements.`;

      const responseText = await callOpenRouter(
        [
          { role: 'system', content: SYSTEM_PLANNER_PROMPT },
          { role: 'user', content: prompt }
        ],
        settings,
        {
          temperature: 0.6,
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
        compositionLayout: parsed.compositionLayout || scene.compositionLayout,
        cameraMotion: parsed.cameraMotion || scene.cameraMotion,
        focalConcept: parsed.focalConcept || scene.focalConcept,
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
