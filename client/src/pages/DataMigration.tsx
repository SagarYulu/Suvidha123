
import DataMigrationTool from '@/components/DataMigrationTool';

const DataMigration = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Migration to MySQL
          </h1>
          <p className="text-lg text-gray-600">
            Generate complete MySQL migration scripts from your Supabase database
          </p>
        </div>
        
        <DataMigrationTool />
      </div>
    </div>
  );
};

export default DataMigration;
