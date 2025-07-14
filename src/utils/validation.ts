import { useTranslation } from 'react-i18next';
import { ValidationResult } from '../types';

export const validateDomains = (input: string): ValidationResult => {
  const { t } = useTranslation();
  const errors: string[] = [];
  const validDomains: string[] = [];
  const lines = input.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  
  if (lines.length === 0) {
    errors.push(t('validation.noValidDomains'));
    return { domains: [], errors };
  }

  // Enhanced domain regex that requires at least one dot and doesn't allow pure numbers
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  const pureNumberRegex = /^\d+$/;
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  lines.forEach((line, index) => {
    const parts = line.split(/\s+/);
    let domain: string;
    
    // Check if it's a hosts file entry (IP domain) or just a domain
    if (parts.length >= 2 && ipRegex.test(parts[0])) {
      // Hosts file format: IP domain - reject if more than 2 parts
      if (parts.length > 2) {
        errors.push(`Line ${index + 1}: ${t('validation.invalidFormat')} "${line}"`);
        return;
      }
      domain = parts[1];
    } else if (parts.length === 1) {
      // Just a domain
      domain = parts[0];
    } else {
      errors.push(`Line ${index + 1}: ${t('validation.invalidFormat')} "${line}"`);
      return;
    }
    
    // Check domain length first
    if (domain.length > 253) {
      errors.push(`Line ${index + 1}: ${t('validation.domainTooLong')} "${domain}"`);
      return;
    }
    
    // Additional validation checks
    if (pureNumberRegex.test(domain)) {
      errors.push(`Line ${index + 1}: ${t('validation.invalidDomainFormat')} "${domain}"`);
      return;
    }
    
    // Check for domains starting with numbers (like 123example.com)
    if (/^\d/.test(domain)) {
      errors.push(`Line ${index + 1}: ${t('validation.invalidDomainFormat')} "${domain}"`);
      return;
    }
    
    // Check for domains with consecutive dots
    if (domain.includes('..')) {
      errors.push(`Line ${index + 1}: ${t('validation.invalidDomainFormat')} "${domain}"`);
      return;
    }
    
    // Check for domains starting or ending with dots
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