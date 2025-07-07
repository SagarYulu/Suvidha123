
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CSVEmployeeData } from "@/types";
import { ROLE_OPTIONS } from "@/data/formOptions";

interface ValidEmployeesListProps {
  validEmployees: CSVEmployeeData[];
}

const ValidEmployeesList = ({ validEmployees }: ValidEmployeesListProps) => {
  if (validEmployees.length === 0) return null;

  // Function to get exact case-matching role from ROLE_OPTIONS
  const getExactRoleMatch = (role: string): string => {
    return ROLE_OPTIONS.find(r => r.toLowerCase() === role.toLowerCase()) || role;
  };

  return (
    <div>
      <h3 className="text-lg font-medium">Valid Employees ({validEmployees.length})</h3>
      <p className="text-sm text-muted-foreground mb-2">
        These employees will be added if you proceed. System will generate unique IDs for each employee.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Cluster</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Password</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validEmployees.map((emp, idx) => (
            <TableRow key={`valid-employee-${idx}`}>
              <TableCell>{emp.id || 'Auto-generated'}</TableCell>
              <TableCell>{emp.userId}</TableCell>
              <TableCell>{emp.emp_id}</TableCell>
              <TableCell>{emp.name}</TableCell>
              <TableCell>{emp.email}</TableCell>
              <TableCell>{emp.phone || '-'}</TableCell>
              <TableCell>{emp.city || '-'}</TableCell>
              <TableCell>{emp.cluster || '-'}</TableCell>
              <TableCell>{emp.manager || '-'}</TableCell>
              <TableCell>{getExactRoleMatch(emp.role)}</TableCell>
              <TableCell>{emp.password || 'changeme123'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ValidEmployeesList;
