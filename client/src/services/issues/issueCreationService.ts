import { Issue } from "@/types";
import { getIssueById } from "./issueFetchService";
import { logAuditTrail } from "./issueAuditService";
import authenticatedAxios from '@/services/authenticatedAxios';

/**
 * Create a new issue
 */
export const createIssue = async (issueData: Partial<Issue>): Promise<Issue | null> => {
  try {
    // Create the issue using our API
    const response = await authenticatedAxios.post('/api/issues', {
      employeeId: issueData.employeeId,
      typeId: issueData.typeId,
      subTypeId: issueData.subTypeId,
      description: issueData.description,
      status: issueData.status || 'open',
      priority: issueData.priority || 'low',
      attachmentUrl: issueData.attachmentUrl || null,
      attachments: issueData.attachments || null
    });
    
    const createdIssue = response.data;

    // Create audit log for issue creation
    if (createdIssue && createdIssue.id && issueData.employeeId) {
      await logAuditTrail(
        createdIssue.id,
        issueData.employeeId,
        'create',
        undefined,
        undefined,
        { initialData: issueData }
      );
    }
    
    // Return the created issue
    return createdIssue ? await getIssueById(createdIssue.id) || null : null;
  } catch (error) {
    console.error('Error in createIssue:', error);
    return null;
  }
};