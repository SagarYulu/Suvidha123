import { Issue } from "@/types";

/**
 * Issue utility functions - helpers for processing issue data
 */

// Function to generate a unique ID (using timestamp + random)
export const generateUniqueId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Function to map database issue to app Issue type
export const mapDbIssueToAppIssue = (dbIssue: any, comments: any[]): Issue => {
  return {
    id: Number(dbIssue.id),
    employeeId: Number(dbIssue.employeeId || dbIssue.employee_id),
    typeId: dbIssue.typeId || dbIssue.type_id,
    subTypeId: dbIssue.subTypeId || dbIssue.sub_type_id,
    description: dbIssue.description,
    status: dbIssue.status as Issue["status"],
    priority: dbIssue.priority as Issue["priority"],
    createdAt: dbIssue.createdAt || dbIssue.created_at,
    updatedAt: dbIssue.updatedAt || dbIssue.updated_at,
    closedAt: dbIssue.closedAt || dbIssue.closed_at,
    assignedTo: dbIssue.assignedTo ? Number(dbIssue.assignedTo) : undefined,
    comments: comments,
    lastStatusChangeAt: dbIssue.lastStatusChangeAt || dbIssue.last_status_change_at,
    reopenableUntil: dbIssue.reopenableUntil || dbIssue.reopenable_until,
    previouslyClosedAt: dbIssue.previouslyClosedAt || dbIssue.previously_closed_at
  };
};

/**
 * Maps employee integer IDs to names in a batch for better performance
 * This works with the PostgreSQL integer ID schema - using simple fetch
 */
export const mapEmployeeIdsToNames = async (employeeIds: number[]): Promise<Record<number, string>> => {
  const uniqueIds = Array.from(new Set(employeeIds));
  const result: Record<number, string> = {};
  
  try {
    // Simple fetch call instead of complex authenticated axios
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/employees', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const employees = await response.json();
    
    // Create mapping from employee ID to name
    const employeeMap = employees.reduce((acc: Record<number, string>, emp: any) => {
      acc[emp.id] = emp.name;
      return acc;
    }, {});
    
    // Map requested IDs to names
    uniqueIds.forEach(id => {
      result[id] = employeeMap[id] || "Suvidha";
    });
    
  } catch (error) {
    console.error('Error fetching employee names:', error);
    // Fallback: mark all as unknown
    uniqueIds.forEach(id => {
      result[id] = "Suvidha";
    });
  }
  
  return result;
};

// Cache for employee names to avoid repeated API calls
let employeeNameCache: Record<number, string> = {};
let cacheLastUpdated = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Gets the employee name from their integer ID
 * Uses caching to avoid individual API calls - PERFORMANCE OPTIMIZED
 */
export const getEmployeeNameById = async (employeeId: number): Promise<string> => {
  try {
    const now = Date.now();
    
    // Check if cache is fresh and contains the employee
    if (now - cacheLastUpdated < CACHE_DURATION && employeeNameCache[employeeId]) {
      return employeeNameCache[employeeId];
    }
    
    // Refresh cache by fetching all employees in one batch call
    const employeeMap = await mapEmployeeIdsToNames([employeeId]);
    
    // Update cache with all fetched employees
    employeeNameCache = { ...employeeNameCache, ...employeeMap };
    cacheLastUpdated = now;
    
    return employeeMap[employeeId] || "Suvidha";
  } catch (error) {
    console.error(`Error fetching employee name for ID ${employeeId}:`, error);
    return "Suvidha";
  }
};

/**
 * Legacy function for compatibility - converts string ID to number and calls getEmployeeNameById
 */
export const getEmployeeNameByUuid = async (employeeId: string | number): Promise<string> => {
  const id = typeof employeeId === 'string' ? parseInt(employeeId, 10) : employeeId;
  if (isNaN(id)) {
    return "Suvidha";
  }
  return getEmployeeNameById(id);
};

/**
 * Get available assignees for ticket assignment
 * Returns a formatted list for dropdown selection
 */
export const getAvailableAssignees = async (): Promise<{ value: string; label: string }[]> => {
  try {
    // Import authenticatedAxios for JWT authenticated requests
    const { default: authenticatedAxios } = await import('@/services/authenticatedAxios');
    
    // Get users with admin or support roles from the database
    const response = await authenticatedAxios.get('/dashboard-users');
    const allUsers = response.data;
    
    // Show ALL dashboard users for assignment (as requested by user)
    // Map to the format needed for the dropdown
    return allUsers.map((user: any) => ({
      value: user.id.toString(),
      label: `${user.name} (${user.role})`
    }));
  } catch (error) {
    console.error('Error in getAvailableAssignees:', error);
    return [];
  }
};