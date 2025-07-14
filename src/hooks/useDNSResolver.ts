import { useState, useCallback } from 'react';
import { DNSResult, DOHProvider } from '../types';
import { resolveDNS } from '../utils/dnsResolver';
import { MAX_CONCURRENT_REQUESTS } from '../utils/constants';

interface UseDNSResolverProps {
  onProgress: (domain: string, result: DNSResult, index: number) => void;
}

export const useDNSResolver = ({ onProgress }: UseDNSResolverProps) => {
  const [isResolving, setIsResolving] = useState(false);

  const processDomainsInBatches = useCallback(async (
    domains: string[], 
    provider: DOHProvider
  ): Promise<DNSResult[]> => {
    const results: DNSResult[] = [];
    
    for (let i = 0; i < domains.length; i += MAX_CONCURRENT_REQUESTS) {
      const batch = domains.slice(i, i + MAX_CONCURRENT_REQUESTS);
      const batchPromises = batch.map(async (domain, batchIndex) => {
        const globalIndex = i + batchIndex;
        const delay = globalIndex * 200;
        
        setTimeout(() => {
          onProgress(domain, { domain, ip: null }, globalIndex);
        }, delay);
        
        const result = await resolveDNS(domain, provider);
        
        setTimeout(() => {
          onProgress(domain, result, globalIndex);
        }, delay + 1000);
        
        return result;
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      if (i + MAX_CONCURRENT_REQUESTS < domains.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }, [onProgress]);

  const resolveDomains = useCallback(async (
    domains: string[], 
    provider: DOHProvider
  ): Promise<DNSResult[]> => {
    setIsResolving(true);
    try {
      const results = await processDomainsInBatches(domains, provider);
      return results;
    } finally {
      setIsResolving(false);
    }
  }, [processDomainsInBatches]);

  return {
    isResolving,
    resolveDomains
  };
};