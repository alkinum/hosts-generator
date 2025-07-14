import React from 'react';
import { AlertCircle } from 'lucide-react';
import { DNSResult, PresetItem } from '../types';
import { PresetDropdown } from './PresetDropdown';
import { t, Language } from '../utils/i18n';

interface InputPanelProps {
  domains: string;
  isResolving: boolean;
  validationErrors: string[];
  results: DNSResult[];
  presets: PresetItem[];
  language: Language;
  onDomainsChange: (value: string) => void;
  onResolve: () => void;
  onClear: () => void;
  onDownload: () => void;
  onPresetSelect: (value: string) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  domains,
  isResolving,
  validationErrors,
  results,
  presets,
  language,
  onDomainsChange,
  onResolve,
  onClear,
  onDownload,
  onPresetSelect
}) => {
  const hasPresets = presets.length > 0;
  const hasResults = results.length > 0;
  const successCount = results.filter(r => r.ip).length;
  const errorCount = results.filter(r => !r.ip).length;

  return (
    <div className="bg-gray-900 border-r border-gray-700 p-4">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-green-500 text-sm select-none">{t('input', language)}</div>
          {hasPresets && (
            <PresetDropdown
              presets={presets}
              onSelect={onPresetSelect}
              language={language}
              disabled={isResolving}
            />
          )}
        </div>
        <div className="text-gray-400 text-xs mb-3 select-none">{t('inputDescription', language)}</div>
      </div>
      
      <textarea
        value={domains}
        onChange={(e) => onDomainsChange(e.target.value)}
        placeholder={t('inputPlaceholder', language)}
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
          onClick={onResolve}
          disabled={isResolving || !domains.trim()}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium py-2 px-4 rounded text-sm transition-colors select-none"
        >
          {isResolving ? t('resolving', language) : t('resolveDomains', language)}
        </button>
        
        <button
          onClick={onClear}
          disabled={isResolving}
          className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 py-2 px-4 rounded text-sm transition-colors select-none"
        >
          {t('clear', language)}
        </button>
      </div>
    </div>
  );
};