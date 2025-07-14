import { ValidationResult } from '../types';
import { t, Language } from './i18n';

export const validateDomains = (input: string, language: Language): ValidationResult => {
  const errors: string[] = [];
  const validDomains: string[] = [];
  const lines = input.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  
  if (lines.length === 0) {
    errors.push(t('noValidDomains', language));
    return { domains: [], errors };
  }

  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  lines.forEach((line, index) => {
    const parts = line.split(/\s+/);
    let domain: string;
    
    // Check if it's a hosts file entry (IP domain) or just a domain
    if (parts.length >= 2 && ipRegex.test(parts[0])) {
      // Hosts file format: IP domain
      domain = parts[1];
    } else if (parts.length === 1) {
      // Just a domain
      domain = parts[0];
    } else {
      errors.push(`Line ${index + 1}: ${t('invalidFormat', language)} "${line}"`);
      return;
    }
    
    if (!domainRegex.test(domain)) {
      errors.push(`Line ${index + 1}: ${t('invalidDomainFormat', language)} "${domain}"`);
      return;
    }
    
    if (domain.length > 253) {
      errors.push(`Line ${index + 1}: ${t('domainTooLong', language)} "${domain}"`);
      return;
    }

    if (!validDomains.includes(domain)) {
      validDomains.push(domain);
    }
  });

  return { domains: validDomains, errors };
};