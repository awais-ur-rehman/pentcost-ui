import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface TranslationDebugData {
  inputText: string;
  outputText: string;
  targetLanguage: string;
  timestamp: Date;
  step: 'translate' | 'proofread' | 'format';
  success: boolean;
  error?: string;
}

interface TranslationDebugContextType {
  debugData: TranslationDebugData[];
  addDebugEntry: (data: Omit<TranslationDebugData, 'timestamp'>) => void;
  clearDebugData: () => void;
  isDebuggerVisible: boolean;
  toggleDebugger: () => void;
}

const TranslationDebugContext = createContext<TranslationDebugContextType | undefined>(undefined);

export function TranslationDebugProvider({ children }: { children: ReactNode }) {
  const [debugData, setDebugData] = useState<TranslationDebugData[]>([]);
  const [isDebuggerVisible, setIsDebuggerVisible] = useState(false);

  const addDebugEntry = useCallback((data: Omit<TranslationDebugData, 'timestamp'>) => {
    const newEntry: TranslationDebugData = {
      ...data,
      timestamp: new Date(),
    };
    
    setDebugData(prev => [...prev, newEntry]);
  }, []);

  const clearDebugData = useCallback(() => {
    setDebugData([]);
  }, []);

  const toggleDebugger = useCallback(() => {
    setIsDebuggerVisible(prev => !prev);
  }, []);

  return (
    <TranslationDebugContext.Provider
      value={{
        debugData,
        addDebugEntry,
        clearDebugData,
        isDebuggerVisible,
        toggleDebugger,
      }}
    >
      {children}
    </TranslationDebugContext.Provider>
  );
}

export function useTranslationDebug() {
  const context = useContext(TranslationDebugContext);
  if (context === undefined) {
    throw new Error('useTranslationDebug must be used within a TranslationDebugProvider');
  }
  return context;
}
