import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface TerminalOutputProps {
  terminalOutput: string[];
  currentLine: string;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  terminalOutput,
  currentLine,
}) => {
  const { t } = useTranslation();
  const [showCursor, setShowCursor] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new content is added and user is at bottom
  useEffect(() => {
    if (scrollRef.current && isAtBottom) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalOutput, currentLine, isAtBottom]);

  // Track scroll position to determine if user is at bottom
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(isNearBottom);
    }
  };

  return (
    <div className="lg:col-span-2 bg-black p-4">
      <div className="mb-3">
        <div className="text-green-500 text-sm mb-1 select-none">{t('terminal.title')}</div>
        <div className="text-gray-400 text-xs mb-3 select-none">{t('terminal.description')}</div>
      </div>
      
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-80 overflow-y-auto bg-gray-950 border border-gray-800 rounded p-3 text-sm
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-gray-900/50
        [&::-webkit-scrollbar-track]:rounded
        [&::-webkit-scrollbar-thumb]:bg-gray-600/60
        [&::-webkit-scrollbar-thumb]:rounded
        [&::-webkit-scrollbar-thumb:hover]:bg-gray-500/80"
      >
        {/* 历史输出，不包含光标 */}
        {terminalOutput.map((line, index) => (
          <div key={index} className="mb-1 leading-relaxed">
            {line.startsWith('✓') ? (
              <span className="text-green-400 select-text">{line}</span>
            ) : line.startsWith('✗') ? (
              <span className="text-red-400 select-text">{line}</span>
            ) : line.startsWith('$') ? (
              <span className="text-blue-400 select-text">{line}</span>
            ) : line.startsWith('#') ? (
              <span className="text-gray-500 select-text">{line}</span>
            ) : (
              <span className="text-gray-300 select-text">{line}</span>
            )}
          </div>
        ))}
        
        {/* 当前输入行和光标 - 只在这里显示光标 */}
        <div className="text-gray-300 leading-relaxed select-text">
          <span className="text-blue-400">$ </span>
          <span>{currentLine}</span>
          {showCursor && (
            <span className="text-green-400 animate-pulse">_</span>
          )}
        </div>
      </div>
    </div>
  );
};