import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserSettings, DOHProvider } from '../types';
import { validateDnsProvider } from '../utils/dnsValidation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [newProvider, setNewProvider] = useState<DOHProvider>({ name: '', url: '', label: '' });
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState('');

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
    setIsAddingProvider(false);
    setNewProvider({ name: '', url: '', label: '' });
    setValidationStatus('idle');
    setValidationError('');
    onClose();
  };

  const handleAddProvider = async () => {
    if (!newProvider.name || !newProvider.url || !newProvider.label) {
      setValidationError(t('settings.allFieldsRequired'));
      setValidationStatus('error');
      return;
    }

    setValidationStatus('validating');
    setValidationError('');

    const validation = await validateDnsProvider(newProvider);
    
    if (!validation.valid) {
      setValidationError(validation.error || t('settings.invalidDnsProvider'));
      setValidationStatus('error');
      return;
    }

    setValidationStatus('success');
    setFormData({
      ...formData,
      customDnsProviders: [...formData.customDnsProviders, newProvider]
    });
    setNewProvider({ name: '', url: '', label: '' });
    setIsAddingProvider(false);
    setTimeout(() => setValidationStatus('idle'), 2000);
  };

  const handleRemoveProvider = (index: number) => {
    setFormData({
      ...formData,
      customDnsProviders: formData.customDnsProviders.filter((_, i) => i !== index)
    });
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
                {t('settings.title')}
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
          <div className="p-4 space-y-6">
            {/* Preset Source URL Block */}
            <div className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-300 mb-1 select-none">
                  {t('settings.presetSourceUrl')}
                </label>
                <p className="text-xs text-gray-500 select-none">
                  {t('settings.presetSourceDescription')}
                </p>
              </div>
              <input
                type="url"
                value={formData.presetSourceUrl}
                onChange={(e) => setFormData({ ...formData, presetSourceUrl: e.target.value })}
                placeholder={t('settings.presetSourcePlaceholder')}
                className="w-full bg-black border border-gray-600 rounded p-3 text-green-400 text-sm placeholder-gray-600 focus:border-green-500 focus:outline-none select-text"
                disabled={status === 'saving'}
              />
            </div>

            {/* Custom DNS Providers Block */}
            <div className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 select-none">
                    {t('settings.customDnsProviders')}
                  </label>
                  <p className="text-xs text-gray-500 select-none">
                    {t('settings.customDnsProvidersDescription')}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingProvider(true)}
                  className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700/50 transition-colors"
                  disabled={status === 'saving' || isAddingProvider}
                >
                  <Plus className="w-4 h-4" />
                  {t('settings.addProvider')}
                </button>
              </div>

              {/* Existing providers */}
              {formData.customDnsProviders && formData.customDnsProviders.length > 0 ? (
                <div className="space-y-2">
                  {formData.customDnsProviders.map((provider, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded border border-gray-600/50">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-400">{provider.label}</div>
                        <div className="text-xs text-gray-400 truncate">{provider.url}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveProvider(index)}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-colors"
                        disabled={status === 'saving'}
                        title={t('settings.removeProvider')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                !isAddingProvider && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-600 rounded-lg">
                    <div className="text-sm mb-2">{t('settings.noCustomProviders')}</div>
                    <div className="text-xs">{t('settings.addCustomProviderHint')}</div>
                  </div>
                )
              )}

              {/* Add new provider form */}
              {isAddingProvider && (
                <div className="mt-4 border border-gray-600 rounded-lg p-4 bg-gray-700/30">
                  <div className="text-sm font-medium text-gray-300 mb-3 select-none">
                    {t('settings.addNewProvider')}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">{t('settings.providerName')}</label>
                      <input
                        type="text"
                        value={newProvider.name}
                        onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                        placeholder={t('settings.providerNamePlaceholder')}
                        className="w-full bg-black border border-gray-600 rounded p-2 text-green-400 text-sm placeholder-gray-600 focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">{t('settings.displayLabel')}</label>
                      <input
                        type="text"
                        value={newProvider.label}
                        onChange={(e) => setNewProvider({ ...newProvider, label: e.target.value })}
                        placeholder={t('settings.displayLabelPlaceholder')}
                        className="w-full bg-black border border-gray-600 rounded p-2 text-green-400 text-sm placeholder-gray-600 focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">{t('settings.dnsOverHttpsUrl')}</label>
                      <input
                        type="url"
                        value={newProvider.url}
                        onChange={(e) => setNewProvider({ ...newProvider, url: e.target.value })}
                        placeholder={t('settings.dnsOverHttpsUrlPlaceholder')}
                        className="w-full bg-black border border-gray-600 rounded p-2 text-green-400 text-sm placeholder-gray-600 focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    
                    {/* Validation status */}
                    {validationStatus === 'error' && validationError && (
                      <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-2 rounded">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{validationError}</span>
                      </div>
                    )}
                    
                    {validationStatus === 'success' && (
                      <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-2 rounded">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{t('settings.providerValidated')}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setIsAddingProvider(false);
                          setNewProvider({ name: '', url: '', label: '' });
                          setValidationStatus('idle');
                          setValidationError('');
                        }}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-3 rounded text-sm transition-colors"
                      >
                        {t('settings.cancel')}
                      </button>
                      <button
                        onClick={handleAddProvider}
                        disabled={validationStatus === 'validating'}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-black font-medium py-2 px-3 rounded text-sm transition-colors"
                      >
                        {validationStatus === 'validating' ? t('settings.validating') : t('settings.addProvider')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {status === 'error' && errorMessage && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded border border-red-400/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="select-text">{errorMessage}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-3 rounded border border-green-400/20">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="select-none">{t('settings.fetchPresetsSuccess')}</span>
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
              {t('settings.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={status === 'saving'}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium py-2 px-4 rounded text-sm transition-colors select-none"
            >
              {status === 'saving' ? t('settings.fetchingPresets') : t('settings.save')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};