
/**
 * Validates if a file is an Excel file based on its MIME type
 */
export const isExcelFile = (file: File): boolean => {
  const validTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
  ];
  
  return validTypes.includes(file.type);
};

/**
 * Formats file size to a human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

/**
 * Checks if the file is valid for processing
 */
export const validateExcelFile = (file: File): { valid: boolean; message?: string } => {
  // Check file type
  if (!isExcelFile(file)) {
    return { 
      valid: false, 
      message: `${file.name} is not an Excel file. Only .xlsx and .xls files are allowed.` 
    };
  }
  
  // Check file size (limit to 20MB)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      message: `${file.name} exceeds the maximum file size of 20MB.` 
    };
  }
  
  return { valid: true };
};
