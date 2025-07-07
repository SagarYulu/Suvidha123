
export const MIGRATION_TABLES = [
  'employees',
  'issues',
  'dashboard_users',
  'issue_comments',
  'issue_internal_comments',
  'issue_audit_trail',
  'issue_notifications',
  'ticket_feedback',
  'master_cities',
  'master_clusters',
  'master_roles',
  'rbac_permissions',
  'rbac_roles',
  'rbac_role_permissions',
  'rbac_user_roles',
  'dashboard_user_audit_logs',
  'master_audit_logs'
] as const;

export type MigrationTable = typeof MIGRATION_TABLES[number];
