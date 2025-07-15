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
        <div className="flex gap-2 select-none hidden md:flex">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-all duration-200 flex items-center justify-center group relative"
            title="Close"
          >
            {/* macOS close icon (×) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg width="8" height="8" viewBox="0 0 8 8" className="text-red-900">
                <path
                  d="M1.5 1.5l5 5M6.5 1.5l-5 5"
                  stroke="currentColor"
                  strokeWidth="1.2"
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
            {/* macOS minimize/expand icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {isMinimized ? (
                // Plus icon for expanding
                <svg width="8" height="8" viewBox="0 0 8 8" className="text-yellow-900">
                  <path
                    d="M4 2v4M2 4h4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                // Minus icon for minimizing
                <svg width="8" height="8" viewBox="0 0 8 8" className="text-yellow-900">
                  <line
                    x1="2"
                    y1="4"
                    x2="6"
                    y2="4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
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
                // Shrink icon (diagonal arrows pointing inward)
                <svg width="8" height="8" viewBox="0 0 8 8" className="text-green-900">
                  <path
                    d="M2.5 1.5L1 3M5.5 1.5L7 3M2.5 6.5L1 5M5.5 6.5L7 5"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                // Expand icon (diagonal arrows pointing outward)
                <svg width="8" height="8" viewBox="0 0 8 8" className="text-green-900">
                  <path
                    d="M1 2.5L2.5 1M1 5.5L2.5 7M7 2.5L5.5 1M7 5.5L5.5 7"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
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
        <div className="flex items-center gap-1">
          {/* History Button */}
          <button
            onClick={onShowHistory}
            className="text-gray-400 hover:text-green-400 transition-colors select-none p-1.5 rounded hover:bg-gray-800/50"
            disabled={isResolving}
            title={t('header.history')}
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onShowSettings}
            className="text-gray-400 hover:text-green-400 transition-colors select-none p-1.5 rounded hover:bg-gray-800/50"
            title={t('header.settings')}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* DNS Provider Selector */}
          <div className="relative" ref={providerMenuRef}>
            <button
              onClick={onToggleProviderMenu}
              className="flex items-center gap-1.5 text-gray-400 hover:text-green-400 transition-colors select-none p-1.5 rounded hover:bg-gray-800/50"
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