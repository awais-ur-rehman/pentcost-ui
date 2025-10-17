// Chrome AI API types based on official documentation
export interface ChromeAI {
    translator: {
        translate: (text: string, targetLanguage: string, sourceLanguage?: string) => Promise<{
            translatedText: string;
            sourceLanguage: string;
            targetLanguage: string;
            confidence: number;
        }>;
    };
    proofreader: {
        availability?: () => Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'>;
        create: (options?: ProofreaderOptions) => Promise<ProofreaderSession>;
    };
    rewriter: {
        availability?: () => Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'>;
        create: (options?: RewriterOptions) => Promise<RewriterSession>;
    };
    summarizer: {
        create: (options?: SummarizerOptions) => Promise<SummarizerSession>;
    };
    writer: {
        create: (options?: WriterOptions) => Promise<WriterSession>;
    };
    prompt: {
        create: (options?: PromptOptions) => Promise<PromptSession>;
    };
    languageModel: {
        availability: () => Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'>;
        create: (options?: LanguageModelOptions) => Promise<LanguageModelSession>;
    };
}

// Proofreader API types
export interface ProofreaderOptions {
    expectedInputLanguages?: string[];
    monitor?: (monitor: ProofreaderMonitor) => void;
}

export interface ProofreaderSession {
    proofread: (text: string) => Promise<ProofreadResult>;
}

export interface ProofreadResult {
    correction: string;
    corrections: ProofreadCorrection[];
}

export interface ProofreadCorrection {
    startIndex: number;
    endIndex: number;
    type: 'grammar' | 'spelling' | 'punctuation' | 'style';
    message: string;
    explanation: string;
}

export interface ProofreaderMonitor {
    addEventListener: (event: 'downloadprogress', listener: (e: DownloadProgressEvent) => void) => void;
}

export interface DownloadProgressEvent {
    loaded: number;
    total: number;
}

// Rewriter API types
export interface RewriterOptions {
    tone?: 'formal' | 'casual' | 'concise' | 'detailed';
    context?: string;
    monitor?: (monitor: RewriterMonitor) => void;
}

export interface RewriterSession {
    rewrite: (text: string) => Promise<RewriteResult>;
}

export interface RewriteResult {
    suggestions: RewriteSuggestion[];
}

export interface RewriteSuggestion {
    text: string;
    tone: 'formal' | 'casual' | 'concise' | 'detailed';
    reason: string;
    confidence: number;
}

export interface RewriterMonitor {
    addEventListener: (event: 'downloadprogress', listener: (e: DownloadProgressEvent) => void) => void;
}

// Summarizer API types
export interface SummarizerOptions {
    monitor?: (monitor: SummarizerMonitor) => void;
}

export interface SummarizerSession {
    summarize: (text: string) => Promise<SummaryResult>;
}

export interface SummaryResult {
    summary: string;
}

export interface SummarizerMonitor {
    addEventListener: (event: 'downloadprogress', listener: (e: DownloadProgressEvent) => void) => void;
}

// Writer API types
export interface WriterOptions {
    monitor?: (monitor: WriterMonitor) => void;
}

export interface WriterSession {
    write: (prompt: string) => Promise<WriteResult>;
}

export interface WriteResult {
    text: string;
}

export interface WriterMonitor {
    addEventListener: (event: 'downloadprogress', listener: (e: DownloadProgressEvent) => void) => void;
}

// Prompt API types
export interface PromptOptions {
    monitor?: (monitor: PromptMonitor) => void;
}

export interface PromptSession {
    prompt: (input: string) => Promise<PromptResult>;
}

export interface PromptResult {
    text: string;
}

export interface PromptMonitor {
    addEventListener: (event: 'downloadprogress', listener: (e: DownloadProgressEvent) => void) => void;
}

// Language Model API types
export interface LanguageModelOptions {
    monitor?: (monitor: LanguageModelMonitor) => void;
    expectedOutputs?: Array<{ type: string; languages: string[] }>;
}

export interface LanguageModelSession {
    generate: (input: string) => Promise<GenerateResult>;
    prompt: (options: { text: string; language: string }) => Promise<string | PromptResult>;
}

export interface GenerateResult {
    text: string;
}

export interface PromptResult {
    text: string;
}

export interface LanguageModelMonitor {
    addEventListener: (event: 'downloadprogress' | 'downloadcomplete', listener: (e?: DownloadProgressEvent) => void) => void;
}

declare global {
    interface Window {
        ai?: ChromeAI;
    }
}
