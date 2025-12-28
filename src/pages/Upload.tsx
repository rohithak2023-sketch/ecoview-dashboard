import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Upload as UploadIcon, FileJson, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

// Security constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;
const VALID_EXTENSIONS = ['.csv', '.json'];
const VALID_MIME_TYPES = ['application/json', 'text/csv', 'application/vnd.ms-excel'];

// Sanitize filename to prevent path traversal and injection attacks
const sanitizeFilename = (filename: string): string => {
  // Remove path components and keep only the filename
  const baseName = filename.split(/[\\\/]/).pop() || filename;
  // Remove potentially dangerous characters, keep only alphanumeric, dots, dashes, underscores
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
};

// Validate file extension
const hasValidExtension = (filename: string): boolean => {
  const lowerName = filename.toLowerCase();
  return VALID_EXTENSIONS.some(ext => lowerName.endsWith(ext));
};

// Validate MIME type
const hasValidMimeType = (type: string): boolean => {
  return VALID_MIME_TYPES.includes(type);
};

const Upload = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    // Check total file count limit
    if (files.length + fileList.length > MAX_FILES) {
      toast({
        title: "Too many files",
        description: `Maximum ${MAX_FILES} files allowed at once.`,
        variant: "destructive",
      });
      return;
    }

    Array.from(fileList).forEach((file) => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large (max 10MB)`);
        return;
      }

      // Validate file size minimum (prevent empty files)
      if (file.size === 0) {
        errors.push(`${file.name}: File is empty`);
        return;
      }

      // Validate file extension
      if (!hasValidExtension(file.name)) {
        errors.push(`${file.name}: Invalid file type`);
        return;
      }

      // Validate MIME type (with fallback for missing MIME)
      if (file.type && !hasValidMimeType(file.type)) {
        errors.push(`${file.name}: Invalid file format`);
        return;
      }

      // Sanitize the filename
      const sanitizedName = sanitizeFilename(file.name);

      newFiles.push({
        id: crypto.randomUUID(),
        name: sanitizedName,
        size: file.size,
        type: file.type || (file.name.endsWith('.json') ? 'application/json' : 'text/csv'),
        status: 'pending',
      });
    });

    // Show errors if any
    if (errors.length > 0) {
      toast({
        title: "Some files were rejected",
        description: errors.slice(0, 3).join('. ') + (errors.length > 3 ? ` (+${errors.length - 3} more)` : ''),
        variant: "destructive",
      });
    }

    if (newFiles.length === 0) {
      return;
    }

    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload process
    newFiles.forEach((file, index) => {
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'uploading' } : f
          )
        );
      }, index * 500);

      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'success' } : f
          )
        );
        toast({
          title: "File uploaded",
          description: `${file.name} has been processed successfully.`,
        });
      }, index * 500 + 2000);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Upload Data</h1>
          <p className="text-muted-foreground mt-1">
            Import energy consumption data from CSV or JSON files (max 10MB each)
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "eco-card p-12 border-2 border-dashed transition-all duration-200 cursor-pointer animate-slide-up",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-muted-foreground/50"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl mb-6 transition-colors",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}>
              <UploadIcon className={cn(
                "h-8 w-8 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isDragging ? 'Drop files here' : 'Drag and drop files'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse from your computer
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>CSV</span>
              </div>
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                <span>JSON</span>
              </div>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3 opacity-0 animate-slide-up delay-100">
            <h3 className="text-sm font-medium text-foreground">Uploaded Files</h3>
            
            {files.map((file) => (
              <div
                key={file.id}
                className="eco-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    file.type.includes('json') ? "bg-chart-4/10" : "bg-chart-1/10"
                  )}>
                    {file.type.includes('json') ? (
                      <FileJson className="h-5 w-5 text-chart-4" />
                    ) : (
                      <FileSpreadsheet className="h-5 w-5 text-chart-1" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {file.status === 'pending' && (
                    <span className="text-sm text-muted-foreground">Waiting...</span>
                  )}
                  {file.status === 'uploading' && (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                    </div>
                  )}
                  {file.status === 'success' && (
                    <div className="flex items-center gap-2 text-chart-1">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Complete</span>
                    </div>
                  )}
                  {file.status === 'error' && (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Failed</span>
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="eco-card p-6 opacity-0 animate-slide-up delay-200">
          <h3 className="text-sm font-semibold text-foreground mb-4">File Format Requirements</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-chart-1" />
                CSV Format
              </h4>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`timestamp,consumption,cost
2024-01-01 00:00,45.2,5.42
2024-01-01 01:00,42.8,5.14`}
              </pre>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <FileJson className="h-4 w-4 text-chart-4" />
                JSON Format
              </h4>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`{
  "readings": [
    {"timestamp": "2024-01-01T00:00",
     "consumption": 45.2}
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
