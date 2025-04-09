
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileArchive, Shield } from 'lucide-react';
import FileDropZone from '@/components/FileDropZone';
import PasswordInput from '@/components/PasswordInput';
import ProcessingAnimation from '@/components/ProcessingAnimation';
import { unlockExcelFiles, downloadBlobAsFile } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const handleFileSelection = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    // Reset result blob when files change
    setResultBlob(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one Excel file to unlock.',
        variant: 'destructive',
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: 'Password required',
        description: 'Please enter the password for your Excel files.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Start processing
      setIsProcessing(true);
      setResultBlob(null);

      // Call API to unlock files
      const result = await unlockExcelFiles(files, password);
      
      // Store result blob
      setResultBlob(result);
      
      // Show success toast
      toast({
        title: 'Files unlocked successfully',
        description: `${files.length} ${files.length === 1 ? 'file has' : 'files have'} been unlocked.`,
      });

    } catch (error: any) {
      // Show error toast
      toast({
        title: 'Error unlocking files',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
      setResultBlob(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBlob) {
      downloadBlobAsFile(resultBlob, 'unlocked_excel_files.zip');
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <FileArchive className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Excel Vault Liberator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Unlock multiple password-protected Excel files at once
          </p>
        </div>

        <Card className="border-border bg-card p-6">
          {isProcessing ? (
            <ProcessingAnimation filesCount={files.length} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Select Excel Files</h3>
                <FileDropZone
                  onFilesSelected={handleFileSelection}
                  selectedFiles={files}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Password</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter the password that works for all selected Excel files.
                </p>
                <PasswordInput
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isProcessing}
                />
              </div>

              <div className="flex flex-col items-center space-y-4 pt-2">
                {resultBlob ? (
                  <Button
                    type="button"
                    onClick={handleDownload}
                    className="w-full max-w-xs"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Unlocked Files
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-full max-w-xs"
                    disabled={files.length === 0 || !password.trim()}
                  >
                    Unlock Files
                  </Button>
                )}

                {resultBlob && (
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full max-w-xs"
                  >
                    Process Again
                  </Button>
                )}
              </div>
            </form>
          )}
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Your files are processed securely. No data is stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default Index;
