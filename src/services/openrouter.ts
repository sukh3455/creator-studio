import { SceneItem, OpenRouterModel, AspectRatio, Language, SUPPORTED_LANGUAGES } from '../types/timeline';
import { generateLocalReelScript } from './aiScriptWriter';
import { ProceduralSynthesizer } from '../engine/proceduralSynthesizer';

const STORAGE_KEY = 'openrouter_api_key';

export const AVAILABLE_MODELS: OpenRouterModel[] = [
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Free)',
    description: 'Ultra-fast multimodal reasoning with excellent canvas coding',
    isFree: true
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B Instruct (Free)',
    description: 'High-capability open-source model with creative coding skills',
    isFree: true
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat (V3)',
    description: 'Elite algorithmic reasoning and JavaScript synthesis',
    isFree: true
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B Instruct (Free)',
    description: 'Lightweight and fast open model',
    isFree: true
  },
  {
    id: 'nvidia/nemotron-3.5-super-vl',
    name: 'Nemotron 3.5 VL',
    description: 'NVIDIA Multimodal Video & Vision reasoning'
  }
];

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save API key to localStorage', e);
  }
}

export function clearStoredApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear API key from localStorage', e);
  }
}

export async function generateTimelineFromAI(
  apiKey: string,
  model: string,
  idea: string,
  videoMeta?: { name: string; size: number; type: string },
  aspectRatio: AspectRatio = '9:16',
  language: Language = 'en'
): Promise<SceneItem[]> {
  const langConfig = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;

  // Fallback to local AI scriptwriter if no API key provided
  if (!apiKey.trim()) {
    return generateLocalReelScript(idea, language);
  }

  const formatDescription = aspectRatio === '9:16'
    ? 'Vertical 9:16 mobile format (720x1280, YouTube Shorts / Reels / TikTok). Use punchy 1-3 word kinetic uppercase headline labels, and snappy spoken lines.'
    : 'Landscape 16:9 widescreen format (1280x720, YouTube HD / Desktop).';

  const videoContext = videoMeta
    ? `Reference video attached: "${videoMeta.name}" (${(videoMeta.size / 1024 / 1024).toFixed(1)}MB). Structure scenes to reflect or enhance this content.`
    : '';

  const promptContext = `You are an elite creative technologist and generative video director (like Claude Design).
Generate a high-retention 4-scene video script AND custom HTML5 Canvas 2D animation code for this topic: "${idea}".

Target Language: ${langConfig.name} (${langConfig.nativeName}). Spoken "text" MUST be written in ${langConfig.name}. The "label" field must be 2-3 words uppercase.
Format: ${formatDescription}
${videoContext}

You are animating a 2D cartoon character wearing a teal shirt with thick dark outlines. The engine renders the character automatically.
YOU must code the dynamic procedural background AND topic-specific animated focal graphics for each scene.

Output MUST be a strict raw JSON array of 4 scenes without markdown fences or backticks.
JSON Array Schema:
[
  {
    "text": "Spoken voiceover sentence in ${langConfig.name}",
    "label": "2-3 WORDS (UPPERCASE HEADLINE)",
    "action": "jump" | "bounce" | "slide_left" | "slide_right" | "scale_up" | "float" | "shake" | "idle",
    "expression": "happy" | "excited" | "thinking" | "surprised" | "cool" | "explaining",
    "pose": "waving" | "pointing" | "explaining" | "thumbs_up" | "hands_on_hips" | "cheering",
    "color": "#38bdf8" (Vibrant theme accent hex),
    "visualTheme": "Short descriptive name of this scene visual",
    "visualCode": "JavaScript Canvas2D code statements executed inside: (ctx, w, h, t, isVertical, accentColor) => { ... }. Write complete drawing code that renders: 1) A themed animated background (ctx.createRadialGradient or createLinearGradient + particles/grid). 2) An animated focal diagram, vector graphic, math curve, or visual metaphor centered at (isVertical ? w*0.5 : w*0.72, isVertical ? h*0.38 : h*0.42). Use 't' (elapsed time in seconds) to animate elements (Math.sin, Math.cos, rotations). Do NOT draw the cartoon character. Use standard Canvas 2D context methods."
  }
]
Generate exactly 4 progressive scenes (Scene 1: Hook, Scene 2: Mechanism, Scene 3: Exponential Climax, Scene 4: Action / Viral Takeaway).`;

  try {
    const chosenModel = model || 'google/gemini-2.0-flash-exp:free';
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin || 'http://localhost:5173',
        'X-Title': 'Auto-Anim Engine Video Producer'
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: [{ role: 'user', content: promptContext }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let msg = `OpenRouter HTTP ${response.status}: ${response.statusText}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed?.error?.message) {
          msg += ` - ${parsed.error.message}`;
        }
      } catch {
        msg += ` - ${errorBody.slice(0, 150)}`;
      }
      throw new Error(msg);
    }

    const data = await response.json();
    let cleanText = data.choices?.[0]?.message?.content?.trim() || '';

    if (cleanText.includes('```json')) {
      cleanText = cleanText.split('```json')[1].split('```')[0].trim();
    } else if (cleanText.includes('```')) {
      cleanText = cleanText.split('```')[1].split('```')[0].trim();
    }

    const parsed = JSON.parse(cleanText);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('AI returned an invalid timeline array format.');
    }

    // Validate visualCode or fall back to high-end procedural synthesizer
    return parsed.map((item: any, idx: number) => {
      let validCode = item.visualCode;
      if (typeof validCode === 'string' && validCode.trim()) {
        try {
          // Test if function compiles cleanly
          new Function('ctx', 'w', 'h', 't', 'isVertical', 'accentColor', validCode);
        } catch (e) {
          console.warn(`LLM visualCode syntax check failed for scene ${idx + 1}, using procedural fallback`, e);
          validCode = null;
        }
      } else {
        validCode = null;
      }

      if (!validCode) {
        const fallback = ProceduralSynthesizer.synthesizeVisualCode(idea, idx);
        validCode = fallback.code;
        if (!item.visualTheme) {
          item.visualTheme = fallback.theme;
        }
      }

      return {
        text: item.text || `Scene ${idx + 1}`,
        label: item.label || 'CONCEPT',
        visualCode: validCode,
        visualTheme: item.visualTheme || 'procedural_visual',
        action: item.action || 'bounce',
        expression: item.expression || 'explaining',
        pose: item.pose || 'explaining',
        color: item.color || '#38bdf8',
        position: item.position || 'center'
      };
    }) as SceneItem[];
  } catch (err) {
    console.warn('AI call failed, using local script generator:', err);
    return generateLocalReelScript(idea, language);
  }
}
