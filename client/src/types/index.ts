
export interface User {
  id: number; // Integer ID from PostgreSQL serial
  userId: number; // Manual numeric ID for internal use
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  city: string;
  cluster: string;
  manager: string;
  role: string; // Changed from "employee" | "admin" to string to accommodate more roles
  password: string;
  dateOfJoining?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface Issue {
  id: number;
  employeeId: number; // Updated to use integer employee ID
  typeId: string;
  subTypeId: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  assignedTo?: number; // Updated to use integer ID
  comments: IssueComment[];
  lastStatusChangeAt?: string;
  reopenableUntil?: string;
  previouslyClosedAt?: string[];
  attachmentUrl?: string | null;
  attachments?: string[] | null;
  // Add mapped fields
  mappedTypeId?: string;
  mappedSubTypeId?: string;
  mappedAt?: string;
  mappedBy?: number; // Updated to use integer ID
  // Add escalation fields
  escalation_level?: number;
  escalated_at?: string;
}

export interface IssueComment {
  id: number;
  issueId: number;
  employeeId: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  commenterName?: string;
  commenterEmail?: string;
  commenterRole?: string;
  isEmployee?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null; // Changed from specific type to string
}

// Add a new interface for CSV employee data
export interface CSVEmployeeData {
  id?: number;   // Optional - Integer ID from PostgreSQL serial
  userId: number; // Manual numeric ID for internal use
  emp_id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  cluster?: string | null;
  role: string;
  manager?: string | null;
  date_of_joining?: string | null;
  date_of_birth?: string | null;
  blood_group?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  password?: string;
}

// Row data interface - explicitly defined with all fields as strings except IDs
export interface RowData {
  id: number;    // Integer ID from PostgreSQL serial
  userId: number; // Manual numeric ID
  emp_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  cluster: string;
  role: string;
  manager: string;
  date_of_joining: string;
  date_of_birth: string;
  blood_group: string;
  account_number: string;
  ifsc_code: string;
  password: string;  // Added password field
}

// Define a string-indexed interface for edited rows
export interface EditedRowsRecord {
  [key: string]: RowData;
}

export interface ValidationError {
  row: CSVEmployeeData;
  errors: string[];
  rowData: RowData;
}

export interface ValidationResult {
  validEmployees: CSVEmployeeData[];
  invalidRows: ValidationError[];
}

export interface DashboardUser {
  id: number;
  name: string;
  email: string;
  employee_id: number | null;
  user_id: number | null;
  phone: string | null;
  city: string | null;
  cluster: string | null;
  manager: string | null;
  role: string;
  created_at: string | null;
  updated_at: string | null;
}
