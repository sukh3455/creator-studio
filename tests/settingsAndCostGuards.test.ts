import { describe, it, expect } from 'vitest';
import { validateProviderStatuses, DEFAULT_SETTINGS } from '../src/services/settings/settingsStore';
import { callOpenRouter } from '../src/services/ai/openrouterClient';
import { ProviderSettings } from '../src/types/creatorStudio';

describe('Settings & Cost Protections', () => {
  it('reports all providers as mocked/local fallback when credentials are empty', () => {
    const statuses = validateProviderStatuses(DEFAULT_SETTINGS);
    expect(statuses.length).toBe(5);

    const ai = statuses.find(s => s.service === 'OpenRouter AI');
    expect(ai?.status).toBe('mocked');
    expect(ai?.isFree).toBe(true);

    const github = statuses.find(s => s.service === 'GitHub Actions Rendering');
    expect(github?.status).toBe('mocked');
    expect(github?.isFree).toBe(true);

    const db = statuses.find(s => s.service === 'Supabase Database');
    expect(db?.status).toBe('mocked');

    const storage = statuses.find(s => s.service === 'Cloudflare R2');
    expect(storage?.status).toBe('mocked');

    const worker = statuses.find(s => s.service === 'Cloud Run Worker');
    expect(worker?.status).toBe('mocked');
  });

  it('reports connected status when valid keys are configured', () => {
    const customSettings: ProviderSettings = {
      ...DEFAULT_SETTINGS,
      openRouterApiKey: 'sk-or-v1-mock-valid-key',
      githubOwner: 'octocat',
      githubRepo: 'creator-studio',
      githubToken: 'ghp_mock_token_123',
      supabaseEnabled: true,
      supabaseUrl: 'https://testproject.supabase.co',
      supabaseAnonKey: 'mock-anon-key',
      r2AccountId: 'acc123',
      r2AccessKeyId: 'key123',
      r2SecretAccessKey: 'sec123',
      r2BucketName: 'renders-bucket'
    };

    const statuses = validateProviderStatuses(customSettings);
    expect(statuses.find(s => s.service === 'OpenRouter AI')?.status).toBe('connected');
    expect(statuses.find(s => s.service === 'GitHub Actions Rendering')?.status).toBe('connected');
    expect(statuses.find(s => s.service === 'Supabase Database')?.status).toBe('connected');
    expect(statuses.find(s => s.service === 'Cloudflare R2')?.status).toBe('connected');
  });

  it('blocks paid models when free-only safeguard is active', async () => {
    const settingsWithKey: ProviderSettings = {
      ...DEFAULT_SETTINGS,
      openRouterApiKey: 'sk-or-v1-test',
      openRouterFreeOnly: true
    };

    // Attempting to call paid model Claude 3.5 Sonnet
    await expect(
      callOpenRouter(
        [{ role: 'user', content: 'test' }],
        settingsWithKey,
        { model: 'anthropic/claude-3.5-sonnet' }
      )
    ).rejects.toThrow('Cost Safeguard Active');
  });

  it('throws helpful missing key error when API key is blank', async () => {
    await expect(
      callOpenRouter(
        [{ role: 'user', content: 'test' }],
        DEFAULT_SETTINGS
      )
    ).rejects.toThrow('OPENROUTER_API_KEY is not configured');
  });
});
