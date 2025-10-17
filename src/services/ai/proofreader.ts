import type { ProofreadingResult, ProofreadingError, ProofreadingSuggestion } from '../../types';
import type { ProofreaderOptions, ProofreadResult } from '../../types/chrome-ai';
import '../../types/chrome-ai';

class ProofreaderService {
    private session: any = null;
    private isInitializing = false;

    private isChromeAIAvailable(): boolean {
        return typeof window !== 'undefined' &&
            window.ai !== undefined &&
            window.ai.proofreader !== undefined;
    }

    private async checkAvailability(): Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'> {
        if (!this.isChromeAIAvailable()) {
            return 'unavailable';
        }

        try {
            // Check if Proofreader has availability method
            if (typeof window.ai!.proofreader.availability === 'function') {
                return await window.ai!.proofreader.availability();
            }
            return 'available';
        } catch (error) {
            console.warn('Proofreader availability check failed:', error);
            return 'unavailable';
        }
    }

    private async initializeSession(): Promise<void> {
        if (this.session || this.isInitializing) {
            return;
        }

        this.isInitializing = true;

        try {
            const availability = await this.checkAvailability();

            if (availability === 'unavailable') {
                throw new Error('Proofreader API is not available on this device');
            }

            if (availability === 'downloadable' || availability === 'downloading') {
                // Check for user activation
                if (!navigator.userActivation?.isActive) {
                    throw new Error('User activation required to download model');
                }
            }

            const options: ProofreaderOptions = {
                expectedInputLanguages: ['en'],
                monitor: (monitor) => {
                    monitor.addEventListener('downloadprogress', (e: any) => {
                        console.log(`Proofreader model download progress: ${e.loaded * 100}%`);
                    });
                }
            };

            this.session = await window.ai!.proofreader.create(options);
            console.log('Proofreader session initialized successfully');
        } catch (error) {
            console.error('Failed to initialize proofreader session:', error);
            throw error;
        } finally {
            this.isInitializing = false;
        }
    }

    async checkText(text: string, _language = 'en'): Promise<ProofreadingResult> {
        if (!this.isChromeAIAvailable()) {
            throw new Error('Chrome AI Proofreader API is not available. Please ensure you are using Chrome 127+ with AI features enabled.');
        }

        try {
            await this.initializeSession();

            if (!this.session) {
                throw new Error('Proofreader session not available');
            }

            const result: ProofreadResult = await this.session.proofread(text);

            // Map the new API response to our existing interface
            const errors: ProofreadingError[] = result.corrections.map((correction: any) => ({
                type: correction.type || 'grammar',
                message: correction.message || correction.explanation || 'Error found',
                startIndex: correction.startIndex,
                endIndex: correction.endIndex,
                severity: 'medium', // Default severity since new API doesn't provide this
            }));

            const suggestions: ProofreadingSuggestion[] = result.corrections.map((correction: any) => ({
                originalText: text.substring(correction.startIndex, correction.endIndex),
                suggestedText: '', // New API doesn't provide individual suggestions
                reason: correction.explanation || correction.message || 'Correction needed',
                startIndex: correction.startIndex,
                endIndex: correction.endIndex,
            }));

            return {
                originalText: text,
                correctedText: result.correction,
                errors,
                suggestions,
            };
        } catch (error) {
            console.error('Proofreading failed:', error);
            throw new Error(`Proofreading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async checkTextBatch(texts: string[], language = 'en'): Promise<ProofreadingResult[]> {
        const results: ProofreadingResult[] = [];

        for (const text of texts) {
            try {
                const result = await this.checkText(text, language);
                results.push(result);
            } catch (error) {
                console.error(`Failed to proofread text: ${text}`, error);
                // Add error result to maintain array order
                results.push({
                    originalText: text,
                    correctedText: text, // Fallback to original text
                    errors: [],
                    suggestions: [],
                });
            }
        }

        return results;
    }

    // Utility method to get error count by severity
    getErrorCounts(result: ProofreadingResult): { low: number; medium: number; high: number } {
        const counts = { low: 0, medium: 0, high: 0 };

        result.errors.forEach(error => {
            counts[error.severity]++;
        });

        return counts;
    }

    // Utility method to get errors by type
    getErrorsByType(result: ProofreadingResult): Record<string, ProofreadingError[]> {
        const errorsByType: Record<string, ProofreadingError[]> = {
            grammar: [],
            spelling: [],
            punctuation: [],
            style: [],
        };

        result.errors.forEach(error => {
            errorsByType[error.type].push(error);
        });

        return errorsByType;
    }

    // Utility method to apply a suggestion
    applySuggestion(text: string, suggestion: ProofreadingSuggestion): string {
        return text.substring(0, suggestion.startIndex) +
            suggestion.suggestedText +
            text.substring(suggestion.endIndex);
    }

    // Utility method to apply all suggestions
    applyAllSuggestions(result: ProofreadingResult): string {
        let correctedText = result.originalText;

        // Sort suggestions by start index in descending order to avoid index shifting
        const sortedSuggestions = [...result.suggestions].sort((a, b) => b.startIndex - a.startIndex);

        sortedSuggestions.forEach(suggestion => {
            correctedText = this.applySuggestion(correctedText, suggestion);
        });

        return correctedText;
    }

    // Method to check if proofreader is ready
    async isReady(): Promise<boolean> {
        try {
            const availability = await this.checkAvailability();
            return availability === 'available' || this.session !== null;
        } catch {
            return false;
        }
    }

    // Method to get download progress if downloading
    async getDownloadProgress(): Promise<number | null> {
        try {
            const availability = await this.checkAvailability();
            if (availability === 'downloading') {
                // Note: In real implementation, you'd track progress from the monitor
                return 0; // Placeholder
            }
            return null;
        } catch {
            return null;
        }
    }
}

export const proofreaderService = new ProofreaderService();
export default proofreaderService;