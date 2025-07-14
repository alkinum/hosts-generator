import React, { useState, useEffect, useRef } from 'react';
import { Download, Copy, Settings, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { HistorySidebar } from './components/HistorySidebar';
import { historyDB } from './utils/indexedDB';

interface DNSResult {
  domain: string;
  ip: string | null;
  error?: string;
}

interface DOHProvider {
  name: string;
  url: string;
  label: string;
}

const DOH_PROVIDERS: DOHProvider[] = [
  { name: 'cloudflare', url: 'https://cloudflare-dns.com/dns-query', label: 'Cloudflare' },
  { name: 'google', url: 'https://dns.google/resolve', label: 'Google' },
  { name: 'quad9', url: 'https://dns.quad9.net:5053/dns-query', label: 'Quad9' },
  { name: 'brave', url: 'https://dns.brave.com/dns-query', label: 'Brave DNS' }
];

const MAX_CONCURRENT_REQUESTS = 5;

function App() {
  const [domains, setDomains] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [results, setResults] = useState<DNSResult[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<DOHProvider>(DOH_PROVIDERS[0]);
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [includeLocalhost, setIncludeLocalhost] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const providerMenuRef = useRef<HTMLDivElement>(null);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    // Initialize IndexedDB
    historyDB.init().catch(console.error);
    
    setTerminalOutput([
      'hosts-generator v2.1.0',
      `DNS resolution via ${selectedProvider.label}`,
      '',
      'Ready to process domains...',
      ''
    ]);
  }, [selectedProvider]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (providerMenuRef.current && !providerMenuRef.current.contains(event.target as Node)) {
        setShowProviderMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const validateDomains = (input: string): { domains: string[], errors: string[] } => {
    const errors: string[] = [];
    const validDomains: string[] = [];
    const lines = input.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    if (lines.length === 0) {
      errors.push('No valid domains found');
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
        errors.push(`Line ${index + 1}: Invalid format "${line}"`);
        return;
      }
      
      if (!domainRegex.test(domain)) {
        errors.push(`Line ${index + 1}: Invalid domain format "${domain}"`);
        return;
      }
      
      if (domain.length > 253) {
        errors.push(`Line ${index + 1}: Domain too long "${domain}"`);
        return;
      }

      if (!validDomains.includes(domain)) {
        validDomains.push(domain);
      }
    });

    return { domains: validDomains, errors };
  };

  const addToTerminal = (line: string, delay = 0) => {
    setTimeout(() => {
      setTerminalOutput(prev => [...prev, line]);
    }, delay);
  };

  const typeToTerminal = (text: string, delay = 0) => {
    setTimeout(() => {
      setCurrentLine('');
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setCurrentLine(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setTerminalOutput(prev => [...prev, text]);
            setCurrentLine('');
          }, 500);
        }
      }, 30);
    }, delay);
  };

  const resolveDNS = async (domain: string): Promise<DNSResult> => {
    try {
      let url: string;
      let headers: Record<string, string>;

      if (selectedProvider.name === 'google') {
        url = `${selectedProvider.url}?name=${domain}&type=A`;
        headers = { 'Accept': 'application/json' };
      } else {
        url = `${selectedProvider.url}?name=${domain}&type=A`;
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

  const processDomainsInBatches = async (domains: string[]): Promise<DNSResult[]> => {
    const results: DNSResult[] = [];
    
    for (let i = 0; i < domains.length; i += MAX_CONCURRENT_REQUESTS) {
      const batch = domains.slice(i, i + MAX_CONCURRENT_REQUESTS);
      const batchPromises = batch.map(async (domain, batchIndex) => {
        const globalIndex = i + batchIndex;
        const delay = globalIndex * 200; // Stagger the visual updates
        
        setTimeout(() => {
          typeToTerminal(`Resolving ${domain}...`, 0);
        }, delay);
        
        const result = await resolveDNS(domain);
        
        setTimeout(() => {
          if (result.ip) {
            addToTerminal(`✓ ${domain} → ${result.ip}`, 0);
          } else {
            addToTerminal(`✗ ${domain} → ${result.error || 'Failed'}`, 0);
          }
        }, delay + 1000);
        
        return result;
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + MAX_CONCURRENT_REQUESTS < domains.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  };

  const saveToHistory = async () => {
    if (results.length === 0) return;
    
    try {
      await historyDB.addRecord({
        inputContent: domains,
        outputContent: generateHostsFile(),
        timestamp: Date.now(),
        successCount: results.filter(r => r.ip).length,
        totalCount: results.length,
        provider: selectedProvider.label
      });
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  };

  const handleResolve = async () => {
    if (!domains.trim()) return;

    const { domains: validDomains, errors } = validateDomains(domains);
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      addToTerminal('$ hosts-generator --validate', 0);
      addToTerminal('', 100);
      errors.forEach((error, index) => {
        addToTerminal(`✗ ${error}`, 200 + index * 100);
      });
      addToTerminal('', 200 + errors.length * 100);
      addToTerminal('Validation failed. Please fix errors and try again.', 300 + errors.length * 100);
      return;
    }

    if (validDomains.length === 0) {
      addToTerminal('✗ No valid domains to resolve', 0);
      return;
    }

    setIsResolving(true);
    setResults([]);

    addToTerminal(`$ hosts-generator --resolve --provider=${selectedProvider.name}`, 0);
    addToTerminal('', 100);
    typeToTerminal('Initializing DNS resolver...', 200);
    addToTerminal(`Found ${validDomains.length} domains to resolve`, 1500);
    addToTerminal(`Using ${selectedProvider.label} DNS over HTTPS`, 1600);
    addToTerminal(`Max concurrent requests: ${MAX_CONCURRENT_REQUESTS}`, 1700);
    addToTerminal('', 1800);

    try {
      const resolvedResults = await processDomainsInBatches(validDomains);
      
      setTimeout(() => {
        addToTerminal('', 500);
        addToTerminal('DNS resolution completed.', 600);
        addToTerminal(`Successfully resolved ${resolvedResults.filter(r => r.ip).length}/${validDomains.length} domains`, 700);
        setResults(resolvedResults);
        setIsResolving(false);
        
        // Save to history after successful resolution
        setTimeout(() => {
          saveToHistory();
        }, 1000);
      }, validDomains.length * 200 + 2000);
    } catch (error) {
      addToTerminal('✗ Resolution process failed', 0);
      setIsResolving(false);
    }
  };

  const generateHostsFile = () => {
    const header = includeLocalhost ? [
      '# Hosts file generated by hosts-generator',
      `# Generated on: ${new Date().toISOString()}`,
      `# Resolved using ${selectedProvider.label} DNS over HTTPS`,
      '',
      '# Default localhost entries',
      '127.0.0.1 localhost',
      '::1 localhost',
      '',
      '# Custom entries'
    ] : [
      '# Hosts file generated by hosts-generator',
      `# Generated on: ${new Date().toISOString()}`,
      `# Resolved using ${selectedProvider.label} DNS over HTTPS`,
      '',
      '# Custom entries'
    ];

    const entries = results
      .filter(result => result.ip)
      .map(result => `${result.ip} ${result.domain}`);

    return [...header, ...entries].join('\n');
  };

  const downloadHostsFile = () => {
    const content = generateHostsFile();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hosts';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateHostsFile());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearAll = () => {
    setDomains('');
    setTerminalOutput([
      'hosts-generator v2.1.0',
      `DNS resolution via ${selectedProvider.label}`,
      '',
      'Ready to process domains...',
      ''
    ]);
    setCurrentLine('');
    setResults([]);
    setValidationErrors([]);
  };

  const hasResults = results.length > 0;
  const successCount = results.filter(r => r.ip).length;
  const errorCount = results.filter(r => !r.ip).length;

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden select-none">
      {/* Sci-fi Background Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Animated Lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-green-500 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Bar */}
          <div className="bg-gray-900 border border-gray-700 rounded-t-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 text-sm">hosts-generator</span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* History Button */}
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors select-none"
                disabled={isResolving}
              >
                <Clock className="w-3 h-3" />
                <span>历史</span>
              </button>
              
              {/* DNS Provider Selector */}
              <div className="relative" ref={providerMenuRef}>
                <button
                  onClick={() => setShowProviderMenu(!showProviderMenu)}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors select-none"
                  disabled={isResolving}
                >
                  <Settings className="w-3 h-3" />
                  <span>{selectedProvider.label}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </button>
                
                {showProviderMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-20 min-w-32">
                    {DOH_PROVIDERS.map((provider) => (
                      <button
                        key={provider.name}
                        onClick={() => {
                          setSelectedProvider(provider);
                          setShowProviderMenu(false);
                        }}
                        className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-700 transition-colors select-none ${
                          selectedProvider.name === provider.name ? 'text-green-400' : 'text-gray-300'
                        }`}
                      >
                        {provider.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-0 border-l border-r border-gray-700">
            {/* Input Panel */}
            <div className="bg-gray-900 border-r border-gray-700 p-4">
              <div className="mb-3">
                <div className="text-green-500 text-sm mb-1">INPUT</div>
                <div className="text-gray-400 text-xs mb-3">Enter domains or hosts entries</div>
              </div>
              
              <textarea
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
                placeholder="example.com&#10;google.com&#10;github.com&#10;&#10;# Or paste hosts entries:&#10;127.0.0.1 localhost"
                className="w-full h-56 bg-black border border-gray-600 rounded p-3 text-green-400 text-sm placeholder-gray-600 focus:border-green-500 focus:outline-none resize-none select-text"
                disabled={isResolving}
              />
              
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span className="select-text">{error}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-3 space-y-2">
                <button
                  onClick={handleResolve}
                  disabled={isResolving || !domains.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium py-2 px-4 rounded text-sm transition-colors select-none"
                >
                  {isResolving ? 'RESOLVING...' : 'RESOLVE DOMAINS'}
                </button>
                
                <button
                  onClick={clearAll}
                  disabled={isResolving}
                  className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 py-2 px-4 rounded text-sm transition-colors select-none"
                >
                  CLEAR
                </button>
              </div>

              {/* Stats */}
              {hasResults && (
                <div className="mt-4 space-y-2 text-xs">
                  <div className="text-green-500 mb-2">STATISTICS</div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Success:</span>
                    <span className="text-green-400">{successCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Failed:</span>
                    <span className="text-red-400">{errorCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-blue-400">{results.length}</span>
                  </div>
                  
                  {successCount > 0 && (
                    <button
                      onClick={downloadHostsFile}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2 select-none"
                    >
                      <Download className="w-3 h-3" />
                      DOWNLOAD HOSTS
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Terminal Output */}
            <div className="lg:col-span-2 bg-black p-4 border-r border-gray-700">
              <div className="mb-3">
                <div className="text-green-500 text-sm mb-1">OUTPUT</div>
                <div className="text-gray-400 text-xs mb-3">Real-time resolution log</div>
              </div>
              
              <div className="h-80 overflow-y-auto bg-gray-950 border border-gray-800 rounded p-3 text-sm">
                {terminalOutput.map((line, index) => (
                  <div key={index} className="mb-1 leading-relaxed">
                    {line.startsWith('✓') ? (
                      <span className="text-green-400">{line}</span>
                    ) : line.startsWith('✗') ? (
                      <span className="text-red-400">{line}</span>
                    ) : line.startsWith('$') ? (
                      <span className="text-blue-400">{line}</span>
                    ) : line.startsWith('#') ? (
                      <span className="text-gray-500">{line}</span>
                    ) : (
                      <span className="text-gray-300">{line}</span>
                    )}
                  </div>
                ))}
                {currentLine && (
                  <div className="text-gray-300 leading-relaxed">
                    {currentLine}
                    {showCursor && <span className="bg-green-400 text-black">█</span>}
                  </div>
                )}
                {!currentLine && (
                  <div className="text-gray-300 leading-relaxed">
                    {showCursor && <span className="bg-green-400 text-black animate-pulse">█</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-900 border-l border-r border-b border-gray-700 rounded-b-lg p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-green-500 text-sm mb-1">PREVIEW</div>
                <div className="text-gray-400 text-xs mb-3">Generated hosts file content</div>
              </div>
              
              {hasResults && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-gray-400 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeLocalhost}
                      onChange={(e) => setIncludeLocalhost(e.target.checked)}
                      className="w-3 h-3 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                    />
                    Include localhost entries
                  </label>
                  
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-3 rounded text-xs transition-colors select-none"
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <pre className="bg-black border border-gray-800 rounded p-3 text-xs overflow-x-auto max-h-40 overflow-y-auto min-h-28">
              <code className="text-gray-300 leading-relaxed select-text">
                {hasResults ? generateHostsFile() : '# No hosts entries generated yet\n# Resolve some domains to see the output here'}
              </code>
            </pre>
          </div>
        </div>
      </div>
      
      {/* History Sidebar */}
      <HistorySidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoadRecord={(inputContent) => {
          setDomains(inputContent);
          setShowHistory(false);
        }}
      />
    </div>
  );
}

export default App;