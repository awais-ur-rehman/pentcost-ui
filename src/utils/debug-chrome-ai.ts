/**
 * Debug utility for Chrome AI API
 * Run this in browser console to debug Chrome AI availability
 */

export const debugChromeAI = () => {
    console.group('🔍 Chrome AI Debug Information');

    // Basic checks
    console.log('1. Window available:', typeof window !== 'undefined');
    console.log('2. window.ai exists:', typeof window !== 'undefined' && 'ai' in window);

    if (typeof window !== 'undefined') {
        console.log('3. window.ai object:', window.ai);

        if (window.ai) {
            console.log('4. Available APIs:', Object.keys(window.ai));
            console.log('5. Full window.ai structure:', JSON.stringify(window.ai, null, 2));

            // Check different possible property names
            const possibleNames = ['languageModel', 'LanguageModel', 'language_model', 'proofreader', 'rewriter', 'translator'];
            possibleNames.forEach(name => {
                console.log(`6. Checking ${name}:`, window.ai ? name in window.ai : false, window.ai?.[name as keyof typeof window.ai]);
            });

            // Check if it's available globally
            console.log('7. Global LanguageModel:', typeof (window as any).LanguageModel);
            console.log('8. Global Proofreader:', typeof (window as any).Proofreader);
            console.log('9. Global Rewriter:', typeof (window as any).Rewriter);
            console.log('10. Global Translator:', typeof (window as any).Translator);

            // Test specific Chrome AI APIs
            const translator = (window as any).Translator;
            const proofreader = (window as any).Proofreader;
            const rewriter = (window as any).Rewriter;

            if (translator && typeof translator.availability === 'function') {
                console.log('11. Testing Translator.availability...');
                translator.availability({
                    sourceLanguage: 'en',
                    targetLanguage: 'es'
                }).then((availability: any) => {
                    console.log('12. Translator availability (en->es):', availability);
                }).catch((error: any) => {
                    console.log('12. Translator availability error:', error);
                });
            }

            if (proofreader && typeof proofreader.availability === 'function') {
                console.log('13. Testing Proofreader.availability...');
                proofreader.availability().then((availability: any) => {
                    console.log('14. Proofreader availability:', availability);
                }).catch((error: any) => {
                    console.log('14. Proofreader availability error:', error);
                });
            }

            if (rewriter && typeof rewriter.availability === 'function') {
                console.log('15. Testing Rewriter.availability...');
                rewriter.availability().then((availability: any) => {
                    console.log('16. Rewriter availability:', availability);
                }).catch((error: any) => {
                    console.log('16. Rewriter availability error:', error);
                });
            }

            // Try direct access to LanguageModel
            try {
                const lm = (window as any).LanguageModel;
                if (lm && typeof lm.availability === 'function') {
                    console.log('11. Found LanguageModel globally');
                    lm.availability()
                        .then((status: any) => {
                            console.log('12. Global LanguageModel availability:', status);
                        })
                        .catch((error: any) => {
                            console.log('12. Global LanguageModel error:', error);
                        });
                }
            } catch (error) {
                console.log('11. Global LanguageModel error:', error);
            }

            // Try to create a session with LanguageModel to see what methods it has
            try {
                const lm = (window as any).LanguageModel;
                if (lm && typeof lm.create === 'function') {
                    console.log('13. Testing LanguageModel.create()...');
                    lm.create()
                        .then((session: any) => {
                            console.log('14. LanguageModel session created:', session);
                            console.log('15. Session methods:', Object.keys(session));
                        })
                        .catch((error: any) => {
                            console.log('14. LanguageModel.create() error:', error);
                        });
                }
            } catch (error) {
                console.log('13. LanguageModel.create() error:', error);
            }
        }
    }

    console.groupEnd();
};

// Make it available globally for console debugging
if (typeof window !== 'undefined') {
    (window as any).debugChromeAI = debugChromeAI;
    console.log('🔧 debugChromeAI() function available in console');
}
