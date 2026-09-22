import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';
import { cn } from '../../utils/cn';

const DOCUMENT_TYPES = [
  { value: 'hospital_bill', label: 'Hospital Bill' },
  { value: 'discharge_summary', label: 'Discharge Summary' },
  { value: 'medical_documents', label: 'Medical Documents' },
  { value: 'payment_receipt', label: 'Payment Receipt' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 10,
  className,
  required = false,
  error,
}) {
  const [files, setFiles] = useState(value);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const emitChange = useCallback((next) => {
    onChangeRef.current?.(next.map(({ file, documentType }) => ({ file, documentType })));
  }, []);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only PDF, PNG, and JPG files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const addFiles = useCallback((newFiles) => {
    const validFiles = [];
    const errors = [];

    Array.from(newFiles).forEach((file) => {
      const err = validateFile(file);
      if (err) {
        errors.push(`${file.name}: ${err}`);
      } else if (files.length + validFiles.length < maxFiles) {
        validFiles.push({
          file,
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          documentType: 'hospital_bill',
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        });
      } else {
        errors.push(`Maximum ${maxFiles} files allowed`);
      }
    });

    if (validFiles.length > 0) {
      setFiles((prev) => {
        const next = [...prev, ...validFiles];
        emitChange(next);
        return next;
      });
    }
    if (errors.length > 0) {
      console.warn(errors.join(', '));
    }
  }, [files.length, maxFiles, emitChange]);

  const removeFile = useCallback((id) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      const next = prev.filter((f) => f.id !== id);
      emitChange(next);
      return next;
    });
  }, [emitChange]);

  const updateDocumentType = useCallback((id, documentType) => {
    setFiles((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, documentType } : f));
      emitChange(next);
      return next;
    });
  }, [emitChange]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback((e) => {
    if (e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  }, [addFiles]);

  const handleClick = useCallback(() => fileInputRef.current?.click(), []);

  const getFileIcon = (type) => {
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <Image className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200',
          'cursor-pointer',
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50',
          files.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label="File upload area"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={files.length >= maxFiles}
          aria-label="Select files"
        />

        <Upload className="mx-auto w-10 h-10 text-slate-400 mb-3" />
        <p className="text-lg font-medium text-slate-700 mb-1">
          {isDragActive ? 'Drop files here' : 'Click or drag & drop to upload'}
        </p>
        <p className="text-sm text-slate-500 mb-2">
          PDF, PNG, JPG up to 10MB each • Max {maxFiles} files
        </p>
        {files.length > 0 && (
          <p className="text-sm text-primary-600 font-medium">
            {files.length}/{maxFiles} files selected
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-3" role="list" aria-label="Uploaded files">
          {files.map((fileData) => (
            <div
              key={fileData.id}
              className={cn(
                'flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-slide-up',
                fileData.preview && 'bg-green-50 border-green-100'
              )}
              role="listitem"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                {fileData.preview ? (
                  <img src={fileData.preview} alt="" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  getFileIcon(fileData.file.type)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{fileData.file.name}</p>
                <p className="text-xs text-slate-500">
                  {(fileData.file.size / 1024).toFixed(1)} KB • {fileData.file.type}
                </p>
                <select
                  value={fileData.documentType}
                  onChange={(e) => updateDocumentType(fileData.id, e.target.value)}
                  className="mt-2 w-full sm:w-48 px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Document type"
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => removeFile(fileData.id)}
                className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                aria-label={`Remove ${fileData.file.name}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>
      )}
      {required && files.length === 0 && !error && (
        <p className="mt-2 text-sm text-amber-600">At least one document is required</p>
      )}
    </div>
  );
}