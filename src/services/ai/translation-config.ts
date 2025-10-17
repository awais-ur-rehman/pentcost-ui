/**
 * Translation configuration and terminology management
 */

export interface TranslationConfig {
    customTerms: Record<string, Record<string, string>>;
    preserveFormatting: boolean;
    addDisclaimer: boolean;
    enableProofreading: boolean;
}

const defaultConfig: TranslationConfig = {
    customTerms: {},
    preserveFormatting: true,
    addDisclaimer: true,
    enableProofreading: true
};

// Storage key for user preferences
const STORAGE_KEY = 'contract-translation-config';

/**
 * Get user's translation configuration
 */
export function getTranslationConfig(): TranslationConfig {
    if (typeof window === 'undefined') return defaultConfig;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...defaultConfig, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.warn('Failed to load translation config:', error);
    }

    return defaultConfig;
}

/**
 * Save user's translation configuration
 */
export function saveTranslationConfig(config: Partial<TranslationConfig>): void {
    if (typeof window === 'undefined') return;

    try {
        const currentConfig = getTranslationConfig();
        const newConfig = { ...currentConfig, ...config };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (error) {
        console.warn('Failed to save translation config:', error);
    }
}

/**
 * Add custom terminology for translation
 */
export function addCustomTerm(sourceLang: string, targetLang: string, sourceTerm: string, targetTerm: string): void {
    const config = getTranslationConfig();

    if (!config.customTerms[sourceLang]) {
        config.customTerms[sourceLang] = {};
    }

    if (!config.customTerms[sourceLang][targetLang]) {
        config.customTerms[sourceLang][targetLang] = {};
    }

    config.customTerms[sourceLang][targetLang][sourceTerm.toLowerCase()] = targetTerm;
    saveTranslationConfig(config);
}

/**
 * Get custom terminology for a language pair
 */
export function getCustomTerms(sourceLang: string, targetLang: string): Record<string, string> {
    const config = getTranslationConfig();
    return config.customTerms[sourceLang]?.[targetLang] || {};
}

/**
 * Predefined legal terminology sets
 */
export const LEGAL_TERMINOLOGY_SETS = {
    'contract-general': {
        'en-fr': {
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
        },
        'en-es': {
            'contractor': 'CONTRATISTA',
            'client': 'CLIENTE',
            'agreement': 'ACUERDO',
            'whereas': 'CONSIDERANDO QUE',
            'now therefore': 'POR LO TANTO',
            'entire agreement': 'ACUERDO COMPLETO',
            'governing law': 'LEY APLICABLE',
            'independent contractor': 'CONTRATISTA INDEPENDIENTE',
            'intellectual property': 'PROPIEDAD INTELECTUAL',
            'confidentiality': 'CONFIDENCIALIDAD',
            'termination': 'TERMINACIÓN',
            'compensation': 'COMPENSACIÓN',
            'services': 'SERVICIOS'
        }
    },
    'employment': {
        'en-fr': {
            'employee': 'EMPLOYÉ',
            'employer': 'EMPLOYEUR',
            'salary': 'SALAIRE',
            'benefits': 'AVANTAGES',
            'vacation': 'VACANCES',
            'termination': 'LICENCIEMENT'
        }
    }
};

/**
 * Load predefined terminology set
 */
export function loadTerminologySet(setName: string): void {
    const terminologySet = LEGAL_TERMINOLOGY_SETS[setName as keyof typeof LEGAL_TERMINOLOGY_SETS];
    if (!terminologySet) return;

    Object.entries(terminologySet).forEach(([langPair, terms]) => {
        const [sourceLang, targetLang] = langPair.split('-');
        Object.entries(terms).forEach(([sourceTerm, targetTerm]) => {
            addCustomTerm(sourceLang, targetLang, sourceTerm, targetTerm);
        });
    });
}
