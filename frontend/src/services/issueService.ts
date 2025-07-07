
// This file is a facade that re-exports from the modularized services
// This maintains backwards compatibility while allowing a cleaner structure

// Re-export types
import { IssueFilters } from "./issues/issueFilters";
export type { IssueFilters };

// Re-export all the functions from the modular services
export { 
  getIssueById,
  getIssuesByUserId,
  createIssue,
  updateIssueStatus,
  assignIssueToUser,
  getAssignedIssues,
  reopenTicket,
  updateIssuePriority,
  updateAllIssuePriorities
} from "./issues/issueCore";

export {
  getIssues
} from "./issues/issueFilters";

export { 
  getIssueTypeLabel, 
  getIssueSubTypeLabel,
  getEffectiveIssueType,
  getEffectiveIssueSubType
} from "./issues/issueTypeHelpers";

export { 
  addNewComment as addComment 
} from "./issues/issueCommentService";

export { 
  getAnalytics
} from "./issues/issueAnalyticsService";

export {
  getEmployeeNameByUuid,
  mapEmployeeIdsToNames
} from "./issues/issueUtils";

// Re-export the formatting utilities
export {
  formatConsistentIssueData,
  processIssues
} from "./issues/issueProcessingService";

// Re-export the mapping utilities
export {
  mapIssueType,
  isIssueMappable
} from "./issues/issueMapperService";
