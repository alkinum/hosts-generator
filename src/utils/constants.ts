import { DOHProvider } from '../types';

export const DOH_PROVIDERS: DOHProvider[] = [
  { name: 'cloudflare', url: 'https://cloudflare-dns.com/dns-query', label: 'Cloudflare' },
  { name: 'google', url: 'https://dns.google/resolve', label: 'Google' },
  { name: 'quad9', url: 'https://dns.quad9.net:5053/dns-query', label: 'Quad9' },
  { name: 'brave', url: 'https://dns.brave.com/dns-query', label: 'Brave DNS' }
];

export const MAX_CONCURRENT_REQUESTS = 5;