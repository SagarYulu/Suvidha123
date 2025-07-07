// MySQL Storage Implementation
// Place this file in server/storage-mysql.ts

import { db } from "./config/db";
import { eq, and, desc, sql, or, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "@/shared/schema-mysql";
import type { 
  InsertEmployee, 
  Employee,
  InsertDashboardUser,
  DashboardUser,
  InsertIssue,
  Issue,
  InsertIssueComment,
  IssueComment,
  InsertIssueInternalComment,
  IssueInternalComment,
  InsertTicketFeedback,
  TicketFeedback
} from "@/shared/schema-mysql";

export interface IStorage {
  // Employee operations
  getEmployees(): Promise<Employee[]>;
  getEmployeeById(id: number): Promise<Employee | null>;
  getEmployeeByEmail(email: string): Promise<Employee | null>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, updates: Partial<InsertEmployee>): Promise<Employee | null>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Dashboard User operations
  getDashboardUsers(): Promise<DashboardUser[]>;
  getDashboardUserById(id: number): Promise<DashboardUser | null>;
  getDashboardUserByEmail(email: string): Promise<DashboardUser | null>;
  createDashboardUser(user: InsertDashboardUser): Promise<DashboardUser>;
  updateDashboardUser(id: number, updates: Partial<InsertDashboardUser>): Promise<DashboardUser | null>;
  deleteDashboardUser(id: number): Promise<boolean>;
  
  // Issue operations
  getIssues(): Promise<Issue[]>;
  getIssueById(id: number): Promise<Issue | null>;
  getIssuesByEmployeeId(employeeId: number): Promise<Issue[]>;
  getIssuesByAssignedTo(assignedTo: number): Promise<Issue[]>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: number, updates: Partial<InsertIssue>): Promise<Issue | null>;
  deleteIssue(id: number): Promise<boolean>;
  
  // Comment operations
  getCommentsByIssueId(issueId: number): Promise<IssueComment[]>;
  createComment(comment: InsertIssueComment): Promise<IssueComment>;
  getInternalCommentsByIssueId(issueId: number): Promise<IssueInternalComment[]>;
  createInternalComment(comment: InsertIssueInternalComment): Promise<IssueInternalComment>;
  
  // Feedback operations
  getFeedbackByIssueId(issueId: number): Promise<TicketFeedback | null>;
  createFeedback(feedback: InsertTicketFeedback): Promise<TicketFeedback>;
  getAllFeedback(): Promise<TicketFeedback[]>;
  
  // Master data operations
  getMasterRoles(): Promise<any[]>;
  getMasterCities(): Promise<any[]>;
  getMasterClusters(): Promise<any[]>;
  createMasterRole(role: any): Promise<any>;
  createMasterCity(city: any): Promise<any>;
  createMasterCluster(cluster: any): Promise<any>;
  updateMasterRole(id: number, updates: any): Promise<any>;
  updateMasterCity(id: number, updates: any): Promise<any>;
  updateMasterCluster(id: number, updates: any): Promise<any>;
  deleteMasterRole(id: number): Promise<boolean>;
  deleteMasterCity(id: number): Promise<boolean>;
  deleteMasterCluster(id: number): Promise<boolean>;
  getMasterAuditLogs(): Promise<any[]>;
  createMasterAuditLog(log: any): Promise<any>;
  
  // Holiday operations
  getHolidays(): Promise<any[]>;
  getHolidayById(id: number): Promise<any>;
  createHoliday(holiday: any): Promise<any>;
  updateHoliday(id: number, updates: any): Promise<any>;
  deleteHoliday(id: number): Promise<boolean>;
  
  // Bulk operations
  bulkCreateEmployees(employees: InsertEmployee[]): Promise<{ success: Employee[]; failed: any[] }>;
  bulkCreateDashboardUsers(users: InsertDashboardUser[]): Promise<{ success: DashboardUser[]; failed: any[] }>;
}

export class MySQLStorage implements IStorage {
  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(schema.employees).orderBy(desc(schema.employees.createdAt));
  }

  async getEmployeeById(id: number): Promise<Employee | null> {
    const result = await db.select().from(schema.employees).where(eq(schema.employees.id, id)).limit(1);
    return result[0] || null;
  }

  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    const result = await db.select().from(schema.employees).where(eq(schema.employees.email, email)).limit(1);
    return result[0] || null;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    // Hash password if provided
    if (employee.password) {
      employee.password = await bcrypt.hash(employee.password, 10);
    }
    
    const result = await db.insert(schema.employees).values(employee);
    const insertId = result[0].insertId;
    const created = await this.getEmployeeById(insertId);
    if (!created) throw new Error("Failed to create employee");
    return created;
  }

  async updateEmployee(id: number, updates: Partial<InsertEmployee>): Promise<Employee | null> {
    // Hash password if being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    await db.update(schema.employees).set(updates).where(eq(schema.employees.id, id));
    return await this.getEmployeeById(id);
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.delete(schema.employees).where(eq(schema.employees.id, id));
    return result[0].affectedRows > 0;
  }

  // Dashboard User operations
  async getDashboardUsers(): Promise<DashboardUser[]> {
    return await db.select().from(schema.dashboardUsers).orderBy(desc(schema.dashboardUsers.createdAt));
  }

  async getDashboardUserById(id: number): Promise<DashboardUser | null> {
    const result = await db.select().from(schema.dashboardUsers).where(eq(schema.dashboardUsers.id, id)).limit(1);
    return result[0] || null;
  }

  async getDashboardUserByEmail(email: string): Promise<DashboardUser | null> {
    const result = await db.select().from(schema.dashboardUsers).where(eq(schema.dashboardUsers.email, email)).limit(1);
    return result[0] || null;
  }

  async createDashboardUser(user: InsertDashboardUser): Promise<DashboardUser> {
    // Hash password
    user.password = await bcrypt.hash(user.password, 10);
    
    const result = await db.insert(schema.dashboardUsers).values(user);
    const insertId = result[0].insertId;
    const created = await this.getDashboardUserById(insertId);
    if (!created) throw new Error("Failed to create dashboard user");
    return created;
  }

  async updateDashboardUser(id: number, updates: Partial<InsertDashboardUser>): Promise<DashboardUser | null> {
    // Hash password if being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    await db.update(schema.dashboardUsers).set(updates).where(eq(schema.dashboardUsers.id, id));
    return await this.getDashboardUserById(id);
  }

  async deleteDashboardUser(id: number): Promise<boolean> {
    const result = await db.delete(schema.dashboardUsers).where(eq(schema.dashboardUsers.id, id));
    return result[0].affectedRows > 0;
  }

  // Issue operations
  async getIssues(): Promise<Issue[]> {
    return await db.select().from(schema.issues).orderBy(desc(schema.issues.createdAt));
  }

  async getIssueById(id: number): Promise<Issue | null> {
    const result = await db.select().from(schema.issues).where(eq(schema.issues.id, id)).limit(1);
    return result[0] || null;
  }

  async getIssuesByEmployeeId(employeeId: number): Promise<Issue[]> {
    return await db.select().from(schema.issues)
      .where(eq(schema.issues.employeeId, employeeId))
      .orderBy(desc(schema.issues.createdAt));
  }

  async getIssuesByAssignedTo(assignedTo: number): Promise<Issue[]> {
    return await db.select().from(schema.issues)
      .where(eq(schema.issues.assignedTo, assignedTo))
      .orderBy(desc(schema.issues.createdAt));
  }

  async createIssue(issue: InsertIssue): Promise<Issue> {
    const result = await db.insert(schema.issues).values(issue);
    const insertId = result[0].insertId;
    const created = await this.getIssueById(insertId);
    if (!created) throw new Error("Failed to create issue");
    return created;
  }

  async updateIssue(id: number, updates: Partial<InsertIssue>): Promise<Issue | null> {
    await db.update(schema.issues).set(updates).where(eq(schema.issues.id, id));
    return await this.getIssueById(id);
  }

  async deleteIssue(id: number): Promise<boolean> {
    const result = await db.delete(schema.issues).where(eq(schema.issues.id, id));
    return result[0].affectedRows > 0;
  }

  // Comment operations
  async getCommentsByIssueId(issueId: number): Promise<IssueComment[]> {
    return await db.select().from(schema.issueComments)
      .where(eq(schema.issueComments.issueId, issueId))
      .orderBy(schema.issueComments.createdAt);
  }

  async createComment(comment: InsertIssueComment): Promise<IssueComment> {
    const result = await db.insert(schema.issueComments).values(comment);
    const insertId = result[0].insertId;
    const created = await db.select().from(schema.issueComments)
      .where(eq(schema.issueComments.id, insertId))
      .limit(1);
    if (!created[0]) throw new Error("Failed to create comment");
    return created[0];
  }

  async getInternalCommentsByIssueId(issueId: number): Promise<IssueInternalComment[]> {
    return await db.select().from(schema.issueInternalComments)
      .where(eq(schema.issueInternalComments.issueId, issueId))
      .orderBy(schema.issueInternalComments.createdAt);
  }

  async createInternalComment(comment: InsertIssueInternalComment): Promise<IssueInternalComment> {
    const result = await db.insert(schema.issueInternalComments).values(comment);
    const insertId = result[0].insertId;
    const created = await db.select().from(schema.issueInternalComments)
      .where(eq(schema.issueInternalComments.id, insertId))
      .limit(1);
    if (!created[0]) throw new Error("Failed to create internal comment");
    return created[0];
  }

  // Feedback operations
  async getFeedbackByIssueId(issueId: number): Promise<TicketFeedback | null> {
    const result = await db.select().from(schema.ticketFeedback)
      .where(eq(schema.ticketFeedback.issueId, issueId))
      .limit(1);
    return result[0] || null;
  }

  async createFeedback(feedback: InsertTicketFeedback): Promise<TicketFeedback> {
    const result = await db.insert(schema.ticketFeedback).values(feedback);
    const insertId = result[0].insertId;
    const created = await db.select().from(schema.ticketFeedback)
      .where(eq(schema.ticketFeedback.id, insertId))
      .limit(1);
    if (!created[0]) throw new Error("Failed to create feedback");
    return created[0];
  }

  async getAllFeedback(): Promise<TicketFeedback[]> {
    return await db.select().from(schema.ticketFeedback)
      .orderBy(desc(schema.ticketFeedback.createdAt));
  }

  // Master data operations
  async getMasterRoles(): Promise<any[]> {
    return await db.select().from(schema.masterRoles).orderBy(schema.masterRoles.name);
  }

  async getMasterCities(): Promise<any[]> {
    return await db.select().from(schema.masterCities).orderBy(schema.masterCities.name);
  }

  async getMasterClusters(): Promise<any[]> {
    return await db.select({
      id: schema.masterClusters.id,
      name: schema.masterClusters.name,
      cityId: schema.masterClusters.cityId,
      cityName: schema.masterCities.name,
      createdAt: schema.masterClusters.createdAt,
      createdBy: schema.masterClusters.createdBy
    })
    .from(schema.masterClusters)
    .leftJoin(schema.masterCities, eq(schema.masterClusters.cityId, schema.masterCities.id))
    .orderBy(schema.masterClusters.name);
  }

  async createMasterRole(role: any): Promise<any> {
    const result = await db.insert(schema.masterRoles).values(role);
    return { id: result[0].insertId, ...role };
  }

  async createMasterCity(city: any): Promise<any> {
    const result = await db.insert(schema.masterCities).values(city);
    return { id: result[0].insertId, ...city };
  }

  async createMasterCluster(cluster: any): Promise<any> {
    const result = await db.insert(schema.masterClusters).values(cluster);
    return { id: result[0].insertId, ...cluster };
  }

  async updateMasterRole(id: number, updates: any): Promise<any> {
    await db.update(schema.masterRoles).set(updates).where(eq(schema.masterRoles.id, id));
    const result = await db.select().from(schema.masterRoles).where(eq(schema.masterRoles.id, id)).limit(1);
    return result[0];
  }

  async updateMasterCity(id: number, updates: any): Promise<any> {
    await db.update(schema.masterCities).set(updates).where(eq(schema.masterCities.id, id));
    const result = await db.select().from(schema.masterCities).where(eq(schema.masterCities.id, id)).limit(1);
    return result[0];
  }

  async updateMasterCluster(id: number, updates: any): Promise<any> {
    await db.update(schema.masterClusters).set(updates).where(eq(schema.masterClusters.id, id));
    const result = await db.select().from(schema.masterClusters).where(eq(schema.masterClusters.id, id)).limit(1);
    return result[0];
  }

  async deleteMasterRole(id: number): Promise<boolean> {
    const result = await db.delete(schema.masterRoles).where(eq(schema.masterRoles.id, id));
    return result[0].affectedRows > 0;
  }

  async deleteMasterCity(id: number): Promise<boolean> {
    const result = await db.delete(schema.masterCities).where(eq(schema.masterCities.id, id));
    return result[0].affectedRows > 0;
  }

  async deleteMasterCluster(id: number): Promise<boolean> {
    const result = await db.delete(schema.masterClusters).where(eq(schema.masterClusters.id, id));
    return result[0].affectedRows > 0;
  }

  async getMasterAuditLogs(): Promise<any[]> {
    return await db.select().from(schema.masterAuditLogs)
      .orderBy(desc(schema.masterAuditLogs.createdAt))
      .limit(100);
  }

  async createMasterAuditLog(log: any): Promise<any> {
    const result = await db.insert(schema.masterAuditLogs).values(log);
    return { id: result[0].insertId, ...log };
  }

  // Holiday operations
  async getHolidays(): Promise<any[]> {
    return await db.select().from(schema.holidays).orderBy(schema.holidays.date);
  }

  async getHolidayById(id: number): Promise<any> {
    const result = await db.select().from(schema.holidays).where(eq(schema.holidays.id, id)).limit(1);
    return result[0] || null;
  }

  async createHoliday(holiday: any): Promise<any> {
    const result = await db.insert(schema.holidays).values(holiday);
    return { id: result[0].insertId, ...holiday };
  }

  async updateHoliday(id: number, updates: any): Promise<any> {
    await db.update(schema.holidays).set(updates).where(eq(schema.holidays.id, id));
    return await this.getHolidayById(id);
  }

  async deleteHoliday(id: number): Promise<boolean> {
    const result = await db.delete(schema.holidays).where(eq(schema.holidays.id, id));
    return result[0].affectedRows > 0;
  }

  // Bulk operations
  async bulkCreateEmployees(employees: InsertEmployee[]): Promise<{ success: Employee[]; failed: any[] }> {
    const success: Employee[] = [];
    const failed: any[] = [];

    for (const employee of employees) {
      try {
        const created = await this.createEmployee(employee);
        success.push(created);
      } catch (error: any) {
        failed.push({
          data: employee,
          error: error.message
        });
      }
    }

    return { success, failed };
  }

  async bulkCreateDashboardUsers(users: InsertDashboardUser[]): Promise<{ success: DashboardUser[]; failed: any[] }> {
    const success: DashboardUser[] = [];
    const failed: any[] = [];

    for (const user of users) {
      try {
        const created = await this.createDashboardUser(user);
        success.push(created);
      } catch (error: any) {
        failed.push({
          data: user,
          error: error.message
        });
      }
    }

    return { success, failed };
  }
}

export const storage = new MySQLStorage();