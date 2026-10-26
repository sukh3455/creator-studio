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
Your role is to design an authentic, art-directed motion graphics film that uniquely matches the user's specific subject and concept.

CRITICAL CREATIVE DIRECTIVES:
1. SUBJECT-AUTHENTIC STORYTELLING:
   - If the user asks for a cultural festival (e.g. Holi, Diwali, Eid, Christmas), write specifically about that festival's traditions, colors, music, and emotional warmth.
   - Do NOT use generic business templates, corporate jargon, or agency portfolio copy ("Brand Identity Systems", "60 FPS Motion Graphics", "High-Converting Ads") unless the user explicitly requested a graphic design portfolio video.
   - If the video is about a product, fitness, coffee, travel, or event, tailor every sentence and visual element to that exact theme.

2. 3-ACT NARRATIVE STRUCTURE:
   - Scene 1 (Hook / Dawn): layout "split_editorial", camera "zoom_in". Compelling thesis/question, cultural or topic kicker badge, bold kinetic typography.
   - Scene 2 (Immersion / Experience / Value): layout "metric_grid" or "hero_badge", camera "pan_drift_up". 3 structured highlights or features.
   - Scene 3 (Climax / Finale): layout "brand_outro", camera "zoom_out". High-impact celebratory crest or monogram, metallic light sweep, festive tagline, and topic-relevant CTA button.

3. DIVERSE VISUAL ATMOSPHERE:
   - Never use the same background color or layout across scenes.
   - Assign distinct contrasting backgrounds suited to the subject (e.g., deep ultraviolet/berry for Holi, warm dark amber for Diwali, dark slate for tech).
   - Assign camera motions: "zoom_in", "zoom_out", "pan_drift_up", "pan_drift_down".

CRITICAL JSON OUTPUT RULES:
Return ONLY a valid JSON object matching this schema without markdown codeblocks or commentary:
{
  "title": "Short punchy project title",
  "description": "Brief 1-2 sentence description",
  "stylePreset": "vibrant_colors | festive | corporate | cyberpunk | minimal | luxury_gold | neon_glow",
  "brandKit": {
    "name": "Brand or Celebratory Title (e.g. Happy Holi)",
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "tagline": "Short motto or festive blessing",
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
      "theme": "vibrant_colors | diwali_festive | luxury_gold | high_tech | cyberpunk | minimalist",
      "backgroundColor": "#0F0728",
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

// Helper: Extract 3 topic-specific highlights for Scene 2 without hardcoding agency text
function extractContextualHighlights(
  narration: string,
  prompt: string,
  isHoli: boolean,
  isDiwali: boolean,
  isFitness: boolean,
  isTech: boolean,
  isAgency: boolean
): Array<{ num: string; title: string; desc: string }> {
  if (isHoli) {
    return [
      { num: '01', title: 'Vibrant Gulal Powders', desc: 'Explosions of magenta, cyan & golden clouds' },
      { num: '02', title: 'Dhol Beats & Dancing', desc: 'Rhythmic celebration of boundless joy' },
      { num: '03', title: 'Sweet Festive Warmth', desc: 'Sharing gujiya and spreading love' }
    ];
  }
  if (isDiwali) {
    return [
      { num: '01', title: 'Radiant Terracotta Diyas', desc: 'Golden light triumphing over darkness' },
      { num: '02', title: 'Prosperity & Blessings', desc: 'Inviting abundance to every home' },
      { num: '03', title: 'Cherished Feasts', desc: 'Warm sweet moments with family & friends' }
    ];
  }
  if (isFitness) {
    return [
      { num: '01', title: 'Unstoppable Momentum', desc: 'Push beyond limits every single day' },
      { num: '02', title: 'Peak Intensity', desc: 'Engineered for strength and endurance' },
      { num: '03', title: 'Transformative Power', desc: 'Discipline that turns into triumph' }
    ];
  }
  if (isTech) {
    return [
      { num: '01', title: 'Next-Gen Speed', desc: 'Lightning-fast execution in real-time' },
      { num: '02', title: 'Intelligent Flow', desc: 'Automate complex execution effortlessly' },
      { num: '03', title: 'Uncompromising Scale', desc: 'Reliability engineered for growth' }
    ];
  }
  if (isAgency) {
    return [
      { num: '01', title: 'Brand Identity Systems', desc: 'Bespoke logos, guidelines & typography' },
      { num: '02', title: '60 FPS Motion Graphics', desc: 'Cinematic visual storytelling' },
      { num: '03', title: 'Performance Ad Creatives', desc: 'Engineered for viral retention' }
    ];
  }

  // Generic prompt: Extract from narration sentences if available
  const cleanSentences = narration.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
  if (cleanSentences.length >= 3) {
    return [
      { num: '01', title: cleanSentences[0].slice(0, 32), desc: cleanSentences[0].slice(32, 85) || cleanSentences[0] },
      { num: '02', title: cleanSentences[1].slice(0, 32), desc: cleanSentences[1].slice(32, 85) || cleanSentences[1] },
      { num: '03', title: cleanSentences[2].slice(0, 32), desc: cleanSentences[2].slice(32, 85) || cleanSentences[2] }
    ];
  }

  // Contextual fallback from prompt words
  const pWords = prompt.split(/\s+/).filter(w => w.length > 3);
  const w1 = pWords[0] || 'Vision';
  const w2 = pWords[1] || 'Experience';
  const w3 = pWords[2] || 'Community';

  return [
    { num: '01', title: `${w1.toUpperCase()} & Purpose`, desc: 'Crafted with intention and passion' },
    { num: '02', title: `${w2.toUpperCase()} in Motion`, desc: 'Dynamic visual storytelling in 60 FPS' },
    { num: '03', title: `${w3.toUpperCase()} & Connection`, desc: 'Uniting people through great experiences' }
  ];
}

export async function planCreativeProject(
  prompt: string,
  options: PlanProjectOptions = {},
  settings: ProviderSettings
): Promise<{ project: Project; usedAi: boolean; note?: string }> {
  const duration = options.duration || 15;
  const aspectRatio = options.aspectRatio || '9:16';
  let stylePreset = options.stylePreset || 'auto';

  // Topic detection from prompt
  const pLower = prompt.toLowerCase();
  const isHoli = pLower.includes('holi') || pLower.includes('gulal') || pLower.includes('rang barse') || pLower.includes('colors festival') || pLower.includes('festival of colors');
  const isDiwali = pLower.includes('diwali') || pLower.includes('deepavali') || pLower.includes('diya');
  const isFitness = pLower.includes('gym') || pLower.includes('fitness') || pLower.includes('workout') || pLower.includes('sport');
  const isTech = pLower.includes('tech') || pLower.includes('ai') || pLower.includes('cyber') || pLower.includes('crypto') || pLower.includes('software') || pLower.includes('saas');
  const isAgency = pLower.includes('sukh') || pLower.includes('graphix') || pLower.includes('agency') || pLower.includes('design studio') || pLower.includes('portfolio');

  // Auto-resolve style preset
  if (stylePreset === 'auto') {
    if (isHoli) stylePreset = 'vibrant_colors';
    else if (isDiwali) stylePreset = 'festive';
    else if (isFitness || isTech) stylePreset = 'cyberpunk';
    else if (isAgency) stylePreset = 'luxury_gold';
    else stylePreset = 'corporate';
  }

  // Brand Kit derivation (do not default to Sukh Graphix unless requested)
  const userBrandName = options.brandKit?.name?.trim();
  const hasUserBrand = Boolean(userBrandName && userBrandName.length > 0);

  let brandName = userBrandName;
  let brandTagline = options.brandKit?.tagline;
  let primaryColor = options.brandKit?.primaryColor;
  let secondaryColor = options.brandKit?.secondaryColor;
  let accentColor = options.brandKit?.accentColor;

  if (!hasUserBrand) {
    if (isHoli) {
      brandName = 'HAPPY HOLI';
      brandTagline = 'Festival of Colors & Boundless Joy';
      primaryColor = '#EC4899'; // Vibrant Gulal Magenta
      secondaryColor = '#06B6D4'; // Cyan
      accentColor = '#FACC15'; // Canary Yellow
    } else if (isDiwali) {
      brandName = 'SHUBH DEEPAVALI';
      brandTagline = 'Festival of Lights & Prosperity';
      primaryColor = '#F59E0B';
      secondaryColor = '#B45309';
      accentColor = '#FEF08A';
    } else if (isAgency) {
      brandName = 'Sukh Graphix';
      brandTagline = 'Illuminating Creative Excellence';
      primaryColor = '#F59E0B';
      secondaryColor = '#B45309';
      accentColor = '#FEF08A';
    } else {
      brandName = prompt.length > 25 ? 'CREATOR STUDIO' : prompt.toUpperCase();
      brandTagline = 'Crafted For Modern Creators';
      primaryColor = '#3B82F6';
      secondaryColor = '#8B5CF6';
      accentColor = '#38BDF8';
    }
  }

  const defaultBrand: BrandKit = {
    name: brandName!,
    primaryColor: primaryColor || '#EC4899',
    secondaryColor: secondaryColor || '#06B6D4',
    accentColor: accentColor || '#FACC15',
    tagline: brandTagline || '',
    fontFamily: isHoli || isDiwali ? 'serif' : 'sans'
  };

  // Check if OpenRouter is configured
  if (settings.openRouterApiKey && settings.openRouterApiKey.trim().length > 0) {
    try {
      const userMessage = `Act as Creative Director for this project.
Creative Idea Prompt: "${prompt}"
Target Duration: ${duration} seconds.
Aspect Ratio: ${aspectRatio}.
Resolved Style: ${stylePreset}.
Brand Info: ${JSON.stringify(defaultBrand)}.

Design a cohesive 3-scene motion graphics sequence:
- Scene 1: Hook with split_editorial layout, zoom_in camera, kinetic_headline element.
- Scene 2: Immersion/Proof with metric_grid or hero_badge layout, pan_drift_up camera, metric_grid element with 3 subject-specific points.
- Scene 3: Climax with brand_outro layout, zoom_out camera, brand_outro element.
IMPORTANT: Tailor every line of text strictly to "${prompt}". Do not use placeholder agency copy.`;

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
        const narration = s.narration || s.audio || s.speech || s.voiceover || s.script || s.action || s.description || s.visual || '';
        const captionText = s.captionText || s.caption || s.text || s.headline || title;
        const sceneDuration = Number(s.duration) || Math.round(duration / Math.max(1, rawScenes.length));
        
        // Contextual theme & contrasting background colors per scene
        let theme: any = 'luxury_gold';
        let bg = s.backgroundColor;

        if (isHoli || stylePreset === 'vibrant_colors') {
          theme = 'vibrant_colors';
          if (!bg) {
            if (idx === 0) bg = '#0F0728'; // Deep Ultraviolet Night
            else if (idx === 1) bg = '#160838'; // Royal Berry Night
            else bg = '#0B0520'; // Midnight Plum
          }
        } else if (isDiwali || stylePreset === 'festive') {
          theme = 'diwali_festive';
          if (!bg) {
            if (idx === 0) bg = '#1E1100';
            else if (idx === 1) bg = '#140A02';
            else bg = '#0A0500';
          }
        } else if (isFitness || isTech || stylePreset === 'cyberpunk') {
          theme = 'cyberpunk';
          if (!bg) {
            if (idx === 0) bg = '#080E1C';
            else if (idx === 1) bg = '#061324';
            else bg = '#040A14';
          }
        } else {
          theme = 'luxury_gold';
          if (!bg) {
            if (idx === 0) bg = '#0B0F19';
            else if (idx === 1) bg = '#080E1C';
            else bg = '#0D0801';
          }
        }

        const layout: CompositionLayout = s.compositionLayout || (
          idx === 0 ? 'split_editorial' : idx === 1 ? 'metric_grid' : 'brand_outro'
        );

        const cameraMotion: CameraMotion = s.cameraMotion || (
          idx === 0 ? 'zoom_in' : idx === 1 ? 'pan_drift_up' : 'zoom_out'
        );

        const focalConcept = s.focalConcept || (
          idx === 0 ? (isHoli ? 'Vibrant Gulal Cloud with Glowing Kinetic Typography' : 'Editorial Headline & Vector Guides') :
          idx === 1 ? (isHoli ? '3-Tier Festive Highlight Cards in Vibrant Glassmorphism' : '3-Tier Value Proposition Grid') :
          (isHoli ? 'Grand Luminous Festive Crest with Specular Sheen' : 'Brand Monogram Crest & Specular Sheen')
        );

        // Guarantee rich, topic-specific motion-graphics elements
        let elements = s.elements;
        if (!elements || !Array.isArray(elements) || elements.length === 0) {
          if (idx === 0) {
            const kicker = isHoli
              ? '✦ FESTIVAL OF COLORS ✦'
              : isDiwali
              ? '✨ SHUBH DEEPAVALI ✨'
              : isAgency
              ? '✦ SUKH GRAPHIX // CREATIVE STUDIO ✦'
              : `✦ 01 // ${defaultBrand.name.toUpperCase()} ✦`;

            elements = [
              {
                id: `elem_kh_${idx}_${Date.now()}`,
                type: 'kinetic_headline',
                props: {
                  kicker,
                  headline: captionText.replace(/\n.*/, ''),
                  subtitle: narration.slice(0, 95) || (isHoli ? 'Celebrate the joy, love, and vibrant colors of Holi.' : ''),
                  accentColor: defaultBrand.primaryColor
                }
              },
              {
                id: `elem_p_${idx}`,
                type: 'particles',
                props: { count: 50, color: defaultBrand.primaryColor, speed: 1.0 }
              }
            ];
          } else if (idx === 1) {
            const items = extractContextualHighlights(narration, prompt, isHoli, isDiwali, isFitness, isTech, isAgency);
            elements = [
              {
                id: `elem_mg_${idx}_${Date.now()}`,
                type: 'metric_grid',
                props: {
                  headline: isHoli ? 'COLORS OF CELEBRATION' : isDiwali ? 'FESTIVE LIGHT & JOY' : 'KEY HIGHLIGHTS',
                  items
                }
              },
              {
                id: `elem_p_${idx}`,
                type: 'particles',
                props: { count: 60, color: defaultBrand.secondaryColor, speed: 1.2 }
              }
            ];
          } else {
            const cta = isHoli
              ? 'SHARE THE JOY →'
              : isDiwali
              ? 'CELEBRATE WITH US →'
              : isFitness
              ? 'JOIN THE MOVEMENT →'
              : isAgency
              ? 'START YOUR PROJECT →'
              : 'DISCOVER MORE →';

            elements = [
              {
                id: `elem_bo_${idx}_${Date.now()}`,
                type: 'brand_outro',
                props: {
                  brandName: defaultBrand.name,
                  tagline: defaultBrand.tagline,
                  emblem: isHoli ? '✦' : isDiwali ? '✨' : defaultBrand.name.slice(0, 2).toUpperCase(),
                  cta,
                  glowColor: defaultBrand.primaryColor
                }
              },
              {
                id: `elem_p_${idx}`,
                type: 'particles',
                props: { count: 70, color: defaultBrand.accentColor, speed: 1.5 }
              }
            ];
          }
        }

        return {
          id: `sc_${Date.now()}_${idx + 1}`,
          order: s.order || idx + 1,
          label: s.label || (idx === 0 ? 'SCENE 1: HOOK' : idx === 1 ? 'SCENE 2: VALUE & PROOF' : 'SCENE 3: BRAND CLIMAX'),
          title,
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
Topic / Concept: ${project.prompt}
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
