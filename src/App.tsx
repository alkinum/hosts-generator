import { Github } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BackgroundEffects } from './components/BackgroundEffects';
import { HeaderBar } from './components/HeaderBar';
import { InputPanel } from './components/InputPanel';
import { TerminalOutput } from './components/TerminalOutput';
import { PreviewSection } from './components/PreviewSection';
import { HistorySidebar } from './components/HistorySidebar';
import { SettingsModal } from './components/SettingsModal';
import { useTerminal } from './hooks/useTerminal';
import { useDNSResolver } from './hooks/useDNSResolver';
import { validateDomains } from './utils/validation';
import { historyDB } from './utils/indexedDB';
import { loadSettings, saveSettings } from './utils/settings';
import { fetchPresets } from './utils/presets';
import { DOH_PROVIDERS } from './utils/constants';
import { DNSResult, DOHProvider, PresetItem, UserSettings } from './types';
import packageJson from '../package.json';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [domains, setDomains] = useState('');
  const [results, setResults] = useState<DNSResult[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<DOHProvider>(DOH_PROVIDERS[0]);
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [includeLocalhost, setIncludeLocalhost] = useState(false);
  const [removeComments, setRemoveComments] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [allProviders, setAllProviders] = useState<DOHProvider[]>([...DOH_PROVIDERS]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [generationTimestamp, setGenerationTimestamp] = useState<string | null>(null);
  const [isFullyResolving, setIsFullyResolving] = useState<boolean>(false);

  // Update providers when settings change
  useEffect(() => {
    const combinedProviders = [...DOH_PROVIDERS, ...settings.customDnsProviders];
    setAllProviders(combinedProviders);

    // If current selected provider is no longer available, reset to first provider
    if (!combinedProviders.find(p => p.name === selectedProvider.name)) {
      setSelectedProvider(combinedProviders[0]);
    }
  }, [settings.customDnsProviders, selectedProvider.name]);

  const {
    terminalOutput,
    currentLine,
    addToTerminal,
    typeToTerminal,
    resetTerminal
  } = useTerminal([]);

  const { isResolving, resolveDomains } = useDNSResolver({
    onProgress: () => {}
  });

  // Initialize IndexedDB and initial terminal output
  useEffect(() => {
    historyDB.init().catch(console.error);
  }, []);

  // Initialize terminal output once and update when provider changes
  useEffect(() => {
    if (!i18n.isInitialized) return;

    resetTerminal([]);

    // Store timeout IDs for cleanup
    const timeouts: number[] = [];

    // Add animated output with delays
    timeouts.push(setTimeout(() => addToTerminal(`hosts-generator v${packageJson.version}`), 0));
    timeouts.push(setTimeout(() => addToTerminal(`${t('generated.resolvedUsing', { provider: selectedProvider.label })}`), 200));
    timeouts.push(setTimeout(() => addToTerminal(''), 400));
    timeouts.push(setTimeout(() => typeToTerminal(t('misc.ready')), 600));
    timeouts.push(setTimeout(() => addToTerminal(''), 1100));

    // Cleanup function to clear all timeouts
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [selectedProvider, i18n.isInitialized, addToTerminal, typeToTerminal, resetTerminal, t]);

  const saveToHistory = async (resolvedResults: DNSResult[], inputContent: string) => {
    if (resolvedResults.length === 0) return;

    try {
      const hostsContent = generateHostsFileContent(resolvedResults, generationTimestamp || undefined);
      await historyDB.addRecord({
        inputContent: inputContent,
        outputContent: hostsContent,
        timestamp: Date.now(),
        successCount: resolvedResults.filter(r => r.ip).length,
        totalCount: resolvedResults.length,
        provider: selectedProvider.label
      });
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  };

  const generateHostsFileContent = (resolvedResults: DNSResult[], timestamp?: string) => {
    const generationTime = timestamp || new Date().toISOString();
    let content: string[] = [];

    if (!removeComments) {
      const header = includeLocalhost ? [
        `# ${t('generated.hostsFileGenerated')}`,
        `# ${t('generated.generatedOn')}: ${generationTime}`,
        `# ${t('generated.resolvedUsing', { provider: selectedProvider.label })}`,
        '',
        `# ${t('generated.defaultLocalhostEntries')}`,
        '127.0.0.1 localhost',
        '::1 localhost',
        '',
        `# ${t('generated.customEntries')}`
      ] : [
        `# ${t('generated.hostsFileGenerated')}`,
        `# ${t('generated.generatedOn')}: ${generationTime}`,
        `# ${t('generated.resolvedUsing', { provider: selectedProvider.label })}`,
        '',
        `# ${t('generated.customEntries')}`
      ];
      content = [...header];
    } else if (includeLocalhost) {
      content = [
        '127.0.0.1 localhost',
        '::1 localhost'
      ];
    }

    const entries = resolvedResults
      .filter(result => result.ip)
      .map(result => `${result.ip} ${result.domain}`);

    return [...content, ...entries].join('\n');
  };

  // Check connection status with interval
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const testDomain = 'google.com';
        const dnsQuery = `${selectedProvider.url}?name=${testDomain}&type=A`;

        const response = await fetch(dnsQuery, {
          method: 'GET',
          headers: {
            'Accept': 'application/dns-json',
          },
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
          setIsConnected(false);
          return;
        }

        const data = await response.json();

        if (!data || typeof data !== 'object' || !('Status' in data)) {
          setIsConnected(false);
          return;
        }

        if (data.Status !== 0) {
          setIsConnected(false);
          return;
        }

        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 300000);

    return () => clearInterval(interval);
  }, [selectedProvider.url]);

  // Load presets when settings change or on initial load
  useEffect(() => {
    const loadPresets = async () => {
      if (settings.presetSourceUrl) {
        try {
          const fetchedPresets = await fetchPresets(settings.presetSourceUrl);
          setPresets(fetchedPresets);
          addToTerminal(`✓ ${t('settings.fetchPresetsSuccess')}`, 0);
        } catch (error) {
          console.error('Failed to fetch presets:', error);
          addToTerminal(`✗ ${t('settings.fetchPresetsFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`, 0);
          setPresets([]);
        }
      } else {
        setPresets([]);
      }
    };

    loadPresets();
  }, [settings.presetSourceUrl, addToTerminal, t]);

  const handleSaveSettings = async (newSettings: UserSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleResolve = async () => {
    if (!domains.trim()) return;

    setIsFullyResolving(true);

    const { domains: validDomains, errors } = validateDomains(domains, t);
    setValidationErrors(errors);

    if (errors.length > 0) {
      addToTerminal('$ hosts-generator --validate', 0);
      addToTerminal('', 100);
      errors.forEach((error, index) => {
        addToTerminal(`✗ ${error}`, 200 + index * 100);
      });
      addToTerminal('', 200 + errors.length * 100);
      addToTerminal(t('validation.validationFailed'), 300 + errors.length * 100);
      setIsFullyResolving(false);
      return;
    }

    if (validDomains.length === 0) {
      addToTerminal(`✗ ${t('validation.noValidDomains')}`, 0);
      setIsFullyResolving(false);
      return;
    }

    setResults([]);
    setGenerationTimestamp(null);

    const timestamp = new Date().toISOString();
    setGenerationTimestamp(timestamp);

    addToTerminal(`$ hosts-generator --resolve --provider=${selectedProvider.name}`, 0);
    addToTerminal('', 100);
    typeToTerminal(t('dns.initializingResolver'), 200);
    addToTerminal(t('dns.foundDomains', { count: validDomains.length }), 1500);
    addToTerminal(t('dns.usingProvider', { provider: selectedProvider.label }), 1600);
    addToTerminal(t('dns.maxConcurrentRequests'), 1700);
    addToTerminal('', 1800);

    try {
      const resolvedResults = await resolveDomains(validDomains, selectedProvider);

      setTimeout(() => {
        addToTerminal('', 500);
        addToTerminal(t('dns.resolutionCompleted'), 600);
        addToTerminal(t('dns.successfullyResolved', { success: resolvedResults.filter(r => r.ip).length, total: validDomains.length }), 700);
        setResults(resolvedResults);

        // Save to history immediately after setting results
        saveToHistory(resolvedResults, domains);

        // Mark resolution as complete after all terminal output
        setIsFullyResolving(false);
      }, validDomains.length * 200 + 2000);
    } catch (error) {
      addToTerminal(`✗ ${t('dns.resolutionFailed')}`, 0);
      setIsFullyResolving(false);
    }
  };

  const generateHostsFile = () => {
    return generateHostsFileContent(results);
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

  const clearAll = () => {
    setDomains('');
    resetTerminal([
      `hosts-generator v${packageJson.version}`,
      `${t('generated.resolvedUsing', { provider: selectedProvider.label })}`,
      '',
      t('misc.ready'),
      ''
    ]);
    setResults([]);
    setGenerationTimestamp(null);
    setValidationErrors([]);
  };

  const handleProviderSelect = (provider: DOHProvider) => {
    setSelectedProvider(provider);
    setShowProviderMenu(false);
  };

  const toggleProviderMenu = () => {
    if (showProviderMenu) {
      setShowProviderMenu(false);
    } else {
      setShowProviderMenu(true);
    }
  };

  const closeProviderMenu = () => {
    setShowProviderMenu(false);
  };

  // Window control handlers
  const handleClose = () => {
    if (window.confirm(t('misc.closeConfirm'))) {
      window.close();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handlePresetSelect = (value: string) => {
    setDomains(value);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden select-none">
      <BackgroundEffects />

      <div className={`relative z-10 transition-all duration-500 ease-in-out ${
        isMinimized
          ? 'p-4 max-w-fit mx-0'
          : 'p-4'
      }`}>
        <div className={`transition-all duration-500 ease-in-out ${
          isMinimized
            ? 'max-w-fit'
            : 'max-w-7xl mx-auto'
        }`}>
          <HeaderBar
            selectedProvider={selectedProvider}
            providers={allProviders}
            showProviderMenu={showProviderMenu}
            isResolving={isResolving}
            providerConnected={isConnected}
            isFullscreen={isFullscreen}
            onProviderSelect={handleProviderSelect}
            onToggleProviderMenu={toggleProviderMenu}
            onCloseProviderMenu={closeProviderMenu}
            onShowHistory={() => setShowHistory(true)}
            isMinimized={isMinimized}
            onMinimize={handleMinimize}
            onClose={handleClose}
            onShowSettings={() => setShowSettings(true)}
            onToggleFullscreen={handleToggleFullscreen}
          />

          <div className={`grid lg:grid-cols-3 gap-0 border-l border-r border-gray-700 transition-all duration-500 ease-in-out overflow-hidden ${
            isMinimized ? 'h-0 opacity-0 pointer-events-none' : 'h-auto opacity-100'
          }`}>
            <InputPanel
              domains={domains}
              isResolving={isFullyResolving}
              validationErrors={validationErrors}
              presets={presets}
              onDomainsChange={setDomains}
              onResolve={handleResolve}
              onClear={clearAll}
              onPresetSelect={handlePresetSelect}
            />

            <TerminalOutput
              terminalOutput={terminalOutput}
              currentLine={currentLine}
            />
          </div>

          <PreviewSection
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isMinimized ? 'h-0 opacity-0 pointer-events-none' : 'h-auto opacity-100'
            }`}
            results={results}
            selectedProvider={selectedProvider}
            generationTimestamp={generationTimestamp}
            includeLocalhost={includeLocalhost}
            removeComments={removeComments}
            onIncludeLocalhostChange={setIncludeLocalhost}
            onRemoveCommentsChange={setRemoveComments}
            onDownload={downloadHostsFile}
          />

          {/* Footer */}
          <div className={`bg-gray-900 border-l border-r border-t border-b border-gray-700 rounded-b-lg px-3 py-2 flex items-center justify-between transition-all duration-500 ease-in-out ${
            isMinimized ? 'h-0 opacity-0 pointer-events-none border-0' : 'h-auto opacity-100'
          }`}>
            <div className="flex items-center text-[0.625rem] text-gray-400">
              <span>Made by Alkinum</span>
            </div>
            <a
              href="https://github.com/alkinum/hosts-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-800/50 rounded transition-all duration-200 hover:scale-110"
              title="View on GitHub"
            >
              <Github size={14} />
            </a>
          </div>
        </div>
      </div>

      <HistorySidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoadRecord={(inputContent) => {
          setDomains(inputContent);
          setShowHistory(false);
        }}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

export default App;