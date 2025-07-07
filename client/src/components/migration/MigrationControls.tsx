
import { Database, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface MigrationControlsProps {
  isGenerating: boolean;
  progress: number;
  onGenerateMigration: () => void;
}

const MigrationControls = ({ isGenerating, progress, onGenerateMigration }: MigrationControlsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Button 
        onClick={onGenerateMigration} 
        disabled={isGenerating}
        size="lg"
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Database className="h-4 w-4 mr-2 animate-spin" />
            Generating Enhanced MySQL Migration Script...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Generate Enhanced MySQL Migration
          </>
        )}
      </Button>

      {isGenerating && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="text-sm text-gray-600 text-center">
            Processing tables with enhanced compatibility... ({progress}%)
          </div>
        </div>
      )}
    </div>
  );
};

export default MigrationControls;
