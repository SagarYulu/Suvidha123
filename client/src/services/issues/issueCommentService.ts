import { IssueComment } from "@/types";
import { logAuditTrail } from "./issueAuditService";
import authenticatedAxios from '@/services/authenticatedAxios';

export const getCommentsForIssue = async (issueId: string | number): Promise<IssueComment[]> => {
  try {
    const numericIssueId = Number(issueId);
    const response = await authenticatedAxios.get(`/api/issues/${numericIssueId}/comments`);
    
    return response.data.map((dbComment: any) => ({
      id: dbComment.id,
      issueId: numericIssueId,
      employeeId: dbComment.employeeId,
      content: dbComment.content,
      createdAt: dbComment.createdAt
    }));
  } catch (error) {
    console.error('Error in getCommentsForIssue:', error);
    return [];
  }
};

// Get user info for audit logs
async function getUserInfoForComment(employeeId: number) {
  try {
    // First try dashboard users
    try {
      const response = await authenticatedAxios.get(`/api/dashboard-users/${employeeId}`);
      const dashboardUser = response.data;
      
      if (dashboardUser) {
        return {
          name: dashboardUser.name,
          role: dashboardUser.role || 'Dashboard User',
          id: employeeId
        };
      }
    } catch (error) {
      // Dashboard user not found, try employees
    }
    
    // Then try employees
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
    
    return {
      name: 'Suvidha',
      role: 'Unknown',
      id: employeeId
    };
  } catch (error) {
    console.error('Error getting user info for comment:', error);
    return {
      name: 'Suvidha',
      role: 'Unknown',
      id: employeeId
    };
  }
}

export const addNewComment = async (
  issueId: string | number, 
  employeeId: number, 
  content: string, 
  isInternal?: boolean
): Promise<IssueComment | null> => {
  try {
    const numericIssueId = Number(issueId);
    
    // Get user info for the commenter
    const userInfo = await getUserInfoForComment(employeeId);
    
    // Add the comment - authenticatedAxios already has /api base URL
    const response = await authenticatedAxios.post(`/api/issues/${numericIssueId}/comments`, {
      content: content,
      employeeId: employeeId
    });
    
    const newComment = response.data;
    
    // Log audit trail for comment addition
    await logAuditTrail(
      numericIssueId, 
      employeeId, 
      isInternal ? 'internal_comment_added' : 'comment_added',
      undefined,
      undefined,
      { 
        comment_content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        performer: userInfo
      }
    );
    
    return {
      id: newComment.id,
      issueId: numericIssueId,
      employeeId: employeeId,
      content: content,
      createdAt: newComment.createdAt
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

// Export as addComment for backwards compatibility
export const addComment = addNewComment;