import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';

export interface DashboardUserRowData {
  userId: string;
  name: string;
  email: string;
  employee_id: string;
  phone: string;
  city: string;
  cluster: string;
  manager: string;
  role: string;
  password: string;
}

export interface DashboardUserValidationResult {
  validUsers: DashboardUserRowData[];
  invalidRows: {
    row: DashboardUserRowData;
    errors: string[];
    rowData: DashboardUserRowData;
  }[];
}

export interface EditedDashboardUserRowsRecord {
  [key: string]: DashboardUserRowData;
}

const useDashboardUserBulkUpload = (onUploadSuccess?: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationResults, setValidationResults] = useState<DashboardUserValidationResult>({ 
    validUsers: [], 
    invalidRows: [] 
  });
  const [editedRows, setEditedRows] = useState<EditedDashboardUserRowsRecord>({});
  const { toast } = useToast();

  console.log("useDashboardUserBulkUpload hook initialized with onUploadSuccess callback:", !!onUploadSuccess);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await parseDashboardUserCSV(file);
      
      setValidationResults(result);
      // Initialize edited rows with original data
      const initialEditedRows: EditedDashboardUserRowsRecord = {};
      result.invalidRows.forEach((item, index) => {
        initialEditedRows[`row-${index}`] = { ...item.rowData };
      });
      setEditedRows(initialEditedRows);
      
      setShowValidationDialog(true);
      
      if (result.validUsers.length === 0 && result.invalidRows.length === 0) {
        toast({
          variant: "destructive",
          title: "Empty File",
          description: "The CSV file doesn't contain any valid data rows.",
        });
      }
      
      setIsUploading(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error processing the CSV file. Please check the format.",
      });
      setIsUploading(false);
    }
  };

  const handleFieldEdit = (rowKey: string, field: keyof DashboardUserRowData, value: string) => {
    setEditedRows(prev => ({
      ...prev,
      [rowKey]: {
        ...prev[rowKey],
        [field]: value
      }
    }));
  };

  // Validate dashboard user data
  const validateDashboardUserData = (user: any) => {
    const errors: string[] = [];
    
    // Required fields validation
    if (!user.userId || user.userId.toString().trim() === '') {
      errors.push('User ID is required');
    } else if (isNaN(Number(user.userId))) {
      errors.push('User ID must be numeric');
    }
    
    if (!user.name || user.name.toString().trim() === '') {
      errors.push('Name is required');
    }
    
    if (!user.email || user.email.toString().trim() === '') {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.push('Invalid email format');
    }
    
    if (!user.employee_id || user.employee_id.toString().trim() === '') {
      errors.push('Employee ID is required');
    }
    
    if (!user.phone || user.phone.toString().trim() === '') {
      errors.push('Phone is required');
    }
    
    if (!user.city || user.city.toString().trim() === '') {
      errors.push('City is required');
    }
    
    if (!user.cluster || user.cluster.toString().trim() === '') {
      errors.push('Cluster is required');
    }
    
    if (!user.role || user.role.toString().trim() === '') {
      errors.push('Role is required');
    } else {
      const validRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin'];
      if (!validRoles.includes(user.role)) {
        errors.push('Role must be one of: ' + validRoles.join(', '));
      }
    }
    
    if (!user.password || user.password.toString().trim() === '') {
      errors.push('Password is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Parse CSV content
  const parseDashboardUserCSV = async (file: File): Promise<DashboardUserValidationResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvContent = e.target?.result as string;
          const lines = csvContent.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error('CSV file must contain header row and at least one data row');
          }
          
          const headers = lines[0].split(',').map(h => h.trim());
          const validUsers: DashboardUserRowData[] = [];
          const invalidRows: { row: DashboardUserRowData; errors: string[]; rowData: DashboardUserRowData; }[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            
            if (values.length !== headers.length) {
              continue; // Skip malformed rows
            }
            
            const userRow: DashboardUserRowData = {
              userId: values[0] || '',
              name: values[1] || '',
              email: values[2] || '',
              employee_id: values[3] || '',
              phone: values[4] || '',
              city: values[5] || '',
              cluster: values[6] || '',
              manager: values[7] || '',
              role: values[8] || '',
              password: values[9] || 'changeme123',
            };
            
            const validation = validateDashboardUserData(userRow);
            
            if (validation.isValid) {
              validUsers.push(userRow);
            } else {
              invalidRows.push({
                row: userRow,
                errors: validation.errors,
                rowData: userRow
              });
            }
          }
          
          resolve({ validUsers, invalidRows });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Check if all edited rows are now valid
  const validateEditedRows = () => {
    const correctedUsers: DashboardUserRowData[] = [];
    const stillInvalid: {row: DashboardUserRowData, errors: string[], rowData: DashboardUserRowData}[] = [];
    
    // Process each invalid row with its edits
    validationResults.invalidRows.forEach((item, index) => {
      const rowKey = `row-${index}`;
      const editedRow = editedRows[rowKey] || item.rowData;
      
      // Validate the edited data
      const validation = validateDashboardUserData(editedRow);
      
      if (validation.isValid) {
        correctedUsers.push(editedRow);
      } else {
        stillInvalid.push({
          row: editedRow,
          errors: validation.errors,
          rowData: editedRow
        });
      }
    });
    
    return { correctedUsers, stillInvalid };
  };

  const handleUploadEditedRows = () => {
    // First validate all edited rows
    const { correctedUsers, stillInvalid } = validateEditedRows();
    
    if (stillInvalid.length > 0) {
      // Some rows are still invalid
      toast({
        variant: "destructive",
        title: "Validation Errors",
        description: `${stillInvalid.length} row(s) still have validation errors. Please correct them before uploading.`,
      });
      
      // Update validation results with the still invalid rows
      setValidationResults(prev => ({
        ...prev,
        invalidRows: stillInvalid
      }));
      
      return;
    }
    
    // Combine the original valid users with the corrected ones
    const allUsers = [...validationResults.validUsers, ...correctedUsers];
    uploadValidUsers(allUsers);
  };

  const uploadValidUsers = async (users: DashboardUserRowData[]) => {
    try {
      setIsUploading(true);
      console.log("Attempting to upload dashboard users:", users);
      
      // Check for existing email addresses to avoid constraint violations
      let existingEmails: string[] = [];
      try {
        const response = await apiClient.getDashboardUsers();
        existingEmails = response
          .filter((user: any) => users.some(u => u.email === user.email))
          .map((user: any) => user.email);
      } catch (checkError) {
        console.error('Error checking existing dashboard users:', checkError);
        throw new Error('Failed to check for existing users');
      }
      console.log("Found existing emails:", existingEmails);
      
      // Filter out users with duplicate emails
      const newUsers = users.filter(user => !existingEmails.includes(user.email));
      const duplicateUsers = users.filter(user => existingEmails.includes(user.email));
      
      if (duplicateUsers.length > 0) {
        console.log(`Found ${duplicateUsers.length} duplicate emails, they will be skipped:`, 
          duplicateUsers.map(u => u.email));
      }
      
      if (newUsers.length === 0) {
        toast({
          variant: "destructive",
          title: "No New Users",
          description: `All ${users.length} users already exist in the database with the same email addresses.`,
        });
        setIsUploading(false);
        setShowValidationDialog(false);
        return;
      }
      
      // Convert to the format expected by the API
      const usersData = newUsers.map(user => ({
        userId: parseInt(user.userId),
        name: user.name,
        email: user.email,
        employeeId: user.employee_id,
        phone: user.phone,
        city: user.city,
        cluster: user.cluster,
        manager: user.manager,
        role: user.role,
        password: user.password,
      }));
      
      console.log("Uploading dashboard users with data:", usersData);
      
      // Use the bulk insert API endpoint
      const result = await apiClient.bulkCreateDashboardUsers(usersData);
      
      console.log('Upload successful. Result:', result);
      
      const duplicateMessage = duplicateUsers.length > 0 
        ? ` (${duplicateUsers.length} duplicate emails were skipped)`
        : '';
      
      toast({
        title: "Upload Successful",
        description: `Successfully added ${newUsers.length} dashboard users.${duplicateMessage}`,
      });
      
      // Call the onUploadSuccess callback if provided
      if (onUploadSuccess) {
        console.log("Calling onUploadSuccess callback to refresh user list");
        onUploadSuccess();
      } else {
        console.warn("No onUploadSuccess callback provided, user list won't refresh automatically");
      }
      
      setShowValidationDialog(false);
    } catch (error: any) {
      console.error('Upload to database error:', error);
      toast({
        variant: "destructive",
        title: "Database Upload Failed",
        description: error.message || "There was an error uploading to the database.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProceedAnyway = () => {
    if (validationResults.validUsers.length > 0) {
      uploadValidUsers(validationResults.validUsers);
    } else {
      toast({
        variant: "destructive",
        title: "No Valid Users",
        description: "Cannot proceed as there are no valid dashboard users to upload.",
      });
      setShowValidationDialog(false);
    }
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
    handleProceedAnyway
  };
};

export default useDashboardUserBulkUpload;