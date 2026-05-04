import React, { useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { FileUp, FileText, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function FileUploader({ onFileSelect, selectedFile, onClear }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const dropzoneOptions: any = {
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  if (selectedFile) {
    return (
      <div className="relative p-5 border border-slate-700 bg-slate-800 rounded-lg group shadow-sm">
        <button 
          onClick={onClear}
          className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-rose-500 text-slate-400 hover:text-white rounded-md transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-red-500 rounded text-white shrink-0 shadow-lg shadow-red-900/20">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-sans text-sm font-semibold truncate text-white">
              {selectedFile.name}
            </p>
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-wider font-bold">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • SECURED
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "cursor-pointer border-2 border-dashed border-slate-700 p-8 text-center transition-all rounded-xl",
        "hover:border-indigo-500 hover:bg-slate-800/50 hover:shadow-xl hover:shadow-indigo-500/5",
        isDragActive && "border-indigo-500 bg-slate-800/80 shadow-2xl shadow-indigo-500/10"
      )}
    >
      <input {...getInputProps()} />
      <FileUp className="w-8 h-8 mx-auto mb-3 text-slate-600" />
      <p className="font-sans font-medium text-sm text-slate-300">Drop your PDF here</p>
      <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest mt-1">
        Supports large documents
      </p>
    </div>
  );
}
