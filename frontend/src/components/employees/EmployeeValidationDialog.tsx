import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Edit2, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { ValidationResult, EditedRowsRecord } from '@/types';

interface EmployeeValidationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  validationResults: ValidationResult;
  editedRows: EditedRowsRecord;
  isUploading: boolean;
  handleFieldEdit: (rowIndex: number, field: string, value: string) => void;
  handleUploadEditedRows: () => void;
  handleProceedAnyway: () => void;
}

const EmployeeValidationDialog: React.FC<EmployeeValidationDialogProps> = ({
  isOpen,
  onOpenChange,
  validationResults,
  editedRows,
  isUploading,
  handleFieldEdit,
  handleUploadEditedRows,
  handleProceedAnyway
}) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);

  const handleEdit = (rowIndex: number) => {
    setEditingRow(rowIndex);
  };

  const handleSave = () => {
    setEditingRow(null);
  };

  const handleValidateAgain = () => {
    handleUploadEditedRows();
  };

  const totalRows = validationResults.validEmployees.length + validationResults.invalidRows.length;
  const validCount = validationResults.validEmployees.length;
  const invalidCount = validationResults.invalidRows.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Validation Results</DialogTitle>
          <DialogDescription>
            Review the validation results and edit any invalid entries before uploading.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRows}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Valid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{validCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Invalid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{invalidCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Validation Results */}
        <div className="space-y-4">
          {validationResults.invalidRows.map((row, index) => (
            <Card key={index} className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Row {row.rowIndex + 1}: {row.data.name || 'Unnamed Employee'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {editingRow === row.rowIndex ? (
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
                        onClick={() => handleEdit(row.rowIndex)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <p className="text-sm text-red-600 font-medium">Errors:</p>
                  <ul className="text-sm text-red-600 list-disc list-inside">
                    {row.errors.map((error, errorIndex) => (
                      <li key={errorIndex}>{error}</li>
                    ))}
                  </ul>
                </div>
                
                {editingRow === row.rowIndex ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${row.rowIndex}`}>Name</Label>
                      <Input
                        id={`name-${row.rowIndex}`}
                        value={editedRows[row.rowIndex]?.name || row.data.name || ''}
                        onChange={(e) => handleFieldEdit(row.rowIndex, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`email-${row.rowIndex}`}>Email</Label>
                      <Input
                        id={`email-${row.rowIndex}`}
                        value={editedRows[row.rowIndex]?.email || row.data.email || ''}
                        onChange={(e) => handleFieldEdit(row.rowIndex, 'email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`phone-${row.rowIndex}`}>Phone</Label>
                      <Input
                        id={`phone-${row.rowIndex}`}
                        value={editedRows[row.rowIndex]?.phone || row.data.phone || ''}
                        onChange={(e) => handleFieldEdit(row.rowIndex, 'phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`empId-${row.rowIndex}`}>Employee ID</Label>
                      <Input
                        id={`empId-${row.rowIndex}`}
                        value={editedRows[row.rowIndex]?.empId || row.data.empId || ''}
                        onChange={(e) => handleFieldEdit(row.rowIndex, 'empId', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`city-${row.rowIndex}`}>City</Label>
                      <Input
                        id={`city-${row.rowIndex}`}
                        value={editedRows[row.rowIndex]?.city || row.data.city || ''}
                        onChange={(e) => handleFieldEdit(row.rowIndex, 'city', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`cluster-${row.rowIndex}`}>Cluster</Label>
                      <Input
                        id={`cluster-${row.rowIndex}`}
                        value={editedRows[row.rowIndex]?.cluster || row.data.cluster || ''}
                        onChange={(e) => handleFieldEdit(row.rowIndex, 'cluster', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`role-${row.rowIndex}`}>Role</Label>
                      <Input
                        id={`role-${row.rowIndex}`}
                        value={editedRows[row.rowIndex]?.role || row.data.role || ''}
                        onChange={(e) => handleFieldEdit(row.rowIndex, 'role', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`manager-${row.rowIndex}`}>Manager</Label>
                      <Input
                        id={`manager-${row.rowIndex}`}
                        value={editedRows[row.rowIndex]?.manager || row.data.manager || ''}
                        onChange={(e) => handleFieldEdit(row.rowIndex, 'manager', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Name:</strong> {row.data.name || 'N/A'}</div>
                    <div><strong>Email:</strong> {row.data.email || 'N/A'}</div>
                    <div><strong>Phone:</strong> {row.data.phone || 'N/A'}</div>
                    <div><strong>Employee ID:</strong> {row.data.empId || 'N/A'}</div>
                    <div><strong>City:</strong> {row.data.city || 'N/A'}</div>
                    <div><strong>Cluster:</strong> {row.data.cluster || 'N/A'}</div>
                    <div><strong>Role:</strong> {row.data.role || 'N/A'}</div>
                    <div><strong>Manager:</strong> {row.data.manager || 'N/A'}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Valid Employees Summary */}
        {validCount > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {validCount} Valid Employee{validCount === 1 ? '' : 's'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600">
                These employees will be uploaded to the system.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          
          <div className="flex items-center gap-2">
            {Object.keys(editedRows).length > 0 && (
              <Button
                variant="outline"
                onClick={handleValidateAgain}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Validate Again
              </Button>
            )}
            
            {validCount > 0 && (
              <Button
                onClick={handleProceedAnyway}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Upload {validCount} Valid Employee{validCount === 1 ? '' : 's'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeValidationDialog;