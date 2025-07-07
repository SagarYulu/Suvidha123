
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MigrationAlerts = () => {
  return (
    <>
      <Alert>
        <RefreshCw className="h-4 w-4" />
        <AlertDescription>
          <strong>Enhanced Migration Process:</strong> This updated tool provides better MySQL compatibility, improved error handling, smaller batch sizes, and enhanced data type conversion for a more reliable migration.
        </AlertDescription>
      </Alert>

      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Before Running New Migration:</strong> If you previously ran a migration script, please clean your MySQL database first to avoid data conflicts. Run the cleanup SQL commands in MySQL Workbench before proceeding.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default MigrationAlerts;
