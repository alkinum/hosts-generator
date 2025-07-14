import React from 'react';
import { AlertCircle } from 'lucide-react';
import { DNSResult } from '../types';

interface InputPanelProps {
  domains: string;
  isResolving: boolean;
  validationErrors: string[];
  results: DNSResult[];
  onDomainsChange: (value: string) => void;
  onResolve: () => void;
  onClear: () => void;
  onDownload: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  domains,
  isResolving,
  validationErrors,
  results,
  onDomainsChange,
  onResolve,
  onClear,
  onDownload
}) => {
  const hasResults = results.length > 0;
  const successCount = results.filter(r => r.ip).length;
  const errorCount = results.filter(r => !r.ip).length;

  return (
    <div className="bg-gray-900 border-r border-gray-700 p-4">
      <div className="mb-3">
        <div className="text-green-500 text-sm mb-1 select-none">INPUT</div>
        <div className="text-gray-400 text-xs mb-3 select-none">Enter domains or hosts entries</div>
      </div>
      
      <textarea
        value={domains}
        onChange={(e) => onDomainsChange(e.target.value)}
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
          onClick={onResolve}
          disabled={isResolving || !domains.trim()}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium py-2 px-4 rounded text-sm transition-colors select-none"
        >
          {isResolving ? 'RESOLVING...' : 'RESOLVE DOMAINS'}
        </button>
        
        <button
          onClick={onClear}
          disabled={isResolving}
          className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 py-2 px-4 rounded text-sm transition-colors select-none"
        >
          CLEAR
        </button>
      </div>

      {/* Stats */}
      {hasResults && (
        <div className="mt-4 space-y-2 text-xs">
          <div className="text-green-500 mb-2 select-none">STATISTICS</div>
          <div className="flex justify-between">
            <span className="text-gray-400 select-none">Success:</span>
            <span className="text-green-400 select-none">{successCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 select-none">Failed:</span>
            <span className="text-red-400 select-none">{errorCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 select-none">Total:</span>
            <span className="text-blue-400 select-none">{results.length}</span>
          </div>
          
          {successCount > 0 && (
            <button
              onClick={onDownload}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2 select-none"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              DOWNLOAD HOSTS
            </button>
          )}
        </div>
      )}
    </div>
  );
};