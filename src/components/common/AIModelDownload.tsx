import React, { useState } from 'react';
import { Button } from './Button';
import { useAIModel } from '../../hooks/useAIModel';
import { useContractAI } from '../../hooks/useContractAI';
import { 
  CloudArrowDownIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CpuChipIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

export const AIModelDownload: React.FC = () => {
  const { modelStatus, downloadModel, testModel, checkAvailability, manualTest } = useAIModel();
  const { testFeatures, checkAvailability: checkContractAI } = useContractAI();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [contractTestResult, setContractTestResult] = useState<string | null>(null);

  // Make manual test available globally for console debugging
  React.useEffect(() => {
    (window as any).manualAITest = manualTest;
    (window as any).testContractAI = testFeatures;
    (window as any).checkContractAI = checkContractAI;
    
    // Add direct translation test
    (window as any).testTranslation = async (text: string = "Hello world", targetLang: string = "es") => {
      try {
        const { translateText } = await import('../../services/ai/contract-ai');
        console.log('🧪 Testing translation directly...');
        const result = await translateText(text, targetLang, 'en');
        console.log('Translation test result:', result);
        return result;
      } catch (error) {
        console.error('Translation test failed:', error);
        return { success: false, error: error.message };
      }
    };
    
    console.log('🔧 AI functions available in console:');
    console.log('  - manualAITest() - Test LanguageModel');
    console.log('  - testContractAI() - Test contract features');
    console.log('  - checkContractAI() - Check contract AI availability');
    console.log('  - testTranslation("Hello", "es") - Test translation directly');
  }, [manualTest, testFeatures, checkContractAI]);

  const handleDownload = async () => {
    const result = await downloadModel();
    if (result.success) {
      console.log('AI Model downloaded successfully!');
    } else {
      console.error('Download failed:', result.error);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    const result = await testModel();
    if (result.success) {
      setTestResult(result.response || 'Test completed successfully');
    } else {
      setTestResult(`Test failed: ${result.error}`);
    }
    
    setIsTesting(false);
  };

  const handleContractTest = async () => {
    setIsTesting(true);
    setContractTestResult(null);
    
    try {
      const result = await testFeatures();
      const availableFeatures = Object.entries(result.availableFeatures)
        .filter(([key, value]) => key !== 'overall' && value)
        .map(([key]) => key)
        .join(', ');
      
      setContractTestResult(`Contract AI Features Available: ${availableFeatures}`);
      console.log('Contract AI Test Results:', result);
    } catch (error) {
      setContractTestResult(`Contract test failed: ${error}`);
    }
    
    setIsTesting(false);
  };

  const getStatusIcon = () => {
    switch (modelStatus.status) {
      case 'available':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'downloading':
        return <CloudArrowDownIcon className="h-6 w-6 text-blue-600 animate-pulse" />;
      case 'downloadable':
        return <CloudArrowDownIcon className="h-6 w-6 text-gray-600" />;
      case 'unavailable':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      default:
        return <CpuChipIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (modelStatus.status) {
      case 'available':
        return 'AI Model Ready';
      case 'downloading':
        return `Downloading... ${modelStatus.progress}%`;
      case 'downloadable':
        return 'Ready to Download';
      case 'unavailable':
        return 'Not Available';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusColor = () => {
    switch (modelStatus.status) {
      case 'available':
        return 'text-green-600';
      case 'downloading':
        return 'text-blue-600';
      case 'downloadable':
        return 'text-gray-600';
      case 'unavailable':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CpuChipIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-lg font-medium text-gray-900">AI Model Status</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={checkAvailability}
            disabled={modelStatus.isDownloading}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Status Display */}
        <div className="flex items-center space-x-3 mb-4">
          {getStatusIcon()}
          <div className="flex-1">
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            {modelStatus.status === 'downloading' && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${modelStatus.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {modelStatus.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{modelStatus.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {modelStatus.status === 'downloadable' && (
            <Button 
              onClick={handleDownload}
              leftIcon={<CloudArrowDownIcon className="h-5 w-5" />}
              disabled={modelStatus.isDownloading}
            >
              Download AI Model
            </Button>
          )}

          {modelStatus.status === 'available' && (
            <>
              <Button 
                onClick={handleTest}
                leftIcon={<CpuChipIcon className="h-5 w-5" />}
                disabled={isTesting}
                loading={isTesting}
                variant="outline"
              >
                Test Model
              </Button>
              <Button 
                onClick={handleContractTest}
                leftIcon={<DocumentTextIcon className="h-5 w-5" />}
                disabled={isTesting}
                loading={isTesting}
                variant="outline"
              >
                Test Contract Features
              </Button>
            </>
          )}

          {modelStatus.status === 'downloading' && (
            <Button disabled loading>
              Downloading...
            </Button>
          )}
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Model Test Result:</span> {testResult}
            </p>
          </div>
        )}

        {contractTestResult && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Contract AI Result:</span> {contractTestResult}
            </p>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-4 text-xs text-gray-500">
          <p>
            The AI model enables advanced text processing features like proofreading, 
            rewriting, and translation. Download is required for offline functionality.
          </p>
        </div>
      </div>
    </div>
  );
};
