
import React from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardUserBulkUpload from '@/components/DashboardUserBulkUpload';

interface BulkUploadCardProps {
  onUploadSuccess: () => void;
}

const BulkUploadCard: React.FC<BulkUploadCardProps> = ({ onUploadSuccess }) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Bulk Upload Dashboard Users</CardTitle>
        <CardDescription>
          Upload multiple dashboard users at once using a CSV file with the same fields as the single user form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DashboardUserBulkUpload onUploadSuccess={onUploadSuccess} />
      </CardContent>
    </>
  );
};

export default BulkUploadCard;
