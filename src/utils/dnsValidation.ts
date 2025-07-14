import { DOHProvider } from '../types';

export const validateDnsProvider = async (provider: DOHProvider): Promise<{ valid: boolean; error?: string }> => {
  try {
    // Validate URL format first (this is already done in the component, but kept for completeness)
    const url = new URL(provider.url);
    if (!url.protocol.startsWith('https')) {
      return { valid: false, error: 'DNS provider must use HTTPS' };
    }

    // Test DNS query to validate provider
    const testDomain = 'google.com';
    const dnsQuery = `${provider.url}?name=${testDomain}&type=A`;
    
    const response = await fetch(dnsQuery, {
      method: 'GET',
      headers: {
        'Accept': 'application/dns-json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return { valid: false, error: `DNS provider returned ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object' || !('Status' in data)) {
      return { valid: false, error: 'Invalid DNS response format' };
    }

    if (data.Status !== 0) {
      return { valid: false, error: `DNS query failed with status ${data.Status}` };
    }

    if (!data.Answer || !Array.isArray(data.Answer) || data.Answer.length === 0) {
      return { valid: false, error: 'DNS provider returned no answers' };
    }

    return { valid: true };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      return { valid: false, error: 'Invalid URL format' };
    }
    if (error instanceof Error && error.name === 'AbortError') {
      return { valid: false, error: 'DNS provider request timed out' };
    }
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown validation error' };
  }
};