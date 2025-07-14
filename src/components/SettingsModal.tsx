import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { UserSettings } from '../types';
import { t, Language } from '../utils/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  language: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  language
}) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async () => {
    setStatus('saving');
    setErrorMessage('');
    
    try {
      await onSave(formData);
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 1000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Save failed');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleCancel = () => {
    setFormData(settings);
    setStatus('idle');
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium select-none">
                {t('settingsTitle', language)}
              </span>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-green-400 transition-colors select-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Preset Source URL */}
            <div>
              <label className="block text-sm text-gray-400 mb-2 select-none">
                {t('presetSourceUrl', language)}
              </label>
              <input
                type="url"
                value={formData.presetSourceUrl}
                onChange={(e) => setFormData({ ...formData, presetSourceUrl: e.target.value })}
                placeholder={t('presetSourcePlaceholder', language)}
                className="w-full bg-black border border-gray-600 rounded p-3 text-green-400 text-sm placeholder-gray-600 focus:border-green-500 focus:outline-none select-text"
                disabled={status === 'saving'}
              />
            </div>

            {/* Status Messages */}
            {status === 'error' && errorMessage && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="select-text">{errorMessage}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="select-none">{t('fetchPresetsSuccess', language)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 border-t border-gray-700">
            <button
              onClick={handleCancel}
              disabled={status === 'saving'}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 py-2 px-4 rounded text-sm transition-colors select-none"
            >
              {t('cancel', language)}
            </button>
            <button
              onClick={handleSave}
              disabled={status === 'saving'}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium py-2 px-4 rounded text-sm transition-colors select-none"
            >
              {status === 'saving' ? t('fetchingPresets', language) : t('save', language)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};