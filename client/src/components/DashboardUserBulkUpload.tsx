
import { useState } from 'react';
import { getDashboardUserCSVTemplate } from '@/utils/csvDashboardUsersParser';
import DashboardUserValidationDialog from './dashboard-users/DashboardUserValidationDialog';
import useDashboardUserBulkUpload from '@/hooks/useDashboardUserBulkUpload';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Upload, FileSpreadsheet, Download, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface DashboardUserBulkUploadProps {
  onUploadSuccess?: () => void;
}

const DashboardUserBulkUpload = ({ onUploadSuccess }: DashboardUserBulkUploadProps) => {
  const {
    isUploading,
    showValidationDialog,
    setShowValidationDialog,
    validationResults,
    editedRows,
    handleFileUpload,
    handleFieldEdit,
    handleUploadEditedRows,
    handleProceedAnyway,
    handleValidateAgain
  } = useDashboardUserBulkUpload(onUploadSuccess);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    const template = getDashboardUserCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard_users_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleDownloadTemplate}
        >
          <Download size={18} />
          Download Template
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => document.getElementById('csvFileInput')?.click()}
          disabled={isUploading}
        >
          <Upload size={18} />
          {isUploading ? 'Uploading...' : 'Select CSV File'}
        </Button>
        <input
          id="csvFileInput"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      
      <Card className="p-4 bg-slate-50">
        <div className="flex items-start space-x-4">
          <FileSpreadsheet className="h-6 w-6 text-blue-500" />
          <div>
            <h3 className="font-semibold text-sm">CSV Format Requirements</h3>
            <ul className="text-sm text-gray-600 space-y-1 mt-1">
              <li>• All fields are required: User ID, name, email, employee_id, phone, city, cluster, manager, role, password</li>
              <li>• User ID must be numeric</li>
              <li>• Role must be one of: City Head, Revenue and Ops Head, CRM, Cluster Head, Payroll Ops, HR Admin, Super Admin</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Make sure your CSV file has the correct format. Download the template for reference.
          All dashboard users will need to have permissions assigned after upload.
        </AlertDescription>
      </Alert>

      <DashboardUserValidationDialog 
        isOpen={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        validationResults={validationResults}
        editedRows={editedRows}
        isUploading={isUploading}
        handleFieldEdit={handleFieldEdit}
        handleUploadEditedRows={handleUploadEditedRows}
        handleProceedAnyway={handleProceedAnyway}
        handleValidateAgain={handleValidateAgain}
      />
    </div>
  );
};

export default DashboardUserBulkUpload;
