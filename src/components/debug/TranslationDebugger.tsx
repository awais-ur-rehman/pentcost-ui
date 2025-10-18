import { useState, useEffect } from 'react';
import { 
  BugAntIcon, 
  XMarkIcon, 
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';

interface TranslationDebugData {
  inputText: string;
  outputText: string;
  targetLanguage: string;
  timestamp: Date;
  step: 'translate' | 'proofread' | 'format';
  success: boolean;
  error?: string;
  duration?: number; // Time taken in milliseconds
  formattingApplied?: boolean; // Whether formatting was successfully applied
}

interface TranslationDebuggerProps {
  isVisible: boolean;
  onToggle: () => void;
  debugData: TranslationDebugData[];
  onClear?: () => void;
}

export function TranslationDebugger({ isVisible, onToggle, debugData, onClear }: TranslationDebuggerProps) {
  const [selectedStep, setSelectedStep] = useState<'translate' | 'proofread' | 'format'>('translate');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'translate':
        return <LanguageIcon className="h-4 w-4" />;
      case 'proofread':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'format':
        return <DocumentTextIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getStepColor = (step: string) => {
    switch (step) {
      case 'translate':
        return 'bg-blue-100 text-blue-800';
      case 'proofread':
        return 'bg-green-100 text-green-800';
      case 'format':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepDescription = (step: string) => {
    switch (step) {
      case 'translate':
        return 'Chrome Language Detector + Translator API - Auto-detects language and translates content';
      case 'proofread':
        return 'Chrome Proofreader API - Manual proofreading only (not used in main workflow)';
      case 'format':
        return 'Chrome Prompt API - Adds proper formatting using original text as template';
      default:
        return 'Unknown step';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Open Translation Debugger"
      >
        <BugAntIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[80vh] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BugAntIcon className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-gray-900">Translation Debugger</h3>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Workflow Overview */}
      <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
        <div className="text-sm font-medium text-blue-900 mb-2">Translation Workflow</div>
        <div className="flex items-center space-x-2 text-xs text-blue-700">
          <div className="flex items-center space-x-1">
            <CheckCircleIcon className="h-3 w-3" />
            <span>1. Detect</span>
          </div>
          <ArrowRightIcon className="h-3 w-3" />
          <div className="flex items-center space-x-1">
            <LanguageIcon className="h-3 w-3" />
            <span>2. Translate</span>
          </div>
          <ArrowRightIcon className="h-3 w-3" />
          <div className="flex items-center space-x-1">
            <DocumentTextIcon className="h-3 w-3" />
            <span>3. Format</span>
          </div>
          <ArrowRightIcon className="h-3 w-3" />
          <div className="flex items-center space-x-1">
            <CheckCircleIcon className="h-3 w-3" />
            <span>4. Complete</span>
          </div>
        </div>
        <div className="text-xs text-blue-600 mt-1">
          Three-step workflow: Detect → Translate → Format (auto language detection)
        </div>
      </div>

      {/* Step Selector */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex space-x-2">
          {(['translate', 'proofread', 'format'] as const).map((step) => (
            <button
              key={step}
              onClick={() => setSelectedStep(step)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedStep === step
                  ? getStepColor(step)
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center space-x-1">
                {getStepIcon(step)}
                <span className="capitalize">{step}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-h-96">
        {debugData.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No translation data yet</p>
            <p className="text-sm">Start a translation to see debug info</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {debugData
              .filter(data => data.step === selectedStep)
              .slice(-5) // Show last 5 entries
              .map((data, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Entry Header */}
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStepColor(data.step)}`}>
                          {data.step.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {data.timestamp.toLocaleTimeString()}
                        </span>
                        {data.duration && (
                          <span className="text-xs text-gray-500">
                            ({data.duration}ms)
                          </span>
                        )}
                        {data.success ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                        )}
                        {data.formattingApplied && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            ✓ Formatted
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        Target: {data.targetLanguage.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-gray-600">
                        {getStepDescription(data.step)}
                      </span>
                    </div>
                  </div>

                  {/* Input Section */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() => toggleSection(`input-${index}`)}
                      className="w-full px-3 py-2 text-left bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">
                          Input Text ({data.inputText.length} chars)
                        </span>
                        <span className="text-xs text-blue-600">
                          {expandedSections.has(`input-${index}`) ? '▼' : '▶'}
                        </span>
                      </div>
                    </button>
                    {expandedSections.has(`input-${index}`) && (
                      <div className="p-3 bg-blue-25">
                        <div className="flex justify-end mb-2">
                          <button
                            onClick={() => copyToClipboard(data.inputText)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto bg-white p-2 rounded border">
                          {data.inputText}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Output Section */}
                  <div>
                    <button
                      onClick={() => toggleSection(`output-${index}`)}
                      className="w-full px-3 py-2 text-left bg-green-50 hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-900">
                          Output Text ({data.outputText.length} chars)
                        </span>
                        <span className="text-xs text-green-600">
                          {expandedSections.has(`output-${index}`) ? '▼' : '▶'}
                        </span>
                      </div>
                    </button>
                    {expandedSections.has(`output-${index}`) && (
                      <div className="p-3 bg-green-25">
                        <div className="flex justify-end mb-2">
                          <button
                            onClick={() => copyToClipboard(data.outputText)}
                            className="text-xs text-green-600 hover:text-green-800"
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto bg-white p-2 rounded border">
                          {data.outputText}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Error Section */}
                  {data.error && (
                    <div className="p-3 bg-red-50 border-t border-red-100">
                      <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-900">Error</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">{data.error}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-gray-500">Total Entries</div>
            <div className="font-medium">{debugData.length}</div>
          </div>
          <div>
            <div className="text-gray-500">Success Rate</div>
            <div className="font-medium">
              {debugData.length > 0 
                ? `${Math.round((debugData.filter(d => d.success).length / debugData.length) * 100)}%`
                : '0%'
              }
            </div>
          </div>
          <div>
            <div className="text-gray-500">Avg Duration</div>
            <div className="font-medium">
              {debugData.filter(d => d.duration).length > 0
                ? `${Math.round(debugData.filter(d => d.duration).reduce((sum, d) => sum + (d.duration || 0), 0) / debugData.filter(d => d.duration).length)}ms`
                : 'N/A'
              }
            </div>
          </div>
          <div>
            <div className="text-gray-500">Formatting Applied</div>
            <div className="font-medium">
              {debugData.filter(d => d.formattingApplied).length}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
          <span>Debug data for translation workflow</span>
          <button
            onClick={onClear}
            className="text-red-600 hover:text-red-800"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
