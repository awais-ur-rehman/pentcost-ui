import { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  BoldIcon, 
  ItalicIcon, 
  ListBulletIcon, 
  NumberedListIcon,
  LanguageIcon,
  PencilIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  onTranslate?: (text: string, targetLanguage: string) => Promise<string>;
  onProofread?: (text: string) => Promise<any>;
  onRewrite?: (text: string) => Promise<string>;
}

export function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start writing your contract...',
  className = '',
  onTranslate,
  onProofread,
  onRewrite
}: RichTextEditorProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isProofreading, setIsProofreading] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [proofreadingResults, setProofreadingResults] = useState<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const handleTranslate = useCallback(async () => {
    if (!editor || !onTranslate) return;
    
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );

    if (!selectedText.trim()) {
      toast.error('Please select text to translate');
      return;
    }

    setIsTranslating(true);
    try {
      const translatedText = await onTranslate(selectedText, 'en');
      
      // Replace selected text with translated text
      editor.chain()
        .focus()
        .deleteSelection()
        .insertContent(translatedText)
        .run();
        
      toast.success('Text translated successfully');
    } catch (error) {
      toast.error('Translation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsTranslating(false);
    }
  }, [editor, onTranslate]);

  const handleProofread = useCallback(async () => {
    if (!editor || !onProofread) return;
    
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );

    if (!selectedText.trim()) {
      toast.error('Please select text to proofread');
      return;
    }

    setIsProofreading(true);
    try {
      const results = await onProofread(selectedText);
      setProofreadingResults(results);
      toast.success('Proofreading completed');
    } catch (error) {
      toast.error('Proofreading failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProofreading(false);
    }
  }, [editor, onProofread]);

  const handleRewrite = useCallback(async () => {
    if (!editor || !onRewrite) return;
    
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );

    if (!selectedText.trim()) {
      toast.error('Please select text to rewrite');
      return;
    }

    setIsRewriting(true);
    try {
      const rewrittenText = await onRewrite(selectedText);
      
      // Replace selected text with rewritten text
      editor.chain()
        .focus()
        .deleteSelection()
        .insertContent(rewrittenText)
        .run();
        
      toast.success('Text rewritten successfully');
    } catch (error) {
      toast.error('Rewriting failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsRewriting(false);
    }
  }, [editor, onRewrite]);

  const applyProofreadingSuggestion = useCallback((suggestion: any) => {
    if (!editor) return;
    
    // Replace the text with the suggestion
    editor.chain()
      .focus()
      .deleteSelection()
      .insertContent(suggestion.suggestion)
      .run();
      
    setProofreadingResults(null);
    toast.success('Suggestion applied');
  }, [editor]);

  if (!editor) {
    return <LoadingSpinner size="lg" text="Loading editor..." />;
  }

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          {/* Basic formatting */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          >
            <BoldIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          >
            <ItalicIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
          >
            <ListBulletIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
          >
            <NumberedListIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Tools */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTranslate}
            disabled={isTranslating}
            className="flex items-center space-x-1"
          >
            <LanguageIcon className="h-4 w-4" />
            <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleProofread}
            disabled={isProofreading}
            className="flex items-center space-x-1"
          >
            <CheckCircleIcon className="h-4 w-4" />
            <span>{isProofreading ? 'Proofreading...' : 'Proofread'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRewrite}
            disabled={isRewriting}
            className="flex items-center space-x-1"
          >
            <PencilIcon className="h-4 w-4" />
            <span>{isRewriting ? 'Rewriting...' : 'Rewrite'}</span>
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none focus:outline-none"
        />
      </div>

      {/* Proofreading Results */}
      {proofreadingResults && (
        <div className="border-t border-gray-200 p-4 bg-yellow-50">
          <h4 className="font-medium text-gray-900 mb-2">Proofreading Suggestions</h4>
          <div className="space-y-2">
            {proofreadingResults.errors?.map((error: any, index: number) => (
              <div key={index} className="flex items-start space-x-2 p-2 bg-white rounded border">
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{error.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Suggestion: {error.suggestion}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applyProofreadingSuggestion(error)}
                >
                  Apply
                </Button>
              </div>
            ))}
            {proofreadingResults.suggestions?.map((suggestion: any, index: number) => (
              <div key={index} className="flex items-start space-x-2 p-2 bg-white rounded border">
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{suggestion.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Suggestion: {suggestion.suggestion}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applyProofreadingSuggestion(suggestion)}
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setProofreadingResults(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
