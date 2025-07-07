
import { CSVDashboardUserData } from '@/types/dashboardUsers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface DashboardUserValidListProps {
  users: CSVDashboardUserData[];
}

const DashboardUserValidList: React.FC<DashboardUserValidListProps> = ({ users }) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Cluster</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={index}>
              <TableCell>{user.userId || user.user_id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.employee_id || '-'}</TableCell>
              <TableCell>{user.phone || '-'}</TableCell>
              <TableCell>{user.city || '-'}</TableCell>
              <TableCell>{user.cluster || '-'}</TableCell>
              <TableCell>{user.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DashboardUserValidList;
