import authenticatedAxios from '@/services/authenticatedAxios';

// Helper function to log audit trail
export const logAuditTrail = async (
  issueId: string | number, 
  employeeId: string | number, 
  action: string, 
  previousStatus?: string, 
  newStatus?: string,
  details?: any
) => {
  try {
    // Make sure we have a valid issue ID
    if (!issueId || typeof issueId === 'object') {
      console.error('Error: Invalid issueId provided for audit trail:', issueId);
      return;
    }

    // Convert IDs to appropriate types with validation
    const numericIssueId = Number(issueId);
    const numericEmployeeId = Number(employeeId);
    
    // Check for NaN values
    if (isNaN(numericIssueId) || isNaN(numericEmployeeId)) {
      console.error('Error: Invalid ID values - issueId:', issueId, 'employeeId:', employeeId);
      return { id: null };
    }
    
    console.log(`Logging audit trail for issue ${numericIssueId} by employee ${numericEmployeeId}`);
    
    // Get user information for the performer
    const userInfo = await getUserInfoForAudit(numericEmployeeId);

    // Insert the audit trail entry
    const response = await authenticatedAxios.post('/api/issue-audit-trail', {
      issueId: numericIssueId,
      employeeId: numericEmployeeId,
      action,
      previousStatus: previousStatus,
      newStatus: newStatus,
      details: {
        ...details || {},
        performer: userInfo
      }
    });
    
    console.log(`Audit trail logged: ${action} for issue ${numericIssueId} by user ${numericEmployeeId}`, userInfo);
  } catch (error) {
    console.error('Error logging audit trail:', error);
  }
};

// Get detailed user information for the audit trail
async function getUserInfoForAudit(employeeId: number): Promise<{name: string, role?: string, id: number}> {
  try {
    // First check dashboard users
    try {
      const response = await authenticatedAxios.get(`/api/dashboard-users/${employeeId}`);
      const dashboardUser = response.data;
      
      if (dashboardUser) {
        return {
          name: dashboardUser.name,
          role: dashboardUser.role,
          id: employeeId
        };
      }
    } catch (error) {
      // Dashboard user not found, try employees
    }
    
    // Then check employees
    try {
      const response = await authenticatedAxios.get(`/api/employees/${employeeId}`);
      const employee = response.data;
      
      if (employee) {
        return {
          name: employee.name,
          role: employee.role || 'Employee',
          id: employeeId
        };
      }
    } catch (error) {
      // Employee not found
    }
    
    // Fallback for unknown users
    return {
      name: 'Unknown User',
      role: 'Unknown',
      id: employeeId
    };
  } catch (error) {
    console.error('Error getting user info for audit:', error);
    return {
      name: 'Unknown User',
      role: 'Unknown',
      id: employeeId
    };
  }
}

// Get audit trail for an issue
export const getAuditTrail = async (issueId: string | number) => {
  try {
    const numericIssueId = Number(issueId);
    const response = await authenticatedAxios.get(`/api/issues/${numericIssueId}/audit-trail`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    return [];
  }
};