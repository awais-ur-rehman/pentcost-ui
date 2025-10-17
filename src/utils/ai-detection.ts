/**
 * Utility functions for detecting and checking Chrome AI API availability
 */

export interface ChromeAICapabilities {
  translator: boolean;
  proofreader: boolean;
  rewriter: boolean;
  summarizer: boolean;
  writer: boolean;
  prompt: boolean;
  languageModel: boolean;
  isAvailable: boolean;
}

/**
 * Check if Chrome AI APIs are available
 */
export function checkChromeAIAvailability(): ChromeAICapabilities {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return {
      translator: false,
      proofreader: false,
      rewriter: false,
      summarizer: false,
      writer: false,
      prompt: false,
      languageModel: false,
      isAvailable: false
    };
  }

  // Check if window.ai exists
  const hasWindowAI = 'ai' in window && window.ai !== undefined;

  if (!hasWindowAI) {
    return {
      translator: false,
      proofreader: false,
      rewriter: false,
      summarizer: false,
      writer: false,
      prompt: false,
      languageModel: false,
      isAvailable: false
    };
  }

  // Check individual API availability
  const ai = window.ai as any;
  const hasTranslator = typeof ai.translator === 'object' && ai.translator !== null;
  const hasProofreader = typeof ai.proofreader === 'object' && ai.proofreader !== null;
  const hasRewriter = typeof ai.rewriter === 'object' && ai.rewriter !== null;
  const hasSummarizer = typeof ai.summarizer === 'object' && ai.summarizer !== null;
  const hasWriter = typeof ai.writer === 'object' && ai.writer !== null;
  const hasPrompt = typeof ai.prompt === 'object' && ai.prompt !== null;
  const hasLanguageModel = typeof ai.languageModel === 'object' && ai.languageModel !== null;

  return {
    translator: hasTranslator,
    proofreader: hasProofreader,
    rewriter: hasRewriter,
    summarizer: hasSummarizer,
    writer: hasWriter,
    prompt: hasPrompt,
    languageModel: hasLanguageModel,
    // Consider AI available if any Chrome AI surface is present
    isAvailable: hasTranslator || hasProofreader || hasRewriter || hasSummarizer || hasWriter || hasPrompt || hasLanguageModel
  };
}

/**
 * Get a user-friendly message about Chrome AI availability
 */
export function getChromeAIMessage(): string {
  const capabilities = checkChromeAIAvailability();

  // If window.ai is missing entirely, advise enabling Chrome AI features
  if (typeof window === 'undefined' || !('ai' in window) || window.ai === undefined) {
    return 'Chrome AI features are not available. Please ensure you are using Chrome 127+ with AI features enabled.';
  }

  if (!capabilities.isAvailable) {
    return 'Chrome AI is detected, but the required features are not available.';
  }

  const availableFeatures = [];
  if (capabilities.translator) availableFeatures.push('Translation');
  if (capabilities.proofreader) availableFeatures.push('Proofreading');
  if (capabilities.rewriter) availableFeatures.push('Rewriting');
  if (capabilities.summarizer) availableFeatures.push('Summarization');
  if (capabilities.writer) availableFeatures.push('Writing');
  if (capabilities.prompt) availableFeatures.push('Prompt');
  if (capabilities.languageModel) availableFeatures.push('Language Model');

  if (availableFeatures.length === 0) {
    return 'Chrome AI APIs are detected but no features are available.';
  }

  return `Chrome AI features available: ${availableFeatures.join(', ')}`;
}

/**
 * Check if a specific AI feature is available
 */
export function isAIFeatureAvailable(feature: 'translator' | 'proofreader' | 'rewriter' | 'summarizer' | 'writer' | 'prompt' | 'languageModel'): boolean {
  const capabilities = checkChromeAIAvailability();
  return capabilities[feature];
}

/**
 * Show a toast notification about Chrome AI availability
 */
export function notifyChromeAIStatus(): void {
  const message = getChromeAIMessage();
  const capabilities = checkChromeAIAvailability();

  if (capabilities.isAvailable) {
    console.log('✅ Chrome AI APIs detected:', message);
    // Diagnostics for debugging
    const ai: any = (typeof window !== 'undefined' ? (window as any).ai : undefined);
    console.debug('[AI][detect] capabilities', capabilities);
    if (ai) {
      console.debug('[AI][detect] surfaces', {
        hasTranslator: typeof ai.translator === 'object' && ai.translator !== null,
        hasProofreader: typeof ai.proofreader === 'object' && ai.proofreader !== null,
        hasRewriter: typeof ai.rewriter === 'object' && ai.rewriter !== null,
        hasAssistant: typeof ai.assistant === 'object' && ai.assistant !== null,
        hasLanguageModel: typeof ai.languageModel === 'object' && ai.languageModel !== null,
      });
    }
  } else {
    console.warn('⚠️ Chrome AI APIs not available:', message);
    console.debug('[AI][detect] window.ai present:', typeof window !== 'undefined' && 'ai' in window);
  }
}
