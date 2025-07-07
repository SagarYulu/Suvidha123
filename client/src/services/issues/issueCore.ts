
// This file is now a lightweight entry point that re-exports from the modularized services
// This allows us to maintain backwards compatibility with existing imports

// Initialize service
const initializeService = () => {
  console.log("Issue core service initialized");
};
initializeService();

// Re-export the functions from the modularized services
export { processIssues } from "./issueProcessingService";
export { getIssueById, getIssuesByUserId, getAssignedIssues } from "./issueFetchService";
export { createIssue } from "./issueCreationService";
export { updateIssueStatus } from "./issueStatusService";
export { assignIssueToUser } from "./issueAssignmentService";
export { reopenTicket } from "./issueReopeningService";
export { updateIssuePriority, updateAllIssuePriorities } from "./priorityUpdateService";
