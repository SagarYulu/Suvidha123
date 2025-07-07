import { Issue } from "@/types";
import { logAuditTrail } from "./issueAuditService";
import { toast } from "@/hooks/use-toast";
import authenticatedAxios from '@/services/authenticatedAxios';

/**
 * Maps an "Others" ticket to a different ticket type and subtype
 */
export const mapIssue = async (
  issueId: string,
  newTypeId: string,
  newSubTypeId: string,
  currentUserId: string
): Promise<Issue | null> => {
  try {
    console.log(`Mapping issue ${issueId} to type ${newTypeId}, subtype ${newSubTypeId}`);
    
    // Get current issue details for audit trail
    const currentIssueResponse = await authenticatedAxios.get(`/issues/${issueId}`);
    const currentIssue = currentIssueResponse.data;
    
    if (!currentIssue) {
      console.error("Error fetching current issue for mapping");
      return null;
    }

    // Update the issue with new type and subtype
    try {
      await authenticatedAxios.patch(`/issues/${issueId}`, {
        typeId: newTypeId,
        subTypeId: newSubTypeId,
        mappedTypeId: newTypeId,
        mappedSubTypeId: newSubTypeId,
        mappedAt: new Date().toISOString(),
        mappedBy: Number(currentUserId)
      });
    } catch (error) {
      console.error("Error mapping issue type:", error);
      return null;
    }

    // Create audit log for the mapping action
    await logAuditTrail(
      issueId,
      Number(currentUserId),
      "issue_mapped",
      undefined,
      undefined,
      {
        previous: {
          type_id: currentIssue.typeId,
          sub_type_id: currentIssue.subTypeId
        },
        new: {
          type_id: newTypeId,
          sub_type_id: newSubTypeId
        }
      }
    );

    toast({
      title: "Success",
      description: "Issue mapped successfully",
    });

    // Return the updated issue
    const updatedIssueResponse = await authenticatedAxios.get(`/issues/${issueId}`);
    return updatedIssueResponse.data || null;
  } catch (error) {
    console.error("Error in mapIssue:", error);
    toast({
      title: "Error",
      description: "Failed to map issue",
      variant: "destructive",
    });
    return null;
  }
};

// Export aliases for backward compatibility
export const mapIssueType = mapIssue;

// Check if an issue can be mapped (used for UI logic)
export const isIssueMappable = (issue: Issue): boolean => {
  // Only allow mapping if the issue type is "other" or "others"
  return issue.typeId?.toLowerCase() === 'other' || issue.typeId?.toLowerCase() === 'others';
};