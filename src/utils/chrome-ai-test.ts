/**
 * Chrome AI Testing Utility
 * 
 * This utility helps test and debug Chrome AI API availability and functionality.
 * Use this to verify that your Chrome AI implementation is working correctly.
 */

import { checkChromeAIAvailability, notifyChromeAIStatus } from './ai-detection';

export interface ChromeAITestResult {
    api: string;
    available: boolean;
    error?: string;
    details?: any;
}

export interface ChromeAITestSuite {
    overall: boolean;
    results: ChromeAITestResult[];
    summary: string;
}

class ChromeAITester {
    private results: ChromeAITestResult[] = [];

    /**
     * Run comprehensive Chrome AI tests
     */
    async runAllTests(): Promise<ChromeAITestSuite> {
        this.results = [];

        console.log('🧪 Starting Chrome AI API Tests...');

        // Test basic availability
        await this.testBasicAvailability();

        // Test individual APIs
        await this.testProofreaderAPI();
        await this.testRewriterAPI();
        await this.testTranslatorAPI();

        // Test session creation
        await this.testSessionCreation();

        // Test model download scenarios
        await this.testModelDownload();

        const overall = this.results.every(result => result.available);
        const summary = this.generateSummary();

        return {
            overall,
            results: this.results,
            summary
        };
    }

    private async testBasicAvailability(): Promise<void> {
        try {
            const capabilities = checkChromeAIAvailability();

            this.results.push({
                api: 'Basic Availability',
                available: capabilities.isAvailable,
                details: capabilities
            });

            console.log('✅ Basic availability check:', capabilities.isAvailable);
        } catch (error) {
            this.results.push({
                api: 'Basic Availability',
                available: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error('❌ Basic availability check failed:', error);
        }
    }

    private async testProofreaderAPI(): Promise<void> {
        try {
            if (typeof window === 'undefined' || !window.ai?.proofreader) {
                this.results.push({
                    api: 'Proofreader API',
                    available: false,
                    error: 'window.ai.proofreader not available'
                });
                return;
            }

            // Check availability method
            let availability = 'unknown';
            if (typeof window.ai.proofreader.availability === 'function') {
                availability = await window.ai.proofreader.availability();
            }

            this.results.push({
                api: 'Proofreader API',
                available: true,
                details: { availability }
            });

            console.log('✅ Proofreader API available:', availability);
        } catch (error) {
            this.results.push({
                api: 'Proofreader API',
                available: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error('❌ Proofreader API test failed:', error);
        }
    }

    private async testRewriterAPI(): Promise<void> {
        try {
            if (typeof window === 'undefined' || !window.ai?.rewriter) {
                this.results.push({
                    api: 'Rewriter API',
                    available: false,
                    error: 'window.ai.rewriter not available'
                });
                return;
            }

            // Check availability method
            let availability = 'unknown';
            if (typeof window.ai.rewriter.availability === 'function') {
                availability = await window.ai.rewriter.availability();
            }

            this.results.push({
                api: 'Rewriter API',
                available: true,
                details: { availability }
            });

            console.log('✅ Rewriter API available:', availability);
        } catch (error) {
            this.results.push({
                api: 'Rewriter API',
                available: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error('❌ Rewriter API test failed:', error);
        }
    }

    private async testTranslatorAPI(): Promise<void> {
        try {
            if (typeof window === 'undefined' || !window.ai?.translator) {
                this.results.push({
                    api: 'Translator API',
                    available: false,
                    error: 'window.ai.translator not available'
                });
                return;
            }

            this.results.push({
                api: 'Translator API',
                available: true,
                details: { hasTranslate: typeof window.ai.translator.translate === 'function' }
            });

            console.log('✅ Translator API available');
        } catch (error) {
            this.results.push({
                api: 'Translator API',
                available: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error('❌ Translator API test failed:', error);
        }
    }

    private async testSessionCreation(): Promise<void> {
        try {
            if (typeof window === 'undefined' || !window.ai) {
                this.results.push({
                    api: 'Session Creation',
                    available: false,
                    error: 'window.ai not available'
                });
                return;
            }

            // Test if we can check user activation
            const hasUserActivation = 'userActivation' in navigator;

            this.results.push({
                api: 'Session Creation',
                available: true,
                details: {
                    hasUserActivation,
                    isActive: hasUserActivation ? navigator.userActivation.isActive : false
                }
            });

            console.log('✅ Session creation prerequisites available');
        } catch (error) {
            this.results.push({
                api: 'Session Creation',
                available: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error('❌ Session creation test failed:', error);
        }
    }

    private async testModelDownload(): Promise<void> {
        try {
            // Check if we can access model status
            const hasOnDeviceInternals = typeof window !== 'undefined' &&
                window.location?.protocol === 'chrome:' &&
                window.location?.pathname.includes('on-device-internals');

            this.results.push({
                api: 'Model Download',
                available: true,
                details: {
                    canAccessInternals: hasOnDeviceInternals,
                    userAgent: navigator.userAgent.includes('Chrome')
                }
            });

            console.log('✅ Model download prerequisites available');
        } catch (error) {
            this.results.push({
                api: 'Model Download',
                available: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error('❌ Model download test failed:', error);
        }
    }

    private generateSummary(): string {
        const total = this.results.length;
        const passed = this.results.filter(r => r.available).length;
        const failed = total - passed;

        let summary = `Chrome AI Test Results: ${passed}/${total} tests passed\n`;

        if (failed > 0) {
            summary += '\nFailed tests:\n';
            this.results
                .filter(r => !r.available)
                .forEach(r => {
                    summary += `- ${r.api}: ${r.error || 'Unknown error'}\n`;
                });
        }

        if (passed === total) {
            summary += '\n🎉 All tests passed! Chrome AI is ready to use.';
        } else {
            summary += '\n⚠️ Some tests failed. Check the errors above for troubleshooting.';
        }

        return summary;
    }

    /**
     * Test a specific API with actual functionality
     */
    async testProofreaderFunctionality(text: string = 'This is a test text with some errors.'): Promise<ChromeAITestResult> {
        try {
            if (typeof window === 'undefined' || !window.ai?.proofreader) {
                return {
                    api: 'Proofreader Functionality',
                    available: false,
                    error: 'window.ai.proofreader not available'
                };
            }

            // Try to create a session and proofread text
            const session = await window.ai.proofreader.create({
                expectedInputLanguages: ['en'],
                monitor: (monitor) => {
                    monitor.addEventListener('downloadprogress', (e: any) => {
                        console.log('Download progress:', e.loaded * 100);
                    });
                }
            });

            const result = await session.proofread(text);

            return {
                api: 'Proofreader Functionality',
                available: true,
                details: {
                    originalText: text,
                    correctedText: result.correction,
                    correctionsCount: result.corrections.length
                }
            };
        } catch (error) {
            return {
                api: 'Proofreader Functionality',
                available: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get system information for debugging
     */
    getSystemInfo(): any {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hasUserActivation: 'userActivation' in navigator,
            userActivationActive: 'userActivation' in navigator ? navigator.userActivation.isActive : false,
            windowAI: typeof window !== 'undefined' ? 'ai' in window : false,
            windowAIObject: typeof window !== 'undefined' && 'ai' in window ? window.ai : null
        };
    }

    /**
     * Print detailed debug information
     */
    printDebugInfo(): void {
        console.group('🔍 Chrome AI Debug Information');

        const systemInfo = this.getSystemInfo();
        console.log('System Info:', systemInfo);

        if (typeof window !== 'undefined' && window.ai) {
            console.log('Available APIs:', Object.keys(window.ai));

            Object.keys(window.ai).forEach(api => {
                const apiObj = (window.ai as any)[api];
                console.log(`${api}:`, typeof apiObj, apiObj);
            });
        }

        notifyChromeAIStatus();

        console.groupEnd();
    }
}

// Export singleton instance
export const chromeAITester = new ChromeAITester();

// Convenience functions
export async function runChromeAITests(): Promise<ChromeAITestSuite> {
    return chromeAITester.runAllTests();
}

export function debugChromeAI(): void {
    chromeAITester.printDebugInfo();
}

export async function testProofreader(text?: string): Promise<ChromeAITestResult> {
    return chromeAITester.testProofreaderFunctionality(text);
}

// Auto-run basic tests if in development
if (import.meta.env.DEV) {
    console.log('🔧 Development mode: Chrome AI tests available');
    console.log('Run debugChromeAI() to see debug info');
    console.log('Run runChromeAITests() to run all tests');
}
