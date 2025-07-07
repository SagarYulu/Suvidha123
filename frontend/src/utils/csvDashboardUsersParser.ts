
import Papa from 'papaparse';
import { CSVDashboardUserData, DashboardUserRowData, DashboardUserValidationResult } from '@/types/dashboardUsers';
import { DASHBOARD_USER_ROLES, CITY_OPTIONS, CLUSTER_OPTIONS } from '@/data/formOptions';

/**
 * Validates if a string is a valid user ID (numeric value)
 */
export const isValidUserID = (userId: string): boolean => {
  // User ID should be a numeric string
  return /^\d+$/.test(userId);
};

/**
 * Validates dashboard user data fields
 */
export const validateDashboardUserData = (data: Partial<CSVDashboardUserData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required fields
  const userId = data.userId || data.user_id || '';
  
  const requiredFields = ['name', 'email', 'role', 'employee_id', 'phone', 'city', 'cluster', 'manager', 'password'];
  const missingFields = requiredFields.filter(field => 
    !data[field as keyof typeof data]
  );
  
  if (!userId) {
    missingFields.push('User ID');
  }
  
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // User ID validation (if provided)
  if (userId && !isValidUserID(userId)) {
    errors.push(`Invalid User ID format: ${userId}. Must be numeric.`);
  }
  
  // Role validation - check against allowed roles
  if (data.role) {
    if (!DASHBOARD_USER_ROLES.map(r => r.toLowerCase()).includes(data.role.toLowerCase())) {
      errors.push(`Invalid role: ${data.role}. Valid options are: ${DASHBOARD_USER_ROLES.join(', ')}`);
    }
  }

  // City validation (if provided)
  if (data.city) {
    const validCities = CITY_OPTIONS.map(c => c.toLowerCase());
    if (!validCities.includes(data.city.toLowerCase())) {
      errors.push(`Invalid city: ${data.city}. Valid options are: ${CITY_OPTIONS.join(', ')}`);
    }
  }

  // Cluster validation (if city and cluster are provided)
  if (data.city && data.cluster) {
    const cityKey = CITY_OPTIONS.find(c => c.toLowerCase() === data.city?.toLowerCase());
    if (cityKey && CLUSTER_OPTIONS[cityKey]) {
      const validClusters = CLUSTER_OPTIONS[cityKey].map(c => c.toLowerCase());
      if (!validClusters.includes(data.cluster.toLowerCase())) {
        errors.push(`Invalid cluster: ${data.cluster} for city: ${data.city}. Valid options are: ${CLUSTER_OPTIONS[cityKey].join(', ')}`);
      }
    }
  }

  // Email format validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push(`Invalid email format: ${data.email}`);
  }

  // Password validation
  if (data.password && data.password.length < 6) {
    errors.push(`Password must be at least 6 characters long`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Parses and validates a CSV file containing dashboard user data
 */
export const parseCSVDashboardUsers = (file: File): Promise<DashboardUserValidationResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validUsers: CSVDashboardUserData[] = [];
        const invalidRows: {row: CSVDashboardUserData, errors: string[], rowData: DashboardUserRowData}[] = [];
        
        console.log(`CSV parse complete. Found ${results.data.length} rows:`, results);
        
        // Process each row
        results.data.forEach((row, index) => {
          // Skip empty rows
          if (Object.values(row).every(val => val === null || val === '')) {
            return;
          }
          
          // Check multiple possible header names for user_id field
          const userId = 
            row.userId || 
            row.user_id || 
            row.userid || 
            row['User ID'] || 
            row['user id'] || 
            row['USER ID'] || 
            row['UserId'] || 
            '';

          // Convert CSV data to dashboard user format
          const dashboardUserData: Partial<CSVDashboardUserData> = {
            userId: userId,
            name: row.name || '',
            email: row.email || '',
            employee_id: row.employee_id || row['Employee ID'] || '',
            phone: row.phone || row.mobile || row['Mobile Number'] || '',
            city: row.city || row.City || '',
            cluster: row.cluster || row.Cluster || '',
            manager: row.manager || row.Manager || '',
            role: row.role || row.Role || '',
            password: row.password || '',
          };

          // Generate a structured data object for display
          const rowData: DashboardUserRowData = {
            id: 'Auto-generated',
            userId: userId || '',
            name: row.name || '',
            email: row.email || '',
            employee_id: row.employee_id || row['Employee ID'] || '',
            phone: row.phone || row.mobile || row['Mobile Number'] || '',
            city: row.city || row.City || '',
            cluster: row.cluster || row.Cluster || '',
            manager: row.manager || row.Manager || '',
            role: row.role || row.Role || '',
            password: row.password || ''
          };

          // Validate the data
          const validation = validateDashboardUserData(dashboardUserData);
          
          if (validation.isValid) {
            validUsers.push({
              ...dashboardUserData as CSVDashboardUserData,
              password: dashboardUserData.password || 'changeme123' // Ensure password is set
            });
          } else {
            invalidRows.push({ 
              row: {
                ...dashboardUserData as CSVDashboardUserData
              }, 
              errors: validation.errors,
              rowData
            });
          }
        });

        console.log('Validation complete:', {
          validUsers: validUsers.length,
          invalidRows: invalidRows.length
        });
        
        resolve({ validUsers, invalidRows });
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        reject(error);
      }
    });
  });
};

/**
 * Generates a CSV template for dashboard user data import
 * Updated to match the single user form fields and make all fields required
 */
export const getDashboardUserCSVTemplate = () => {
  // Headers match exactly with fields in the single user form
  const headers = [
    'User ID',
    'name',
    'email',
    'employee_id',
    'phone',
    'city',
    'cluster',
    'manager',
    'role',
    'password'
  ];

  const csvContent = [
    headers.join(','),
    '1234567,John Doe,john@example.com,EMP001,9876543210,Bangalore,Koramangala,Jane Smith,City Head,changeme123',
    '2345678,Jane Smith,jane@example.com,EMP002,9876543211,Delhi,GURGAON,Mark Johnson,HR Admin,changeme123'
  ].join('\n');

  return csvContent;
};
