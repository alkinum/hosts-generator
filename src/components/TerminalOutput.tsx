import React, { useEffect, useState } from 'react';

interface TerminalOutputProps {
  terminalOutput: string[];
  currentLine: string;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  terminalOutput,
  currentLine
}) => {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lg:col-span-2 bg-black p-4 border-r border-gray-700">
      <div className="mb-3">
        <div className="text-green-500 text-sm mb-1 select-none">OUTPUT</div>
        <div className="text-gray-400 text-xs mb-3 select-none">Real-time resolution log</div>
      </div>
      
      <div className="h-80 overflow-y-auto bg-gray-950 border border-gray-800 rounded p-3 text-sm">
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
        {currentLine && (
          <div className="text-gray-300 leading-relaxed select-text">
            {currentLine}
            {showCursor && <span className="bg-green-400 text-black">█</span>}
          </div>
        )}
        {!currentLine && (
          <div className="text-gray-300 leading-relaxed">
            {showCursor && <span className="bg-green-400 text-black animate-pulse">█</span>}
          </div>
        )}
      </div>
    </div>
  );
};