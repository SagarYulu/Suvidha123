// MySQL Schema for Drizzle ORM
// Place this file in shared/schema-mysql.ts

import { mysqlTable, varchar, int, text, timestamp, boolean, date, json, mysqlEnum, uniqueIndex, index, primaryKey } from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Employees table
export const employees = mysqlTable('employees', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  empId: varchar('emp_id', { length: 50 }).notNull().unique(),
  city: varchar('city', { length: 100 }),
  cluster: varchar('cluster', { length: 100 }),
  manager: varchar('manager', { length: 255 }),
  role: varchar('role', { length: 100 }),
  password: varchar('password', { length: 255 }).notNull(),
  dateOfJoining: date('date_of_joining'),
  bloodGroup: varchar('blood_group', { length: 10 }),
  dateOfBirth: date('date_of_birth'),
  accountNumber: varchar('account_number', { length: 50 }),
  ifscCode: varchar('ifsc_code', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => {
  return {
    emailIdx: index('idx_email').on(table.email),
    empIdIdx: index('idx_emp_id').on(table.empId),
  };
});

// Dashboard Users table
export const dashboardUsers = mysqlTable('dashboard_users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  employeeId: int('employee_id').references(() => employees.id, { onDelete: 'set null' }),
  userId: int('user_id'),
  phone: varchar('phone', { length: 20 }),
  city: varchar('city', { length: 100 }),
  cluster: varchar('cluster', { length: 100 }),
  manager: varchar('manager', { length: 255 }),
  role: varchar('role', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => {
  return {
    emailIdx: index('idx_email').on(table.email),
  };
});

// Issues table
export const issues = mysqlTable('issues', {
  id: int('id').primaryKey().autoincrement(),
  employeeId: int('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  typeId: varchar('type_id', { length: 50 }).notNull(),
  subTypeId: varchar('sub_type_id', { length: 50 }).notNull(),
  description: text('description').notNull(),
  status: mysqlEnum('status', ['open', 'in_progress', 'resolved', 'closed']).default('open'),
  priority: mysqlEnum('priority', ['low', 'medium', 'high', 'critical']).default('medium'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  closedAt: timestamp('closed_at'),
  assignedTo: int('assigned_to').references(() => dashboardUsers.id, { onDelete: 'set null' }),
  resolvedAt: timestamp('resolved_at'),
  firstResponseAt: timestamp('first_response_at'),
  slaBreached: boolean('sla_breached').default(false),
  lastStatusChangeAt: timestamp('last_status_change_at'),
  reopenableUntil: timestamp('reopenable_until'),
  previouslyClosedAt: json('previously_closed_at'),
  attachmentUrl: text('attachment_url'),
  attachments: json('attachments'),
  mappedTypeId: varchar('mapped_type_id', { length: 50 }),
  mappedSubTypeId: varchar('mapped_sub_type_id', { length: 50 }),
  mappedAt: timestamp('mapped_at'),
  mappedBy: int('mapped_by').references(() => dashboardUsers.id, { onDelete: 'set null' }),
  escalationLevel: int('escalation_level').default(0),
  escalatedAt: timestamp('escalated_at'),
}, (table) => {
  return {
    employeeIdIdx: index('idx_employee_id').on(table.employeeId),
    statusIdx: index('idx_status').on(table.status),
    priorityIdx: index('idx_priority').on(table.priority),
    createdAtIdx: index('idx_created_at').on(table.createdAt),
  };
});

// Issue Comments table
export const issueComments = mysqlTable('issue_comments', {
  id: int('id').primaryKey().autoincrement(),
  issueId: int('issue_id').notNull().references(() => issues.id, { onDelete: 'cascade' }),
  employeeId: int('employee_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => {
  return {
    issueIdIdx: index('idx_issue_id').on(table.issueId),
  };
});

// Issue Internal Comments table
export const issueInternalComments = mysqlTable('issue_internal_comments', {
  id: int('id').primaryKey().autoincrement(),
  issueId: int('issue_id').notNull().references(() => issues.id, { onDelete: 'cascade' }),
  dashboardUserId: int('dashboard_user_id').notNull().references(() => dashboardUsers.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => {
  return {
    issueIdIdx: index('idx_issue_id').on(table.issueId),
  };
});

// Issue Audit Trail table
export const issueAuditTrail = mysqlTable('issue_audit_trail', {
  id: int('id').primaryKey().autoincrement(),
  issueId: int('issue_id').notNull().references(() => issues.id, { onDelete: 'cascade' }),
  changedBy: int('changed_by').notNull(),
  changeType: varchar('change_type', { length: 50 }).notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    issueIdIdx: index('idx_issue_id').on(table.issueId),
    createdAtIdx: index('idx_created_at').on(table.createdAt),
  };
});

// Issue Notifications table
export const issueNotifications = mysqlTable('issue_notifications', {
  id: int('id').primaryKey().autoincrement(),
  issueId: int('issue_id').notNull().references(() => issues.id, { onDelete: 'cascade' }),
  userId: int('user_id').notNull(),
  userType: mysqlEnum('user_type', ['employee', 'dashboard_user']).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  readAt: timestamp('read_at'),
}, (table) => {
  return {
    userIdTypeIdx: index('idx_user_id_type').on(table.userId, table.userType),
    isReadIdx: index('idx_is_read').on(table.isRead),
  };
});

// Ticket Feedback table
export const ticketFeedback = mysqlTable('ticket_feedback', {
  id: int('id').primaryKey().autoincrement(),
  issueId: int('issue_id').notNull().unique().references(() => issues.id, { onDelete: 'cascade' }),
  employeeId: int('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  rating: int('rating').notNull(),
  sentiment: mysqlEnum('sentiment', ['positive', 'neutral', 'negative']).notNull(),
  comment: text('comment'),
  agentId: int('agent_id').references(() => dashboardUsers.id, { onDelete: 'set null' }),
  agentName: varchar('agent_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => {
  return {
    issueIdIdx: index('idx_issue_id').on(table.issueId),
  };
});

// RBAC Roles table
export const rbacRoles = mysqlTable('rbac_roles', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// RBAC Permissions table
export const rbacPermissions = mysqlTable('rbac_permissions', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// RBAC Role Permissions table
export const rbacRolePermissions = mysqlTable('rbac_role_permissions', {
  roleId: int('role_id').notNull().references(() => rbacRoles.id, { onDelete: 'cascade' }),
  permissionId: int('permission_id').notNull().references(() => rbacPermissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  };
});

// RBAC User Roles table
export const rbacUserRoles = mysqlTable('rbac_user_roles', {
  userId: int('user_id').notNull().references(() => dashboardUsers.id, { onDelete: 'cascade' }),
  roleId: int('role_id').notNull().references(() => rbacRoles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
  };
});

// Master Roles table
export const masterRoles = mysqlTable('master_roles', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  type: mysqlEnum('type', ['employee', 'dashboard_user']).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: int('created_by').references(() => dashboardUsers.id, { onDelete: 'set null' }),
});

// Master Cities table
export const masterCities = mysqlTable('master_cities', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: int('created_by').references(() => dashboardUsers.id, { onDelete: 'set null' }),
});

// Master Clusters table
export const masterClusters = mysqlTable('master_clusters', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  cityId: int('city_id').notNull().references(() => masterCities.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: int('created_by').references(() => dashboardUsers.id, { onDelete: 'set null' }),
}, (table) => {
  return {
    uniqueClusterCity: uniqueIndex('unique_cluster_city').on(table.name, table.cityId),
  };
});

// Dashboard User Audit Logs table
export const dashboardUserAuditLogs = mysqlTable('dashboard_user_audit_logs', {
  id: int('id').primaryKey().autoincrement(),
  dashboardUserId: int('dashboard_user_id').notNull().references(() => dashboardUsers.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 100 }).notNull(),
  details: text('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    dashboardUserIdIdx: index('idx_dashboard_user_id').on(table.dashboardUserId),
    createdAtIdx: index('idx_created_at').on(table.createdAt),
  };
});

// Master Audit Logs table
export const masterAuditLogs = mysqlTable('master_audit_logs', {
  id: int('id').primaryKey().autoincrement(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: int('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  oldValues: json('old_values'),
  newValues: json('new_values'),
  changedBy: int('changed_by').notNull().references(() => dashboardUsers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    entityIdx: index('idx_entity').on(table.entityType, table.entityId),
    createdAtIdx: index('idx_created_at').on(table.createdAt),
  };
});

// Holidays table
export const holidays = mysqlTable('holidays', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  date: date('date').notNull(),
  type: mysqlEnum('type', ['government', 'restricted']).notNull(),
  recurring: boolean('recurring').default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => {
  return {
    uniqueHolidayDate: uniqueIndex('unique_holiday_date').on(table.date),
  };
});

// Create insert schemas
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
  createdAt: true,
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

// Type exports
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