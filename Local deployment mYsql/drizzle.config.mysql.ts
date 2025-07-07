// Drizzle Configuration for MySQL
// Copy this to root as drizzle.config.ts when using MySQL

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'mysql',
  schema: "./shared/schema-mysql.ts",
  out: "./drizzle",
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'yulu_user',
    password: process.env.DB_PASSWORD || 'YuluSecurePass123!',
    database: process.env.DB_NAME || 'yulu_grievance_db',
  },
  // MySQL specific settings
  breakpoints: true,
  verbose: true,
  strict: true,
});