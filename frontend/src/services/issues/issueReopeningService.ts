import { Issue } from "@/types";
import { getIssueById } from "./issueFetchService";
import { logAuditTrail } from "./issueAuditService";
import authenticatedAxios from '@/services/authenticatedAxios';

/**
 * Reopen a closed or resolved ticket
 */
export const reopenIssue = async (
  issueId: string,
  userId: string,
  reopenReason: string
): Promise<Issue | null> => {
  try {
    // Update the issue status to open
    await authenticatedAxios.patch(`/issues/${issueId}`, {
      status: 'open',
      reopenableUntil: null,
      previouslyClosedAt: null
    });

    // Add a comment about the reopen reason
    try {
      await authenticatedAxios.post(`/issues/${issueId}/comments`, {
        employeeUuid: Number(userId),
        content: `Issue reopened. Reason: ${reopenReason}`
      });
    } catch (commentError) {
      console.error('Error adding reopen comment:', commentError);
    }
    
    // Create audit log entry
    await logAuditTrail(
      issueId,
      Number(userId),
      'reopen',
      undefined,
      undefined,
      { reason: reopenReason }
    );
    
    // Return the complete updated issue
    const updatedIssue = await getIssueById(issueId);
    return updatedIssue || null;
  } catch (error) {
    console.error('Error reopening ticket:', error);
    throw error;
  }
};

// Export alias for backward compatibility
export const reopenTicket = reopenIssue;