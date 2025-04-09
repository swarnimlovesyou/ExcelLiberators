
/**
 * Service for handling API calls to unlock Excel files
 */

/**
 * Sends files and password to the API for unlocking
 * @param files Array of files to unlock
 * @param password Password to unlock files
 * @returns Promise resolving to a Blob containing the zip file
 */
export const unlockExcelFiles = async (
  files: File[],
  password: string
): Promise<Blob> => {
  // Create form data
  const formData = new FormData();
  
  // Append files
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  // Append password
  formData.append('password', password);
  
  try {
    // Make API call to FastAPI backend
    const response = await fetch('http://localhost:8000/unlock/', {
      method: 'POST',
      body: formData,
    });
    
    // Check if request was successful
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = 'Failed to unlock files';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // If parsing JSON fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    // Get response blob (zip file)
    const blob = await response.blob();
    return blob;
  } catch (error: any) {
    console.error('Error unlocking Excel files:', error);
    throw new Error(error.message || 'Failed to unlock Excel files');
  }
};

/**
 * Triggers download of blob data as a file
 */
export const downloadBlobAsFile = (blob: Blob, filename: string): void => {
  // Create URL for the blob
  const url = window.URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  
  // Append to the document, click it, and clean up
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
