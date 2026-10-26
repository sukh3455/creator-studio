import { ProviderSettings } from '../../types/creatorStudio';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' };
}

export const FREE_MODELS = [
  { id: 'nvidia/nemotron-3.5-lightning:free', name: 'Nvidia Nemotron 3.5 Lightning (Free)', description: 'Ultra-fast, high-accuracy reasoning & planning' },
  { id: 'google/gemma-4-31b-it:free', name: 'Google Gemma 4 31B (Free)', description: 'High-capacity creative language generation' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Google Gemma 4 26B MoE (Free)', description: 'Efficient multimodal instruction following' },
  { id: 'recursive/flint-v1.0:free', name: 'Flint v1.0 (Free)', description: 'Concise creative structured scriptwriting' }
];

export const PAID_RECOMMENDED_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic Claude 3.5 Sonnet', description: 'World-class design & creative copy' },
  { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o', description: 'Flagship versatile intelligence' }
];

export async function callOpenRouter(
  messages: ChatMessage[],
  settings: ProviderSettings,
  options: OpenRouterCompletionOptions = {}
): Promise<string> {
  if (!settings.openRouterApiKey || settings.openRouterApiKey.trim().length === 0) {
    throw new Error('OPENROUTER_API_KEY is not configured. Switching to offline planner.');
  }

  const selectedModel = options.model || settings.openRouterModel || 'google/gemini-2.0-flash-exp:free';

  // Safeguard: Check freeOnly restriction
  if (settings.openRouterFreeOnly && !selectedModel.includes(':free') && !selectedModel.includes('free')) {
    throw new Error(
      `Cost Safeguard Active: Model "${selectedModel}" is a paid model, but "Free-only mode" is enabled. Choose a free model or disable the free safeguard in Settings.`
    );
  }

  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  const body: Record<string, any> = {
    model: selectedModel,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2500
  };

  if (options.responseFormat) {
    body.response_format = options.responseFormat;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.openRouterApiKey.trim()}`,
      'HTTP-Referer': 'https://creatorstudio.local',
      'X-Title': 'Creator Studio AI Motion Graphics'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedMessage = errorText;
    try {
      const errJson = JSON.parse(errorText);
      parsedMessage = errJson?.error?.message || errorText;
    } catch {
      // ignore
    }
    throw new Error(`OpenRouter API error (${response.status}): ${parsedMessage}`);
  }

  const data = await response.json();
  const choice = data?.choices?.[0]?.message?.content;
  if (!choice) {
    throw new Error('OpenRouter returned an empty completion response.');
  }

  return choice;
}
