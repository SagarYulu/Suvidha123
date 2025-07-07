import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, Edit3, Save, RefreshCw, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { ValidationResult, ValidationError, EditedRowsRecord, RowData } from '@/types';

interface EmployeeValidationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  validationResults: ValidationResult;
  editedRows: EditedRowsRecord;
  isUploading: boolean;
  handleFieldEdit: (rowKey: string, field: keyof RowData, value: string) => void;
  handleUploadEditedRows: () => void;
  handleProceedAnyway: () => void;
}

const EmployeeValidationDialog = ({
  isOpen,
  onOpenChange,
  validationResults,
  editedRows,
  isUploading,
  handleFieldEdit,
  handleUploadEditedRows,
  handleProceedAnyway,
}: EmployeeValidationDialogProps) => {
  const [editingRow, setEditingRow] = useState<string | null>(null);

  const handleEdit = (rowIndex: number) => {
    const rowKey = `row-${rowIndex}`;
    const rowData = validationResults.invalidRows[rowIndex].rowData;
    
    // Initialize the edited row data if it doesn't exist
    if (!editedRows[rowKey]) {
      // Initialize with the original row data
      Object.keys(rowData).forEach(field => {
        const value = rowData[field as keyof RowData];
        handleFieldEdit(rowKey, field as keyof RowData, String(value || ''));
      });
    }
    
    setEditingRow(rowKey);
  };

  const handleSave = () => {
    // Trigger re-validation of edited rows to update validation results
    // This will be handled by the parent component's validation logic
    setEditingRow(null);
    
    // Note: The actual validation and state update happens in the parent useBulkUpload hook
    // when handleUploadEditedRows is called
  };

  const totalRows = validationResults.validEmployees.length + validationResults.invalidRows.length;
  const validCount = validationResults.validEmployees.length;
  const invalidCount = validationResults.invalidRows.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Validation Results</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Summary Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">
                Total Rows: {totalRows}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Valid: {validCount}
                </span>
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Invalid: {invalidCount}
                </span>
              </div>
            </div>
          </div>

          {/* Invalid Rows Section */}
          {validationResults.invalidRows.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Rows with Errors ({validationResults.invalidRows.length})
              </h3>
              
              <div className="max-h-96 overflow-y-auto space-y-3">
                {validationResults.invalidRows.map((row, index) => (
                  <Card key={index} className="border-red-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Row {index + 1}: {row.rowData.name || 'Unnamed Employee'}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {editingRow === `row-${index}` ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleSave}
                              className="flex items-center gap-1"
                            >
                              <Save className="h-3 w-3" />
                              Save
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(index)}
                              className="flex items-center gap-1"
                            >
                              <Edit3 className="h-3 w-3" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Error Messages */}
                      <div className="bg-red-50 rounded p-3">
                        <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {row.errors.map((error, errorIndex) => (
                            <li key={errorIndex}>• {error}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Editable Fields */}
                      {editingRow === `row-${index}` && (
                        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                          <div>
                            <Label htmlFor={`name-${index}`}>Name</Label>
                            <Input
                              id={`name-${index}`}
                              value={editedRows[`row-${index}`]?.name || row.rowData.name || ''}
                              onChange={(e) => handleFieldEdit(`row-${index}`, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`email-${index}`}>Email</Label>
                            <Input
                              id={`email-${index}`}
                              value={editedRows[`row-${index}`]?.email || row.rowData.email || ''}
                              onChange={(e) => handleFieldEdit(`row-${index}`, 'email', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`emp_id-${index}`}>Employee ID</Label>
                            <Input
                              id={`emp_id-${index}`}
                              value={editedRows[`row-${index}`]?.emp_id || row.rowData.emp_id || ''}
                              onChange={(e) => handleFieldEdit(`row-${index}`, 'emp_id', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`phone-${index}`}>Phone</Label>
                            <Input
                              id={`phone-${index}`}
                              value={editedRows[`row-${index}`]?.phone || row.rowData.phone || ''}
                              onChange={(e) => handleFieldEdit(`row-${index}`, 'phone', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`role-${index}`}>Role</Label>
                            <Select 
                              value={editedRows[`row-${index}`]?.role || row.rowData.role || ''}
                              onValueChange={(value) => handleFieldEdit(`row-${index}`, 'role', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Area Incharge">Area Incharge</SelectItem>
                                <SelectItem value="Bike Captain">Bike Captain</SelectItem>
                                <SelectItem value="Bike Fitter">Bike Fitter</SelectItem>
                                <SelectItem value="CRM">CRM</SelectItem>
                                <SelectItem value="Cleaning Associate">Cleaning Associate</SelectItem>
                                <SelectItem value="Cluster Executive">Cluster Executive</SelectItem>
                                <SelectItem value="Cluster Head">Cluster Head</SelectItem>
                                <SelectItem value="Inventory Associate">Inventory Associate</SelectItem>
                                <SelectItem value="Marshal">Marshal</SelectItem>
                                <SelectItem value="Mechanic">Mechanic</SelectItem>
                                <SelectItem value="Mobile QC">Mobile QC</SelectItem>
                                <SelectItem value="Operator">Operator</SelectItem>
                                <SelectItem value="Ops Head">Ops Head</SelectItem>
                                <SelectItem value="Pilot">Pilot</SelectItem>
                                <SelectItem value="Promoter">Promoter</SelectItem>
                                <SelectItem value="Quality Check associate">Quality Check associate</SelectItem>
                                <SelectItem value="Sales Associate">Sales Associate</SelectItem>
                                <SelectItem value="TA Associate">TA Associate</SelectItem>
                                <SelectItem value="Team Leader - rider enablement">Team Leader - rider enablement</SelectItem>
                                <SelectItem value="Warehouse Associate">Warehouse Associate</SelectItem>
                                <SelectItem value="Welder">Welder</SelectItem>
                                <SelectItem value="Workshop Manager">Workshop Manager</SelectItem>
                                <SelectItem value="Yulu Captain">Yulu Captain</SelectItem>
                                <SelectItem value="Zone Screener">Zone Screener</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`city-${index}`}>City</Label>
                            <Select 
                              value={editedRows[`row-${index}`]?.city || row.rowData.city || ''}
                              onValueChange={(value) => handleFieldEdit(`row-${index}`, 'city', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Bangalore">Bangalore</SelectItem>
                                <SelectItem value="Delhi">Delhi</SelectItem>
                                <SelectItem value="Mumbai">Mumbai</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`cluster-${index}`}>Cluster</Label>
                            <Input
                              id={`cluster-${index}`}
                              value={editedRows[`row-${index}`]?.cluster || row.rowData.cluster || ''}
                              onChange={(e) => handleFieldEdit(`row-${index}`, 'cluster', e.target.value)}
                              placeholder="Enter cluster"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`manager-${index}`}>Manager</Label>
                            <Input
                              id={`manager-${index}`}
                              value={editedRows[`row-${index}`]?.manager || row.rowData.manager || ''}
                              onChange={(e) => handleFieldEdit(`row-${index}`, 'manager', e.target.value)}
                              placeholder="Enter manager name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`date_of_joining-${index}`}>Date of Joining</Label>
                            <Input
                              id={`date_of_joining-${index}`}
                              type="date"
                              value={editedRows[`row-${index}`]?.date_of_joining || row.rowData.date_of_joining || ''}
                              onChange={(e) => handleFieldEdit(`row-${index}`, 'date_of_joining', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`date_of_birth-${index}`}>Date of Birth</Label>
                            <Input
                              id={`date_of_birth-${index}`}
                              type="date"
                              value={editedRows[`row-${index}`]?.date_of_birth || row.rowData.date_of_birth || ''}
                              onChange={(e) => handleFieldEdit(`row-${index}`, 'date_of_birth', e.target.value)}
                              placeholder="YYYY-MM-DD format"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`blood_group-${index}`}>Blood Group</Label>
                            <Select 
                              value={editedRows[`row-${index}`]?.blood_group || row.rowData.blood_group || ''}
                              onValueChange={(value) => handleFieldEdit(`row-${index}`, 'blood_group', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`account_number-${index}`}>Account Number</Label>
                            <Input
                              id={`account_number-${index}`}
                              value={editedRows[`row-${index}`]?.account_number || row.rowData.account_number || ''}
                              onChange={(e) => handleFieldEdit(`row-${index}`, 'account_number', e.target.value)}
                              placeholder="Bank account number"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`ifsc_code-${index}`}>IFSC Code</Label>
                            <Input
                              id={`ifsc_code-${index}`}
                              value={editedRows[`row-${index}`]?.ifsc_code || row.rowData.ifsc_code || ''}
                              onChange={(e) => handleFieldEdit(`row-${index}`, 'ifsc_code', e.target.value)}
                              placeholder="Bank IFSC code"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`password-${index}`}>Password</Label>
                            <Input
                              id={`password-${index}`}
                              type="password"
                              value={editedRows[`row-${index}`]?.password || row.rowData.password || ''}
                              onChange={(e) => handleFieldEdit(`row-${index}`, 'password', e.target.value)}
                              placeholder="Employee password"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Valid Rows Section */}
          {validationResults.validEmployees.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-green-600 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Valid Rows ({validationResults.validEmployees.length})
              </h3>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  {validationResults.validEmployees.length} employee(s) are ready to be uploaded.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          
          {validationResults.invalidRows.length > 0 && (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Force re-validation by calling handleUploadEditedRows which validates first
                  handleUploadEditedRows();
                }}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Validate Again
              </Button>
              <Button 
                variant="outline" 
                onClick={handleProceedAnyway}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload Valid Only
              </Button>
            </>
          )}
          
          <Button 
            onClick={handleUploadEditedRows}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload All Fixed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeValidationDialog;