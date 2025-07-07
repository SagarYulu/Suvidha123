import { db } from '../config/db';
import { issues, issueComments, issueInternalComments, ticketFeedback, issueAuditTrail } from '@shared/schema';
import { eq, and, or, desc, sql, between } from 'drizzle-orm';
import type { Issue, InsertIssue, IssueComment, InsertIssueComment } from '@shared/schema';

export class IssueModel {
  /**
   * Find issue by ID
   */
  async findById(id: number): Promise<Issue | undefined> {
    const result = await db
      .select()
      .from(issues)
      .where(eq(issues.id, id))
      .limit(1);
    
    return result[0];
  }

  /**
   * Get all issues with filters
   */
  async findAll(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: number;
    employeeId?: number;
    startDate?: string;
    endDate?: string;
    typeId?: string;
    city?: string;
  }): Promise<Issue[]> {
    let query = db.select().from(issues);
    
    if (filters) {
      const conditions = [];
      
      if (filters.status) {
        conditions.push(eq(issues.status, filters.status));
      }
      
      if (filters.priority) {
        conditions.push(eq(issues.priority, filters.priority));
      }
      
      if (filters.assignedTo) {
        conditions.push(eq(issues.assignedTo, filters.assignedTo));
      }
      
      if (filters.employeeId) {
        conditions.push(eq(issues.employeeId, filters.employeeId));
      }
      
      if (filters.typeId) {
        conditions.push(eq(issues.typeId, filters.typeId));
      }
      
      if (filters.startDate && filters.endDate) {
        conditions.push(
          between(issues.createdAt, new Date(filters.startDate), new Date(filters.endDate))
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return query.orderBy(desc(issues.createdAt));
  }

  /**
   * Create new issue
   */
  async create(data: InsertIssue): Promise<Issue> {
    const result = await db
      .insert(issues)
      .values(data)
      .returning();
    
    return result[0];
  }

  /**
   * Update issue
   */
  async update(id: number, data: Partial<Issue>): Promise<Issue | undefined> {
    const result = await db
      .update(issues)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(issues.id, id))
      .returning();
    
    return result[0];
  }

  /**
   * Delete issue
   */
  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(issues)
      .where(eq(issues.id, id))
      .returning();
    
    return result.length > 0;
  }

  /**
   * Get issues by employee ID
   */
  async findByEmployeeId(employeeId: number): Promise<Issue[]> {
    return db
      .select()
      .from(issues)
      .where(eq(issues.employeeId, employeeId))
      .orderBy(desc(issues.createdAt));
  }

  /**
   * Get assigned issues
   */
  async findAssignedTo(userId: number): Promise<Issue[]> {
    return db
      .select()
      .from(issues)
      .where(eq(issues.assignedTo, userId))
      .orderBy(desc(issues.createdAt));
  }

  /**
   * Count issues by status
   */
  async countByStatus(): Promise<Record<string, number>> {
    const result = await db
      .select({
        status: issues.status,
        count: sql<number>`count(*)`
      })
      .from(issues)
      .groupBy(issues.status);
    
    return result.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get issue statistics
   */
  async getStatistics(filters?: { city?: string; dateRange?: { start: Date; end: Date } }) {
    let baseQuery = db.select({
      total: sql<number>`count(*)`,
      open: sql<number>`sum(case when status = 'open' then 1 else 0 end)`,
      inProgress: sql<number>`sum(case when status = 'in_progress' then 1 else 0 end)`,
      resolved: sql<number>`sum(case when status = 'resolved' then 1 else 0 end)`,
      closed: sql<number>`sum(case when status = 'closed' then 1 else 0 end)`,
      highPriority: sql<number>`sum(case when priority = 'high' then 1 else 0 end)`,
      criticalPriority: sql<number>`sum(case when priority = 'critical' then 1 else 0 end)`
    }).from(issues);
    
    if (filters?.dateRange) {
      baseQuery = baseQuery.where(
        between(issues.createdAt, filters.dateRange.start, filters.dateRange.end)
      );
    }
    
    const result = await baseQuery;
    return result[0];
  }

  /**
   * Update SLA fields
   */
  async updateSLAFields(id: number, fields: {
    firstResponseAt?: Date;
    resolvedAt?: Date;
    slaBreached?: boolean;
  }): Promise<Issue | undefined> {
    return this.update(id, fields);
  }
}

// Export singleton instance
export const issueModel = new IssueModel();