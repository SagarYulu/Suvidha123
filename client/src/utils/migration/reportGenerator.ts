

export class ReportGenerator {
  static async generateTableReport(): Promise<string> {
    const tables = [
      'employees', 'issues', 'dashboard_users', 'issue_comments',
      'issue_internal_comments', 'issue_audit_trail', 'issue_notifications',
      'ticket_feedback', 'master_cities', 'master_clusters', 'master_roles',
      'rbac_permissions', 'rbac_roles', 'rbac_role_permissions',
      'rbac_user_roles', 'dashboard_user_audit_logs', 'master_audit_logs'
    ];

    const report: string[] = [
      '-- Enhanced Database Migration Report', 
      '-- Generated on: ' + new Date().toISOString(), 
      '-- This report shows current data counts in Supabase',
      ''
    ];
    let totalRows = 0;

    for (const tableName of tables) {
      try {
        const { count, error } = await (supabase as any)
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          report.push(`-- Table: ${tableName.padEnd(30)} Rows: Error - ${error.message}`);
        } else {
          const rowCount = count || 0;
          totalRows += rowCount;
          report.push(`-- Table: ${tableName.padEnd(30)} Rows: ${rowCount}`);
        }
      } catch (error) {
        report.push(`-- Table: ${tableName.padEnd(30)} Rows: Critical Error`);
      }
    }

    report.push('', `-- Total rows across all tables: ${totalRows}`);
    report.push('', '-- NOTE: This report reflects current Supabase data counts');
    return report.join('\n');
  }
}
