// Strict SSRF (Server-Side Request Forgery) protection & URL safety validator

export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
}

const FORBIDDEN_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254'
]);

export function validateSafePublicUrl(inputUrl: string): UrlValidationResult {
  if (!inputUrl || inputUrl.trim().length === 0) {
    return { isValid: false, error: 'URL cannot be empty.' };
  }

  let parsed: URL;
  try {
    let toParse = inputUrl.trim();
    // If no URI scheme is present (e.g. example.com), prepend https://
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(toParse) && !/^[a-zA-Z]+:/.test(toParse)) {
      toParse = `https://${toParse}`;
    }
    parsed = new URL(toParse);
  } catch {
    return { isValid: false, error: 'Malformed URL format.' };
  }

  // 1. Enforce HTTP/HTTPS only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      error: `Disallowed protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Exact match check against known localhost/metadata names
  if (FORBIDDEN_HOSTNAMES.has(hostname)) {
    return {
      isValid: false,
      error: 'Security Alert: Access to localhost, loopback, or cloud metadata endpoints is blocked.'
    };
  }

  // 3. Reject private and link-local IP ranges (SSRF prevention)
  // IPv4 regexes:
  // 10.0.0.0/8
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return { isValid: false, error: 'Access to private RFC1918 (10.x.x.x) network is blocked.' };
  }
  // 172.16.0.0 - 172.31.255.255
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return { isValid: false, error: 'Access to private RFC1918 (172.16.x.x - 172.31.x.x) network is blocked.' };
  }
  // 192.168.0.0/16
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return { isValid: false, error: 'Access to private RFC1918 (192.168.x.x) network is blocked.' };
  }
  // 127.0.0.0/8
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return { isValid: false, error: 'Access to loopback range is blocked.' };
  }
  // 169.254.0.0/16 (Link Local / Cloud Metadata)
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return { isValid: false, error: 'Access to cloud instance metadata service is strictly blocked.' };
  }

  // 4. Disallow internal / test domains
  if (
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.lan')
  ) {
    return {
      isValid: false,
      error: 'Access to internal or local top-level domains is blocked.'
    };
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.toString()
  };
}
