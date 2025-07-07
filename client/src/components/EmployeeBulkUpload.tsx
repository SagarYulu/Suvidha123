import { useState } from 'react';
import { getCSVTemplate } from '@/utils/csvTemplateUtils';
import EmployeeValidationDialog from './employees/EmployeeValidationDialogSimple';
import useBulkUpload from '@/hooks/useBulkUpload';
import { Button } from './ui/button';
import { Upload, Download, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface EmployeeBulkUploadProps {
  onUploadSuccess?: () => void;
}

const EmployeeBulkUpload = ({ onUploadSuccess }: EmployeeBulkUploadProps) => {
  const {
    isUploading,
    showValidationDialog,
    setShowValidationDialog,
    validationResults,
    editedRows,
    handleFileUpload,
    handleFieldEdit,
    handleUploadEditedRows,
    handleProceedAnyway
  } = useBulkUpload(onUploadSuccess);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(e);
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    const template = getCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
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
          onClick={() => document.getElementById('employeeCsvFileInput')?.click()}
          disabled={isUploading}
        >
          <Upload size={18} />
          {isUploading ? 'Uploading...' : 'Upload CSV'}
        </Button>
        <input
          id="employeeCsvFileInput"
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
            <h3 className="font-semibold text-sm">CSV Format Instructions</h3>
            <p className="text-sm text-gray-600 mb-2">Please ensure your CSV file follows these guidelines:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ <strong>Required Headers:</strong> User ID, emp_id, name, email, role</li>
              <li>✓ <strong>Optional Headers:</strong> phone, city, cluster, manager, date_of_joining, date_of_birth, blood_group, account_number, ifsc_code, password</li>
              <li>✓ <strong>User ID Format:</strong> Must be a 7-digit number (e.g., 1234567)</li>
              <li>✓ <strong>Date Format:</strong> DD-MM-YYYY or DD/MM/YYYY</li>
              <li>✓ <strong>Password:</strong> If not provided, defaults to "changeme123"</li>
            </ul>
          </div>
        </div>
      </Card>

      <EmployeeValidationDialog 
        isOpen={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        validationResults={validationResults}
        editedRows={editedRows}
        isUploading={isUploading}
        handleFieldEdit={handleFieldEdit}
        handleUploadEditedRows={handleUploadEditedRows}
        handleProceedAnyway={handleProceedAnyway}
      />
    </div>
  );
};

export default EmployeeBulkUpload;