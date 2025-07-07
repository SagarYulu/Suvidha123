import { db } from "./db";
import { eq, and, desc, or, like, sql, inArray } from "drizzle-orm";
import { getCurrentISTTime } from "./utils/timezone";
import { 
  employees, dashboardUsers, issues, issueComments, 
  issueInternalComments, ticketFeedback, rbacRoles, rbacPermissions,
  masterRoles, masterCities, masterClusters, issueAuditTrail,
  type Employee, type DashboardUser, type Issue, 
  type IssueComment, type InsertEmployee, 
  type InsertDashboardUser, type InsertIssue, type InsertIssueComment,
  type IssueInternalComment, type InsertIssueInternalComment,
  type InsertTicketFeedback, type TicketFeedback
} from "@shared/schema";

// Enhanced comment type with commenter information
export type EnhancedIssueComment = IssueComment & {
  commenterName: string;
  commenterEmail: string;
  commenterRole: string;
  isEmployee: boolean;
};

// Create types for audit trail
export type IssueAuditTrail = typeof issueAuditTrail.$inferSelect;
export type InsertIssueAuditTrail = typeof issueAuditTrail.$inferInsert;

export interface IStorage {
  // Employee methods
  getEmployeeById(id: number): Promise<Employee | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  getEmployees(): Promise<Employee[]>;
  getEmployeesByIds(ids: number[]): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, updates: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Dashboard user methods
  getDashboardUsers(): Promise<DashboardUser[]>;
  getDashboardUserById(id: number): Promise<DashboardUser | undefined>;
  getDashboardUserByEmail(email: string): Promise<DashboardUser | undefined>;
  createDashboardUser(user: InsertDashboardUser): Promise<DashboardUser>;
  updateDashboardUser(id: number, updates: Partial<DashboardUser>): Promise<DashboardUser | undefined>;
  deleteDashboardUser(id: number): Promise<boolean>;
  
  // Issue methods
  getIssues(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Issue[]>;
  getIssueById(id: number): Promise<Issue | undefined>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: number, updates: Partial<Issue>): Promise<Issue | undefined>;
  
  // Issue comment methods
  getIssueComments(issueId: number): Promise<EnhancedIssueComment[]>;
  createIssueComment(comment: InsertIssueComment): Promise<IssueComment>;
  
  // Issue internal comment methods
  getIssueInternalComments(issueId: number): Promise<EnhancedIssueComment[]>;
  createIssueInternalComment(comment: InsertIssueInternalComment): Promise<IssueInternalComment>;
  
  // Ticket feedback methods
  getTicketFeedback(issueId?: number): Promise<TicketFeedback[]>;
  createTicketFeedback(feedback: InsertTicketFeedback): Promise<TicketFeedback>;
  
  // Issue audit trail methods
  getIssueAuditTrail(issueId: number): Promise<IssueAuditTrail[]>;
  createIssueAuditTrail(auditEntry: InsertIssueAuditTrail): Promise<IssueAuditTrail>;
  
  // Master data methods
  getMasterRoles(): Promise<any[]>;
  createMasterRole(name: string): Promise<any>;
  updateMasterRole(id: number, name: string): Promise<any>;
  deleteMasterRole(id: number): Promise<boolean>;
  
  getMasterCities(): Promise<any[]>;
  createMasterCity(name: string): Promise<any>;
  updateMasterCity(id: number, name: string): Promise<any>;
  deleteMasterCity(id: number): Promise<boolean>;
  
  getMasterClusters(): Promise<any[]>;
  createMasterCluster(name: string, cityId: number): Promise<any>;
  updateMasterCluster(id: number, name: string, cityId: number): Promise<any>;
  deleteMasterCluster(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Employee methods
  async getEmployeeById(id: number): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(employees.id, id));
    return result[0];
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(sql`LOWER(${employees.email})`, email.toLowerCase()));
    return result[0];
  }

  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async getEmployeesByIds(ids: number[]): Promise<Employee[]> {
    if (ids.length === 0) return [];
    return await db.select().from(employees).where(inArray(employees.id, ids));
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const result = await db.insert(employees).values(employee).returning();
    return result[0];
  }

  async updateEmployee(id: number, updates: Partial<Employee>): Promise<Employee | undefined> {
    const result = await db.update(employees)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return result[0];
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Dashboard user methods
  async getDashboardUsers(): Promise<DashboardUser[]> {
    return await db.select().from(dashboardUsers).orderBy(desc(dashboardUsers.createdAt));
  }

  async getDashboardUserById(id: number): Promise<DashboardUser | undefined> {
    const result = await db.select().from(dashboardUsers).where(eq(dashboardUsers.id, id));
    return result[0];
  }

  async getDashboardUserByEmail(email: string): Promise<DashboardUser | undefined> {
    const result = await db.select().from(dashboardUsers).where(eq(sql`LOWER(${dashboardUsers.email})`, email.toLowerCase()));
    return result[0];
  }

  async createDashboardUser(user: InsertDashboardUser): Promise<DashboardUser> {
    const result = await db.insert(dashboardUsers).values(user).returning();
    return result[0];
  }

  async updateDashboardUser(id: number, updates: Partial<DashboardUser>): Promise<DashboardUser | undefined> {
    const result = await db.update(dashboardUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dashboardUsers.id, id))
      .returning();
    return result[0];
  }

  async deleteDashboardUser(id: number): Promise<boolean> {
    const result = await db.delete(dashboardUsers).where(eq(dashboardUsers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Issue methods
  async getIssues(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
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
        const assignedToId = parseInt(filters.assignedTo);
        if (!isNaN(assignedToId)) {
          conditions.push(eq(issues.assignedTo, assignedToId));
        }
      }
      if (filters.employeeId) {
        const employeeId = parseInt(filters.employeeId);
        if (!isNaN(employeeId)) {
          conditions.push(eq(issues.employeeId, employeeId));
        }
      }
      if (filters.startDate) {
        conditions.push(sql`${issues.createdAt} >= ${filters.startDate}`);
      }
      if (filters.endDate) {
        conditions.push(sql`${issues.createdAt} <= ${filters.endDate}`);
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }
    }
    
    return await query.orderBy(desc(issues.createdAt));
  }

  async getIssueById(id: number): Promise<Issue | undefined> {
    const result = await db.select().from(issues).where(eq(issues.id, id));
    return result[0];
  }

  async createIssue(issue: InsertIssue): Promise<Issue> {
    const result = await db.insert(issues).values(issue).returning();
    return result[0];
  }

  async updateIssue(id: number, updates: Partial<Issue>): Promise<Issue | undefined> {
    const now = new Date();
    
    // Convert any string timestamps to Date objects to prevent Drizzle errors
    const sanitizedUpdates = { ...updates };
    
    // Handle timestamp string conversions
    if (sanitizedUpdates.closedAt && typeof sanitizedUpdates.closedAt === 'string') {
      sanitizedUpdates.closedAt = new Date(sanitizedUpdates.closedAt);
    }
    if (sanitizedUpdates.resolvedAt && typeof sanitizedUpdates.resolvedAt === 'string') {
      sanitizedUpdates.resolvedAt = new Date(sanitizedUpdates.resolvedAt);
    }
    if (sanitizedUpdates.firstResponseAt && typeof sanitizedUpdates.firstResponseAt === 'string') {
      sanitizedUpdates.firstResponseAt = new Date(sanitizedUpdates.firstResponseAt);
    }
    if (sanitizedUpdates.mappedAt && typeof sanitizedUpdates.mappedAt === 'string') {
      sanitizedUpdates.mappedAt = new Date(sanitizedUpdates.mappedAt);
    }
    if (sanitizedUpdates.escalatedAt && typeof sanitizedUpdates.escalatedAt === 'string') {
      sanitizedUpdates.escalatedAt = new Date(sanitizedUpdates.escalatedAt);
    }
    
    // Auto-set resolvedAt when status changes to resolved
    if (sanitizedUpdates.status === 'resolved' && !sanitizedUpdates.resolvedAt) {
      sanitizedUpdates.resolvedAt = now;
    }
    
    // Auto-set closedAt when status changes to closed
    if (sanitizedUpdates.status === 'closed' && !sanitizedUpdates.closedAt) {
      sanitizedUpdates.closedAt = now;
    }
    
    // Set firstResponseAt if this is the first admin response
    if (!sanitizedUpdates.firstResponseAt) {
      const existingIssue = await this.getIssueById(id);
      if (existingIssue && !existingIssue.firstResponseAt) {
        // Check if we have any comments or status changes - indicates first response
        const hasComments = await db.select().from(issueComments).where(eq(issueComments.issueId, id)).limit(1);
        if (hasComments.length > 0) {
          sanitizedUpdates.firstResponseAt = now;
        }
      }
    }
    
    console.log(`Updating issue ${id} with sanitized data:`, sanitizedUpdates);
    
    const result = await db.update(issues)
      .set({ ...sanitizedUpdates, updatedAt: now })
      .where(eq(issues.id, id))
      .returning();
    return result[0];
  }

  // Issue comment methods
  async getIssueComments(issueId: number): Promise<EnhancedIssueComment[]> {
    const comments = await db.select({
      id: issueComments.id,
      issueId: issueComments.issueId,
      content: issueComments.content,
      employeeId: issueComments.employeeId,
      createdAt: issueComments.createdAt,
      updatedAt: issueComments.updatedAt,
      commenterName: sql<string>`COALESCE(${employees.name}, ${dashboardUsers.name})`.as('commenterName'),
      commenterEmail: sql<string>`COALESCE(${employees.email}, ${dashboardUsers.email})`.as('commenterEmail'),
      commenterRole: sql<string>`COALESCE(${employees.role}, ${dashboardUsers.role})`.as('commenterRole'),
      isEmployee: sql<boolean>`CASE WHEN ${employees.id} IS NOT NULL THEN true ELSE false END`.as('isEmployee')
    })
    .from(issueComments)
    .leftJoin(employees, eq(issueComments.employeeId, employees.id))
    .leftJoin(dashboardUsers, eq(issueComments.employeeId, dashboardUsers.id))
    .where(eq(issueComments.issueId, issueId))
    .orderBy(desc(issueComments.createdAt));
    
    return comments;
  }

  async createIssueComment(comment: InsertIssueComment): Promise<IssueComment> {
    const result = await db.insert(issueComments).values(comment).returning();
    return result[0];
  }

  // Issue internal comment methods
  async getIssueInternalComments(issueId: number): Promise<EnhancedIssueComment[]> {
    const comments = await db.select({
      id: issueInternalComments.id,
      issueId: issueInternalComments.issueId,
      content: issueInternalComments.content,
      employeeId: issueInternalComments.employeeId,
      createdAt: issueInternalComments.createdAt,
      updatedAt: issueInternalComments.updatedAt,
      commenterName: sql<string>`COALESCE(${employees.name}, ${dashboardUsers.name})`.as('commenterName'),
      commenterEmail: sql<string>`COALESCE(${employees.email}, ${dashboardUsers.email})`.as('commenterEmail'),
      commenterRole: sql<string>`COALESCE(${employees.role}, ${dashboardUsers.role})`.as('commenterRole'),
      isEmployee: sql<boolean>`CASE WHEN ${employees.id} IS NOT NULL THEN true ELSE false END`.as('isEmployee')
    })
    .from(issueInternalComments)
    .leftJoin(employees, eq(issueInternalComments.employeeId, employees.id))
    .leftJoin(dashboardUsers, eq(issueInternalComments.employeeId, dashboardUsers.id))
    .where(eq(issueInternalComments.issueId, issueId))
    .orderBy(desc(issueInternalComments.createdAt));
    
    return comments;
  }

  async createIssueInternalComment(comment: InsertIssueInternalComment): Promise<IssueInternalComment> {
    const result = await db.insert(issueInternalComments).values(comment).returning();
    return result[0];
  }

  // Ticket feedback methods
  async getTicketFeedback(issueId?: number): Promise<TicketFeedback[]> {
    if (issueId) {
      return await db.select()
        .from(ticketFeedback)
        .where(eq(ticketFeedback.issueId, issueId))
        .orderBy(desc(ticketFeedback.createdAt));
    }
    
    return await db.select()
      .from(ticketFeedback)
      .orderBy(desc(ticketFeedback.createdAt));
  }

  async createTicketFeedback(feedback: InsertTicketFeedback): Promise<TicketFeedback> {
    const result = await db.insert(ticketFeedback).values(feedback).returning();
    return result[0];
  }

  // Issue audit trail methods
  async getIssueAuditTrail(issueId: number): Promise<IssueAuditTrail[]> {
    const results = await db.select()
      .from(issueAuditTrail)
      .where(eq(issueAuditTrail.issueId, issueId))
      .orderBy(desc(issueAuditTrail.createdAt));
    
    // Convert camelCase field names to snake_case for frontend compatibility
    return results.map(item => ({
      ...item,
      created_at: item.createdAt,
      employee_id: item.employeeId,
      issue_id: item.issueId,
      previous_status: item.previousStatus,
      new_status: item.newStatus
    }));
  }

  async createIssueAuditTrail(auditEntry: InsertIssueAuditTrail): Promise<IssueAuditTrail> {
    const result = await db.insert(issueAuditTrail).values(auditEntry).returning();
    return result[0];
  }

  // Master data methods
  async getMasterRoles(): Promise<any[]> {
    return await db.select().from(masterRoles).orderBy(masterRoles.name);
  }

  async createMasterRole(name: string): Promise<any> {
    const result = await db.insert(masterRoles).values({ name }).returning();
    return result[0];
  }

  async updateMasterRole(id: number, name: string): Promise<any> {
    const result = await db.update(masterRoles)
      .set({ name })
      .where(eq(masterRoles.id, id))
      .returning();
    return result[0];
  }

  async deleteMasterRole(id: number): Promise<boolean> {
    const result = await db.delete(masterRoles).where(eq(masterRoles.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getMasterCities(): Promise<any[]> {
    return await db.select().from(masterCities).orderBy(masterCities.name);
  }

  async createMasterCity(name: string): Promise<any> {
    const result = await db.insert(masterCities).values({ name }).returning();
    return result[0];
  }

  async updateMasterCity(id: number, name: string): Promise<any> {
    const result = await db.update(masterCities)
      .set({ name })
      .where(eq(masterCities.id, id))
      .returning();
    return result[0];
  }

  async deleteMasterCity(id: number): Promise<boolean> {
    const result = await db.delete(masterCities).where(eq(masterCities.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getMasterClusters(): Promise<any[]> {
    return await db.select({
      id: masterClusters.id,
      name: masterClusters.name,
      cityId: masterClusters.cityId,
      cityName: masterCities.name,
      createdAt: masterClusters.createdAt,
      updatedAt: masterClusters.updatedAt
    })
    .from(masterClusters)
    .leftJoin(masterCities, eq(masterClusters.cityId, masterCities.id))
    .orderBy(masterClusters.name);
  }

  async createMasterCluster(name: string, cityId: number): Promise<any> {
    const result = await db.insert(masterClusters).values({ name, cityId }).returning();
    return result[0];
  }

  async updateMasterCluster(id: number, name: string, cityId: number): Promise<any> {
    const result = await db.update(masterClusters)
      .set({ name, cityId })
      .where(eq(masterClusters.id, id))
      .returning();
    return result[0];
  }

  async deleteMasterCluster(id: number): Promise<boolean> {
    const result = await db.delete(masterClusters).where(eq(masterClusters.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
