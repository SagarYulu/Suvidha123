
// Removed Supabase import - using direct types

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  employee_id?: string | null;
  user_id?: string | null; // User ID for internal reference
  phone?: string | null;
  city?: string | null;
  cluster?: string | null;
  manager?: string | null;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardUserAuditLog {
  id: string;
  entity_type: 'dashboard_user' | 'permission';
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'grant_permission' | 'revoke_permission';
  changes: any;
  performed_by?: string | null;
  performed_at?: string;
}

// Type for CSV dashboard user data from bulk upload
export interface CSVDashboardUserData {
  id?: string;
  userId?: string; // For frontend usage
  user_id?: string; // For database column
  name: string;
  email: string;
  employee_id?: string | null;
  phone?: string | null;
  city?: string | null;
  cluster?: string | null;
  manager?: string | null;
  role: string;
  password: string;
}

// Row data for displaying in validation dialog
export interface DashboardUserRowData {
  id: string;
  userId: string;
  name: string;
  email: string;
  employee_id?: string;
  phone?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  role: string;
  password: string;
}

// Validation result for CSV upload
export interface DashboardUserValidationResult {
  validUsers: CSVDashboardUserData[];
  invalidRows: {
    row: CSVDashboardUserData;
    errors: string[];
    rowData: DashboardUserRowData;
  }[];
}
