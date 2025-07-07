
import { ROLE_OPTIONS, CITY_OPTIONS, CLUSTER_OPTIONS } from '@/data/formOptions';
import { isValidDate } from './dateUtils';
import { apiClient } from '@/services/apiClient';

// Update EmployeeData type for validation
type EmployeeData = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  emp_id?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  role?: string;
  date_of_joining?: string;
  date_of_birth?: string;
  blood_group?: string;
  account_number?: string;
  ifsc_code?: string;
  password?: string;
  user_id?: string; // Add user_id field to match the database column
  userId?: string;  // Add userId field for frontend usage
};

/**
 * Validates if a string is a valid user ID (numeric value)
 */
export const isValidUserID = (userId: string): boolean => {
  // User ID should be a numeric string
  return /^\d+$/.test(userId);
};

/**
 * Validates employee data fields using master data from the database
 */
export const validateEmployeeDataWithMasterData = async (
  data: Partial<EmployeeData>, 
  masterData: { roles: any[], cities: any[], clusters: any[] }
): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = [];
  
  // Required fields - check for userId or user_id
  const userId = data.userId || data.user_id || '';
  
  // Check required fields
  const requiredFields = ['emp_id', 'name', 'email', 'role'];
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
  
  // Role validation using master data
  if (data.role) {
    const validRoles = masterData.roles.map(r => r.name.toLowerCase());
    if (!validRoles.includes(data.role.toLowerCase())) {
      errors.push(`Invalid role: ${data.role}. Valid options are: ${masterData.roles.map(r => r.name).join(', ')}`);
    }
  }

  // City validation using master data
  if (data.city) {
    const validCities = masterData.cities.map(c => c.name.toLowerCase());
    if (!validCities.includes(data.city.toLowerCase())) {
      errors.push(`Invalid city: ${data.city}. Valid options are: ${masterData.cities.map(c => c.name).join(', ')}`);
    }
  }

  // Cluster validation using master data
  if (data.city && data.cluster) {
    const cityObj = masterData.cities.find(c => c.name.toLowerCase() === data.city?.toLowerCase());
    if (cityObj) {
      const validClusters = masterData.clusters
        .filter(cluster => cluster.cityId === cityObj.id)
        .map(cluster => cluster.name.toLowerCase());
      if (!validClusters.includes(data.cluster.toLowerCase())) {
        const availableClusters = masterData.clusters
          .filter(cluster => cluster.cityId === cityObj.id)
          .map(cluster => cluster.name);
        errors.push(`Invalid cluster: ${data.cluster} for city: ${data.city}. Valid options are: ${availableClusters.join(', ')}`);
      }
    }
  }

  // Email format validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push(`Invalid email format: ${data.email}`);
  }

  // Date format validation for optional date fields
  if (data.date_of_joining && !isValidDate(data.date_of_joining)) {
    errors.push(`Invalid date of joining: ${data.date_of_joining}. Use format DD-MM-YYYY or DD/MM/YYYY.`);
  }

  if (data.date_of_birth && !isValidDate(data.date_of_birth)) {
    errors.push(`Invalid date of birth: ${data.date_of_birth}. Use format DD-MM-YYYY or DD/MM/YYYY.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates employee data fields and returns validation results (legacy function for backward compatibility)
 */
export const validateEmployeeData = (data: Partial<EmployeeData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields - check for userId or user_id
  const userId = data.userId || data.user_id || '';
  
  // Check required fields
  const requiredFields = ['emp_id', 'name', 'email', 'role'];
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
  
  // Role validation - Make sure to lowercase the comparison for case-insensitive matching
  if (data.role) {
    const validRoles = ROLE_OPTIONS.map(r => r.toLowerCase());
    if (!validRoles.includes(data.role.toLowerCase())) {
      errors.push(`Invalid role: ${data.role}. Valid options are: ${ROLE_OPTIONS.join(', ')}`);
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

  // Date format validation for optional date fields
  if (data.date_of_joining && !isValidDate(data.date_of_joining)) {
    errors.push(`Invalid date of joining: ${data.date_of_joining}. Use format DD-MM-YYYY or DD/MM/YYYY.`);
  }

  if (data.date_of_birth && !isValidDate(data.date_of_birth)) {
    errors.push(`Invalid date of birth: ${data.date_of_birth}. Use format DD-MM-YYYY or DD/MM/YYYY.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
