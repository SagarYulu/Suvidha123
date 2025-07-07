import { logAuditTrail } from "@/services/issues/issueAuditService";
import authenticatedAxios from '@/services/authenticatedAxios';

export interface InternalComment {
  id: number;
  issueId: number;
  employeeId: number;
  content: string;
  createdAt: string;
}

// Fetch internal comments for a ticket
export const getInternalComments = async (issueId: string | number): Promise<InternalComment[]> => {
  try {
    const response = await authenticatedAxios.get(`/issues/${issueId}/internal-comments`);
    
    const data = response.data;
    
    // Map the database response to our InternalComment interface
    return data.map((comment: any) => ({
      id: comment.id,
      issueId: Number(comment.issueId || comment.issue_id),
      employeeId: Number(comment.employeeId || comment.employee_id),
      content: comment.content,
      createdAt: comment.createdAt || comment.created_at
    }));
  } catch (error) {
    console.error('Error in getInternalComments:', error);
    return [];
  }
};

// Get user info for audit logs
async function getUserInfo(employeeId: number) {
  try {
    // Check dashboard users first
    try {
      const dashboardResponse = await authenticatedAxios.get(`/dashboard-users/${employeeId}`);
      const dashboardUser = dashboardResponse.data;
      if (dashboardUser && dashboardUser.name) {
        return {
          name: dashboardUser.name,
          role: dashboardUser.role,
          id: employeeId,
          email: dashboardUser.email
        };
      }
    } catch (error) {
      // Continue to check employees
    }

    // Then check employees
    try {
      const employeeResponse = await authenticatedAxios.get(`/employees/${employeeId}`);
      const employee = employeeResponse.data;
      if (employee && employee.name) {
        return {
          name: employee.name,
          role: employee.role,
          id: employeeId,
          email: employee.email
        };
      }
    } catch (error) {
      console.error('Error fetching employee info:', error);
    }

    console.log(`Could not find user info for ID: ${employeeId}`);
    return { name: "Suvidha", id: employeeId };
  } catch (error) {
    console.error('Error getting user info:', error);
    return { name: "Suvidha", id: employeeId };
  }
}

// Add a new internal comment to a ticket
export const addInternalComment = async (
  issueId: string | number, 
  employeeId: number, 
  content: string
): Promise<InternalComment | null> => {
  try {
    // Ensure we have valid user information
    const userInfo = await getUserInfo(employeeId);
    
    const response = await authenticatedAxios.post(`/issues/${issueId}/internal-comments`, {
      employeeId,
      content
    });
    
    const data = response.data;
    
    console.log(`Added internal comment by ${userInfo.name} (${employeeId})`);
    
    // Create audit log entry with detailed performer info
    await logAuditTrail(
      issueId,
      employeeId,
      'internal_comment_added',
      undefined,
      undefined,
      { 
        commentId: data.id,
        performer: userInfo
      }
    );
    
    // Map the database response to our InternalComment interface
    return {
      id: data.id,
      issueId: data.issueId || data.issue_id,
      employeeId: data.employeeId || data.employee_id,
      content: data.content,
      createdAt: data.createdAt || data.created_at
    };
  } catch (error) {
    console.error('Error in addInternalComment:', error);
    return null;
  }
};

// Create notification for assignee when a comment is added
async function createNotificationForAssignee(issueId: string, commenterId: string, commenterName: string) {
  try {
    // First, get the issue to find the assignee
    const issueResponse = await fetch(`/api/issues/${issueId}`);
    if (!issueResponse.ok) {
      console.log('No issue found for notification');
      return;
    }
    
    const issue = await issueResponse.json();
    if (!issue || !issue.assignedTo) {
      console.log('No assignee found for notification');
      return;
    }
    
    // Don't notify if the commenter is the same as the assignee
    if (issue.assignedTo === commenterId) {
      console.log('Commenter is the assignee, no notification needed');
      return;
    }
    
    // Create notification for the assignee
    const notificationResponse = await fetch('/api/issue-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: issue.assignedTo,
        issueId,
        content: `${commenterName} added an internal comment to a ticket assigned to you.`,
        isRead: false
      }),
    });
    
    if (!notificationResponse.ok) {
      console.error('Error creating notification:', notificationResponse.statusText);
    } else {
      console.log(`Notification created for assignee ${issue.assignedTo}`);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}