import { getDatabaseType } from "./database-config";

// Dynamic schema loader that imports the correct schema based on database type
export const loadSchema = async () => {
  const dbType = getDatabaseType();
  
  if (dbType === 'mysql') {
    return await import('./schema-mysql');
  } else {
    return await import('./schema');
  }
};

// Type-safe schema exports that work with both database types
export type { 
  Employee, 
  DashboardUser, 
  Issue, 
  IssueComment, 
  IssueInternalComment, 
  TicketFeedback,
  InsertEmployee,
  InsertDashboardUser,
  InsertIssue,
  InsertIssueComment,
  InsertIssueInternalComment,
  InsertTicketFeedback
} from './schema';

// Re-export validation schemas (these are identical between both database types)
export { 
  insertEmployeeSchema,
  insertDashboardUserSchema,
  insertIssueSchema,
  insertIssueCommentSchema,
  insertIssueInternalCommentSchema,
  insertTicketFeedbackSchema,
  insertHolidaySchema
} from './schema';