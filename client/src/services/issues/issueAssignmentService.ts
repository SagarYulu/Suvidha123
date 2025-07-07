import { Issue } from "@/types";
import { getIssueById } from "./issueFetchService";
import { logAuditTrail } from "./issueAuditService";
import authenticatedAxios from '@/services/authenticatedAxios';

/**
 * Assign an issue to a user
 */
export const assignIssue = async (
  issueId: string,
  assigneeId: string,
  currentUserId: string
): Promise<Issue | null> => {
  try {
    // Get assignee info for better audit logs
    let assigneeName = "Suvidha";
    try {
      const assigneeResponse = await authenticatedAxios.get(`/dashboard-users/${assigneeId}`);
      assigneeName = assigneeResponse.data?.name || "Suvidha";
    } catch (error) {
      console.log('Assignee not found in dashboard users');
    }
    
    // Get performer info (the person doing the assignment)
    let performerInfo = { name: "Suvidha", role: "Unknown" };
    try {
      const performerResponse = await authenticatedAxios.get(`/dashboard-users/${currentUserId}`);
      performerInfo = {
        name: performerResponse.data?.name || "Suvidha",
        role: performerResponse.data?.role || "Unknown"
      };
    } catch (error) {
      console.log('Performer not found in dashboard users');
    }
    
    // Update the issue assignment
    try {
      await authenticatedAxios.patch(`/issues/${issueId}`, {
        assignedTo: Number(assigneeId),
        status: 'in_progress'
      });
    } catch (error) {
      console.error('Error assigning issue:', error);
      throw error;
    }
    
    // Create audit log entry for assignment
    await logAuditTrail(
      issueId,
      Number(currentUserId),
      'assignment',
      undefined,
      undefined,
      { 
        assigneeId: Number(assigneeId),
        assigneeName,
        performer: performerInfo
      }
    );
    
    // Return the complete updated issue
    const updatedIssue = await getIssueById(issueId);
    return updatedIssue || null;
  } catch (error) {
    console.error('Error assigning issue:', error);
    throw error;
  }
};

// Export alias for backward compatibility
export const assignIssueToUser = assignIssue;