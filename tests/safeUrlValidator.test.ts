import { describe, it, expect } from 'vitest';
import { validateSafePublicUrl } from '../src/services/webcapture/safeUrlValidator';

describe('SSRF Protection & Safe URL Validator', () => {
  it('allows valid public HTTPS domains', () => {
    const res1 = validateSafePublicUrl('https://sukhgraphix.com');
    expect(res1.isValid).toBe(true);
    expect(res1.sanitizedUrl).toBe('https://sukhgraphix.com/');

    const res2 = validateSafePublicUrl('example.com/pricing');
    expect(res2.isValid).toBe(true);
    expect(res2.sanitizedUrl).toBe('https://example.com/pricing');
  });

  it('blocks localhost and loopback IPv4', () => {
    const res1 = validateSafePublicUrl('http://localhost:3000');
    expect(res1.isValid).toBe(false);
    expect(res1.error).toContain('Security Alert');

    const res2 = validateSafePublicUrl('http://127.0.0.1:8080');
    expect(res2.isValid).toBe(false);

    const res3 = validateSafePublicUrl('http://127.0.1.5');
    expect(res3.isValid).toBe(false);
  });

  it('blocks cloud metadata endpoints (169.254.169.254)', () => {
    const res = validateSafePublicUrl('http://169.254.169.254/latest/meta-data/');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('metadata');
  });

  it('blocks private RFC 1918 subnets', () => {
    // 10.0.0.0/8
    expect(validateSafePublicUrl('http://10.0.1.1').isValid).toBe(false);
    // 192.168.0.0/16
    expect(validateSafePublicUrl('http://192.168.1.1').isValid).toBe(false);
    // 172.16.0.0/12
    expect(validateSafePublicUrl('http://172.16.0.5').isValid).toBe(false);
  });

  it('blocks non-HTTP protocols like file:// and gopher://', () => {
    expect(validateSafePublicUrl('file:///etc/passwd').isValid).toBe(false);
    expect(validateSafePublicUrl('gopher://internal.lan').isValid).toBe(false);
  });

  it('blocks internal and local top-level domains', () => {
    expect(validateSafePublicUrl('http://service.internal').isValid).toBe(false);
    expect(validateSafePublicUrl('http://database.local').isValid).toBe(false);
  });
});
