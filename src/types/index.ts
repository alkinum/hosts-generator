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
}

export interface PresetItem {
  title: string;
  value?: string | string[];  // Support both string and string array
  children?: PresetItem[];
}

export interface UserSettings {
  presetSourceUrl: string;
  customDnsProviders: DOHProvider[];
}