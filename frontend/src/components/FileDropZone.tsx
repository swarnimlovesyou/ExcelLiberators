
import React, { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { formatFileSize, validateExcelFile } from '../utils/fileUtils';
import { toast } from '../hooks/use-toast';

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFilesSelected,
  selectedFiles,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = useCallback(
    (filesToProcess: FileList | null) => {
      if (!filesToProcess || filesToProcess.length === 0) return;

      const validFiles: File[] = [];
      const newFiles = Array.from(filesToProcess);

      // Check for duplicates and validate files
      const existingFileNames = selectedFiles.map((f) => f.name);

      newFiles.forEach((file) => {
        // Check for duplicates
        if (existingFileNames.includes(file.name)) {
          toast({
            title: 'Duplicate file',
            description: `${file.name} is already in your upload list.`,
            variant: 'destructive',
          });
          return;
        }

        // Validate the file
        const validation = validateExcelFile(file);
        if (!validation.valid) {
          toast({
            title: 'Invalid file',
            description: validation.message,
            variant: 'destructive',
          });
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        onFilesSelected([...selectedFiles, ...validFiles]);
      }
    },
    [onFilesSelected, selectedFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      // Clear the input value to allow selecting the same files again
      e.target.value = '';
    },
    [processFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const updatedFiles = [...selectedFiles];
      updatedFiles.splice(index, 1);
      onFilesSelected(updatedFiles);
    },
    [onFilesSelected, selectedFiles]
  );

  return (
    <div className="w-full space-y-4">
      <div
        className={`file-drop-area ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Drag & Drop Excel Files</h3>
          <p className="text-sm text-muted-foreground">
            or click to browse (.xlsx, .xls)
          </p>
          <p className="text-xs text-muted-foreground">
            Maximum file size: 20MB per file
          </p>
          <input
            type="file"
            className="hidden"
            id="fileInput"
            onChange={handleFileInputChange}
            accept=".xlsx,.xls"
            multiple
          />
          <label
            htmlFor="fileInput"
            className="mt-2 cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Select Files
          </label>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 rounded-md border bg-background p-4">
          <h3 className="mb-3 font-medium">Selected Files</h3>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex-1 truncate">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="rounded-full p-1 hover:bg-background"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
