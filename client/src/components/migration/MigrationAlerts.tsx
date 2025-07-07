import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MigrationAlerts = () => {
  return (
    <>
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This tool generates mock data for testing purposes. Production data should be migrated using proper backup and restore procedures.
        </AlertDescription>
      </Alert>
      
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Warning:</strong> This will replace existing data. Make sure to backup your database before proceeding.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default MigrationAlerts;