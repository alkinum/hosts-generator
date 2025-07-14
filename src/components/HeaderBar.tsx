import React, { useRef, useEffect } from 'react';
import { Settings, Clock } from 'lucide-react';
import { DOHProvider } from '../types';

interface HeaderBarProps {
  selectedProvider: DOHProvider;
  providers: DOHProvider[];
  showProviderMenu: boolean;
  isResolving: boolean;
  onProviderSelect: (provider: DOHProvider) => void;
  onToggleProviderMenu: () => void;
  onShowHistory: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  selectedProvider,
  providers,
  showProviderMenu,
  isResolving,
  onProviderSelect,
  onToggleProviderMenu,
  onShowHistory
}) => {
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
    <div className="bg-gray-900 border border-gray-700 rounded-t-lg px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-gray-400 text-sm select-none">hosts-generator</span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* History Button */}
        <button
          onClick={onShowHistory}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors select-none"
          disabled={isResolving}
        >
          <Clock className="w-3 h-3" />
          <span>历史</span>
        </button>
        
        {/* DNS Provider Selector */}
        <div className="relative" ref={providerMenuRef}>
          <button
            onClick={onToggleProviderMenu}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors select-none"
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
    </div>
  );
};