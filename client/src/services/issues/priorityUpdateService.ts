import { Issue } from "@/types";
import { getIssueById } from "./issueFetchService";
import { logAuditTrail } from "./issueAuditService";
import { toast } from "@/hooks/use-toast";
import authenticatedAxios from '@/services/authenticatedAxios';

/**
 * Update the priority of an issue
 */
export const updateIssuePriority = async (
  issueId: string,
  newPriority: string,
  userId: string
): Promise<Issue | null> => {
  try {
    // Get current issue for previous priority
    const currentIssue = await getIssueById(issueId);
    const previousPriority = currentIssue?.priority;

    // Get performer info (the person updating the priority)
    let performerInfo = { name: "Suvidha", role: "Unknown" };
    try {
      const performerResponse = await authenticatedAxios.get(`/api/dashboard-users/${userId}`);
      performerInfo = {
        name: performerResponse.data?.name || "Suvidha",
        role: performerResponse.data?.role || "Unknown"
      };
    } catch (error) {
      console.log('Performer not found in dashboard users');
    }

    // Update the issue priority
    try {
      await authenticatedAxios.patch(`/api/issues/${issueId}`, {
        priority: newPriority,
        lastUpdatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating issue priority:', error);
      throw error;
    }

    // Create audit log entry with performer info
    await logAuditTrail(
      issueId,
      Number(userId),
      'priority_change',
      previousPriority,
      newPriority,
      { 
        performer: performerInfo
      }
    );

    toast({
      title: "Success",
      description: "Issue priority updated successfully",
    });
    
    // Get the complete updated issue
    const updatedIssue = await getIssueById(issueId);
    return updatedIssue || null;
  } catch (error) {
    console.error('Error updating issue priority:', error);
    toast({
      title: "Error",
      description: "Failed to update issue priority",
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Bulk update priority for multiple issues
 */
export const bulkUpdatePriority = async (
  issueIds: string[],
  newPriority: string,
  userId: string
): Promise<Issue[]> => {
  try {
    const updatedIssues: Issue[] = [];
    
    // Get performer info once
    let performerInfo = { name: "Suvidha", role: "Unknown" };
    try {
      const performerResponse = await authenticatedAxios.get(`/api/dashboard-users/${userId}`);
      performerInfo = {
        name: performerResponse.data?.name || "Suvidha",
        role: performerResponse.data?.role || "Unknown"
      };
    } catch (error) {
      console.log('Performer not found in dashboard users');
    }

    // Process each issue
    for (const issueId of issueIds) {
      try {
        // Get current issue for previous priority
        const currentIssue = await getIssueById(issueId);
        const previousPriority = currentIssue?.priority;

        // Update the issue priority
        await authenticatedAxios.patch(`/api/issues/${issueId}`, {
          priority: newPriority,
          lastUpdatedAt: new Date().toISOString()
        });

        // Create audit log entry
        await logAuditTrail(
          issueId,
          Number(userId),
          'priority_change',
          previousPriority,
          newPriority,
          { 
            performer: performerInfo,
            bulkUpdate: true
          }
        );

        // Get the updated issue
        const updatedIssue = await getIssueById(issueId);
        if (updatedIssue) {
          updatedIssues.push(updatedIssue);
        }
      } catch (error) {
        console.error(`Error updating priority for issue ${issueId}:`, error);
        // Continue with other issues even if one fails
      }
    }

    toast({
      title: "Success",
      description: `Priority updated for ${updatedIssues.length} issues`,
    });

    return updatedIssues;
  } catch (error) {
    console.error('Error in bulk priority update:', error);
    toast({
      title: "Error",
      description: "Failed to update issue priorities",
      variant: "destructive",
    });
    throw error;
  }
};

// Export aliases for backward compatibility
export const updateAllIssuePriorities = bulkUpdatePriority;
export const usePriorityUpdater = () => ({ updateIssuePriority, bulkUpdatePriority });