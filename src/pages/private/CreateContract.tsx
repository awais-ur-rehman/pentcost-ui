import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateContract } from '../../hooks/useContracts';
import { useLanguage } from '../../contexts/LanguageContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import { FileUpload } from '../../components/common/FileUpload';
import { useContractAI } from '../../hooks/useContractAI';
import { checkAIFeatures, proofreadText, rewriteText, translateText } from '../../services/ai/contract-ai';
import { 
  PlusIcon, 
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const contractSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
});

type ContractFormData = z.infer<typeof contractSchema>;

export default function CreateContract() {
  const navigate = useNavigate();
  const { availableLanguages, userLanguage } = useLanguage();
  const createContractMutation = useCreateContract();
  const {} = useContractAI();
  
  const [contractContent, setContractContent] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [aiCapabilities, setAiCapabilities] = useState(checkAIFeatures());

  // Check AI availability on mount and periodically
  useEffect(() => {
    setAiCapabilities(checkAIFeatures());
    const poll = setInterval(() => {
      const next = checkAIFeatures();
      setAiCapabilities(prev => {
        const same = prev.overall === next.overall && prev.translator === next.translator && prev.proofreader === next.proofreader && prev.rewriter === next.rewriter;
        if (!same) {
          console.debug('[UI][detect] aiCapabilities changed', next);
        }
        return same ? prev : next;
      });
    }, 5000);
    return () => clearInterval(poll);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      title: '',
      description: '',
      language: userLanguage || 'en'
    }
  });

  const handleTranslate = useCallback(async (text: string, targetLanguage: string): Promise<string> => {
    if (!aiCapabilities.overall) {
      throw new Error('Chrome AI features are not available in this browser environment.');
    }
    try {
      console.log('[CreateContract] Starting translation:', { text: text.substring(0, 50) + '...', targetLanguage });
      const result = await translateText(text, targetLanguage, 'en');
      console.log('[CreateContract] Translation result:', result);
      
      if (result.success && result.result) {
        console.log('[CreateContract] Translation successful, returning:', result.result.substring(0, 50) + '...');
        return result.result;
      }
      
      console.error('[CreateContract] Translation failed:', result.error);
      throw new Error(result.error || 'Translation failed');
    } catch (error) {
      console.debug('[AI][translate] error', error);
      throw new Error('Translation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [aiCapabilities.overall]);

  const handleProofread = useCallback(async (text: string) => {
    if (!aiCapabilities.overall) {
      throw new Error('Chrome AI features are not available in this browser environment.');
    }
    if (!aiCapabilities.proofreader) {
      throw new Error('Proofreading feature not available.');
    }
    try {
      const result = await proofreadText(text);
      if (result.success && result.result) {
        return result.result;
      }
      throw new Error(result.error || 'Proofreading failed');
    } catch (error) {
      throw new Error('Proofreading failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [aiCapabilities.overall, aiCapabilities.proofreader]);

  const handleRewrite = useCallback(async (text: string): Promise<string> => {
    if (!aiCapabilities.overall) {
      throw new Error('Chrome AI features are not available in this browser environment.');
    }
    if (!aiCapabilities.rewriter) {
      throw new Error('Rewriting feature not available.');
    }
    try {
      const result = await rewriteText(text, 'formal');
      if (result.success && result.result) {
        return result.result;
      }
      throw new Error(result.error || 'Rewriting failed');
    } catch (error) {
      throw new Error('Rewriting failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [aiCapabilities.overall, aiCapabilities.rewriter]);

  const handleContentChange = useCallback((content: string) => {
    setContractContent(content);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      
      // Try to translate if the file language is different from user's preferred language
      let processedText = text;
      if (userLanguage && userLanguage !== 'en') {
        try {
          processedText = await handleTranslate(text, userLanguage);
        } catch (error) {
          console.warn('Translation failed, using original text:', error);
        }
      }
      
      setContractContent(processedText);
      setShowFileUpload(false);
      toast.success('File uploaded and processed successfully');
    } catch (error) {
      toast.error('Failed to process document: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [userLanguage, handleTranslate, setValue]);

  const onSubmit = async (data: ContractFormData) => {
    try {
      // Backend API expects title, description, content, and originalLanguage
      const contractData = {
        title: data.title,
        description: data.description || '',
        content: contractContent,
        originalLanguage: data.language
      };

      await createContractMutation.mutateAsync(contractData);
      toast.success('Contract created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create contract: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Contract</h1>
              <p className="text-gray-600 mt-2">
                Create a new contract with AI-powered features for translation, proofreading, and rewriting.
              </p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Contract Title"
                {...register('title')}
                error={errors.title?.message}
                placeholder="Enter contract title"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  {...register('language')}
                  className="input-field w-full"
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                {errors.language && (
                  <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
                )}
              </div>
            </div>
            <div className="mt-6">
              <Input
                label="Description (Optional)"
                {...register('description')}
                error={errors.description?.message}
                placeholder="Brief description of the contract"
                multiline
                rows={3}
              />
            </div>
          </div>

          {/* Contract Content */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Contract Content</h2>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<DocumentArrowUpIcon className="h-4 w-4" />}
                  onClick={() => setShowFileUpload(true)}
                >
                  Upload File
                </Button>
              </div>
            </div>

            {showFileUpload && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Upload Contract File</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFileUpload(false)}
                  >
                    Cancel
                  </Button>
                </div>
                <FileUpload
                  onFileSelect={handleFileUpload}
                  maxSize={10} // 10MB
                />
              </div>
            )}

            <RichTextEditor
              content={contractContent}
              onChange={handleContentChange}
              placeholder="Start writing your contract content here. Use the AI tools to translate, proofread, or rewrite selected text."
              onTranslate={async (text: string) => {
                const target = window.prompt('Translate to (language code, e.g., en, es, fr, de):', 'en');
                if (!target) {
                  throw new Error('Translation cancelled: no target language provided');
                }
                console.debug('[UI][translate] targetLanguage', target);
                return handleTranslate(text, target);
              }}
              onProofread={handleProofread}
              onRewrite={handleRewrite}
              className="min-h-[400px]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createContractMutation.isPending}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Contract</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}