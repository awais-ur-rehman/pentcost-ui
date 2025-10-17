import { useState, useEffect, useCallback } from 'react';

export interface AIModelStatus {
  status: 'unavailable' | 'downloadable' | 'downloading' | 'available';
  progress: number;
  error: string | null;
  isDownloading: boolean;
}

export interface AIModelDownloadResult {
  success: boolean;
  session?: any;
  error?: string;
}

export const useAIModel = () => {
  const [modelStatus, setModelStatus] = useState<AIModelStatus>({
    status: 'unavailable',
    progress: 0,
    error: null,
    isDownloading: false,
  });

  // Check model availability
  const checkAvailability = useCallback(async () => {
    try {
      if (typeof window === 'undefined') {
        setModelStatus(prev => ({ ...prev, status: 'unavailable', error: 'Window not available' }));
        return;
      }

      // Check for global LanguageModel first (this is what you're using in console)
      const globalLM = (window as any).LanguageModel;
      if (globalLM && typeof globalLM.availability === 'function') {
        console.log('Using global LanguageModel');
        try {
          const status = await globalLM.availability();
          console.log('Global LanguageModel availability:', status);

          setModelStatus(prev => ({
            ...prev,
            status,
            error: null,
            isDownloading: status === 'downloading'
          }));
          return;
        } catch (error) {
          console.error('Error checking global LanguageModel availability:', error);
          // Don't return here, try other methods
        }
      }

      // Check for window.ai.languageModel
      if (window.ai && window.ai.languageModel && typeof window.ai.languageModel.availability === 'function') {
        console.log('Using window.ai.languageModel');
        try {
          const status = await window.ai.languageModel.availability();
          console.log('window.ai.languageModel availability:', status);

          setModelStatus(prev => ({
            ...prev,
            status,
            error: null,
            isDownloading: status === 'downloading'
          }));
          return;
        } catch (error) {
          console.error('Error checking window.ai.languageModel availability:', error);
        }
      }

      // Check for specific APIs (proofreader, rewriter, etc.)
      if (window.ai) {
        const availableAPIs = [];
        if (window.ai.proofreader) availableAPIs.push('proofreader');
        if (window.ai.rewriter) availableAPIs.push('rewriter');
        if (window.ai.translator) availableAPIs.push('translator');

        if (availableAPIs.length > 0) {
          console.log('Found available Chrome AI APIs:', availableAPIs);
          setModelStatus(prev => ({
            ...prev,
            status: 'available',
            error: null
          }));
          return;
        }
      }

      // If we get here, neither method worked
      console.log('No working Chrome AI APIs found');
      setModelStatus(prev => ({
        ...prev,
        status: 'unavailable',
        error: 'Chrome AI APIs not accessible. Model may be ready but APIs not available.'
      }));
    } catch (error) {
      console.error('Error checking availability:', error);
      setModelStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'unavailable'
      }));
    }
  }, []);

  // Download the AI model
  const downloadModel = useCallback(async (): Promise<AIModelDownloadResult> => {
    try {
      if (typeof window === 'undefined') {
        return {
          success: false,
          error: 'Window not available'
        };
      }

      console.log('Starting model download...');

      setModelStatus(prev => ({
        ...prev,
        isDownloading: true,
        progress: 0,
        error: null,
        status: 'downloading'
      }));

      // Check for global LanguageModel first
      const globalLM = (window as any).LanguageModel;
      if (globalLM && typeof globalLM.create === 'function') {
        console.log('Using global LanguageModel for download');

        const session = await globalLM.create({
          monitor: (monitor: any) => {
            monitor.addEventListener('downloadprogress', (e: any) => {
              const progress = Math.floor((e.loaded / e.total) * 100);
              setModelStatus(prev => ({
                ...prev,
                progress,
                status: progress === 100 ? 'available' : 'downloading'
              }));
            });

            monitor.addEventListener('downloadcomplete', () => {
              setModelStatus(prev => ({
                ...prev,
                status: 'available',
                progress: 100,
                isDownloading: false,
                error: null
              }));
            });
          }
        });

        setModelStatus(prev => ({
          ...prev,
          status: 'available',
          progress: 100,
          isDownloading: false,
          error: null
        }));

        return {
          success: true,
          session
        };
      }

      // Fallback to window.ai.languageModel
      if (!window.ai) {
        return {
          success: false,
          error: 'Chrome AI API not available'
        };
      }

      if (!window.ai.languageModel) {
        return {
          success: false,
          error: 'LanguageModel API not available'
        };
      }

      const session = await window.ai.languageModel.create({
        expectedOutputs: [{ type: 'text', languages: ['en'] }],
        monitor: (monitor: any) => {
          monitor.addEventListener('downloadprogress', (e: any) => {
            const progress = Math.floor((e.loaded / e.total) * 100);
            setModelStatus(prev => ({
              ...prev,
              progress,
              status: progress === 100 ? 'available' : 'downloading'
            }));
          });

          monitor.addEventListener('downloadcomplete', () => {
            setModelStatus(prev => ({
              ...prev,
              status: 'available',
              progress: 100,
              isDownloading: false,
              error: null
            }));
          });
        }
      });

      setModelStatus(prev => ({
        ...prev,
        status: 'available',
        progress: 100,
        isDownloading: false,
        error: null
      }));

      return {
        success: true,
        session
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      setModelStatus(prev => ({
        ...prev,
        error: errorMessage,
        isDownloading: false,
        status: 'downloadable'
      }));

      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  // Test the model with a simple prompt
  const testModel = useCallback(async (testPrompt: string = "Hello, how are you?"): Promise<{ success: boolean; response?: string; error?: string }> => {
    try {
      if (modelStatus.status !== 'available') {
        return {
          success: false,
          error: 'Model is not available. Please download it first.'
        };
      }

      if (typeof window === 'undefined') {
        return {
          success: false,
          error: 'Window not available'
        };
      }

      // Check for global LanguageModel first
      const globalLM = (window as any).LanguageModel;
      if (globalLM && typeof globalLM.create === 'function') {
        console.log('Using global LanguageModel for test');

        const session = await globalLM.create();
        const result = await session.prompt({
          text: testPrompt,
          language: 'en'
        });

        return {
          success: true,
          response: result.text
        };
      }

      // Fallback to window.ai.languageModel
      if (!window.ai) {
        return {
          success: false,
          error: 'Chrome AI API not available'
        };
      }

      if (!window.ai.languageModel) {
        return {
          success: false,
          error: 'LanguageModel API not available'
        };
      }

      const session = await window.ai.languageModel.create({
        expectedOutputs: [{ type: 'text', languages: ['en'] }]
      });
      const result = await session.prompt({
        text: testPrompt,
        language: 'en'
      });

      return {
        success: true,
        response: result.text
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      };
    }
  }, [modelStatus.status]);

  // Check availability on mount and periodically
  useEffect(() => {
    checkAvailability();

    const interval = setInterval(checkAvailability, 5000);
    return () => clearInterval(interval);
  }, [checkAvailability]);

  // Manual test function for console use
  const manualTest = useCallback(async (testPrompt: string = "Hello, how are you?") => {
    try {
      console.log('🧪 Manual AI Model Test Starting...');

      // Check for global LanguageModel
      const globalLM = (window as any).LanguageModel;
      if (globalLM && typeof globalLM.create === 'function') {
        console.log('Using global LanguageModel for manual test');

        const session = await globalLM.create();
        console.log('Session created:', session);

        const result = await session.prompt({
          text: testPrompt,
          language: 'en'
        });

        console.log('✅ AI Response:', result.text);
        return result.text;
      }

      // Fallback to window.ai.languageModel
      if (window.ai && window.ai.languageModel && typeof window.ai.languageModel.create === 'function') {
        console.log('Using window.ai.languageModel for manual test');

        const session = await window.ai.languageModel.create({
          expectedOutputs: [{ type: 'text', languages: ['en'] }]
        });

        const result = await session.prompt({
          text: testPrompt,
          language: 'en'
        });

        console.log('✅ AI Response:', result.text);
        return result.text;
      }

      console.error('❌ No working LanguageModel API found');
      return null;
    } catch (error) {
      console.error('❌ Manual test failed:', error);
      return null;
    }
  }, []);

  return {
    modelStatus,
    checkAvailability,
    downloadModel,
    testModel,
    manualTest,
  };
};
