import { useState, useCallback } from 'react';
import { proofreadText, rewriteText, translateText, checkAIFeatures, testAIFeatures } from '../services/ai/contract-ai';

export interface ContractAIState {
    isProcessing: boolean;
    result: string | null;
    error: string | null;
    corrections?: Array<{
        startIndex: number;
        endIndex: number;
        type: string;
        message: string;
        explanation: string;
    }>;
}

export const useContractAI = () => {
    const [state, setState] = useState<ContractAIState>({
        isProcessing: false,
        result: null,
        error: null,
        corrections: undefined
    });

    const resetState = useCallback(() => {
        setState({
            isProcessing: false,
            result: null,
            error: null,
            corrections: undefined
        });
    }, []);

    const proofread = useCallback(async (text: string) => {
        setState({
            isProcessing: true,
            result: null,
            error: null,
            corrections: undefined
        });

        try {
            const result = await proofreadText(text);

            if (result.success) {
                setState({
                    isProcessing: false,
                    result: result.result || text,
                    error: null,
                    corrections: result.corrections
                });
            } else {
                setState({
                    isProcessing: false,
                    result: null,
                    error: result.error || 'Proofreading failed'
                });
            }
        } catch (error) {
            setState({
                isProcessing: false,
                result: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }, []);

    const rewrite = useCallback(async (text: string, tone: 'formal' | 'casual' | 'concise' | 'detailed' = 'formal') => {
        setState({
            isProcessing: true,
            result: null,
            error: null
        });

        try {
            const result = await rewriteText(text, tone);

            if (result.success) {
                setState({
                    isProcessing: false,
                    result: result.result || text,
                    error: null
                });
            } else {
                setState({
                    isProcessing: false,
                    result: null,
                    error: result.error || 'Rewriting failed'
                });
            }
        } catch (error) {
            setState({
                isProcessing: false,
                result: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }, []);

    const translate = useCallback(async (text: string, targetLanguage: string, sourceLanguage: string = 'en') => {
        setState({
            isProcessing: true,
            result: null,
            error: null
        });

        try {
            const result = await translateText(text, targetLanguage, sourceLanguage);

            if (result.success) {
                setState({
                    isProcessing: false,
                    result: result.result || text,
                    error: null
                });
            } else {
                setState({
                    isProcessing: false,
                    result: null,
                    error: result.error || 'Translation failed'
                });
            }
        } catch (error) {
            setState({
                isProcessing: false,
                result: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }, []);

    const testFeatures = useCallback(async () => {
        console.log('🧪 Testing all AI features...');
        const results = await testAIFeatures();

        console.log('AI Feature Test Results:', results);

        const availableFeatures = checkAIFeatures();
        console.log('Available AI Features:', availableFeatures);

        return {
            results,
            availableFeatures
        };
    }, []);

    const checkAvailability = useCallback(() => {
        return checkAIFeatures();
    }, []);

    return {
        state,
        proofread,
        rewrite,
        translate,
        testFeatures,
        checkAvailability,
        resetState
    };
};
