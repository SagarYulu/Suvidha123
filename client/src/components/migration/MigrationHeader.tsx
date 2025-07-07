
import { Database } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MigrationHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Database className="h-6 w-6" />
        Enhanced Data Migration Tool
      </CardTitle>
      <CardDescription>
        Extract all data from your Supabase database and generate MySQL-compatible INSERT statements with improved error handling and compatibility.
      </CardDescription>
    </CardHeader>
  );
};

export default MigrationHeader;
