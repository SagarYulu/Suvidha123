import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Upload } from 'lucide-react';

const AdditionalTools = () => {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-semibold">Additional Tools</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Database
        </Button>
        <Button variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
        <Button variant="outline" className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Import Data
        </Button>
      </div>
    </div>
  );
};

export default AdditionalTools;