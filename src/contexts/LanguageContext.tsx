import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { translatorService } from '../services/ai/translator';
import type { Language, TranslationResult } from '../types';

interface LanguageState {
  userLanguage: string;
  availableLanguages: Language[];
  translationCache: Map<string, TranslationResult>;
  loading: boolean;
  error: string | null;
}

type LanguageAction =
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_AVAILABLE_LANGUAGES'; payload: Language[] }
  | { type: 'ADD_TRANSLATION_TO_CACHE'; payload: { key: string; result: TranslationResult } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface LanguageContextType extends LanguageState {
  setLanguage: (language: string) => void;
  translateText: (text: string, targetLanguage?: string, sourceLanguage?: string) => Promise<TranslationResult>;
  translateBatch: (texts: string[], targetLanguage?: string, sourceLanguage?: string) => Promise<TranslationResult[]>;
  clearCache: () => void;
  getCachedTranslation: (text: string, targetLanguage: string, sourceLanguage?: string) => TranslationResult | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const initialState: LanguageState = {
  userLanguage: 'en',
  availableLanguages: [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  ],
  translationCache: new Map(),
  loading: false,
  error: null,
};

function languageReducer(state: LanguageState, action: LanguageAction): LanguageState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return {
        ...state,
        userLanguage: action.payload,
      };
    case 'SET_AVAILABLE_LANGUAGES':
      return {
        ...state,
        availableLanguages: action.payload,
      };
    case 'ADD_TRANSLATION_TO_CACHE':
      return {
        ...state,
        translationCache: new Map(state.translationCache).set(action.payload.key, action.payload.result),
      };
    case 'CLEAR_CACHE':
      return {
        ...state,
        translationCache: new Map(),
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [state, dispatch] = useReducer(languageReducer, initialState);

  // Load user language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('user_language');
    if (savedLanguage) {
      dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('user_language', state.userLanguage);
  }, [state.userLanguage]);

  const setLanguage = (language: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const getCacheKey = (text: string, targetLanguage: string, sourceLanguage?: string): string => {
    return `${text}-${sourceLanguage || 'auto'}-${targetLanguage}`;
  };

  const getCachedTranslation = (text: string, targetLanguage: string, sourceLanguage?: string): TranslationResult | null => {
    const key = getCacheKey(text, targetLanguage, sourceLanguage);
    return state.translationCache.get(key) || null;
  };

  const translateText = async (
    text: string, 
    targetLanguage = state.userLanguage, 
    sourceLanguage?: string
  ): Promise<TranslationResult> => {
    // Check cache first
    const cached = getCachedTranslation(text, targetLanguage, sourceLanguage);
    if (cached) {
      return cached;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await translatorService.translate(text, targetLanguage, sourceLanguage);
      
      // Add to cache
      const key = getCacheKey(text, targetLanguage, sourceLanguage);
      dispatch({ type: 'ADD_TRANSLATION_TO_CACHE', payload: { key, result } });
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Translation failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const translateBatch = async (
    texts: string[], 
    targetLanguage = state.userLanguage, 
    sourceLanguage?: string
  ): Promise<TranslationResult[]> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const results = await translatorService.translateBatch(texts, targetLanguage, sourceLanguage);
      
      // Add results to cache
      results.forEach(result => {
        const key = getCacheKey(result.originalText, result.targetLanguage, result.sourceLanguage);
        dispatch({ type: 'ADD_TRANSLATION_TO_CACHE', payload: { key, result } });
      });
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch translation failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const clearCache = () => {
    dispatch({ type: 'CLEAR_CACHE' });
    translatorService.clearCache();
  };

  const value: LanguageContextType = {
    ...state,
    setLanguage,
    translateText,
    translateBatch,
    clearCache,
    getCachedTranslation,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
