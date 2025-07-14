export interface DNSResult {
  domain: string;
  ip: string | null;
  error?: string;
}

export interface DOHProvider {
  name: string;
  url: string;
  label: string;
}

export interface ValidationResult {
  domains: string[];
  errors: string[];