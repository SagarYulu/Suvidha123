
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ValidationResult, EditedRowsRecord } from "@/types";
import ValidationAlerts from './ValidationAlerts';
import InvalidRowEditor from './InvalidRowEditor';
import ValidEmployeesList from './ValidEmployeesList';
import { useToast } from '@/hooks/use-toast';

interface ValidationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  validationResults: ValidationResult;
  editedRows: EditedRowsRecord;
  isUploading: boolean;
  handleFieldEdit: (rowKey: string, field: keyof import('@/types').RowData, value: string) => void;
  handleUploadEditedRows: () => void;
  handleProceedAnyway: () => void;
}

const ValidationDialog = ({
  isOpen,
  onOpenChange,
  validationResults,
  editedRows,
  isUploading,
  handleFieldEdit,
  handleUploadEditedRows,
  handleProceedAnyway,
}: ValidationDialogProps) => {
  const { toast } = useToast();
  const [processingClose, setProcessingClose] = useState(false);
  
  // Get value for a field from edited rows or fall back to original
  const getRowValue = (rowKey: string, field: keyof import('@/types').RowData, originalValue: string) => {
    return editedRows[rowKey] ? editedRows[rowKey][field] || originalValue : originalValue;
  };
  
  // Handle dialog close with confirmation if there are valid employees
  const handleCloseDialog = () => {
    if (validationResults.validEmployees.length > 0 && !processingClose) {
      if (confirm("There are valid employees ready to upload. Are you sure you want to cancel?")) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>CSV Validation Results</DialogTitle>
        </DialogHeader>
        
        <ValidationAlerts validationResults={validationResults} />
        
        <ScrollArea className="h-[50vh]">
          <div className="space-y-6">
            {validationResults.invalidRows.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Invalid Rows ({validationResults.invalidRows.length})</h3>
                
                <div className="space-y-4">
                  {validationResults.invalidRows.map((item, idx) => {
                    const rowKey = `row-${idx}`;
                    return (
                      <InvalidRowEditor 
                        key={`invalid-row-editor-${idx}`}
                        item={item} 
                        idx={idx} 
                        rowKey={rowKey}
                        editedRows={editedRows}
                        handleFieldEdit={handleFieldEdit}
                        getRowValue={getRowValue}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <ValidEmployeesList validEmployees={validationResults.validEmployees} />
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center space-x-2">
          <Button variant="outline" onClick={handleCloseDialog}>
            Cancel Upload
          </Button>
          
          <div className="flex space-x-2">
            {validationResults.invalidRows.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleUploadEditedRows} 
                disabled={isUploading}
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
              >
                Validate & Upload Edited Rows
              </Button>
            )}
            
            {validationResults.validEmployees.length > 0 ? (
              <Button 
                onClick={() => {
                  setProcessingClose(true);
                  handleProceedAnyway();
                }} 
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : `Upload Valid Employees (${validationResults.validEmployees.length})`}
              </Button>
            ) : (
              <Button variant="outline" disabled>
                No Valid Data to Upload
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ValidationDialog;
