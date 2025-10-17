import type { RewriteResult, RewriteSuggestion } from '../../types';
import type { RewriterOptions, RewriteResult as ChromeRewriteResult } from '../../types/chrome-ai';
import '../../types/chrome-ai';

class RewriterService {
    private session: any = null;
    private isInitializing = false;
    private currentTone: 'formal' | 'casual' | 'concise' | 'detailed' = 'formal';
    private currentContext = 'legal contract';

    private isChromeAIAvailable(): boolean {
        return typeof window !== 'undefined' &&
            window.ai !== undefined &&
            window.ai.rewriter !== undefined;
    }

    private async checkAvailability(): Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'> {
        if (!this.isChromeAIAvailable()) {
            return 'unavailable';
        }

        try {
            // Check if Rewriter has availability method
            if (typeof window.ai!.rewriter.availability === 'function') {
                return await window.ai!.rewriter.availability();
            }
            return 'available';
        } catch (error) {
            console.warn('Rewriter availability check failed:', error);
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
                throw new Error('Rewriter API is not available on this device');
            }

            if (availability === 'downloadable' || availability === 'downloading') {
                // Check for user activation
                if (!navigator.userActivation?.isActive) {
                    throw new Error('User activation required to download model');
                }
            }

            const options: RewriterOptions = {
                tone: this.currentTone,
                context: this.currentContext,
                monitor: (monitor) => {
                    monitor.addEventListener('downloadprogress', (e: any) => {
                        console.log(`Rewriter model download progress: ${e.loaded * 100}%`);
                    });
                }
            };

            this.session = await window.ai!.rewriter.create(options);
            console.log('Rewriter session initialized successfully');
        } catch (error) {
            console.error('Failed to initialize rewriter session:', error);
            throw error;
        } finally {
            this.isInitializing = false;
        }
    }

    async rewriteText(
        text: string,
        tone: 'formal' | 'casual' | 'concise' | 'detailed' = 'formal',
        context = 'legal contract'
    ): Promise<RewriteResult> {
        if (!this.isChromeAIAvailable()) {
            throw new Error('Chrome AI Rewriter API is not available. Please ensure you are using Chrome 127+ with AI features enabled.');
        }

        try {
            // Update session if tone or context changed
            if (tone !== this.currentTone || context !== this.currentContext) {
                this.currentTone = tone;
                this.currentContext = context;
                this.session = null; // Force reinitialization with new options
            }

            await this.initializeSession();

            if (!this.session) {
                throw new Error('Rewriter session not available');
            }

            const result: ChromeRewriteResult = await this.session.rewrite(text);

            // Map the Chrome API response to our interface
            const suggestions: RewriteSuggestion[] = result.suggestions.map((suggestion: any) => ({
                text: suggestion.text,
                tone: suggestion.tone || tone,
                reason: suggestion.reason || `Rewritten in ${tone} tone`,
                confidence: suggestion.confidence || 0.8,
            }));

            return {
                originalText: text,
                suggestions,
            };
        } catch (error) {
            console.error('Rewriting failed:', error);
            throw new Error(`Rewriting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async rewriteTextBatch(
        texts: string[],
        tone: 'formal' | 'casual' | 'concise' | 'detailed' = 'formal',
        context = 'legal contract'
    ): Promise<RewriteResult[]> {
        const results: RewriteResult[] = [];

        for (const text of texts) {
            try {
                const result = await this.rewriteText(text, tone, context);
                results.push(result);
            } catch (error) {
                console.error(`Failed to rewrite text: ${text}`, error);
                // Add error result to maintain array order
                results.push({
                    originalText: text,
                    suggestions: [],
                });
            }
        }

        return results;
    }

    // Method to check if rewriter is ready
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

    // Utility method to get the best suggestion
    getBestSuggestion(result: RewriteResult): RewriteSuggestion | null {
        if (result.suggestions.length === 0) {
            return null;
        }

        // Return the suggestion with highest confidence
        return result.suggestions.reduce((best, current) =>
            current.confidence > best.confidence ? current : best
        );
    }

    // Utility method to filter suggestions by tone
    getSuggestionsByTone(result: RewriteResult, tone: 'formal' | 'casual' | 'concise' | 'detailed'): RewriteSuggestion[] {
        return result.suggestions.filter(suggestion => suggestion.tone === tone);
    }
}

export const rewriterService = new RewriterService();
export default rewriterService;