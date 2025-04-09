
import { FileArchive, Loader } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';

interface ProcessingAnimationProps {
  filesCount: number;
}

const ProcessingAnimation = ({ filesCount }: ProcessingAnimationProps) => {
  const [progress, setProgress] = useState(0);
  
  // Simulate progress for better user experience
  useEffect(() => {
    // Quickly go to 60% then slow down
    const timer1 = setTimeout(() => setProgress(30), 300);
    const timer2 = setTimeout(() => setProgress(60), 800);
    
    // Slower updates after 60%
    const timer3 = setTimeout(() => setProgress(70), 1500);
    const timer4 = setTimeout(() => setProgress(80), 2500);
    const timer5 = setTimeout(() => setProgress(90), 4000);
    
    // We never reach 100% as that would indicate completion
    // The actual completion will be determined by the API response
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <FileArchive className="h-16 w-16 text-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="h-6 w-6 animate-spin-slow text-primary-foreground" />
        </div>
      </div>
      <h3 className="mt-4 text-xl font-medium">Processing Files</h3>
      <p className="text-muted-foreground mb-4">
        Unlocking {filesCount} {filesCount === 1 ? 'file' : 'files'}...
      </p>
      <div className="w-full max-w-xs">
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};

export default ProcessingAnimation;
