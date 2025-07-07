// MySQL Database Configuration
// Place this file in server/config/db-mysql.ts

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@/shared/schema-mysql';
import { getDatabaseType } from '@/shared/database-config';

// Create connection based on database type
async function createConnection() {
  const dbType = getDatabaseType();
  
  if (dbType === 'mysql') {
    // MySQL connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      // Important for handling JSON and dates properly
      typeCast: function (field: any, next: any) {
        if (field.type === 'JSON') {
          return JSON.parse(field.string());
        }
        return next();
      }
    });

    // Test connection
    try {
      const connection = await pool.getConnection();
      console.log('MySQL connected successfully');
      connection.release();
    } catch (error) {
      console.error('MySQL connection error:', error);
      throw error;
    }

    return drizzle(pool, { schema, mode: 'default' });
  } else {
    // PostgreSQL connection (fallback)
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const { drizzle: pgDrizzle } = await import('drizzle-orm/node-postgres');
    const pgSchema = await import('@/shared/schema');
    
    return pgDrizzle(pool, { schema: pgSchema });
  }
}

// Export the database connection
export let db: any;

// Initialize database connection
export async function initializeDatabase() {
  db = await createConnection();
  return db;
}

// Helper function to check database type
export function isMySQL(): boolean {
  return getDatabaseType() === 'mysql';
}

// MySQL-specific query helpers
export const mysqlHelpers = {
  // Convert PostgreSQL array operations to JSON
  arrayContains: (column: string, value: string) => {
    return `JSON_CONTAINS(${column}, '"${value}"')`;
  },
  
  // Date interval helper
  dateInterval: (interval: string) => {
    // Convert '7 days' to '7 DAY'
    return interval.toUpperCase().replace('DAYS', 'DAY');
  },
  
  // JSON extract helper
  jsonExtract: (column: string, path: string) => {
    return `JSON_EXTRACT(${column}, '${path}')`;
  }
};