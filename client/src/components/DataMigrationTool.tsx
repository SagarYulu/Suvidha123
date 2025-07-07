
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DataMigrationGenerator } from '@/utils/dataMigrationGenerator';
import { toast } from '@/hooks/use-toast';
import MigrationHeader from './migration/MigrationHeader';
import MigrationAlerts from './migration/MigrationAlerts';
import MigrationControls from './migration/MigrationControls';
import AdditionalTools from './migration/AdditionalTools';
import MigrationSuccess from './migration/MigrationSuccess';

const DataMigrationTool = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const migrationGenerator = new DataMigrationGenerator();

  const handleGenerateMigration = async () => {
    setIsGenerating(true);
    setProgress(0);
    setMigrationComplete(false);
    
    try {
      toast({
        title: "Starting Enhanced Data Migration",
        description: "Extracting data with improved MySQL compatibility and error handling...",
      });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 92));
      }, 400);

      await migrationGenerator.generateCompleteMigration();
      
      clearInterval(progressInterval);
      setProgress(100);
      setMigrationComplete(true);
      
      toast({
        title: "Enhanced Migration Script Generated!",
        description: "Improved MySQL migration script with better compatibility has been downloaded.",
      });

    } catch (error) {
      console.error('Migration generation failed:', error);
      toast({
        title: "Migration Failed",
        description: "There was an error generating the migration script. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await migrationGenerator.generateTableReport();
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `database_report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Database report has been downloaded.",
      });
    } catch (error) {
      console.error('Report generation failed:', error);
      toast({
        title: "Report Failed",
        description: "Failed to generate database report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <MigrationHeader />
        <CardContent className="space-y-6">
          <MigrationAlerts />
          
          <MigrationControls 
            isGenerating={isGenerating}
            progress={progress}
            onGenerateMigration={handleGenerateMigration}
          />

          <AdditionalTools onGenerateReport={handleGenerateReport} />

          {migrationComplete && <MigrationSuccess />}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataMigrationTool;
