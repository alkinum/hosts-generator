import React, { useRef, useEffect } from 'react';
import { Settings, Clock, Wifi } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DOHProvider } from '../types';

interface HeaderBarProps {
  selectedProvider: DOHProvider;
  providers: DOHProvider[];
  showProviderMenu: boolean;
  isResolving: boolean;
  providerConnected: boolean;
  isFullscreen: boolean;
  onProviderSelect: (provider: DOHProvider) => void;
  onToggleProviderMenu: () => void;
  onCloseProviderMenu: () => void;
  onShowHistory: () => void;
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  onShowSettings: () => void;
  onToggleFullscreen: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  selectedProvider,
  providers,
  showProviderMenu,
  isResolving,
  providerConnected,
  isFullscreen,
  onProviderSelect,
  onToggleProviderMenu,
  onCloseProviderMenu,
  onShowHistory,
  isMinimized,
  onMinimize,
  onClose,
  onShowSettings,
  onToggleFullscreen,
}) => {
  const { t } = useTranslation();
  const providerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (providerMenuRef.current && !providerMenuRef.current.contains(event.target as Node)) {
        onCloseProviderMenu();
      }
    };

    if (showProviderMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProviderMenu, onCloseProviderMenu]);

  return (
    <div className={`bg-gray-900 border border-gray-700 ${isMinimized ? 'rounded-lg' : 'rounded-t-lg'} px-4 py-3 flex items-center justify-between transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <div className="flex gap-2 select-none">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-all duration-200 flex items-center justify-center group relative"
            title="Close"
          >
            {/* macOS close icon (×) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg width="6" height="6" viewBox="0 0 6 6" className="text-red-900">
                <path
                  d="M1 1l4 4M5 1L1 5"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </button>
          
          {/* Minimize Button */}
          <button
            onClick={onMinimize}
            className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center group relative"
            title="Minimize"
          >
            {/* macOS minimize icon (−) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg width="6" height="1" viewBox="0 0 6 1" className="text-yellow-900">
                <rect width="6" height="1" rx="0.5" fill="currentColor" />
              </svg>
            </div>
          </button>
          
          {/* Fullscreen Toggle Button */}
          <button
            onClick={onToggleFullscreen}
            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-all duration-200 flex items-center justify-center group relative"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {/* macOS fullscreen icon - changes based on state */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {isFullscreen ? (
                // Exit fullscreen icon (shrink)
                <svg width="6" height="6" viewBox="0 0 6 6" className="text-green-900">
                  <path
                    d="M2.5 1V2.5H1M3.5 1V2.5H5M2.5 5V3.5H1M3.5 5V3.5H5"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                // Enter fullscreen icon (expand)
                <svg width="6" height="6" viewBox="0 0 6 6" className="text-green-900">
                  <path
                    d="M1 2.5V1h1.5M5 2.5V1H3.5M1 3.5v1.5h1.5M5 3.5v1.5H3.5"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>
        {!isMinimized && (
          <span className="text-gray-400 text-sm select-none">{t('header.appTitle')}</span>
        )}
      </div>
      
      {!isMinimized && (
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button
            onClick={onShowHistory}
            className="text-gray-400 hover:text-green-400 transition-colors select-none p-2 rounded hover:bg-gray-800/50"
            disabled={isResolving}
            title={t('header.history')}
          >
            <Clock className="w-4 h-4" />
          </button>
          
          {/* Settings Button */}
          <button
            onClick={onShowSettings}
            className="text-gray-400 hover:text-green-400 transition-colors select-none p-2 rounded hover:bg-gray-800/50"
            title={t('header.settings')}
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {/* DNS Provider Selector */}
          <div className="relative" ref={providerMenuRef}>
            <button
              onClick={onToggleProviderMenu}
              className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors select-none p-2 rounded hover:bg-gray-800/50"
              title={selectedProvider.label}
              disabled={isResolving}
            >
              <Wifi className="w-4 h-4" />
              <span className="text-xs">{selectedProvider.label}</span>
              <div className={`w-2 h-2 rounded-full ${providerConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            </button>
            
            {showProviderMenu && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-20 min-w-32">
                {providers.map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => onProviderSelect(provider)}
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
      )}
    </div>
  );
};