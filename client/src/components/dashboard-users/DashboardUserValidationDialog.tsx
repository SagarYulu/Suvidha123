
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, Check, AlertTriangle } from 'lucide-react';
import { DashboardUserRowData } from '@/types/dashboardUsers';
import DashboardUserInvalidRowEditor from './DashboardUserInvalidRowEditor';
import DashboardUserValidList from './DashboardUserValidList';

interface ValidationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  validationResults: {
    validUsers: any[];
    invalidRows: {
      row: any;
      errors: string[];
      rowData: DashboardUserRowData;
    }[];
  };
  editedRows: Record<string, DashboardUserRowData>;
  isUploading: boolean;
  handleFieldEdit: (rowIndex: string, field: keyof DashboardUserRowData, value: string) => void;
  handleUploadEditedRows: () => void;
  handleProceedAnyway: () => void;
  handleValidateAgain: () => void;
}

const DashboardUserValidationDialog: React.FC<ValidationDialogProps> = ({
  isOpen,
  onOpenChange,
  validationResults,
  editedRows,
  isUploading,
  handleFieldEdit,
  handleUploadEditedRows,
  handleProceedAnyway,
  handleValidateAgain
}) => {
  const { validUsers, invalidRows } = validationResults;
  const hasValidUsers = validUsers.length > 0;
  const hasInvalidRows = invalidRows.length > 0;
  const totalRows = validUsers.length + invalidRows.length;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-screen overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">CSV Validation Results</DialogTitle>
          <DialogDescription>
            {totalRows > 0 
              ? `${validUsers.length} of ${totalRows} rows are valid and ready to upload.`
              : "No data found in the CSV file."
            }
          </DialogDescription>
        </DialogHeader>
        
        {totalRows > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {hasValidUsers && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700">{validUsers.length} Valid Entries</AlertTitle>
                  <AlertDescription className="text-green-600">
                    These records are ready to be uploaded to the system.
                  </AlertDescription>
                </Alert>
              )}
              
              {hasInvalidRows && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{invalidRows.length} Invalid Entries</AlertTitle>
                  <AlertDescription>
                    These records need corrections before they can be uploaded.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue={hasInvalidRows ? 'invalid' : 'valid'} className="h-full">
                <TabsList>
                  <TabsTrigger value="valid" disabled={!hasValidUsers}>
                    Valid ({validUsers.length})
                  </TabsTrigger>
                  <TabsTrigger value="invalid" disabled={!hasInvalidRows}>
                    Invalid ({invalidRows.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="valid" className="overflow-auto max-h-[50vh]">
                  {hasValidUsers ? (
                    <DashboardUserValidList users={validUsers} />
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">No valid entries found.</div>
                  )}
                </TabsContent>
                
                <TabsContent value="invalid" className="overflow-auto max-h-[50vh]">
                  {hasInvalidRows ? (
                    <DashboardUserInvalidRowEditor 
                      invalidRows={invalidRows}
                      editedRows={editedRows}
                      onFieldEdit={handleFieldEdit}
                    />
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">No invalid entries found.</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div className="flex space-x-2">
                {hasInvalidRows && Object.keys(editedRows).length > 0 && (
                  <Button 
                    variant="secondary" 
                    onClick={handleValidateAgain}
                    disabled={isUploading}
                  >
                    Validate Again
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                {hasInvalidRows && hasValidUsers && (
                  <Button 
                    variant="outline" 
                    onClick={handleProceedAnyway}
                    disabled={isUploading || validUsers.length === 0}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Valid Entries Only'}
                  </Button>
                )}
                
                <Button 
                  variant="default" 
                  onClick={handleUploadEditedRows}
                  disabled={isUploading || (validUsers.length === 0 && Object.keys(editedRows).length === 0)}
                >
                  {isUploading ? 'Uploading...' : 'Upload All Valid Entries'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DashboardUserValidationDialog;
