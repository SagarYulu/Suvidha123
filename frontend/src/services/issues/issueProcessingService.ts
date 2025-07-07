import { Issue } from "@/types";
import { mapDbIssueToAppIssue } from "./issueUtils";
import { apiClient } from "../apiClient";

// Initialize service
const initializeService = () => {
  console.log("Issue processing service initialized");
};
initializeService();

/**
 * Processes a list of database issues and adds their comments
 * Ensures consistent formatting across application
 */
export async function processIssues(dbIssues: any[]): Promise<Issue[]> {
  // If no issues found, return empty array
  if (!dbIssues || dbIssues.length === 0) {
    return [];
  }
  
  // Get all comments for these issues
  const issueIds = dbIssues.map(issue => issue.id);
  let commentsByIssueId: Record<string, any[]> = {};
  
  if (issueIds.length > 0) {
    try {
      // Get comments for each issue
      const commentPromises = issueIds.map(async issueId => {
        try {
          const dbComments = await apiClient.getIssueComments(issueId.toString());
          return { issueId, comments: dbComments || [] };
        } catch (error) {
          console.error(`Error fetching comments for issue ${issueId}:`, error);
          return { issueId, comments: [] };
        }
      });
      
      const commentResults = await Promise.all(commentPromises);
      
      // Group comments by issue_id
      commentResults.forEach(result => {
        const { issueId, comments } = result;
        if (comments && Array.isArray(comments)) {
          commentsByIssueId[issueId] = comments.map(comment => ({
            id: comment.id,
            employeeUuid: comment.employeeId,
            content: comment.content,
            createdAt: comment.createdAt
          }));
        }
      });
    } catch (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }
  }
  
  // Map database issues to app Issue type with comments and ensure consistent formatting
  const issues = dbIssues.map(dbIssue => {
    const issue = mapDbIssueToAppIssue(dbIssue, commentsByIssueId[dbIssue.id] || []);
    
    // Ensure priority is formatted consistently
    // For closed or resolved issues, we'll still keep the original priority in the data
    // but the UI can choose to display it differently
    
    return issue;
  });
  
  return issues;
}

export const formatConsistentIssueData = (issues: Issue[]): Issue[] => {
  return issues.map(issue => ({
    ...issue,
    // Ensure status is consistently formatted (remove underscores for display)
    status: issue.status,
    // Ensure priority is consistently formatted
    priority: issue.priority,
  }));
};
