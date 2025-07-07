
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_OPTIONS, CITY_OPTIONS, CLUSTER_OPTIONS } from "@/data/formOptions";
import { RowData, ValidationError } from "@/types";

interface InvalidRowEditorProps {
  item: ValidationError;
  idx: number;
  rowKey: string;
  editedRows: Record<string, RowData>;
  handleFieldEdit: (rowKey: string, field: keyof RowData, value: string) => void;
  getRowValue: (rowKey: string, field: keyof RowData, originalValue: string) => string;
}

const InvalidRowEditor = ({ 
  item, 
  idx, 
  rowKey, 
  handleFieldEdit, 
  getRowValue 
}: InvalidRowEditorProps) => {
  // Helper function to get clusters for a city
  const getClustersForCity = (city: string) => {
    const matchedCity = CITY_OPTIONS.find(c => c.toLowerCase() === city.toLowerCase());
    return matchedCity ? CLUSTER_OPTIONS[matchedCity] : [];
  };

  return (
    <Card key={`invalid-row-${idx}`} className="border-red-200">
      <CardHeader className="bg-red-50 p-4 border-b border-red-200">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-red-800">Row {idx + 1} - Validation Errors</h4>
          <Badge variant="destructive" className="text-xs">{item.errors.length} Errors</Badge>
        </div>
        <ul className="list-disc list-inside space-y-1 text-red-600 text-xs mt-2">
          {item.errors.map((error: string, errorIdx: number) => (
            <li key={`error-${idx}-${errorIdx}`}>{error}</li>
          ))}
        </ul>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">UUID</label>
            <Input 
              value={getRowValue(rowKey, 'id', item.rowData.id)}
              disabled={true}
              placeholder="Auto-generated"
              className="h-8 text-sm bg-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">User ID *</label>
            <Input 
              value={getRowValue(rowKey, 'userId', item.rowData.userId)}
              onChange={(e) => handleFieldEdit(rowKey, 'userId', e.target.value)}
              className="h-8 text-sm"
              placeholder="Numeric ID (required)"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Employee ID *</label>
            <Input 
              value={getRowValue(rowKey, 'emp_id', item.rowData.emp_id)}
              onChange={(e) => handleFieldEdit(rowKey, 'emp_id', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Name *</label>
            <Input 
              value={getRowValue(rowKey, 'name', item.rowData.name)}
              onChange={(e) => handleFieldEdit(rowKey, 'name', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Email *</label>
            <Input 
              value={getRowValue(rowKey, 'email', item.rowData.email)}
              onChange={(e) => handleFieldEdit(rowKey, 'email', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Phone</label>
            <Input 
              value={getRowValue(rowKey, 'phone', item.rowData.phone)}
              onChange={(e) => handleFieldEdit(rowKey, 'phone', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">City</label>
            <Select
              value={getRowValue(rowKey, 'city', item.rowData.city)}
              onValueChange={(value) => {
                handleFieldEdit(rowKey, 'city', value);
                // Reset cluster when city changes
                handleFieldEdit(rowKey, 'cluster', '');
              }}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {CITY_OPTIONS.map((city, cityIdx) => (
                  <SelectItem key={`city-${rowKey}-${cityIdx}`} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Cluster</label>
            <Select
              value={getRowValue(rowKey, 'cluster', item.rowData.cluster)}
              onValueChange={(value) => handleFieldEdit(rowKey, 'cluster', value)}
              disabled={!getRowValue(rowKey, 'city', item.rowData.city)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder={!getRowValue(rowKey, 'city', item.rowData.city) ? 
                  "Select city first" : "Select cluster"} />
              </SelectTrigger>
              <SelectContent>
                {getClustersForCity(getRowValue(rowKey, 'city', item.rowData.city)).map((cluster, clusterIdx) => (
                  <SelectItem key={`cluster-${rowKey}-${clusterIdx}`} value={cluster}>{cluster}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Manager</label>
            <Input 
              value={getRowValue(rowKey, 'manager', item.rowData.manager)}
              onChange={(e) => handleFieldEdit(rowKey, 'manager', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Role *</label>
            <Select
              value={getRowValue(rowKey, 'role', item.rowData.role)}
              onValueChange={(value) => handleFieldEdit(rowKey, 'role', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role, roleIdx) => (
                  <SelectItem key={`role-${rowKey}-${roleIdx}`} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Date of Joining (DD-MM-YYYY)</label>
            <Input 
              value={getRowValue(rowKey, 'date_of_joining', item.rowData.date_of_joining)}
              onChange={(e) => handleFieldEdit(rowKey, 'date_of_joining', e.target.value)}
              placeholder="DD-MM-YYYY"
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Date of Birth (DD-MM-YYYY)</label>
            <Input 
              value={getRowValue(rowKey, 'date_of_birth', item.rowData.date_of_birth)}
              onChange={(e) => handleFieldEdit(rowKey, 'date_of_birth', e.target.value)}
              placeholder="DD-MM-YYYY"
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Blood Group</label>
            <Input 
              value={getRowValue(rowKey, 'blood_group', item.rowData.blood_group)}
              onChange={(e) => handleFieldEdit(rowKey, 'blood_group', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Account Number</label>
            <Input 
              value={getRowValue(rowKey, 'account_number', item.rowData.account_number)}
              onChange={(e) => handleFieldEdit(rowKey, 'account_number', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">IFSC Code</label>
            <Input 
              value={getRowValue(rowKey, 'ifsc_code', item.rowData.ifsc_code)}
              onChange={(e) => handleFieldEdit(rowKey, 'ifsc_code', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Password</label>
            <Input 
              type="password"
              value={getRowValue(rowKey, 'password', 'changeme123')}
              onChange={(e) => handleFieldEdit(rowKey, 'password', e.target.value)}
              className="h-8 text-sm"
              placeholder="Default: changeme123"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvalidRowEditor;
