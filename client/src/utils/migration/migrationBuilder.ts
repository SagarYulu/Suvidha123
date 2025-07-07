
import type { MigrationResult } from './tableExtractor';

export class MigrationBuilder {
  static buildMigrationScript(results: MigrationResult[], totalRows: number, totalErrors: number): string {
    const timestamp = new Date().toISOString();
    const header = [
      '-- Enhanced MySQL Data Migration Script',
      `-- Generated on: ${timestamp}`,
      `-- Source: Supabase Database`,
      `-- Target: MySQL Database`,
      `-- Total tables: ${results.length}`,
      `-- Total rows: ${totalRows}`,
      `-- Errors encountered: ${totalErrors}`,
      '',
      '-- IMPORTANT NOTES:',
      '-- 1. Make sure your MySQL database schema is already created',
      '-- 2. Run this script in your MySQL database',
      '-- 3. This script will INSERT data into existing tables',
      '-- 4. This script includes enhanced error handling and MySQL compatibility',
      '-- 5. Review any error comments in the script before execution',
      '',
      '-- MySQL Configuration for better compatibility',
      'SET FOREIGN_KEY_CHECKS = 0;',
      'SET AUTOCOMMIT = 0;',
      'SET sql_mode = \'\';',
      'SET CHARACTER_SET_CLIENT = utf8mb4;',
      'SET CHARACTER_SET_CONNECTION = utf8mb4;',
      'SET CHARACTER_SET_RESULTS = utf8mb4;',
      'START TRANSACTION;',
      '',
      ''
    ].join('\n');

    const footer = [
      '',
      '-- Restore MySQL settings and commit transaction',
      'SET FOREIGN_KEY_CHECKS = 1;',
      'COMMIT;',
      '',
      `-- Enhanced migration completed!`,
      `-- Total rows inserted: ${totalRows}`,
      `-- Total errors: ${totalErrors}`,
      `-- Generated on: ${timestamp}`,
      '',
      '-- If you encountered errors, please check the error comments above',
      '-- and verify your MySQL schema matches the Supabase structure.'
    ].join('\n');

    const tableData = results.map(result => {
      const lines = result.insertStatements.join('\n');
      if (result.errors && result.errors.length > 0) {
        return `-- ERRORS IN TABLE ${result.tableName.toUpperCase()}:\n-- ${result.errors.join('\n-- ')}\n\n${lines}`;
      }
      return lines;
    }).join('\n\n');

    return header + tableData + footer;
  }
}
