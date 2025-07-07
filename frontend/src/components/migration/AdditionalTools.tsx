
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdditionalToolsProps {
  onGenerateReport: () => void;
}

const AdditionalTools = ({ onGenerateReport }: AdditionalToolsProps) => {
  return (
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold mb-2">Additional Tools</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button variant="outline" onClick={onGenerateReport} className="h-auto p-4">
          <div className="text-center">
            <FileText className="h-6 w-6 mx-auto mb-2" />
            <div className="font-medium">Generate Table Report</div>
            <div className="text-xs text-gray-500">View current row counts per table</div>
          </div>
        </Button>
        

      </div>
    </div>
  );
};

export default AdditionalTools;
