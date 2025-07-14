import { useState, useEffect } from 'react';
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
  const { t } = useTranslation();
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

  // Update terminal when provider changes
  useEffect(() => {
    resetTerminal([]);
    
    // Add animated output with delays
    addToTerminal(`hosts-generator v${packageJson.version}`, 0);
    addToTerminal(`${t('generated.resolvedUsing', { provider: selectedProvider.label })}`, 200);
    addToTerminal('', 400);
    typeToTerminal(t('misc.ready'), 600);
    addToTerminal('', 1100);
  }, [selectedProvider, t]);

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

    const { domains: validDomains, errors } = validateDomains(domains);
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      addToTerminal('$ hosts-generator --validate', 0);
      addToTerminal('', 100);
      errors.forEach((error, index) => {
        addToTerminal(`✗ ${error}`, 200 + index * 100);
      });
      addToTerminal('', 200 + errors.length * 100);
      addToTerminal(t('validation.validationFailed'), 300 + errors.length * 100);
      return;
    }

    if (validDomains.length === 0) {
      addToTerminal(`✗ ${t('validation.noValidDomains')}`, 0);
      return;
    }

    setResults([]);

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
        
        // Save to history after successful resolution
        setTimeout(() => {
          saveToHistory();
        }, 1000);
      }, validDomains.length * 200 + 2000);
    } catch (error) {
      addToTerminal(`✗ ${t('dns.resolutionFailed')}`, 0);
    }
  };

  const generateHostsFile = () => {
    let content: string[] = [];
    
    if (!removeComments) {
      const header = includeLocalhost ? [
        `# ${t('generated.hostsFileGenerated')}`,
        `# ${t('generated.generatedOn')}: ${new Date().toISOString()}`,
        `# ${t('generated.resolvedUsing', { provider: selectedProvider.label })}`,
        '',
        `# ${t('generated.defaultLocalhostEntries')}`,
        '127.0.0.1 localhost',
        '::1 localhost',
        '',
        `# ${t('generated.customEntries')}`
      ] : [
        `# ${t('generated.hostsFileGenerated')}`,
        `# ${t('generated.generatedOn')}: ${new Date().toISOString()}`,
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

    const entries = results
      .filter(result => result.ip)
      .map(result => `${result.ip} ${result.domain}`);

    return [...content, ...entries].join('\n');
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

  // Window control handlers
  const handleClose = () => {
    if (window.confirm(t('misc.closeConfirm'))) {
      window.close();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

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
            providers={DOH_PROVIDERS}
            showProviderMenu={showProviderMenu}
            isResolving={isResolving}
            onProviderSelect={handleProviderSelect}
            onToggleProviderMenu={toggleProviderMenu}
            onShowHistory={() => setShowHistory(true)}
            isMinimized={isMinimized}
            onMinimize={handleMinimize}
            onClose={handleClose}
            onShowSettings={() => setShowSettings(true)}
          />

          <div className={`grid lg:grid-cols-3 gap-0 border-l border-r border-gray-700 transition-all duration-500 ease-in-out overflow-hidden ${
            isMinimized ? 'h-0 opacity-0 pointer-events-none' : 'h-auto opacity-100'
          }`}>
            <InputPanel
              domains={domains}
              isResolving={isResolving}
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
            includeLocalhost={includeLocalhost}
            removeComments={removeComments}
            onIncludeLocalhostChange={setIncludeLocalhost}
            onRemoveCommentsChange={setRemoveComments}
            onDownload={downloadHostsFile}
          />
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