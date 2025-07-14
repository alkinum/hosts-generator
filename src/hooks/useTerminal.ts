import { useState, useCallback } from 'react';

export const useTerminal = (initialOutput: string[] = []) => {
  const [terminalOutput, setTerminalOutput] = useState<string[]>(initialOutput);
  const [currentLine, setCurrentLine] = useState('');

  const addToTerminal = useCallback((line: string, delay = 0) => {
    setTimeout(() => {
      setTerminalOutput(prev => [...prev, line]);
    }, delay);
  }, []);

  const typeToTerminal = useCallback((text: string, delay = 0) => {
    setTimeout(() => {
      setCurrentLine('');
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setCurrentLine(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setTerminalOutput(prev => [...prev, text]);
            setCurrentLine('');
          }, 500);
        }
      }, 30);
    }, delay);
  }, []);

  const clearTerminal = useCallback(() => {
    setTerminalOutput([]);
    setCurrentLine('');
  }, []);

  const resetTerminal = useCallback((newOutput: string[]) => {
    setTerminalOutput(newOutput);
    setCurrentLine('');
  }, []);

  return {
    terminalOutput,
    currentLine,
    addToTerminal,
    typeToTerminal,
    clearTerminal,
    resetTerminal
  };
};