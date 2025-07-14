import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Trash2, Download, Copy, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { historyDB, HistoryRecord } from '../utils/indexedDB';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRecord: (inputContent: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  onLoadRecord,
}) => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadRecords(0, true);
    }
  }, [isOpen]);

  const loadRecords = async (pageNum: number, reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const newRecords = await historyDB.getRecords(pageNum, 20);

      if (reset) {
        setRecords(newRecords);
      } else {
        setRecords(prev => [...prev, ...newRecords]);
      }

      setHasMore(newRecords.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !loading) {
      loadRecords(page + 1);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await historyDB.deleteRecord(id);
      setRecords(prev => prev.filter(record => record.id !== id));
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  const clearAllRecords = async () => {
    if (!confirm(t('history.confirmClearHistory'))) return;

    try {
      await historyDB.clearAllRecords();
      setRecords([]);
      setHasMore(false);
    } catch (error) {
      console.error('Failed to clear records:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays === 1) {
      return t('misc.yesterday') + ' ' + date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays < 7) {
      return t('misc.daysAgo', { days: diffDays });
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const copyToClipboard = async (content: string, recordId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(recordId);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadHostsFile = (content: string, timestamp: number) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hosts_${new Date(timestamp).toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium select-none">{t('history.title')}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-green-400 transition-colors select-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        {records.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <button
              onClick={clearAllRecords}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors select-none"
            >
              {t('history.clearAllRecords')}
            </button>
          </div>
        )}

        {/* Records List */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-gray-800/50
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-600/80
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb:hover]:bg-gray-500/80
          [&::-webkit-scrollbar-thumb:active]:bg-gray-400/80"
          onScroll={handleScroll}
        >
          {records.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-8 select-none">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{t('history.noHistoryRecords')}</p>
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="bg-gray-800/50 border border-gray-700/60 rounded-lg p-4 hover:border-gray-600 hover:bg-gray-800/70 transition-all duration-200 shadow-sm"
              >
                {/* Record Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded select-none">
                        {formatDate(record.timestamp)}
                      </div>
                      <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded select-none">
                        {record.provider}
                      </div>
                    </div>
                    <div className="text-sm text-gray-200 leading-relaxed mb-2 select-text">
                      {truncateText(record.inputContent.replace(/\n/g, ' '), 60)}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-green-400 bg-green-500/10 px-2 py-1 rounded select-none">
                        ✓ {record.successCount}
                      </span>
                      <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded select-none">
                        ✗ {record.totalCount - record.successCount}
                      </span>
                      <span className="text-gray-400 select-none">
                        {t('preview.total')}: {record.totalCount}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded transition-all duration-200 ml-2 select-none"
                    title={t('history.deleteRecord')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onLoadRecord(record.inputContent)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md select-none"
                  >
                    {t('history.loadInput')}
                  </button>
                  <button
                    onClick={() => setExpandedRecord(
                      expandedRecord === record.id ? null : record.id
                    )}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md select-none"
                  >
                    {expandedRecord === record.id ? t('history.collapse') : t('history.expand')}
                  </button>
                </div>

                {/* Expanded Content */}
                {expandedRecord === record.id && (
                  <div className="space-y-4 border-t border-gray-700/50 pt-4 mt-3">
                    {/* Input Content */}
                    <div>
                      <div className="text-xs font-medium text-gray-400 mb-2 select-none">{t('history.inputContent')}</div>
                      <pre className="bg-black/60 border border-gray-800/60 rounded-md p-3 text-xs text-gray-300 overflow-x-auto max-h-24 overflow-y-auto select-text leading-relaxed
                      [&::-webkit-scrollbar]:w-1.5
                      [&::-webkit-scrollbar]:h-1.5
                      [&::-webkit-scrollbar-track]:bg-gray-900/50
                      [&::-webkit-scrollbar-track]:rounded
                      [&::-webkit-scrollbar-thumb]:bg-gray-600/60
                      [&::-webkit-scrollbar-thumb]:rounded
                      [&::-webkit-scrollbar-thumb:hover]:bg-gray-500/80
                      [&::-webkit-scrollbar-corner]:bg-gray-900/50">
                        {record.inputContent}
                      </pre>
                    </div>

                    {/* Output Content */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-400 select-none">{t('history.outputContent')}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(record.outputContent, record.id)}
                            className="text-gray-500 hover:text-green-400 hover:bg-green-400/10 p-1.5 rounded transition-all duration-200 select-none"
                            title={t('preview.copy')}
                          >
                            {copySuccess === record.id ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => downloadHostsFile(record.outputContent, record.timestamp)}
                            className="text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 p-1.5 rounded transition-all duration-200 select-none"
                            title={t('preview.download')}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <pre className="bg-black/60 border border-gray-800/60 rounded-md p-3 text-xs text-gray-300 overflow-x-auto max-h-40 overflow-y-auto select-text leading-relaxed
                      [&::-webkit-scrollbar]:w-1.5
                      [&::-webkit-scrollbar]:h-1.5
                      [&::-webkit-scrollbar-track]:bg-gray-900/50
                      [&::-webkit-scrollbar-track]:rounded
                      [&::-webkit-scrollbar-thumb]:bg-gray-600/60
                      [&::-webkit-scrollbar-thumb]:rounded
                      [&::-webkit-scrollbar-thumb:hover]:bg-gray-500/80
                      [&::-webkit-scrollbar-corner]:bg-gray-900/50">
                        {record.outputContent}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="text-center py-4 select-none">
              <div className="text-gray-400 text-sm">{t('history.loading')}</div>
            </div>
          )}

          {!hasMore && records.length > 0 && (
            <div className="text-center py-4 select-none">
              <div className="text-gray-500 text-xs">{t('history.allRecordsLoaded')}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};