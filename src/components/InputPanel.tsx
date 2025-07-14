import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PresetItem } from '../types';
import { PresetDropdown } from './PresetDropdown';

interface InputPanelProps {
  domains: string;
  isResolving: boolean;
  validationErrors: string[];
  presets: PresetItem[];
  onDomainsChange: (value: string) => void;
  onResolve: () => void;
  onClear: () => void;
  onPresetSelect: (value: string) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  domains,
  isResolving,
  validationErrors,
  presets,
  onDomainsChange,
  onResolve,
  onClear,
  onPresetSelect
}) => {
  const { t } = useTranslation();
  const hasPresets = presets.length > 0;

  return (
    <div className="bg-gray-900 border-r border-gray-700 p-4">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-green-500 text-sm select-none">{t('input.title')}</div>
          {hasPresets && (
            <PresetDropdown
              presets={presets}
              onSelect={onPresetSelect}
              disabled={isResolving}
            />
          )}
        </div>
        <div className="text-gray-400 text-xs mb-3 select-none">{t('input.description')}</div>
      </div>
      
      <textarea
        value={domains}
        onChange={(e) => onDomainsChange(e.target.value)}
        placeholder={t('input.placeholder')}
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
          {isResolving ? t('input.resolving') : t('input.resolveDomains')}
        </button>
        
        <button
          onClick={onClear}
          disabled={isResolving}
          className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 py-2 px-4 rounded text-sm transition-colors select-none"
        >
          {t('input.clear')}
        </button>
      </div>
    </div>
  );
};