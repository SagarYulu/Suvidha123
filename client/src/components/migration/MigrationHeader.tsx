import React from 'react';
import { Database } from 'lucide-react';

const MigrationHeader = () => {
  return (
    <div className="flex items-center space-x-3 mb-6">
      <Database className="h-8 w-8 text-blue-600" />
      <h1 className="text-2xl font-bold">Data Migration Tool</h1>
    </div>
  );
};

export default MigrationHeader;