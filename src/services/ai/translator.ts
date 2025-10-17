import type { TranslationResult } from '../../types';
import '../../types/chrome-ai';

class TranslatorService {
    private cache = new Map<string, TranslationResult>();
    private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

    private isChromeAIAvailable(): boolean {
        const has = typeof window !== 'undefined' && typeof (window as any).ai !== 'undefined';
        // Debug diagnostics for availability
        if (has) {
            const ai: any = (window as any).ai;
            // eslint-disable-next-line no-console
            console.debug('[AI][translator] window.ai surfaces:', {
                hasTranslator: typeof ai.translator === 'object' && ai.translator !== null,
                hasProofreader: typeof ai.proofreader === 'object' && ai.proofreader !== null,
                hasRewriter: typeof ai.rewriter === 'object' && ai.rewriter !== null,
                hasAssistant: typeof ai.assistant === 'object' && ai.assistant !== null,
                hasLanguageModel: typeof ai.languageModel === 'object' && ai.languageModel !== null,
            });
        } else {
            // eslint-disable-next-line no-console
            console.debug('[AI][translator] window.ai is not defined');
        }
        return has;
    }

    private getCacheKey(text: string, targetLanguage: string, sourceLanguage?: string): string {
        return `${text}-${sourceLanguage || 'auto'}-${targetLanguage}`;
    }

    private getCachedTranslation(text: string, targetLanguage: string, sourceLanguage?: string): TranslationResult | null {
        const key = this.getCacheKey(text, targetLanguage, sourceLanguage);
        const cached = this.cache.get(key);

        if (cached && cached.timestamp && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
            return cached;
        }

        if (cached) {
            this.cache.delete(key);
        }

        return null;
    }

    private setCachedTranslation(result: TranslationResult): void {
        const key = this.getCacheKey(result.originalText, result.targetLanguage, result.sourceLanguage);
        this.cache.set(key, { ...result, timestamp: Date.now() });
    }

    async translate(
        text: string,
        targetLanguage: string,
        sourceLanguage?: string
    ): Promise<TranslationResult> {
        // Check cache first
        const cached = this.getCachedTranslation(text, targetLanguage, sourceLanguage);
        if (cached) {
            return cached;
        }

        // Check if Chrome AI is available
        if (!this.isChromeAIAvailable()) {
            throw new Error('Chrome AI features are not available in this browser environment.');
        }

        try {
            const ai: any = (window as any).ai;
            // Prefer native translator if present
            if (ai?.translator?.translate) {
                // eslint-disable-next-line no-console
                console.debug('[AI][translator] Using native window.ai.translator.translate');
                const result = await ai.translator.translate(text, targetLanguage, sourceLanguage);
                const translationResult: TranslationResult = {
                    originalText: text,
                    translatedText: result.translatedText,
                    sourceLanguage: result.sourceLanguage,
                    targetLanguage: result.targetLanguage,
                    confidence: result.confidence,
                    timestamp: Date.now(),
                };
                this.setCachedTranslation(translationResult);
                return translationResult;
            }

            // Fallback: use on-device language model if available
            if (ai?.languageModel?.create) {
                // eslint-disable-next-line no-console
                console.debug('[AI][translator] Falling back to window.ai.languageModel');
                const session = await ai.languageModel.create();
                const prompt = `Translate the following text to ${targetLanguage}. Respond with only the translated text.\n\nText:\n${text}`;
                const reply: string = await session.prompt(prompt);
                const translationResult: TranslationResult = {
                    originalText: text,
                    translatedText: reply?.trim?.() ?? String(reply ?? ''),
                    sourceLanguage: sourceLanguage || 'auto',
                    targetLanguage,
                    confidence: 0.9,
                    timestamp: Date.now(),
                };
                this.setCachedTranslation(translationResult);
                return translationResult;
            }

            // Fallback: try assistant if available
            if (ai?.assistant?.create) {
                // eslint-disable-next-line no-console
                console.debug('[AI][translator] Falling back to window.ai.assistant');
                const assistant = await ai.assistant.create();
                const prompt = `Translate the following text to ${targetLanguage}. Respond with only the translated text.\n\nText:\n${text}`;
                const reply: string = await assistant.prompt(prompt);
                const translationResult: TranslationResult = {
                    originalText: text,
                    translatedText: reply?.trim?.() ?? String(reply ?? ''),
                    sourceLanguage: sourceLanguage || 'auto',
                    targetLanguage,
                    confidence: 0.9,
                    timestamp: Date.now(),
                };
                this.setCachedTranslation(translationResult);
                return translationResult;
            }

            throw new Error('No translation-capable AI surface found (translator, languageModel, or assistant).');
        } catch (error) {
            console.error('Translation failed:', error);
            throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async translateBatch(
        texts: string[],
        targetLanguage: string,
        sourceLanguage?: string
    ): Promise<TranslationResult[]> {
        const results: TranslationResult[] = [];

        for (const text of texts) {
            try {
                const result = await this.translate(text, targetLanguage, sourceLanguage);
                results.push(result);
            } catch (error) {
                console.error(`Failed to translate text: ${text}`, error);
                // Add error result to maintain array order
                results.push({
                    originalText: text,
                    translatedText: text, // Fallback to original text
                    sourceLanguage: sourceLanguage || 'unknown',
                    targetLanguage,
                    confidence: 0,
                    timestamp: Date.now(),
                });
            }
        }

        return results;
    }

    clearCache(): void {
        this.cache.clear();
    }

    getCacheSize(): number {
        return this.cache.size;
    }

    // Utility method to detect language
    async detectLanguage(text: string): Promise<string> {
        if (!this.isChromeAIAvailable()) {
            throw new Error('Chrome AI Translator API is not available');
        }

        try {
            // Try translating to a common language to detect source language
            const result = await window.ai!.translator.translate(text, 'en');
            return result.sourceLanguage;
        } catch (error) {
            console.error('Language detection failed:', error);
            return 'unknown';
        }
    }
}

export const translatorService = new TranslatorService();
export default translatorService;
