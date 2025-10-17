import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileProcess?: (content: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  onFileProcess,
  acceptedTypes = ['.txt', '.doc', '.docx', '.pdf'],
  maxSize = 10,
  className = '',
  disabled = false
}: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setSelectedFile(file);
    onFileSelect(file);

    if (onFileProcess) {
      setIsProcessing(true);
      try {
        const content = await extractTextFromFile(file);
        onFileProcess(content);
        toast.success('File processed successfully');
      } catch (error) {
        toast.error('Failed to process file: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsProcessing(false);
      }
    }
  }, [onFileSelect, onFileProcess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf']
    },
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: false,
    disabled
  });

  const removeFile = () => {
    setSelectedFile(null);
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'll need a PDF parser library
        // For now, we'll show a message that PDF parsing is not implemented
        reject(new Error('PDF parsing not implemented yet. Please use .txt, .doc, or .docx files.'));
      } else {
        // For Word documents, we'll need a library like mammoth
        // For now, we'll show a message that Word parsing is not implemented
        reject(new Error('Word document parsing not implemented yet. Please use .txt files.'));
      }
    });
  };

  if (selectedFile) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 bg-gray-50 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>
        {isProcessing && (
          <div className="mt-3 flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-600">Processing file...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-900">
          {isDragActive ? 'Drop the file here' : 'Upload a document'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Drag and drop a file, or click to select
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Supported formats: {acceptedTypes.join(', ')} (max {maxSize}MB)
        </p>
      </div>
    </div>
  );
}
