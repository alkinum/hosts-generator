import { ValidationResult } from '../types';

export const validateDomains = (input: string, t: (key: string) => string): ValidationResult => {
  const errors: string[] = [];
  const validDomains: string[] = [];
  const lines = input.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  
  if (lines.length === 0) {
    errors.push(t('validation.noValidDomains'));
    return { domains: [], errors };
  }

  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  const pureNumberRegex = /^\d+$/;
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  lines.forEach((line, index) => {
    const parts = line.split(/\s+/);
    let domain: string;
    
    if (parts.length >= 2 && ipRegex.test(parts[0])) {
      if (parts.length > 2) {
        errors.push(`Line ${index + 1}: ${t('validation.invalidFormat')} "${line}"`);
        return;
      }
      domain = parts[1];
    } else if (parts.length === 1) {
      domain = parts[0];
    } else {
      errors.push(`Line ${index + 1}: ${t('validation.invalidFormat')} "${line}"`);
      return;
    }
    
    if (domain.length > 253) {
      errors.push(`Line ${index + 1}: ${t('validation.domainTooLong')} "${domain}"`);
      return;
    }
    
    if (pureNumberRegex.test(domain)) {
      errors.push(`Line ${index + 1}: ${t('validation.invalidDomainFormat')} "${domain}"`);
      return;
    }
    
    if (/^\d/.test(domain)) {
      errors.push(`Line ${index + 1}: ${t('validation.invalidDomainFormat')} "${domain}"`);
      return;
    }
    
    if (domain.includes('..')) {
      errors.push(`Line ${index + 1}: ${t('validation.invalidDomainFormat')} "${domain}"`);
      return;
    }
    
    if (domain.startsWith('.') || domain.endsWith('.')) {
      errors.push(`Line ${index + 1}: ${t('validation.invalidDomainFormat')} "${domain}"`);
      return;
    }
    
    if (!domainRegex.test(domain)) {
      errors.push(`Line ${index + 1}: ${t('validation.invalidDomainFormat')} "${domain}"`);
      return;
    }
    
    if (!validDomains.includes(domain)) {
      validDomains.push(domain);
    }
  });

  return { domains: validDomains, errors };
};