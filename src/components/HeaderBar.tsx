import React, { useRef, useEffect } from 'react';
import { Settings, Clock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DOHProvider } from '../types';

interface HeaderBarProps {
  selectedProvider: DOHProvider;
  providers: DOHProvider[];
  showProviderMenu: boolean;
  isResolving: boolean;
  onProviderSelect: (provider: DOHProvider) => void;
  onToggleProviderMenu: () => void;
  onShowHistory: () => void;
  isMinimized: boolean;
  onMinimize: () => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
  onShowSettings: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  selectedProvider,
  providers,
  showProviderMenu,
  isResolving,
  onProviderSelect,
  onToggleProviderMenu,
  onShowHistory,
  isMinimized,
  onMinimize,
  onToggleFullscreen,
  onClose,
  onShowSettings,
}) => {
  const { t } = useTranslation();
  const providerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (providerMenuRef.current && !providerMenuRef.current.contains(event.target as Node)) {
        onToggleProviderMenu();
      }
    };

    if (showProviderMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProviderMenu, onToggleProviderMenu]);

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
              <svg width="8" height="8" viewBox="0 0 8 8" className="text-red-900">
                <path
                  d="M1 1l6 6M7 1L1 7"
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
            {/* macOS minimize icon (−) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg width="8" height="2" viewBox="0 0 8 2" className="text-yellow-900">
                <rect width="8" height="1.2" rx="0.6" fill="currentColor" />
              </svg>
            </div>
          </button>
          
          {/* Fullscreen Toggle Button */}
          <button
            onClick={onToggleFullscreen}
            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-all duration-200 flex items-center justify-center group relative"
            title="Toggle Fullscreen"
          >
            {/* macOS fullscreen icon (⤢) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg width="8" height="8" viewBox="0 0 8 8" className="text-green-900">
                <path
                  d="M1 3V1h2M7 3V1H5M1 5v2h2M7 5v2H5"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>
        {!isMinimized && (
          <span className="text-gray-400 text-sm select-none">{t('header.appTitle')}</span>
        )}
      </div>
      
      {!isMinimized && (
        <div className="flex items-center gap-3">
          {/* History Button */}
          <button
            onClick={onShowHistory}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors select-none"
            disabled={isResolving}
            title={t('header.history')}
          >
            <Clock className="w-3 h-3" />
            <span>{t('header.history')}</span>
          </button>
          
          {/* Settings Button */}
          <button
            onClick={onShowSettings}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors select-none"
            title={t('header.settings')}
          >
            <User className="w-3 h-3" />
          </button>
          
          {/* DNS Provider Selector */}
          <div className="relative" ref={providerMenuRef}>
            <button
              onClick={onToggleProviderMenu}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors select-none"
              title={selectedProvider.label}
              disabled={isResolving}
            >
              <Settings className="w-3 h-3" />
              <span>{selectedProvider.label}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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