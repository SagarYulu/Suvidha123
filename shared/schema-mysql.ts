import { mysqlTable, text, int, boolean, timestamp, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Employees table for MySQL
export const employees = mysqlTable("employees", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  empId: text("emp_id").notNull(),
  city: text("city"),
  cluster: text("cluster"),
  manager: text("manager"),
  role: text("role"),
  password: text("password").notNull(),
  dateOfJoining: text("date_of_joining"),
  bloodGroup: text("blood_group"),
  dateOfBirth: text("date_of_birth"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  userId: int("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dashboard users table for MySQL
export const dashboardUsers = mysqlTable("dashboard_users", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  employeeId: text("employee_id"),
  city: text("city"),
  cluster: text("cluster"),
  manager: text("manager"),
  role: text("role").notNull(),
  password: text("password").notNull(),
  userId: text("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: int("created_by"),
  lastUpdatedBy: int("last_updated_by"),
});

// Issues table for MySQL
export const issues = mysqlTable("issues", {
  id: int("id").primaryKey().autoincrement(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  priority: text("priority").notNull(),
  type: text("type").notNull(),
  subType: text("sub_type"),
  category: text("category"),
  employeeId: int("employee_id").notNull(),
  employeeName: text("employee_name"),
  employeeEmail: text("employee_email"),
  assignedTo: int("assigned_to"),
  assignedToName: text("assigned_to_name"),
  assignedToEmail: text("assigned_to_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  firstResponseAt: timestamp("first_response_at"),
  slaBreached: boolean("sla_breached").default(false),
  ticketNumber: text("ticket_number"),
  city: text("city"),
  cluster: text("cluster"),
  urgency: text("urgency"),
  impact: text("impact"),
  resolution: text("resolution"),
  tags: json("tags").$type<string[]>(),
  attachments: json("attachments").$type<string[]>(),
  metadata: json("metadata").$type<Record<string, any>>(),
});

// Issue comments table for MySQL
export const issueComments = mysqlTable("issue_comments", {
  id: int("id").primaryKey().autoincrement(),
  issueId: int("issue_id").notNull(),
  commenterId: int("commenter_id").notNull(),
  commenterType: text("commenter_type").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isInternal: boolean("is_internal").default(false),
  attachments: json("attachments").$type<string[]>(),
  metadata: json("metadata").$type<Record<string, any>>(),
});

// Issue internal comments table for MySQL
export const issueInternalComments = mysqlTable("issue_internal_comments", {
  id: int("id").primaryKey().autoincrement(),
  issueId: int("issue_id").notNull(),
  commenterId: int("commenter_id").notNull(),
  commenterType: text("commenter_type").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  attachments: json("attachments").$type<string[]>(),
  metadata: json("metadata").$type<Record<string, any>>(),
});

// Issue audit trail table for MySQL
export const issueAuditTrail = mysqlTable("issue_audit_trail", {
  id: int("id").primaryKey().autoincrement(),
  issueId: int("issue_id").notNull(),
  userId: int("user_id").notNull(),
  userType: text("user_type").notNull(),
  action: text("action").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  field: text("field"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: json("metadata").$type<Record<string, any>>(),
});

// Issue notifications table for MySQL
export const issueNotifications = mysqlTable("issue_notifications", {
  id: int("id").primaryKey().autoincrement(),
  issueId: int("issue_id").notNull(),
  recipientId: int("recipient_id").notNull(),
  recipientType: text("recipient_type").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata").$type<Record<string, any>>(),
});

// Ticket feedback table for MySQL
export const ticketFeedback = mysqlTable("ticket_feedback", {
  id: int("id").primaryKey().autoincrement(),
  issueId: int("issue_id").notNull(),
  employeeId: int("employee_id").notNull(),
  agentId: int("agent_id"),
  agentName: text("agent_name"),
  rating: int("rating").notNull(),
  feedback: text("feedback"),
  sentiment: text("sentiment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: json("metadata").$type<Record<string, any>>(),
});

// RBAC tables for MySQL
export const rbacRoles = mysqlTable("rbac_roles", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rbacPermissions = mysqlTable("rbac_permissions", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rbacRolePermissions = mysqlTable("rbac_role_permissions", {
  id: int("id").primaryKey().autoincrement(),
  roleId: int("role_id").notNull(),
  permissionId: int("permission_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rbacUserRoles = mysqlTable("rbac_user_roles", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  userType: text("user_type").notNull(),
  roleId: int("role_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Master data tables for MySQL
export const masterRoles = mysqlTable("master_roles", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const masterCities = mysqlTable("master_cities", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const masterClusters = mysqlTable("master_clusters", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  cityId: int("city_id").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit logs for MySQL
export const dashboardUserAuditLogs = mysqlTable("dashboard_user_audit_logs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  action: text("action").notNull(),
  tableName: text("table_name").notNull(),
  recordId: int("record_id"),
  oldValues: json("old_values").$type<Record<string, any>>(),
  newValues: json("new_values").$type<Record<string, any>>(),
  timestamp: timestamp("timestamp").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const masterAuditLogs = mysqlTable("master_audit_logs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  action: text("action").notNull(),
  tableName: text("table_name").notNull(),
  recordId: int("record_id"),
  oldValues: json("old_values").$type<Record<string, any>>(),
  newValues: json("new_values").$type<Record<string, any>>(),
  timestamp: timestamp("timestamp").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const holidays = mysqlTable('holidays', {
  id: int('id').primaryKey().autoincrement(),
  name: text('name').notNull(),
  date: text('date').notNull(),
  type: text('type').notNull(),
  recurring: boolean('recurring').default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Zod schemas for validation - These remain the same for both databases
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDashboardUserSchema = createInsertSchema(dashboardUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIssueSchema = createInsertSchema(issues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIssueCommentSchema = createInsertSchema(issueComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIssueInternalCommentSchema = createInsertSchema(issueInternalComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIssueAuditTrailSchema = createInsertSchema(issueAuditTrail).omit({
  id: true,
  timestamp: true,
});

export const insertTicketFeedbackSchema = createInsertSchema(ticketFeedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHolidaySchema = createInsertSchema(holidays).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports - These remain the same for both databases
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertDashboardUser = z.infer<typeof insertDashboardUserSchema>;
export type DashboardUser = typeof dashboardUsers.$inferSelect;

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;

export type InsertIssueComment = z.infer<typeof insertIssueCommentSchema>;
export type IssueComment = typeof issueComments.$inferSelect;

export type InsertIssueInternalComment = z.infer<typeof insertIssueInternalCommentSchema>;
export type IssueInternalComment = typeof issueInternalComments.$inferSelect;

export type InsertTicketFeedback = z.infer<typeof insertTicketFeedbackSchema>;
export type TicketFeedback = typeof ticketFeedback.$inferSelect;