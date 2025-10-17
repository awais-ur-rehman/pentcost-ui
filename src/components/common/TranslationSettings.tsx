import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { 
  getTranslationConfig, 
  saveTranslationConfig, 
  addCustomTerm, 
  getCustomTerms,
  loadTerminologySet,
  LEGAL_TERMINOLOGY_SETS,
  type TranslationConfig 
} from '../../services/ai/translation-config';
import { Cog6ToothIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TranslationSettingsProps {
  sourceLanguage: string;
  targetLanguage: string;
  onClose: () => void;
}

export function TranslationSettings({ sourceLanguage, targetLanguage, onClose }: TranslationSettingsProps) {
  const [config, setConfig] = useState<TranslationConfig>(getTranslationConfig());
  const [customTerms, setCustomTerms] = useState(getCustomTerms(sourceLanguage, targetLanguage));
  const [newTerm, setNewTerm] = useState({ source: '', target: '' });

  useEffect(() => {
    setCustomTerms(getCustomTerms(sourceLanguage, targetLanguage));
  }, [sourceLanguage, targetLanguage]);

  const handleAddTerm = () => {
    if (newTerm.source && newTerm.target) {
      addCustomTerm(sourceLanguage, targetLanguage, newTerm.source, newTerm.target);
      setCustomTerms(getCustomTerms(sourceLanguage, targetLanguage));
      setNewTerm({ source: '', target: '' });
    }
  };

  const handleRemoveTerm = (term: string) => {
    const updatedTerms = { ...customTerms };
    delete updatedTerms[term];
    
    // Update the config directly
    const updatedConfig = { ...config };
    if (!updatedConfig.customTerms[sourceLanguage]) {
      updatedConfig.customTerms[sourceLanguage] = {};
    }
    updatedConfig.customTerms[sourceLanguage][targetLanguage] = updatedTerms;
    
    saveTranslationConfig(updatedConfig);
    setCustomTerms(updatedTerms);
  };

  const handleLoadTerminologySet = (setName: string) => {
    loadTerminologySet(setName);
    setCustomTerms(getCustomTerms(sourceLanguage, targetLanguage));
  };

  const handleConfigChange = (key: keyof TranslationConfig, value: any) => {
    const updatedConfig = { ...config, [key]: value };
    setConfig(updatedConfig);
    saveTranslationConfig(updatedConfig);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Translation Settings</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        {/* General Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">General Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.preserveFormatting}
                onChange={(e) => handleConfigChange('preserveFormatting', e.target.checked)}
                className="mr-2"
              />
              Preserve formatting and structure
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.addDisclaimer}
                onChange={(e) => handleConfigChange('addDisclaimer', e.target.checked)}
                className="mr-2"
              />
              Add translation disclaimer
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enableProofreading}
                onChange={(e) => handleConfigChange('enableProofreading', e.target.checked)}
                className="mr-2"
              />
              Enable post-translation proofreading
            </label>
          </div>
        </div>

        {/* Predefined Terminology Sets */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Load Terminology Sets</h3>
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(LEGAL_TERMINOLOGY_SETS).map((setName) => (
              <Button
                key={setName}
                variant="outline"
                size="sm"
                onClick={() => handleLoadTerminologySet(setName)}
                className="justify-start"
              >
                Load {setName.replace('-', ' ')} terminology
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Terms */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">
            Custom Terms ({sourceLanguage.toUpperCase()} → {targetLanguage.toUpperCase()})
          </h3>
          
          {/* Add New Term */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder={`${sourceLanguage.toUpperCase()} term`}
              value={newTerm.source}
              onChange={(e) => setNewTerm({ ...newTerm, source: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder={`${targetLanguage.toUpperCase()} translation`}
              value={newTerm.target}
              onChange={(e) => setNewTerm({ ...newTerm, target: e.target.value })}
              className="flex-1"
            />
            <Button
              onClick={handleAddTerm}
              disabled={!newTerm.source || !newTerm.target}
              size="sm"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Existing Terms */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {Object.entries(customTerms).map(([source, target]) => (
              <div key={source} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">
                  <strong>{source}</strong> → {target}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTerm(source)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {Object.keys(customTerms).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                No custom terms defined. Add terms to ensure consistent translation.
              </p>
            )}
          </div>
        </div>

        {/* Quality Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Quality Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use ALL CAPS for section headers and key terms</li>
            <li>• Keep legal phrases consistent throughout the document</li>
            <li>• Always review AI translations before final use</li>
            <li>• Consider loading predefined terminology sets for your domain</li>
          </ul>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
