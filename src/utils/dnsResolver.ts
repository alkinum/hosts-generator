import { DNSResult, DOHProvider } from '../types';

export const resolveDNS = async (domain: string, provider: DOHProvider): Promise<DNSResult> => {
  try {
    let url: string;
    let headers: Record<string, string>;

    if (provider.name === 'google') {
      url = `${provider.url}?name=${domain}&type=A`;
      headers = { 'Accept': 'application/json' };
    } else {
      url = `${provider.url}?name=${domain}&type=A`;
      headers = { 'Accept': 'application/dns-json' };
    }

    const response = await fetch(url, { headers });
    const data = await response.json();
    
    if (data.Answer && data.Answer.length > 0) {
      const ip = data.Answer.find((answer: any) => answer.type === 1)?.data;
      return { domain, ip: ip || null };
    } else {
      return { domain, ip: null, error: 'No A record found' };
    }
  } catch (error) {
    return { domain, ip: null, error: 'DNS resolution failed' };
  }
};