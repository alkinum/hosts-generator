import { describe, it, expect } from 'vitest';
import { validateDomains } from '../utils/validation';

describe('validateDomains', () => {
  describe('valid domains', () => {
    it('should accept valid single domain', () => {
      const result = validateDomains('example.com');
      expect(result.domains).toEqual(['example.com']);
      expect(result.errors).toEqual([]);
    });

    it('should accept multiple valid domains', () => {
      const result = validateDomains('example.com\ngoogle.com\nfacebook.com');
      expect(result.domains).toEqual(['example.com', 'google.com', 'facebook.com']);
      expect(result.errors).toEqual([]);
    });

    it('should accept domains with subdomains', () => {
      const result = validateDomains('sub.example.com\napi.service.com');
      expect(result.domains).toEqual(['sub.example.com', 'api.service.com']);
      expect(result.errors).toEqual([]);
    });

    it('should accept hosts file format (IP + domain)', () => {
      const result = validateDomains('127.0.0.1 example.com\n192.168.1.1 local.test');
      expect(result.domains).toEqual(['example.com', 'local.test']);
      expect(result.errors).toEqual([]);
    });

    it('should handle mixed formats', () => {
      const result = validateDomains('example.com\n127.0.0.1 blocked.com\ntest.org');
      expect(result.domains).toEqual(['example.com', 'blocked.com', 'test.org']);
      expect(result.errors).toEqual([]);
    });

    it('should ignore comments and empty lines', () => {
      const result = validateDomains('example.com\n# This is a comment\n\n   \ntest.com');
      expect(result.domains).toEqual(['example.com', 'test.com']);
      expect(result.errors).toEqual([]);
    });

    it('should remove duplicates', () => {
      const result = validateDomains('example.com\nexample.com\ntest.com');
      expect(result.domains).toEqual(['example.com', 'test.com']);
      expect(result.errors).toEqual([]);
    });
  });

  describe('invalid domains', () => {
    it('should reject empty input', () => {
      const result = validateDomains('');
      expect(result.domains).toEqual([]);
      expect(result.errors).toEqual(['validation.noValidDomains']);
    });

    it('should reject input with only comments', () => {
      const result = validateDomains('# Comment 1\n# Comment 2');
      expect(result.domains).toEqual([]);
      expect(result.errors).toEqual(['validation.noValidDomains']);
    });

    it('should reject pure numbers', () => {
      const result = validateDomains('123\n456');
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain('Line 1: validation.invalidDomainFormat "123"');
      expect(result.errors).toContain('Line 2: validation.invalidDomainFormat "456"');
    });

    it('should reject domains starting with numbers', () => {
      const result = validateDomains('123example.com');
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain('Line 1: validation.invalidDomainFormat "123example.com"');
    });

    it('should reject domains with invalid characters', () => {
      const result = validateDomains('example$.com\ntest_domain.com');
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain('Line 1: validation.invalidDomainFormat "example$.com"');
      expect(result.errors).toContain('Line 2: validation.invalidDomainFormat "test_domain.com"');
    });

    it('should reject domains starting with dash', () => {
      const result = validateDomains('-example.com');
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain('Line 1: validation.invalidDomainFormat "-example.com"');
    });

    it('should reject domains ending with dash', () => {
      const result = validateDomains('example-.com');
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain('Line 1: validation.invalidDomainFormat "example-.com"');
    });

    it('should reject domains that are too long', () => {
      const longDomain = 'a'.repeat(254) + '.com';
      const result = validateDomains(longDomain);
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain(`Line 1: validation.domainTooLong "${longDomain}"`);
    });

    it('should reject invalid IP addresses in hosts format', () => {
      const result = validateDomains('999.999.999.999 example.com');
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain('Line 1: validation.invalidFormat "999.999.999.999 example.com"');
    });

    it('should reject malformed hosts entries', () => {
      const result = validateDomains('127.0.0.1 example.com extra.part');
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain('Line 1: validation.invalidFormat "127.0.0.1 example.com extra.part"');
    });

    it('should reject domains with double dots', () => {
      const result = validateDomains('example..com');
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain('Line 1: validation.invalidDomainFormat "example..com"');
    });

    it('should reject domains starting with dot', () => {
      const result = validateDomains('.example.com');
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain('Line 1: validation.invalidDomainFormat ".example.com"');
    });

    it('should reject domains ending with dot', () => {
      const result = validateDomains('example.com.');
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain('Line 1: validation.invalidDomainFormat "example.com."');
    });

    it('should reject single character domains', () => {
      const result = validateDomains('a');
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain('Line 1: validation.invalidDomainFormat "a"');
    });

    it('should reject domains with only special characters', () => {
      const result = validateDomains('-.!');
      expect(result.domains).toEqual([]);
      expect(result.errors).toContain('Line 1: validation.invalidDomainFormat "-.!"');
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace around domains', () => {
      const result = validateDomains('  example.com  \n  test.com  ');
      expect(result.domains).toEqual(['example.com', 'test.com']);
      expect(result.errors).toEqual([]);
    });

    it('should handle tabs and multiple spaces', () => {
      const result = validateDomains('127.0.0.1\t\texample.com');
      expect(result.domains).toEqual(['example.com']);
      expect(result.errors).toEqual([]);
    });

    it('should handle minimum valid domain length', () => {
      const result = validateDomains('a.b');
      expect(result.domains).toEqual(['a.b']);
      expect(result.errors).toEqual([]);
    });

    it('should handle maximum valid domain length', () => {
      const maxDomain = 'a'.repeat(61) + '.' + 'b'.repeat(61) + '.' + 'c'.repeat(61) + '.' + 'd'.repeat(61) + '.com';
      const result = validateDomains(maxDomain);
      expect(result.domains).toEqual([maxDomain]);
      expect(result.errors).toEqual([]);
    });
  });
});
