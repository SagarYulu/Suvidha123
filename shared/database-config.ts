import { defineConfig } from "drizzle-kit";
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as drizzleMySQL } from "drizzle-orm/mysql2";
import { Pool } from "pg";
import mysql from "mysql2/promise";

export type DatabaseType = 'postgresql' | 'mysql';

export const getDatabaseType = (): DatabaseType => {
  const dbType = process.env.DATABASE_TYPE?.toLowerCase() as DatabaseType;
  return dbType === 'mysql' ? 'mysql' : 'postgresql'; // Default to PostgreSQL
};

export const getDrizzleConfig = () => {
  const dbType = getDatabaseType();
  
  if (dbType === 'mysql') {
    return defineConfig({
      out: "./migrations",
      schema: "./shared/schema.ts",
      dialect: "mysql",
      dbCredentials: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'FS_Grievance_management',
      },
    });
  }
  
  return defineConfig({
    out: "./migrations",
    schema: "./shared/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
      url: process.env.DATABASE_URL!,
    },
  });
};

export const createDatabaseConnection = () => {
  const dbType = getDatabaseType();
  
  if (dbType === 'mysql') {
    const connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'yulu_db',
      multipleStatements: true,
    };
    
    const connection = mysql.createPool(connectionConfig);
    return drizzleMySQL(connection);
  }
  
  // PostgreSQL connection (default)
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  return drizzle(pool);
};