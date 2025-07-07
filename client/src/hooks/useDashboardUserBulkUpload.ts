
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { parseCSVDashboardUsers } from '@/utils/csvDashboardUsersParser';
import { CSVDashboardUserData, DashboardUserRowData } from '@/types/dashboardUsers';
import authenticatedAxios from '@/services/authenticatedAxios';
import { getRoles, getCities, getClusters } from '@/services/masterDataService';
// Removed Supabase import - using PostgreSQL API

type ValidationResults = {
  validUsers: CSVDashboardUserData[];
  invalidRows: {
    row: CSVDashboardUserData;
    errors: string[];
    rowData: DashboardUserRowData;
  }[];
};

const useDashboardUserBulkUpload = (onUploadSuccess?: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResults>({
    validUsers: [],
    invalidRows: []
  });
  const [editedRows, setEditedRows] = useState<Record<string, DashboardUserRowData>>({});

  const handleFileUpload = async (file: File) => {
    try {
      const results = await parseCSVDashboardUsers(file);
      setValidationResults(results);

      // Initialize editedRows with the current invalid rows
      const initialEditedRows: Record<string, DashboardUserRowData> = {};
      results.invalidRows.forEach((row, index) => {
        initialEditedRows[index.toString()] = row.rowData;
      });
      setEditedRows(initialEditedRows);

      setShowValidationDialog(true);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast({
        title: "Error",
        description: "Failed to parse CSV file. Please check the file format.",
        variant: "destructive"
      });
    }
  };

  const handleFieldEdit = (rowIndex: string, field: keyof DashboardUserRowData, value: string) => {
    setEditedRows(prev => ({
      ...prev,
      [rowIndex]: {
        ...prev[rowIndex],
        [field]: value
      }
    }));
  };

  const insertDashboardUsers = async (users: any[]) => {
    // Use bulk insert API endpoint (no /api prefix since axios baseURL already includes it)
    const response = await authenticatedAxios.post('/dashboard-users/bulk', { users });
    return response.data;
  };

  const handleUploadEditedRows = async () => {
    if (validationResults.validUsers.length === 0 && Object.keys(editedRows).length === 0) {
      toast({
        title: "Warning",
        description: "No valid user data to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Prepare all valid users data
      const allValidUsers = [
        // Valid users from CSV
        ...validationResults.validUsers.map(user => ({
          name: user.name,
          email: user.email,
          employee_id: user.employee_id,
          user_id: user.userId || user.user_id,
          phone: user.phone,
          city: user.city,
          cluster: user.cluster,
          manager: user.manager,
          role: user.role,
          password: user.password
        })),
        // Previously invalid, now edited users
        ...Object.values(editedRows).map(row => ({
          name: row.name,
          email: row.email,
          employee_id: row.employee_id,
          user_id: row.userId,
          phone: row.phone,
          city: row.city,
          cluster: row.cluster,
          manager: row.manager,
          role: row.role,
          password: row.password
        }))
      ];

      if (allValidUsers.length > 0) {
        await insertDashboardUsers(allValidUsers);
        
        // Success - only show when users were actually uploaded
        toast({
          title: "Success",
          description: `Successfully uploaded ${allValidUsers.length} dashboard users.`
        });
      } else {
        toast({
          title: "No Users Uploaded",
          description: "No valid user data was available for upload.",
          variant: "destructive"
        });
      }
      
      setShowValidationDialog(false);
      setValidationResults({ validUsers: [], invalidRows: [] });
      setEditedRows({});
      
      // Only call success callback if users were actually uploaded
      if (onUploadSuccess && allValidUsers.length > 0) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Error uploading dashboard users:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProceedAnyway = async () => {
    // Only proceed with valid users, ignore invalid ones
    if (validationResults.validUsers.length === 0) {
      toast({
        title: "Warning",
        description: "No valid user data to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const validUsersData = validationResults.validUsers.map(user => ({
        name: user.name,
        email: user.email,
        employee_id: user.employee_id,
        user_id: user.userId || user.user_id,
        phone: user.phone,
        city: user.city,
        cluster: user.cluster,
        manager: user.manager,
        role: user.role,
        password: user.password
      }));

      if (validationResults.validUsers.length > 0) {
        await insertDashboardUsers(validUsersData);

        toast({
          title: "Success",
          description: `Successfully uploaded ${validationResults.validUsers.length} dashboard users. ${validationResults.invalidRows.length} invalid entries were skipped.`
        });
      } else {
        toast({
          title: "No Users Uploaded",
          description: "No valid users found to upload.",
          variant: "destructive"
        });
      }
      
      setShowValidationDialog(false);
      setValidationResults({ validUsers: [], invalidRows: [] });
      
      // Only call success callback if users were actually uploaded
      if (onUploadSuccess && validationResults.validUsers.length > 0) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Error uploading dashboard users:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const validateDashboardUserData = async (users: any[]) => {
    const [cities, roles, clusters] = await Promise.all([
      getCities(),
      getRoles(),
      getClusters()
    ]);

    const validUsers: any[] = [];
    const invalidRows: any[] = [];

    users.forEach((user, index) => {
      const errors: string[] = [];

      // Required field validation
      if (!user.name || typeof user.name !== 'string' || user.name.trim() === '') {
        errors.push('Name is required');
      }
      if (!user.email || typeof user.email !== 'string' || !user.email.includes('@')) {
        errors.push('Valid email is required');
      }
      if (!user.role || typeof user.role !== 'string' || user.role.trim() === '') {
        errors.push('Role is required');
      }

      // User ID validation
      if (user.user_id && user.user_id.toString().trim() !== '') {
        const userIdStr = user.user_id.toString().trim();
        if (!/^\d+$/.test(userIdStr)) {
          errors.push('Invalid User ID format. Must be numeric.');
        }
      }

      // Role validation
      if (user.role && user.role.trim() !== '') {
        const userRole = user.role.trim();
        const validRoles = roles.map(r => r.name);
        if (!validRoles.includes(userRole)) {
          errors.push(`Invalid role: ${userRole}. Valid options are: ${validRoles.join(', ')}`);
        }
      }

      // City validation
      if (user.city && user.city.trim() !== '') {
        const userCity = user.city.trim();
        const validCities = cities.map(c => c.name);
        if (!validCities.includes(userCity)) {
          errors.push(`Invalid city: ${userCity}. Valid options are: ${validCities.join(', ')}`);
        }
      }

      // Cluster validation
      if (user.cluster && user.cluster.trim() !== '') {
        const userCluster = user.cluster.trim();
        const validClusters = clusters.map(c => c.name);
        if (!validClusters.includes(userCluster)) {
          errors.push(`Invalid cluster: ${userCluster}. Valid options are: ${validClusters.join(', ')}`);
        }
      }

      if (errors.length > 0) {
        invalidRows.push({
          row: user,
          errors,
          rowData: {
            name: user.name || '',
            email: user.email || '',
            employeeId: user.employee_id || '',
            userId: user.user_id || '',
            phone: user.phone || '',
            city: user.city || '',
            cluster: user.cluster || '',
            manager: user.manager || '',
            role: user.role || '',
            password: user.password || 'changeme123'
          }
        });
      } else {
        validUsers.push({
          name: user.name,
          email: user.email,
          employee_id: user.employee_id,
          user_id: user.user_id,
          phone: user.phone,
          city: user.city,
          cluster: user.cluster,
          manager: user.manager,
          role: user.role,
          password: user.password || 'changeme123'
        });
      }
    });

    return { validUsers, invalidRows };
  };

  const handleValidateAgain = async () => {
    // Re-validate all data including edited rows
    const allData = [
      ...validationResults.validUsers,
      ...validationResults.invalidRows.map((row, index) => {
        // Use index as key since that's how we store edits
        const editedData = editedRows[index.toString()] || {};
        
        console.log(`Row ${index}: Original data:`, row.rowData);
        console.log(`Row ${index}: Edited data:`, editedData);
        
        return {
          ...row.rowData,
          // Apply edits if they exist
          ...editedData
        };
      })
    ];

    console.log("All data for validation:", allData);

    // Re-run validation on all data
    const newValidationResults = await validateDashboardUserData(allData);
    setValidationResults(newValidationResults);
    
    // Reset edited rows after successful validation
    setEditedRows({});
    
    toast({
      title: "Validation Complete",
      description: `${newValidationResults.validUsers.length} valid, ${newValidationResults.invalidRows.length} invalid entries found.`
    });
  };

  return {
    isUploading,
    showValidationDialog,
    setShowValidationDialog,
    validationResults,
    editedRows,
    handleFileUpload,
    handleFieldEdit,
    handleUploadEditedRows,
    handleProceedAnyway,
    handleValidateAgain
  };
};

export default useDashboardUserBulkUpload;
