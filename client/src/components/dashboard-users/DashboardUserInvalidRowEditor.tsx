
import { DashboardUserRowData } from '@/types/dashboardUsers';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ROLE_OPTIONS, CITY_OPTIONS, CLUSTER_OPTIONS } from '@/data/formOptions';
import { useState } from 'react';
import { useMasterData } from '@/hooks/useMasterData';

interface DashboardUserInvalidRowEditorProps {
  invalidRows: {
    row: any;
    errors: string[];
    rowData: DashboardUserRowData;
  }[];
  editedRows: Record<string, DashboardUserRowData>;
  onFieldEdit: (rowIndex: string, field: keyof DashboardUserRowData, value: string) => void;
}

const DashboardUserInvalidRowEditor: React.FC<DashboardUserInvalidRowEditorProps> = ({
  invalidRows,
  editedRows,
  onFieldEdit
}) => {
  const [cityClusters, setCityClusters] = useState<Record<string, string[]>>({});
  const { roles, cities, clustersGroupedByCity } = useMasterData();

  const handleCityChange = (rowIndex: string, city: string) => {
    onFieldEdit(rowIndex, 'city', city);
    onFieldEdit(rowIndex, 'cluster', '');
    
    if (city && clustersGroupedByCity[city]) {
      setCityClusters(prev => ({
        ...prev,
        [rowIndex]: clustersGroupedByCity[city].map(cluster => cluster.name)
      }));
    } else {
      setCityClusters(prev => {
        const updated = { ...prev };
        delete updated[rowIndex];
        return updated;
      });
    }
  };

  return (
    <div className="space-y-6">
      {invalidRows.map((item, index) => {
        const rowIndex = index.toString();
        const rowData = editedRows[rowIndex] || item.rowData;
        
        return (
          <div key={index} className="border rounded-md p-4 bg-red-50">
            <div className="mb-3 text-red-600 text-sm font-medium">
              <div className="mb-1">Errors:</div>
              <ul className="list-disc pl-5">
                {item.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>
                    <Input 
                      value={rowData.userId}
                      onChange={e => onFieldEdit(rowIndex, 'userId', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>
                    <Input 
                      value={rowData.name}
                      onChange={e => onFieldEdit(rowIndex, 'name', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>
                    <Input 
                      value={rowData.email}
                      onChange={e => onFieldEdit(rowIndex, 'email', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>
                    <Input 
                      value={rowData.employee_id}
                      onChange={e => onFieldEdit(rowIndex, 'employee_id', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Phone</TableCell>
                  <TableCell>
                    <Input 
                      value={rowData.phone}
                      onChange={e => onFieldEdit(rowIndex, 'phone', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>City</TableCell>
                  <TableCell>
                    <Select 
                      value={rowData.city}
                      onValueChange={value => handleCityChange(rowIndex, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cluster</TableCell>
                  <TableCell>
                    <Select 
                      value={rowData.cluster}
                      onValueChange={value => onFieldEdit(rowIndex, 'cluster', value)}
                      disabled={!rowData.city}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select cluster" />
                      </SelectTrigger>
                      <SelectContent>
                        {(cityClusters[rowIndex] || (rowData.city && clustersGroupedByCity[rowData.city]?.map(c => c.name)) || []).map(cluster => (
                          <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Manager</TableCell>
                  <TableCell>
                    <Input 
                      value={rowData.manager}
                      onChange={e => onFieldEdit(rowIndex, 'manager', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>
                    <Select 
                      value={rowData.role}
                      onValueChange={value => onFieldEdit(rowIndex, 'role', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Password</TableCell>
                  <TableCell>
                    <Input 
                      type="password"
                      value={rowData.password}
                      onChange={e => onFieldEdit(rowIndex, 'password', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardUserInvalidRowEditor;
