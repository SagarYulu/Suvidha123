
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/utils/formatUtils';

interface AuditLogsTableProps {
  auditLogs: any[];
  isLoading: boolean;
}

const AuditLogsTable: React.FC<AuditLogsTableProps> = ({
  auditLogs,
  isLoading,
}) => {
  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (auditLogs.length === 0) {
    return <div className="text-center py-10">No audit logs found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditLogs.map(log => (
            <TableRow key={log.id}>
              <TableCell>{formatDate(log.performed_at)}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    log.action === 'create' ? 'default' :
                    log.action === 'delete' ? 'destructive' :
                    'outline'
                  }
                >
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell>{log.entity_type}</TableCell>
              <TableCell>
                <pre className="text-xs whitespace-pre-wrap bg-muted p-2 rounded-md max-h-24 overflow-auto">
                  {JSON.stringify(log.changes, null, 2)}
                </pre>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AuditLogsTable;
