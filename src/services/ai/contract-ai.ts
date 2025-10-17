/**
 * Contract AI Services
 * Handles proofreading, rewriting, and translation of contract text using Chrome AI APIs
 */

export interface AIResult {
    success: boolean;
    result?: string;
    error?: string;
}

export interface ProofreadResult extends AIResult {
    corrections?: Array<{
        startIndex: number;
        endIndex: number;
        type: string;
        message: string;
        explanation: string;
    }>;
}

/**
 * Proofread contract text using Chrome Proofreader API
 */
export async function proofreadText(text: string): Promise<ProofreadResult> {
    try {
        console.log('🔍 Starting proofreading...');

        // Check for global Proofreader API
        const globalProofreader = (window as any).Proofreader;
        if (!globalProofreader || typeof globalProofreader.create !== 'function') {
            return {
                success: false,
                error: 'Proofreader API not available'
            };
        }

        // Check availability
        const availability = await globalProofreader.availability();
        console.log('Proofreader availability:', availability);

        if (availability === 'unavailable') {
            return {
                success: false,
                error: 'Proofreader API is not available'
            };
        }

        // Create proofreader session
        const proofreader = await globalProofreader.create({
            expectedInputLanguages: ['en'],
            monitor: (monitor: any) => {
                monitor.addEventListener('downloadprogress', (e: any) => {
                    const progress = Math.floor(e.loaded * 100);
                    console.log(`Proofreader model download progress: ${progress}%`);
                });
            }
        });

        // Proofread the text
        const result = await proofreader.proofread(text);

        console.log('✅ Proofreading completed');
        console.log('Proofreading result:', result);

        return {
            success: true,
            result: result.correction,
            corrections: result.corrections
        };
    } catch (error) {
        console.error('❌ Proofreading failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Proofreading failed'
        };
    }
}

/**
 * Rewrite contract text using Chrome Rewriter API
 */
export async function rewriteText(text: string, tone: 'formal' | 'casual' | 'concise' | 'detailed' = 'formal'): Promise<AIResult> {
    try {
        console.log('✏️ Starting rewriting...');

        // Check for global Rewriter API
        const globalRewriter = (window as any).Rewriter;
        if (!globalRewriter || typeof globalRewriter.create !== 'function') {
            return {
                success: false,
                error: 'Rewriter API not available'
            };
        }

        // Check availability
        const availability = await globalRewriter.availability();
        console.log('Rewriter availability:', availability);

        if (availability === 'unavailable') {
            return {
                success: false,
                error: 'Rewriter API is not available'
            };
        }

        // Map tone to Rewriter API format
        const toneMap = {
            formal: 'more-formal',
            casual: 'more-casual',
            concise: 'as-is', // Will use length: 'shorter'
            detailed: 'as-is'  // Will use length: 'longer'
        };

        // Create rewriter session
        const rewriter = await globalRewriter.create({
            tone: toneMap[tone],
            format: 'as-is',
            length: tone === 'concise' ? 'shorter' : tone === 'detailed' ? 'longer' : 'as-is',
            sharedContext: 'This is legal contract text that should be professional and clear.',
            monitor: (monitor: any) => {
                monitor.addEventListener('downloadprogress', (e: any) => {
                    const progress = Math.floor(e.loaded * 100);
                    console.log(`Rewriter model download progress: ${progress}%`);
                });
            }
        });

        // Rewrite the text
        const result = await rewriter.rewrite(text, {
            context: 'Maintain legal accuracy and professional tone while improving clarity.'
        });

        console.log('✅ Rewriting completed');
        console.log('Rewriting result:', result);

        return {
            success: true,
            result: result
        };
    } catch (error) {
        console.error('❌ Rewriting failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Rewriting failed'
        };
    }
}

/**
 * Legal terminology glossary for consistent translation
 */
const LEGAL_TERMS = {
    'en': {
        'contractor': 'CONTRACTOR',
        'client': 'CLIENT',
        'agreement': 'AGREEMENT',
        'whereas': 'WHEREAS',
        'now therefore': 'NOW, THEREFORE',
        'entire agreement': 'ENTIRE AGREEMENT',
        'governing law': 'GOVERNING LAW',
        'independent contractor': 'INDEPENDENT CONTRACTOR',
        'intellectual property': 'INTELLECTUAL PROPERTY',
        'confidentiality': 'CONFIDENTIALITY',
        'termination': 'TERMINATION',
        'compensation': 'COMPENSATION',
        'services': 'SERVICES'
    },
    'fr': {
        'contractor': 'ENTREPRENEUR',
        'client': 'CLIENT',
        'agreement': 'ACCORD',
        'whereas': 'ATTENDU QUE',
        'now therefore': 'PAR CONSÉQUENT',
        'entire agreement': 'INTÉGRALITÉ DE L\'ACCORD',
        'governing law': 'LOI APPLICABLE',
        'independent contractor': 'ENTREPRENEUR INDÉPENDANT',
        'intellectual property': 'PROPRIÉTÉ INTELLECTUELLE',
        'confidentiality': 'CONFIDENTIALITÉ',
        'termination': 'RÉSILIATION',
        'compensation': 'RÉMUNÉRATION',
        'services': 'SERVICES'
    }
};

/**
 * Preserve formatting in translated text
 */
function preserveFormatting(original: string, translated: string): string {
    // Extract formatting patterns from original
    const originalLines = original.split('\n');
    const translatedLines = translated.split('\n');

    // If line counts don't match, try to preserve structure
    if (originalLines.length !== translatedLines.length) {
        // Add line breaks where they existed in original
        let formattedTranslation = translated;

        // Preserve section headers (ALL CAPS)
        const sectionHeaders = original.match(/^[A-Z\s]+$/gm) || [];
        sectionHeaders.forEach(header => {
            const translatedHeader = translated.match(new RegExp(header.toLowerCase(), 'i'));
            if (translatedHeader) {
                formattedTranslation = formattedTranslation.replace(
                    translatedHeader[0],
                    translatedHeader[0].toUpperCase()
                );
            }
        });

        // Preserve numbered sections
        const numberedSections = original.match(/^\d+\.\s+/gm) || [];
        numberedSections.forEach(section => {
            if (!formattedTranslation.includes(section)) {
                // Try to add back the numbering
                formattedTranslation = formattedTranslation.replace(
                    /^([A-Z\s]+)/m,
                    section + '$1'
                );
            }
        });

        return formattedTranslation;
    }

    return translated;
}

/**
 * Ensure consistent terminology translation using configurable terms
 */
function ensureConsistency(translatedText: string, sourceLanguage: string, targetLanguage: string): string {
    // For now, use built-in terms. Custom terms can be added later through UI
    const builtinTerms = LEGAL_TERMS[targetLanguage as keyof typeof LEGAL_TERMS] || {};

    let consistentText = translatedText;

    // Apply consistent terminology (case-insensitive)
    Object.entries(builtinTerms).forEach(([key, value]) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedKey}\\b`, 'gi');
        consistentText = consistentText.replace(regex, (match: string) => {
            // Preserve original case pattern
            if (match === match.toUpperCase()) {
                return (value as string).toUpperCase();
            } else if (match === match.toLowerCase()) {
                return (value as string).toLowerCase();
            } else {
                return (value as string);
            }
        });
    });

    return consistentText;
}

/**
 * Translate contract text using Chrome Translator API with enhanced quality
 */
export async function translateText(text: string, targetLanguage: string, sourceLanguage: string = 'en'): Promise<AIResult> {
    try {
        console.log('🌐 Starting enhanced translation...');

        // Check for global Translator API
        const globalTranslator = (window as any).Translator;
        if (!globalTranslator || typeof globalTranslator.create !== 'function') {
            return {
                success: false,
                error: 'Translator API not available'
            };
        }

        // Check availability for this language pair
        const availability = await globalTranslator.availability({
            sourceLanguage,
            targetLanguage
        });

        console.log('Translation availability:', availability);

        if (availability === 'unavailable') {
            return {
                success: false,
                error: `Translation from ${sourceLanguage} to ${targetLanguage} is not available`
            };
        }

        // Create translator session with download monitoring
        const translator = await globalTranslator.create({
            sourceLanguage,
            targetLanguage,
            monitor: (monitor: any) => {
                monitor.addEventListener('downloadprogress', (e: any) => {
                    const progress = Math.floor(e.loaded * 100);
                    console.log(`Translation model download progress: ${progress}%`);
                });
            }
        });

        // Enhanced translation with context
        const contextPrompt = `
Translate the following legal contract text from ${sourceLanguage} to ${targetLanguage}. 

IMPORTANT INSTRUCTIONS:
1. Maintain all legal terminology consistently throughout the document
2. Preserve the original formatting, structure, and layout
3. Use formal legal language appropriate for contracts
4. Keep section headers in ALL CAPS
5. Maintain numbered sections and bullet points
6. Preserve dates, amounts, and addresses exactly as written
7. Use standard legal phrases for the target language

Text to translate:
${text}
`;

        // Translate with context
        const result = await translator.translate(contextPrompt);

        console.log('✅ Translation completed');
        console.log('Raw translation result:', result);

        // Post-process the translation
        let enhancedResult = result;

        // 1. Ensure consistency
        enhancedResult = ensureConsistency(enhancedResult, sourceLanguage, targetLanguage);

        // 2. Preserve formatting
        enhancedResult = preserveFormatting(text, enhancedResult);

        // 3. Add quality disclaimer
        const disclaimer = targetLanguage === 'fr'
            ? '\n\n[DISCLAIMER: Traduction assistée par IA à des fins de référence uniquement. Consultez un professionnel juridique pour la version finale.]'
            : '\n\n[DISCLAIMER: AI-assisted translation for reference only. Consult legal professional for final version.]';

        enhancedResult += disclaimer;

        console.log('Enhanced translation result:', enhancedResult);

        // 4. Optional: Post-translation proofreading for critical errors
        if (targetLanguage === 'fr') {
            try {
                console.log('🔍 Running post-translation proofreading...');
                const proofreadResult = await proofreadText(enhancedResult);
                if (proofreadResult.success && proofreadResult.result) {
                    console.log('✅ Post-translation proofreading completed');
                    enhancedResult = proofreadResult.result;
                }
            } catch (proofreadError) {
                console.warn('⚠️ Post-translation proofreading failed, using original translation:', proofreadError);
            }
        }

        return {
            success: true,
            result: enhancedResult
        };
    } catch (error) {
        console.error('❌ Translation failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Translation failed'
        };
    }
}

/**
 * Check if AI features are available
 */
export function checkAIFeatures(): {
    proofreader: boolean;
    rewriter: boolean;
    translator: boolean;
    overall: boolean;
} {
    const features = {
        proofreader: false,
        rewriter: false,
        translator: false,
        overall: false
    };

    if (typeof window !== 'undefined') {
        // Check for specific Chrome AI APIs
        const hasTranslator = (window as any).Translator && typeof (window as any).Translator.create === 'function';
        const hasProofreader = (window as any).Proofreader && typeof (window as any).Proofreader.create === 'function';
        const hasRewriter = (window as any).Rewriter && typeof (window as any).Rewriter.create === 'function';

        // Fallback to LanguageModel if specific APIs are not available
        const globalLM = (window as any).LanguageModel;
        const hasLanguageModel = globalLM && typeof globalLM.create === 'function';

        features.translator = hasTranslator;
        features.proofreader = hasProofreader || hasLanguageModel;
        features.rewriter = hasRewriter || hasLanguageModel;
        features.overall = features.proofreader || features.rewriter || features.translator;
    }

    return features;
}

/**
 * Test all AI features
 */
export async function testAIFeatures(): Promise<{
    proofreader: AIResult;
    rewriter: AIResult;
    translator: AIResult;
}> {
    const testText = "This is a test sentence with some errors that need to be corrected.";

    const [proofreaderResult, rewriterResult, translatorResult] = await Promise.allSettled([
        proofreadText(testText),
        rewriteText(testText, 'formal'),
        translateText(testText, 'es')
    ]);

    return {
        proofreader: proofreaderResult.status === 'fulfilled' ? proofreaderResult.value : { success: false, error: 'Promise rejected' },
        rewriter: rewriterResult.status === 'fulfilled' ? rewriterResult.value : { success: false, error: 'Promise rejected' },
        translator: translatorResult.status === 'fulfilled' ? translatorResult.value : { success: false, error: 'Promise rejected' }
    };
}
