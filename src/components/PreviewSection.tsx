import React, { useState } from 'react';
import { Copy, CheckCircle, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DNSResult, DOHProvider } from '../types';

interface PreviewSectionProps {
  className?: string;
  results: DNSResult[];
  selectedProvider: DOHProvider;
  generationTimestamp: string | null;
  includeLocalhost: boolean;
  removeComments: boolean;
  onIncludeLocalhostChange: (include: boolean) => void;
  onRemoveCommentsChange: (remove: boolean) => void;
  onDownload: () => void;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  className = '',
  results,
  selectedProvider,
  generationTimestamp,
  includeLocalhost,
  removeComments,
  onIncludeLocalhostChange,
  onRemoveCommentsChange,
  onDownload
}) => {
  const { t } = useTranslation();
  const [copySuccess, setCopySuccess] = useState(false);

  const generateHostsFile = () => {
    const generationTime = generationTimestamp || new Date().toISOString();
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

    const entries = results
      .filter(result => result.ip)
      .map(result => `${result.ip} ${result.domain}`);

    return [...content, ...entries].join('\n');
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

  const hasResults = results.length > 0;
  const successCount = results.filter(r => r.ip).length;
  const errorCount = results.filter(r => !r.ip).length;

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-b-lg p-4 ${className}`}>
      {/* Header with title and statistics */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-1">
            <div className="text-green-500 text-sm select-none">{t('preview.title')}</div>
            {hasResults && (
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-400 select-none">
                  {t('preview.success')}: <span className="text-green-400">{successCount}</span>
                </span>
                <span className="text-gray-400 select-none">
                  {t('preview.failed')}: <span className="text-red-400">{errorCount}</span>
                </span>
                <span className="text-gray-400 select-none">
                  {t('preview.total')}: <span className="text-blue-400">{results.length}</span>
                </span>
              </div>
            )}
          </div>
          <div className="text-gray-400 text-xs select-none">{t('preview.description')}</div>
        </div>
      </div>

      {/* Controls and actions */}
      {hasResults && (
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Include localhost checkbox */}
              <label className="flex items-center gap-2 text-xs text-gray-400 select-none cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={includeLocalhost}
                    onChange={(e) => onIncludeLocalhostChange(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border-2 rounded transition-all duration-200 ${
                    includeLocalhost
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-600 bg-transparent group-hover:border-green-400'
                  }`}>
                    {includeLocalhost && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-1 border-l-2 border-b-2 border-black transform rotate-[-45deg] translate-y-[-1px]"></div>
                      </div>
                    )}
                  </div>
                </div>
                <span className="group-hover:text-green-400 transition-colors">{t('preview.includeLocalhost')}</span>
              </label>

              {/* Remove comments checkbox */}
              <label className="flex items-center gap-2 text-xs text-gray-400 select-none cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={removeComments}
                    onChange={(e) => onRemoveCommentsChange(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border-2 rounded transition-all duration-200 ${
                    removeComments
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-600 bg-transparent group-hover:border-green-400'
                  }`}>
                    {removeComments && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-1 border-l-2 border-b-2 border-black transform rotate-[-45deg] translate-y-[-1px]"></div>
                      </div>
                    )}
                  </div>
                </div>
                <span className="group-hover:text-green-400 transition-colors">{t('preview.removeComments')}</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-3 rounded text-xs transition-colors select-none"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    {t('preview.copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    {t('preview.copy')}
                  </>
                )}
              </button>

              {successCount > 0 && (
                <button
                  onClick={onDownload}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs transition-colors select-none"
                >
                  <Download className="w-3 h-3" />
                  {t('preview.download')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <pre className="bg-black border border-gray-800 rounded p-3 text-xs overflow-x-auto max-h-40 overflow-y-auto min-h-28
      [&::-webkit-scrollbar]:w-1.5
      [&::-webkit-scrollbar]:h-1.5
      [&::-webkit-scrollbar-track]:bg-gray-900/50
      [&::-webkit-scrollbar-track]:rounded
      [&::-webkit-scrollbar-thumb]:bg-gray-600/60
      [&::-webkit-scrollbar-thumb]:rounded
      [&::-webkit-scrollbar-thumb:hover]:bg-gray-500/80
      [&::-webkit-scrollbar-corner]:bg-gray-900/50">
        <code className="text-gray-300 leading-relaxed select-text">
          {hasResults ? generateHostsFile() : `# ${t('generated.noHostsEntries')}`}
        </code>
      </pre>
    </div>
  );
};