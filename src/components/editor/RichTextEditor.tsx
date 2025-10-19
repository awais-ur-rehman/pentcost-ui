import { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { 
  BoldIcon, 
  ItalicIcon, 
  ListBulletIcon, 
  NumberedListIcon,
  LanguageIcon,
  PencilIcon,
  CheckCircleIcon,
  MinusIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

// Utility function to clean text from encoding issues
const cleanText = (text: string): string => {
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .replace(/\u00A0/g, ' ') // Replace non-breaking spaces with regular spaces
    .replace(/\u2013/g, '-') // Replace en-dash with regular dash
    .replace(/\u2014/g, '--') // Replace em-dash with double dash
    .replace(/\u2018/g, "'") // Replace left single quotation mark
    .replace(/\u2019/g, "'") // Replace right single quotation mark
    .replace(/\u201C/g, '"') // Replace left double quotation mark
    .replace(/\u201D/g, '"') // Replace right double quotation mark
    .replace(/[\u2026]/g, '...') // Replace ellipsis with three dots
    .replace(/[\u00A9]/g, '(c)') // Replace copyright symbol
    .replace(/[\u00AE]/g, '(R)') // Replace registered trademark symbol
    .replace(/[\u2122]/g, '(TM)') // Replace trademark symbol
    .trim();
};

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  onTranslate?: (text: string, targetLanguage: string, htmlContent?: string) => Promise<string>;
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
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Underline,
      Strike,
      Code,
      CodeBlock,
      Blockquote,
      HorizontalRule,
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
      // Get the HTML content of the selected text to preserve formatting
      const selectedHTML = editor.getHTML().substring(
        editor.state.selection.from,
        editor.state.selection.to
      );
      
      // Send plain text for translation but preserve HTML structure
      const translatedText = await onTranslate(selectedText, 'en', selectedHTML);
      
      // Clean the translated text to remove any encoding issues
      const cleanedText = cleanText(translatedText);
      
      // Replace selected text with cleaned translated text
      editor.chain()
        .focus()
        .deleteSelection()
        .insertContent(cleanedText)
        .run();
        
      toast.success('Text translated successfully');
    } catch (error) {
      toast.error('Translation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsTranslating(false);
    }
  }, [editor, onTranslate]);

  const handleTranslateAll = useCallback(async () => {
    if (!editor || !onTranslate) return;
    
    const shouldTranslateAll = window.confirm(
      'Are you sure you want to translate the entire document? This will replace all content.'
    );
    
    if (!shouldTranslateAll) {
      return;
    }

    setIsTranslating(true);
    try {
      const entireText = editor.getText();
      const entireHTML = editor.getHTML();
      
      if (!entireText.trim()) {
        toast.error('No content to translate');
        return;
      }
      
      // Send plain text for translation but preserve HTML structure
      const translatedText = await onTranslate(entireText, 'en', entireHTML);
      
      // Clean the translated text to remove any encoding issues
      const cleanedText = cleanText(translatedText);
      
      // Replace entire document content
      editor.commands.setContent(cleanedText);
        
      toast.success('Entire document translated successfully');
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

    // Check selection size to prevent hallucinations
    if (selectedText.length > 500) {
      toast.error('Selection too large. Please select max 500 characters for proofreading to prevent hallucinations.');
      return;
    }

    setIsProofreading(true);
    try {
      const results = await onProofread(selectedText);
      
      // If proofreading returns corrected text, clean and insert it
      if (results && typeof results === 'string') {
        const cleanedText = cleanText(results);
        
        // Replace selected text with cleaned proofread text
        editor.chain()
          .focus()
          .deleteSelection()
          .insertContent(cleanedText)
          .run();
      } else {
        setProofreadingResults(results);
      }
      
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
      
      // Clean the rewritten text to remove any encoding issues
      const cleanedText = cleanText(rewrittenText);
      
      // Replace selected text with cleaned rewritten text
      editor.chain()
        .focus()
        .deleteSelection()
        .insertContent(cleanedText)
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
          {/* Headings */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
            >
              H1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
            >
              H2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
            >
              H3
            </Button>
          </div>

          {/* Text formatting */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
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
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'bg-gray-200' : ''}
            >
              <span className="underline">U</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'bg-gray-200' : ''}
            >
              <span className="line-through">S</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={editor.isActive('code') ? 'bg-gray-200' : ''}
            >
              <CodeBracketIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists and structure */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
          </div>

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
            <span>{isTranslating ? 'Translating...' : 'Translate Selected'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTranslateAll}
            disabled={isTranslating}
            className="flex items-center space-x-1 bg-success text-black hover:bg-success-700"
          >
            <LanguageIcon className="h-4 w-4" />
            <span>{isTranslating ? 'Translating...' : 'Translate All'}</span>
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
