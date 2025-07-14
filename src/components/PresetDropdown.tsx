import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PresetItem } from '../types';

interface PresetDropdownProps {
  presets: PresetItem[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export const PresetDropdown: React.FC<PresetDropdownProps> = ({
  presets,
  onSelect,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setOpenSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: PresetItem) => {
    if (item.value) {
      onSelect(item.value);
      setIsOpen(false);
      setOpenSubmenu(null);
    } else if (item.children) {
      setOpenSubmenu(openSubmenu === item.title ? null : item.title);
    }
  };

  const handleSubmenuItemClick = (value: string) => {
    onSelect(value);
    setIsOpen(false);
    setOpenSubmenu(null);
  };

  if (presets.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 py-2 px-3 rounded text-sm transition-colors select-none"
      >
        <List className="w-3 h-3" />
        <span>{t('input.presets')}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-30 min-w-48 max-h-64 overflow-y-auto">
          {presets.map((preset, index) => (
            <div key={index} className="relative">
              <button
                onClick={() => handleItemClick(preset)}
                className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors select-none flex items-center justify-between"
              >
                <span>{preset.title}</span>
                {preset.children && (
                  <ChevronDown className={`w-3 h-3 transition-transform ${
                    openSubmenu === preset.title ? 'rotate-180' : 'rotate-[-90deg]'
                  }`} />
                )}
              </button>

              {/* Submenu */}
              {preset.children && openSubmenu === preset.title && (
                <div className="bg-gray-750 border-l-2 border-green-500">
                  {preset.children.map((child, childIndex) => (
                    <button
                      key={childIndex}
                      onClick={() => child.value && handleSubmenuItemClick(child.value)}
                      disabled={!child.value}
                      className="block w-full text-left px-6 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors select-none disabled:cursor-not-allowed"
                    >
                      {child.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};