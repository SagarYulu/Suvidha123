import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Loader2 } from 'lucide-react';

interface MigrationControlsProps {
  isGenerating: boolean;
  progress: number;
  onGenerate: () => void;
}

const MigrationControls: React.FC<MigrationControlsProps> = ({
  isGenerating,
  progress,
  onGenerate,
}) => {
  return (
    <div className="space-y-4">
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        size="lg"
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Data...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Generate Migration Data
          </>
        )}
      </Button>

      {isGenerating && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600 text-center">
            {progress}% Complete
          </p>
        </div>
      )}
    </div>
  );
};

export default MigrationControls;