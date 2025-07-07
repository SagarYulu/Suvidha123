
// This file is now a facade that re-exports from the modularized services
// This maintains backwards compatibility while allowing a cleaner structure

import { Issue } from "@/types";

// Re-export types
import { IssueFilters } from "./issueFilters";
export type { IssueFilters };

// Re-export functions from core module
export {
  getIssueById,
  getIssuesByUserId,
  createIssue,
  updateIssueStatus
} from "./issueCore";

// Re-export functions from filters module
export {
  getIssues
} from "./issueFilters";

// Re-export helper functions
export { 
  getIssueTypeLabel, 
  getIssueSubTypeLabel 
} from "./issueTypeHelpers";

// Re-export comment service
export { 
  addComment 
} from "./issueCommentService";

// Re-export analytics service
export { 
  getAnalytics 
} from "./issueAnalyticsService";

// Initialize service
const initializeService = () => {
  console.log("Issue service initialized");
};
initializeService();
