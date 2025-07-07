import { getDatabaseType } from '../shared/database-config.js';
import { drizzle as drizzlePG } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleMySQL } from 'drizzle-orm/mysql2';
import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import * as schemaPG from "../shared/schema.js";
import * as schemaMySQL from "../shared/schema-mysql.js";

const dbType = getDatabaseType();

// Database connection and schema selection
let db: any;
let schema: any;

if (dbType === 'mysql') {
  // MySQL connection
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'FS_Grievance_management',
    multipleStatements: true,
  };
  
  const connection = mysql.createPool(connectionConfig);
  db = drizzleMySQL(connection, { schema: schemaMySQL, mode: 'default' });
  schema = schemaMySQL;
} else {
  // PostgreSQL connection (default)
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  db = drizzlePG(pool, { schema: schemaPG });
  schema = schemaPG;
}

export { db, schema };
export const pool = db; // Backward compatibility
