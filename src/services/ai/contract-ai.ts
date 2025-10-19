/**
 * Contract AI Services
 * Handles proofreading, rewriting, and translation of contract text using Chrome AI APIs
 */

// Chrome AI API types and interfaces
declare global {
    // LanguageModel API (Prompt API)
    const LanguageModel: {
        availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
        params(): Promise<{
            defaultTopK: number;
            maxTopK: number;
            defaultTemperature: number;
            maxTemperature: number;
        }>;
        create(options?: {
            temperature?: number;
            topK?: number;
            expectedOutputs?: Array<{ type: string; languages: string[] }>;
            monitor?: (monitor: any) => void;
        }): Promise<{
            prompt(text: string): Promise<string>;
            destroy(): Promise<void>;
        }>;
    };
}

// Debug function to log translation data
let debugCallback: ((data: any) => void) | null = null;

export function setTranslationDebugCallback(callback: (data: any) => void) {
    debugCallback = callback;
}

function logTranslationDebug(data: {
    inputText: string;
    outputText: string;
    targetLanguage: string;
    step: 'translate' | 'proofread' | 'format';
    success: boolean;
    error?: string;
    duration?: number;
    formattingApplied?: boolean;
}) {
    if (debugCallback) {
        debugCallback(data);
    }
}

/**
 * Extract the actual translation from the API response by removing the prompt part
 */
function extractTranslationFromResponse(response: string, originalText: string): string {
    console.log('🔍 Extracting translation from response...');
    console.log('📝 Response length:', response.length);
    console.log('📝 Response first 500 chars:', response.substring(0, 500));

    // Look for the start of the actual translation
    // The translation usually starts after the prompt instructions
    const markers = [
        'TRANSLATION (fr only):',
        'TRANSLATION (en only):',
        'TRANSLATION (es only):',
        'TRANSLATION (de only):',
        'Contract to translate:',
        'Contrat à traduire:',
        'Text to translate:',
        'Texte à traduire:',
        'FREELANCE GRAPHIC DESIGN SERVICES AGREEMENT',
        'ACCORD DE SERVICES DE CONCEPTION GRAPHIQUE FREELANCE',
        'This Freelance Graphic Design Services Agreement',
        'Cet Accord de Services de Conception Graphique Freelance',
        'DUMMY CONTRACT AGREEMENT',
        'ACCORD DE CONTRAT FACTICE'
    ];

    let startIndex = -1;
    for (const marker of markers) {
        const index = response.indexOf(marker);
        if (index !== -1) {
            startIndex = index + marker.length;
            console.log('✅ Found marker:', marker, 'at index:', index);
            break;
        }
    }

    if (startIndex === -1) {
        // If no marker found, try to find the start of the actual contract
        // Look for common contract beginnings
        const contractStarters = [
            'FREELANCE GRAPHIC DESIGN SERVICES AGREEMENT',
            'ACCORD DE SERVICES DE CONCEPTION GRAPHIQUE FREELANCE',
            'This Freelance Graphic Design Services Agreement',
            'Cet Accord de Services de Conception Graphique Freelance',
            'DUMMY CONTRACT AGREEMENT',
            'ACCORD DE CONTRAT FACTICE',
            'This Agreement is made',
            'Cet Accord est conclu'
        ];

        for (const starter of contractStarters) {
            const index = response.indexOf(starter);
            if (index !== -1) {
                startIndex = index;
                console.log('✅ Found contract starter:', starter, 'at index:', index);
                break;
            }
        }
    }

    if (startIndex === -1) {
        // Try a different approach - look for the actual contract content
        // The Chrome Translator API might be returning the prompt in the target language
        // Let's look for the actual contract text patterns

        // Look for patterns that indicate the start of the actual contract
        const patterns = [
            /(?:^|\n)\s*FREELANCE GRAPHIC DESIGN SERVICES AGREEMENT/i,
            /(?:^|\n)\s*ACCORD DE SERVICES DE CONCEPTION GRAPHIQUE FREELANCE/i,
            /(?:^|\n)\s*This Freelance Graphic Design Services Agreement/i,
            /(?:^|\n)\s*Cet Accord de Services de Conception Graphique Freelance/i
        ];

        for (const pattern of patterns) {
            const match = response.match(pattern);
            if (match) {
                startIndex = match.index || 0;
                console.log('✅ Found pattern match at index:', startIndex);
                break;
            }
        }
    }

    if (startIndex === -1) {
        // If still no marker found, try to find where the prompt ends and translation begins
        // Look for the end of common prompt phrases
        const promptEndings = [
            'Contract to translate:',
            'Contrat à traduire:',
            'Text to translate:',
            'Texte à traduire:',
            'Exigences critiques :',
            'CRITICAL REQUIREMENTS:',
            'Traduisez le contrat',
            'Translate the contract'
        ];

        for (const ending of promptEndings) {
            const index = response.indexOf(ending);
            if (index !== -1) {
                startIndex = index + ending.length;
                console.log('✅ Found prompt ending:', ending, 'at index:', index);
                break;
            }
        }
    }

    if (startIndex === -1) {
        // Last resort: if the response is mostly the prompt, try to find the actual content
        // by looking for the original text structure
        console.warn('⚠️ Could not find translation start marker, trying alternative approach');

        // Check if the response contains the actual contract content
        const contractIndicators = [
            'FREELANCE GRAPHIC DESIGN SERVICES AGREEMENT',
            'ACCORD DE SERVICES DE CONCEPTION GRAPHIQUE FREELANCE',
            'Bloom & Co. Marketing Agency',
            'Alexandra Chen',
            'Chen Creative Studio',
            'March 1, 2025',
            '1 mars 2025'
        ];

        let foundContent = false;
        for (const indicator of contractIndicators) {
            if (response.includes(indicator)) {
                foundContent = true;
                console.log('✅ Found contract content indicator:', indicator);
                break;
            }
        }

        if (foundContent) {
            console.log('✅ Found contract content in response, using full response');
            return response;
        }

        // If all else fails, return the response as-is
        console.warn('⚠️ Could not extract translation, returning full response');
        return response;
    }

    // Extract the translation part
    let translation = response.substring(startIndex).trim();

    // Remove any remaining prompt text at the end
    const endMarkers = [
        'Exigences critiques',
        'CRITICAL REQUIREMENTS',
        'Traduisez le contrat',
        'Translate the contract',
        'Vous êtes un traducteur',
        'You are a professional'
    ];

    for (const endMarker of endMarkers) {
        const endIndex = translation.indexOf(endMarker);
        if (endIndex !== -1) {
            translation = translation.substring(0, endIndex).trim();
            console.log('✅ Removed end marker:', endMarker);
            break;
        }
    }

    console.log('✅ Extracted translation length:', translation.length);
    console.log('✅ Extracted translation first 200 chars:', translation.substring(0, 200));

    return translation;
}

export interface AIResult {
    success: boolean;
    result?: string;
    error?: string;
    warning?: string;
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

        const proofreadResult = result.correctedInput || result.correction;

        // Log debug data
        logTranslationDebug({
            inputText: text,
            outputText: proofreadResult,
            targetLanguage: 'en', // Proofreading is typically in the same language
            step: 'proofread',
            success: true
        });

        return {
            success: true,
            result: proofreadResult,
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
 * Detect the language of the input text using Chrome Language Detector API
 */
async function detectLanguage(text: string): Promise<AIResult> {
    try {
        // Check if Language Detector API is available
        if (!('LanguageDetector' in self)) {
            return {
                success: false,
                error: 'Language Detector API not available'
            };
        }

        console.log('🔍 Checking Language Detector availability...');

        // Check availability
        const availability = await (self as any).LanguageDetector.availability();
        console.log('🔍 Language Detector availability:', availability);

        if (availability === 'unavailable') {
            return {
                success: false,
                error: 'Language Detector API is unavailable'
            };
        }

        // Create language detector with download monitoring
        const detector = await (self as any).LanguageDetector.create({
            monitor: (monitor: any) => {
                monitor.addEventListener('downloadprogress', (e: any) => {
                    const progress = Math.floor(e.loaded * 100);
                    console.log(`Language detection model download progress: ${progress}%`);
                });
            }
        });

        console.log('🔍 Detecting language for text...');
        console.log('📝 Text length:', text.length);
        console.log('📝 Text first 200 chars:', text.substring(0, 200));

        // Detect language
        const results = await detector.detect(text);

        if (results && results.length > 0) {
            const topResult = results[0];
            console.log('🔍 Detection results:', results.slice(0, 3)); // Show top 3 results

            // Check confidence threshold
            if (topResult.confidence > 0.5) {
                console.log(`✅ Language detected: ${topResult.detectedLanguage} (confidence: ${topResult.confidence})`);
                return {
                    success: true,
                    result: topResult.detectedLanguage
                };
            } else {
                console.warn(`⚠️ Low confidence detection: ${topResult.detectedLanguage} (confidence: ${topResult.confidence})`);
                return {
                    success: false,
                    error: `Low confidence language detection: ${topResult.detectedLanguage} (${topResult.confidence})`
                };
            }
        } else {
            return {
                success: false,
                error: 'No language detection results'
            };
        }

    } catch (error) {
        console.error('❌ Language detection failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Language detection failed'
        };
    }
}

/**
 * Enhanced translation workflow: Detect → Translate → Format using Chrome AI APIs
 */
export async function translateText(text: string, targetLanguage: string, sourceLanguage: string = 'auto', htmlContent?: string): Promise<AIResult> {
    const startTime = Date.now();

    try {
        console.log('🌐 Starting two-step translation workflow: Detect → Translate → Format');

        // ============================================
        // STEP 0: DETECT SOURCE LANGUAGE
        // ============================================
        let detectedSourceLanguage = sourceLanguage;

        if (sourceLanguage === 'auto' || !sourceLanguage) {
            console.log('🔍 Step 0: Detecting source language...');
            const detectionStartTime = Date.now();
            const detectionResult = await detectLanguage(text);
            const detectionDuration = Date.now() - detectionStartTime;

            if (detectionResult.success && detectionResult.result) {
                detectedSourceLanguage = detectionResult.result;
                console.log(`✅ Detected source language: ${detectedSourceLanguage}`);

                // Log debug data for language detection
                logTranslationDebug({
                    inputText: text.substring(0, 200) + '...',
                    outputText: detectedSourceLanguage,
                    targetLanguage: 'detection',
                    step: 'translate', // Use translate step for detection
                    success: true,
                    duration: detectionDuration
                });
            } else {
                console.warn('⚠️ Language detection failed, defaulting to English');
                detectedSourceLanguage = 'en';

                // Log debug data for failed detection
                logTranslationDebug({
                    inputText: text.substring(0, 200) + '...',
                    outputText: 'en (fallback)',
                    targetLanguage: 'detection',
                    step: 'translate',
                    success: false,
                    error: detectionResult.error,
                    duration: detectionDuration
                });
            }
        }

        // ============================================
        // STEP 1: TRANSLATE CONTENT
        // ============================================
        console.log('📝 Step 1: Translating content...');
        const translationStartTime = Date.now();
        const translationResult = await translateWithTranslatorAPI(text, targetLanguage, detectedSourceLanguage);
        const translationDuration = Date.now() - translationStartTime;

        if (!translationResult.success || !translationResult.result) {
            return translationResult;
        }

        console.log('✅ Translation completed');

        // ============================================
        // STEP 2: FORMAT TRANSLATION
        // ============================================
        console.log('🎨 Step 2: Formatting translation...');

        let formattedText = translationResult.result;
        let formattingApplied = false;

        // Check if Prompt API is available for formatting
        console.log('🔍 Checking Prompt API availability...');
        console.log('🔍 window.ai exists:', !!window.ai);
        console.log('🔍 LanguageModel exists:', typeof LanguageModel !== 'undefined');

        if (window.ai) {
            console.log('🔍 Available AI APIs:', Object.keys(window.ai));
            console.log('🔍 window.ai.languageModel exists:', !!window.ai.languageModel);
            console.log('🔍 window.ai.prompt exists:', !!window.ai.prompt);
        }

        // Check for Prompt API using LanguageModel directly
        if (typeof LanguageModel !== 'undefined') {
            try {
                const formattingStartTime = Date.now();
                // Use HTML content if available, otherwise fall back to plain text
                const templateContent = htmlContent || text;
                const formattingResult = await formatTranslatedContract(translationResult.result, targetLanguage, templateContent);
                const formattingDuration = Date.now() - formattingStartTime;

                if (formattingResult.success && formattingResult.result) {
                    formattedText = formattingResult.result;
                    formattingApplied = true;
                    console.log('✅ Formatting applied successfully');

                    // Log debug data for formatting step
                    logTranslationDebug({
                        inputText: translationResult.result,
                        outputText: formattingResult.result,
                        targetLanguage,
                        step: 'format',
                        success: true,
                        duration: formattingDuration,
                        formattingApplied: true
                    });
                } else {
                    console.warn('⚠️ Formatting failed, using unformatted translation');

                    // Log debug data for failed formatting
                    logTranslationDebug({
                        inputText: translationResult.result,
                        outputText: translationResult.result,
                        targetLanguage,
                        step: 'format',
                        success: false,
                        error: formattingResult.error,
                        duration: formattingDuration
                    });
                }
            } catch (error) {
                console.warn('⚠️ Formatting failed, using unformatted translation:', error);

                // Log debug data for formatting error
                logTranslationDebug({
                    inputText: translationResult.result,
                    outputText: translationResult.result,
                    targetLanguage,
                    step: 'format',
                    success: false,
                    error: error instanceof Error ? error.message : 'Formatting failed'
                });
            }
        } else {
            console.warn('⚠️ Using basic HTML formatting to preserve Spanish translation');

            // Apply basic formatting as fallback using original text as template
            const templateContent = htmlContent || text;
            formattedText = applyBasicFormatting(translationResult.result, templateContent);
            formattingApplied = true;

            // Log debug data for basic formatting
            logTranslationDebug({
                inputText: translationResult.result,
                outputText: formattedText,
                targetLanguage,
                step: 'format',
                success: true,
                duration: 0,
                formattingApplied: true
            });
        }

        // Add disclaimer about AI translation
        const disclaimer = targetLanguage === 'fr'
            ? '\n\n[DISCLAIMER: Traduction assistée par IA à des fins de référence uniquement. Consultez un professionnel juridique pour la version finale.]'
            : '\n\n[DISCLAIMER: AI-assisted translation for reference only. Consult legal professional for final version.]';

        return {
            success: true,
            result: formattedText + disclaimer
        };

    } catch (error) {
        console.error('❌ Translation workflow failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Translation workflow failed'
        };
    }
}

/**
 * Step 1: Translate using Chrome Translator API
 */
async function translateWithTranslatorAPI(text: string, targetLanguage: string, sourceLanguage: string): Promise<AIResult> {
    const startTime = Date.now();
    let translationPrompt = '';

    try {
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

        // Use Chrome Translator API - send just the contract text, not the prompt
        console.log('📝 Original text length:', text.length);
        console.log('📝 First 200 chars:', text.substring(0, 200));

        // Build enhanced translation prompt with legal context (for logging only)
        translationPrompt = buildTranslationPrompt(text, sourceLanguage, targetLanguage);
        console.log('📝 Translation prompt (for reference):', translationPrompt.substring(0, 200));

        // Send ONLY the contract text to the Translator API, not the prompt
        const rawResult = await translator.translate(text);
        console.log('✅ Translation completed using Translator API');
        console.log('📝 Raw result length:', rawResult.length);
        console.log('📝 Raw result first 200 chars:', rawResult.substring(0, 200));

        // Since we sent only the contract text, the result should be the direct translation
        // But let's still clean it up in case there are any artifacts
        const result = extractTranslationFromResponse(rawResult, text);
        console.log('📝 Cleaned translation length:', result.length);
        console.log('📝 Cleaned translation first 200 chars:', result.substring(0, 200));

        // Post-process the translation
        let enhancedResult = result;
        enhancedResult = ensureConsistency(enhancedResult, sourceLanguage, targetLanguage);
        enhancedResult = preserveFormatting(text, enhancedResult);

        const duration = Date.now() - startTime;

        // Log debug data for translation step
        logTranslationDebug({
            inputText: translationPrompt,
            outputText: enhancedResult,
            targetLanguage,
            step: 'translate',
            success: true,
            duration: duration
        });

        return {
            success: true,
            result: enhancedResult
        };
    } catch (error) {
        console.error('❌ Translation failed:', error);

        const duration = Date.now() - startTime;

        // Log debug data for failed translation
        logTranslationDebug({
            inputText: translationPrompt || text,
            outputText: '',
            targetLanguage,
            step: 'translate',
            success: false,
            error: error instanceof Error ? error.message : 'Translation failed',
            duration: duration
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Translation failed'
        };
    }
}

/**
 * Manual proofreading for user-selected text only (prevents hallucinations)
 * This should only be used on small text selections (< 500 characters)
 */
export async function proofreadSelection(selectedText: string): Promise<AIResult> {
    try {
        // Enforce size limit to prevent hallucinations
        if (selectedText.length > 500) {
            return {
                success: false,
                error: 'Selection too large. Please select max 500 characters for proofreading to prevent hallucinations.'
            };
        }

        console.log('🔍 Manual proofreading of selected text...');
        console.log('📝 Selected text length:', selectedText.length);

        const result = await proofreadText(selectedText);

        if (!result.success || !result.result) {
            return {
                success: false,
                error: result.error || 'Proofreading failed'
            };
        }

        // Validate that proofreading didn't hallucinate
        const validation = validateProofreadOutput(selectedText, result.result);

        if (!validation.isValid) {
            console.warn('⚠️ Proofreader may have hallucinated, returning original text');
            return {
                success: true,
                result: selectedText,
                warning: 'Proofreading may have altered content. Original text preserved.'
            };
        }

        console.log('✅ Manual proofreading completed successfully');
        return {
            success: true,
            result: result.result
        };
    } catch (error) {
        console.error('❌ Manual proofreading failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Manual proofreading failed'
        };
    }
}

/**
 * Validate proofread output to detect hallucinations
 */
function validateProofreadOutput(original: string, proofread: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check 1: Length similarity (should be within 10%)
    const lengthDiff = Math.abs(proofread.length - original.length) / original.length;
    if (lengthDiff > 0.1) {
        issues.push(`Length changed by ${(lengthDiff * 100).toFixed(1)}% (max allowed: 10%)`);
    }

    // Check 2: No new section numbers
    const originalSections = original.match(/\d+\.\s+[A-Z]/g) || [];
    const proofreadSections = proofread.match(/\d+\.\s+[A-Z]/g) || [];
    if (proofreadSections.length > originalSections.length) {
        issues.push(`New sections detected: ${proofreadSections.length} vs ${originalSections.length}`);
    }

    // Check 3: Key terms preserved (dollar amounts, dates)
    const dollarAmounts = original.match(/\$[\d,]+/g) || [];
    const missingAmounts = dollarAmounts.filter(amount => !proofread.includes(amount));
    if (missingAmounts.length > 0) {
        issues.push(`Missing dollar amounts: ${missingAmounts.join(', ')}`);
    }

    // Check 4: No completely new content blocks
    const originalWords = original.split(/\s+/).length;
    const proofreadWords = proofread.split(/\s+/).length;
    if (proofreadWords > originalWords * 1.5) {
        issues.push(`Significant content increase detected: ${proofreadWords} vs ${originalWords} words`);
    }

    return {
        isValid: issues.length === 0,
        issues
    };
}

/**
 * Step 2: Format translated contract using Chrome Prompt API (LanguageModel)
 * This adds proper formatting without changing content, using original text as template
 */
async function formatTranslatedContract(translatedText: string, targetLanguage: string, originalText: string): Promise<AIResult> {
    try {
        // Check if Prompt API is available
        if (typeof LanguageModel === 'undefined') {
            return {
                success: false,
                error: 'LanguageModel API not available for formatting'
            };
        }

        console.log('🎨 Creating language model session for formatting...');
        console.log('🔍 Using LanguageModel API directly');

        // Check availability first
        const availability = await LanguageModel.availability();
        console.log('🔍 LanguageModel availability:', availability);

        if (availability === 'unavailable') {
            return {
                success: false,
                error: 'LanguageModel is unavailable'
            };
        }

        // Create session with proper parameters
        const params = await LanguageModel.params();
        console.log('🔍 LanguageModel params:', params);

        const session = await LanguageModel.create({
            temperature: 0.1,
            topK: 1,
            expectedOutputs: [
                { type: "text", languages: [targetLanguage] }
            ]
        });

        // Check if originalText contains HTML tags
        const isHTML = /<[^>]+>/.test(originalText);

        // Build formatting prompt using original text as template
        const formattingPrompt = isHTML
            ? buildHTMLFormattingPrompt(translatedText, originalText)
            : buildFormattingPrompt(translatedText, originalText);

        console.log('📝 Sending formatting request to Prompt API...');
        console.log('📝 Formatting prompt length:', formattingPrompt.length);
        console.log('📝 Formatting prompt first 200 chars:', formattingPrompt.substring(0, 200));

        // Get formatted output
        console.log('📝 Calling session.prompt with formatting prompt...');
        const systemPrompt = `You are a document formatter. Your ONLY job is to add HTML formatting. 

CRITICAL INSTRUCTIONS:
- DO NOT translate anything
- DO NOT change any words
- DO NOT change the language
- The text is already in ${targetLanguage} - keep it in ${targetLanguage}
- ONLY add HTML tags like <p>, <h1>, <h2>, <ul>, <li>, <strong>
- Preserve all content exactly as it is

Your task is ONLY to add HTML formatting to make the document look better.`;
        const fullPrompt = `${systemPrompt}\n\n${formattingPrompt}`;

        const result = await session.prompt(fullPrompt);
        const formattedText = typeof result === 'string' ? result : (result as any).text || result;

        console.log('✅ Formatting completed');
        console.log('📝 Formatted text length:', formattedText.length);
        console.log('📝 Formatted text first 200 chars:', formattedText.substring(0, 200));

        // Validate formatting didn't alter content significantly
        const validation = validateFormatting(translatedText, formattedText);

        if (!validation.isValid) {
            console.warn('⚠️ Formatting validation failed:', validation.issues);
            return {
                success: false,
                error: `Formatting validation failed: ${validation.issues.join(', ')}`
            };
        }

        return {
            success: true,
            result: formattedText
        };

    } catch (error) {
        console.error('❌ Formatting failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Formatting failed'
        };
    }
}

/**
 * Build enhanced translation prompt with legal context and terminology guides
 */
function buildTranslationPrompt(text: string, sourceLang: string, targetLang: string): string {
    const terminology = getTerminologyGuide(targetLang);

    return `You are a professional legal translator. Translate this ${sourceLang} legal contract to ${targetLang}.

CRITICAL REQUIREMENTS:
- Translate EVERY word and section completely
- Provide a clean, complete translation in ${targetLang} only
- Use correct legal terminology: ${Object.entries(terminology).map(([en, target]) => `"${en}" = "${target}"`).join(', ')}
- Keep all dates, amounts, addresses, and names exactly the same
- Preserve the exact structure, line breaks, and formatting
- NO mixing of languages - output must be 100% in ${targetLang}
- NO random words inserted in the middle of sentences
- NO incomplete translations

CONTRACT TO TRANSLATE:
${text}

TRANSLATION (${targetLang} only):`;
}

/**
 * Get terminology guide for target language
 */
function getTerminologyGuide(targetLang: string): Record<string, string> {
    const guides: Record<string, Record<string, string>> = {
        fr: {
            'Agreement': 'Accord',
            'Termination': 'Résiliation',
            'Intellectual Property': 'Propriété Intellectuelle',
            'Independent Contractor': 'Entrepreneur Indépendant',
            'Confidentiality': 'Confidentialité',
            'Indemnification': 'Indemnisation',
            'Liability': 'Responsabilité'
        },
        es: {
            'Agreement': 'Acuerdo',
            'Termination': 'Terminación',
            'Intellectual Property': 'Propiedad Intelectual',
            'Independent Contractor': 'Contratista Independiente',
            'Confidentiality': 'Confidencialidad',
            'Indemnification': 'Indemnización',
            'Liability': 'Responsabilidad'
        },
        de: {
            'Agreement': 'Vereinbarung',
            'Termination': 'Kündigung',
            'Intellectual Property': 'Geistiges Eigentum',
            'Independent Contractor': 'Freier Mitarbeiter',
            'Confidentiality': 'Vertraulichkeit',
            'Indemnification': 'Schadloshaltung',
            'Liability': 'Haftung'
        }
    };

    return guides[targetLang] || {};
}

/**
 * Apply basic formatting to translated text using original text as template
 */
function applyBasicFormatting(translatedText: string, originalText: string): string {
    console.log('🎨 Applying enhanced basic formatting using original text as template...');

    // Check if originalText contains HTML tags
    const isHTML = /<[^>]+>/.test(originalText);

    if (isHTML) {
        console.log('📝 Detected HTML content, applying HTML-aware formatting...');
        return applyHTMLFormatting(translatedText, originalText);
    } else {
        console.log('📝 Detected plain text, applying text formatting...');
        return applyTextFormatting(translatedText, originalText);
    }
}

/**
 * Apply HTML-aware formatting to translated text
 */
function applyHTMLFormatting(translatedText: string, originalHTML: string): string {
    console.log('🎨 Applying HTML-aware formatting...');

    try {
        // For now, let's use a simpler approach - just wrap the translated text in basic HTML structure
        // This preserves the Spanish translation while adding basic formatting

        let formatted = translatedText;

        // Add basic HTML structure
        formatted = formatted.replace(/^(FREELANCE GRAPHIC DESIGN SERVICES AGREEMENT|ACUERDO DE SERVICIOS DE DISEÑO GRÁFICO)/i, '<h1>$1</h1>');
        formatted = formatted.replace(/^(\d+\.\s+[A-Z][^.]*)/gm, '<h2>$1</h2>');
        formatted = formatted.replace(/^([A-Z\s]{10,}:)/gm, '<h3>$1</h3>');
        formatted = formatted.replace(/^([A-Z]\.\s+[A-Z][^.]*)/gm, '<h4>$1</h4>');

        // Split into lines and process each
        const lines = formatted.split('\n');
        const processedLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';

            // Skip if already has HTML tags
            if (trimmed.startsWith('<h1>') || trimmed.startsWith('<h2>') || trimmed.startsWith('<h3>') || trimmed.startsWith('<h4>')) {
                return trimmed;
            }

            // Handle bullet points
            if (trimmed.match(/^[•\-\*]\s+/)) {
                return `<li>${trimmed.replace(/^[•\-\*]\s+/, '')}</li>`;
            }

            // Regular paragraph
            return `<p>${trimmed}</p>`;
        });

        // Join and clean up
        formatted = processedLines.filter(line => line.length > 0).join('\n');

        // Wrap consecutive list items in ul tags
        formatted = formatted.replace(/(<li>.*<\/li>(\n<li>.*<\/li>)*)/g, '<ul>\n$1\n</ul>');

        console.log('✅ Basic HTML formatting applied to Spanish translation');
        return formatted;

    } catch (error) {
        console.warn('⚠️ HTML formatting failed, falling back to text formatting:', error);
        return applyTextFormatting(translatedText, originalHTML);
    }
}

/**
 * Extract text nodes from HTML while preserving structure
 */
function extractTextNodes(html: string): Array<{ text: string, index: number }> {
    const textNodes: Array<{ text: string, index: number }> = [];

    // Remove HTML tags and extract text content
    const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    // Split by common separators to identify text segments
    const segments = textContent.split(/(\d+\.\s+)/).filter(segment => segment.trim().length > 0);

    segments.forEach((segment, index) => {
        if (segment.trim()) {
            textNodes.push({
                text: segment.trim(),
                index: index
            });
        }
    });

    return textNodes;
}

/**
 * Apply text-based formatting to translated text
 */
function applyTextFormatting(translatedText: string, originalText: string): string {
    console.log('🎨 Applying text-based formatting...');

    let formatted = translatedText;

    // Step 1: Fix the main title formatting
    formatted = formatted.replace(/^(Freelance Graphic Design SERVICES Contract)/, '$1\n\n');

    // Step 2: Fix CLIENT section formatting
    formatted = formatted.replace(/(between :CLIENT:)/, '$1\n\n');
    formatted = formatted.replace(/(CLIENT:)/g, '$1\n');
    formatted = formatted.replace(/(Bloom & Co\. Marketing Agency)/, '$1\n');
    formatted = formatted.replace(/(Address:)/g, '$1 ');
    formatted = formatted.replace(/(Telephone:)/g, '$1 ');
    formatted = formatted.replace(/(Email:)/g, '$1 ');

    // Step 3: Fix DESIGNER section formatting
    formatted = formatted.replace(/(Designer:)/g, '$1\n');
    formatted = formatted.replace(/(Alexandra Chen)/, '$1\n');
    formatted = formatted.replace(/(Exerciser under the name :)/, '$1 ');
    formatted = formatted.replace(/(Chen Creative Studio)/, '$1\n');

    // Step 4: Add proper spacing around PRÉAMBULE/BACKGROUND
    formatted = formatted.replace(/(préamble)/i, '\n\n$1\n\n');
    formatted = formatted.replace(/(BACKGROUND)/i, '\n\n$1\n\n');

    // Step 5: Fix numbered sections (1., 2., 3., etc.)
    formatted = formatted.replace(/(\d+\.\s+[A-Z][^.]*)/g, '\n\n$1\n');

    // Step 6: Fix subsections (A., B., C., etc.)
    formatted = formatted.replace(/([A-Z]\.\s+[A-Z][^.]*)/g, '\n$1\n');

    // Step 7: Fix bullet points and list items
    formatted = formatted.replace(/(\n\s*[-•]\s)/g, '\n$1');

    // Step 8: Fix section titles (all caps)
    formatted = formatted.replace(/([A-Z\s]{10,}:)/g, '$1\n');

    // Step 9: Fix specific contract sections
    formatted = formatted.replace(/(SCOPE OF WORK)/g, '$1\n');
    formatted = formatted.replace(/(PROJECT CALENDAR)/g, '$1\n');
    formatted = formatted.replace(/(REMUNERATION AND PAYMENT TERMS)/g, '$1\n');
    formatted = formatted.replace(/(REVISIONS)/g, '$1\n');
    formatted = formatted.replace(/(INTELLECTUAL PROPERTY)/g, '$1\n');
    formatted = formatted.replace(/(CLIENT RESPONSIBILITIES)/g, '$1\n');
    formatted = formatted.replace(/(DESIGNER WARRANTIES)/g, '$1\n');
    formatted = formatted.replace(/(PRIVACY)/g, '$1\n');
    formatted = formatted.replace(/(TERMINATION)/g, '$1\n');
    formatted = formatted.replace(/(LIMITATION OF LIABILITY)/g, '$1\n');
    formatted = formatted.replace(/(INDEMNIFICATION)/g, '$1\n');
    formatted = formatted.replace(/(INDEPENDENT ENTREPRENEUR)/g, '$1\n');
    formatted = formatted.replace(/(DISPUTE SETTLEMENT)/g, '$1\n');
    formatted = formatted.replace(/(GENERAL PROVISIONS)/g, '$1\n');

    // Step 10: Fix signature section
    formatted = formatted.replace(/(Name:)/g, '$1 ');
    formatted = formatted.replace(/(Titre:)/g, '$1 ');
    formatted = formatted.replace(/(Date:)/g, '$1 ');
    formatted = formatted.replace(/(Par:)/g, '$1 ');

    // Step 11: Clean up multiple line breaks and spacing
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    formatted = formatted.replace(/[ \t]+/g, ' '); // Normalize spaces
    formatted = formatted.replace(/\n /g, '\n'); // Remove spaces after line breaks

    // Step 12: Trim whitespace
    formatted = formatted.trim();

    console.log('✅ Text-based formatting applied');
    return formatted;
}

/**
 * Build formatting prompt for Prompt API using original text as template
 */
function buildFormattingPrompt(translatedText: string, originalText: string): string {
    return `You are a document formatter. Format the translated text to match the structure and formatting of the original text.

CRITICAL RULES:
- DO NOT change any words or content in the translated text
- DO NOT translate anything
- ONLY add line breaks, spacing, and formatting to match the original structure
- Preserve all dates, amounts, names, and addresses exactly

TASK:
Format the translated text below to have the same line breaks, spacing, and structure as the original text above.

ORIGINAL TEXT (use as formatting template):
${originalText}

TRANSLATED TEXT (format this to match the original structure):
${translatedText}

Return the translated text with formatting that matches the original text structure.`;
}

/**
 * Build HTML formatting prompt for Prompt API using original HTML as template
 */
function buildHTMLFormattingPrompt(translatedText: string, originalHTML: string): string {
    return `You are an HTML formatter. Your ONLY job is to add HTML formatting to the text below.

CRITICAL RULES - READ CAREFULLY:
- DO NOT translate anything
- DO NOT change any words
- DO NOT change the language
- The text below is already translated - keep it exactly as it is
- ONLY add HTML tags like <p>, <h1>, <h2>, <ul>, <li>, <strong>
- Use the original HTML structure as a guide for formatting
- Preserve all content exactly as written

TASK:
Add HTML formatting to the text below. Do NOT translate it. Do NOT change any words. Just add HTML tags.

ORIGINAL HTML STRUCTURE (use as formatting guide):
${originalHTML}

TEXT TO FORMAT (add HTML tags but keep all words exactly the same):
${translatedText}

Return the same text with HTML formatting added. Do NOT translate anything.`;
}

/**
 * Validate that formatting didn't alter content significantly
 */
function validateFormatting(original: string, formatted: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check 1: Length similarity (within 50% for HTML formatting)
    const lengthDiff = Math.abs(formatted.length - original.length) / original.length;
    if (lengthDiff > 0.5) {
        issues.push(`Length changed by ${(lengthDiff * 100).toFixed(1)}% (max allowed: 50%)`);
    }

    // Check 2: Section count preserved (very lenient for HTML formatting)
    const originalSections = (original.match(/\d+\.\s+[A-Z]/g) || []).length;
    const formattedSections = (formatted.match(/\d+\.\s+[A-Z]/g) || []).length;
    if (Math.abs(originalSections - formattedSections) > 5) {
        issues.push(`Section count mismatch: ${originalSections} vs ${formattedSections}`);
    }

    // Check 3: Key terms preserved (dollar amounts, dates)
    const dollarAmounts = original.match(/\$[\d,]+/g) || [];
    const missingAmounts = dollarAmounts.filter(amount => !formatted.includes(amount));
    if (missingAmounts.length > 0) {
        issues.push(`Missing dollar amounts: ${missingAmounts.join(', ')}`);
    }

    // Check 4: No significant content increase (more lenient for HTML formatting)
    const originalWords = original.split(/\s+/).length;
    const formattedWords = formatted.split(/\s+/).length;
    if (formattedWords > originalWords * 1.5) {
        issues.push(`Significant content increase: ${formattedWords} vs ${originalWords} words`);
    }

    return {
        isValid: issues.length === 0,
        issues
    };
}

/**
 * Step 3a: Format using Chrome Rewriter API for better structure (DEPRECATED - use formatTranslatedContract instead)
 */
async function formatWithRewriterAPI(text: string, targetLanguage: string): Promise<AIResult> {
    try {
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
        if (availability === 'unavailable') {
            return {
                success: false,
                error: 'Rewriter API is not available'
            };
        }

        // Create rewriter session with download monitoring
        const rewriter = await globalRewriter.create({
            tone: 'as-is',
            format: 'plain-text',
            length: 'as-is',
            sharedContext: `This is a legal contract in ${targetLanguage}. Clean up formatting issues while preserving all legal content and structure.`,
            monitor: (monitor: any) => {
                monitor.addEventListener('downloadprogress', (e: any) => {
                    const progress = Math.floor(e.loaded * 100);
                    console.log(`Rewriter API model download progress: ${progress}%`);
                });
            }
        });

        // Rewrite with enhanced quality control context
        const context = `You are a legal document editor. Clean up and improve this translated legal contract by:

QUALITY CONTROL REQUIREMENTS:
1. Remove any encoding artifacts, strange characters, or formatting issues
2. Ensure proper paragraph breaks and spacing throughout
3. Maintain ALL legal terminology and structure exactly
4. CRITICAL: Remove any duplicate or repeated content - each clause should appear only once
5. Fix any grammatical errors or awkward phrasing
6. Preserve ALL numbered sections (1, 2, 3, etc.) and subsections (A, B, C, etc.)
7. Keep ALL section headers properly formatted
8. Ensure complete translation - no missing sections
9. Verify legal terminology is correct (e.g., "résiliation" not "résignation")
10. Maintain formal legal register and professional tone

DO NOT:
- Add new content not in the original
- Change legal meaning or intent
- Remove any sections or clauses
- Summarize or condense content

ONLY clean up formatting, grammar, and remove duplicates while preserving complete legal content.`;

        const formattedResult = await rewriter.rewrite(text, { context });
        console.log('✅ Rewriter API formatting completed');

        // Quality validation
        const qualityCheck = validateTranslationQuality(formattedResult, targetLanguage);
        if (!qualityCheck.isValid) {
            console.warn('⚠️ Translation quality issues detected:', qualityCheck.issues);
        }

        // Add quality disclaimer
        const disclaimer = targetLanguage === 'fr'
            ? '\n\n[DISCLAIMER: Traduction assistée par IA à des fins de référence uniquement. Consultez un professionnel juridique pour la version finale.]'
            : '\n\n[DISCLAIMER: AI-assisted translation for reference only. Consult legal professional for final version.]';

        const finalResult = formattedResult + disclaimer;

        // Log debug data
        logTranslationDebug({
            inputText: text,
            outputText: finalResult,
            targetLanguage,
            step: 'format',
            success: true
        });

        return {
            success: true,
            result: finalResult
        };
    } catch (error) {
        console.error('❌ Rewriter API formatting failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Rewriter formatting failed'
        };
    }
}

/**
 * Step 3b: Format using Chrome Prompt API for better structure (fallback)
 */
async function formatWithPromptAPI(text: string, targetLanguage: string): Promise<AIResult> {
    try {
        // Check for global LanguageModel API (Prompt API)
        const globalLanguageModel = (window as any).LanguageModel;
        if (!globalLanguageModel || typeof globalLanguageModel.create !== 'function') {
            return {
                success: false,
                error: 'Prompt API not available'
            };
        }

        // Check availability
        const availability = await globalLanguageModel.availability();
        if (availability === 'unavailable') {
            return {
                success: false,
                error: 'Prompt API is not available'
            };
        }

        // Create session with download monitoring
        const session = await globalLanguageModel.create({
            monitor: (monitor: any) => {
                monitor.addEventListener('downloadprogress', (e: any) => {
                    const progress = Math.floor(e.loaded * 100);
                    console.log(`Prompt API model download progress: ${progress}%`);
                });
            }
        });

        // Create formatting prompt based on target language
        const languageInstructions = targetLanguage === 'fr'
            ? 'Format this French legal contract text properly. Ensure proper spacing, paragraph breaks, and legal formatting. Remove any formatting artifacts or encoding issues. Maintain the original structure but clean up the presentation.'
            : `Format this ${targetLanguage} legal contract text properly. Ensure proper spacing, paragraph breaks, and legal formatting. Remove any formatting artifacts or encoding issues. Maintain the original structure but clean up the presentation.`;

        const formatPrompt = `
You are a professional legal document formatter. ${languageInstructions}

CRITICAL FORMATTING REQUIREMENTS:
1. PRESERVE ALL LEGAL TERMINOLOGY AND STRUCTURE - Do not change any legal meaning
2. Ensure proper paragraph breaks and spacing throughout
3. Remove any encoding artifacts, strange characters, or formatting issues
4. Maintain ALL numbered sections (1, 2, 3, etc.) and subsections (A, B, C, etc.)
5. Keep ALL section headers properly formatted
6. Ensure consistent spacing throughout the document
7. CRITICAL: Remove any duplicate or repeated content - each clause should appear only once
8. Fix any grammatical errors or awkward phrasing
9. Ensure complete document - no missing sections
10. Verify legal terminology is correct (e.g., "résiliation" not "résignation" for French)

DO NOT:
- Add new content not in the original
- Change legal meaning or intent
- Remove any sections or clauses
- Summarize or condense content

ONLY clean up formatting, grammar, and remove duplicates while preserving complete legal content.

Text to format:
${text}

Return only the properly formatted legal contract without any additional commentary or explanations.
`;

        const formattedResult = await session.prompt(formatPrompt);
        console.log('✅ Prompt API formatting completed');

        // Add quality disclaimer
        const disclaimer = targetLanguage === 'fr'
            ? '\n\n[DISCLAIMER: Traduction assistée par IA à des fins de référence uniquement. Consultez un professionnel juridique pour la version finale.]'
            : '\n\n[DISCLAIMER: AI-assisted translation for reference only. Consult legal professional for final version.]';

        return {
            success: true,
            result: formattedResult + disclaimer
        };
    } catch (error) {
        console.error('❌ Prompt API formatting failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Formatting failed'
        };
    }
}

/**
 * Validate translation quality to catch common issues
 */
function validateTranslationQuality(text: string, targetLanguage: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (targetLanguage === 'fr') {
        // Check for common French translation errors
        if (text.includes('résignation')) {
            issues.push('Incorrect legal term: "résignation" should be "résiliation"');
        }

        if (text.includes('détenir')) {
            issues.push('Grammatical error: "détenir" should be "détient" or "détiendra"');
        }

        // Check for excessive repetition
        const lines = text.split('\n');
        const uniqueLines = new Set(lines);
        if (lines.length > uniqueLines.size * 1.5) {
            issues.push('Excessive repetition detected in translation');
        }

        // Check for incomplete translation (too short)
        if (text.length < 1000) {
            issues.push('Translation appears incomplete (too short)');
        }

        // Check for missing sections
        const expectedSections = ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.'];
        const missingSections = expectedSections.filter(section => !text.includes(section));
        if (missingSections.length > 5) {
            issues.push(`Missing sections: ${missingSections.join(', ')}`);
        }
    }

    return {
        isValid: issues.length === 0,
        issues
    };
}

/**
 * Check if AI features are available
 */
export function checkAIFeatures(): {
    proofreader: boolean;
    rewriter: boolean;
    translator: boolean;
    promptAPI: boolean;
    overall: boolean;
} {
    const features = {
        proofreader: false,
        rewriter: false,
        translator: false,
        promptAPI: false,
        overall: false
    };

    if (typeof window !== 'undefined') {
        // Check for specific Chrome AI APIs
        const hasTranslator = (window as any).Translator && typeof (window as any).Translator.create === 'function';
        const hasProofreader = (window as any).Proofreader && typeof (window as any).Proofreader.create === 'function';
        const hasRewriter = (window as any).Rewriter && typeof (window as any).Rewriter.create === 'function';
        const hasLanguageModel = (window as any).LanguageModel && typeof (window as any).LanguageModel.create === 'function';

        features.translator = hasTranslator;
        features.proofreader = hasProofreader || hasLanguageModel;
        features.rewriter = hasRewriter || hasLanguageModel;
        features.promptAPI = hasLanguageModel;
        features.overall = features.proofreader || features.rewriter || features.translator || features.promptAPI;
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
    promptAPI: AIResult;
}> {
    const testText = "This is a test sentence with some errors that need to be corrected.";

    const [proofreaderResult, rewriterResult, translatorResult, promptAPIResult] = await Promise.allSettled([
        proofreadText(testText),
        rewriteText(testText, 'formal'),
        translateText(testText, 'es'),
        formatWithPromptAPI(testText, 'en')
    ]);

    return {
        proofreader: proofreaderResult.status === 'fulfilled' ? proofreaderResult.value : { success: false, error: 'Promise rejected' },
        rewriter: rewriterResult.status === 'fulfilled' ? rewriterResult.value : { success: false, error: 'Promise rejected' },
        translator: translatorResult.status === 'fulfilled' ? translatorResult.value : { success: false, error: 'Promise rejected' },
        promptAPI: promptAPIResult.status === 'fulfilled' ? promptAPIResult.value : { success: false, error: 'Promise rejected' }
    };
}
