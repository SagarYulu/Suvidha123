import { Issue } from "@/types";
import { getIssueById } from "./issueFetchService";
import { logAuditTrail } from "./issueAuditService";
import authenticatedAxios from '@/services/authenticatedAxios';

/**
 * Update the status of an issue
 */
export const updateIssueStatus = async (
  issueId: string,
  newStatus: string,
  userId: string
): Promise<Issue | null> => {
  try {
    // Get current issue for previous status
    const currentIssue = await getIssueById(issueId);
    const previousStatus = currentIssue?.status;

    // Get performer info (the person updating the status)
    let performerInfo = { name: "Unknown User", role: "Unknown" };
    try {
      const performerResponse = await authenticatedAxios.get(`/api/dashboard-users/${userId}`);
      performerInfo = {
        name: performerResponse.data?.name || "Unknown User",
        role: performerResponse.data?.role || "Unknown"
      };
    } catch (error) {
      console.log('Performer not found in dashboard users');
    }

    // Update the issue status
    try {
      const response = await authenticatedAxios.patch(`/api/issues/${issueId}`, {
        status: newStatus,
        closedAt: newStatus === 'closed' || newStatus === 'resolved' ? new Date().toISOString() : null
      });
      console.log(`Status update response for issue ${issueId}:`, response.data);
    } catch (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
    
    // Create audit log entry with performer info
    await logAuditTrail(
      issueId,
      Number(userId),
      'status_change',
      previousStatus,
      newStatus,
      { 
        performer: performerInfo
      }
    );
    
    // Get the complete updated issue
    const updatedIssue = await getIssueById(issueId);
    return updatedIssue || null;
  } catch (error) {
    console.error('Error updating issue status:', error);
    throw error;
  }
};