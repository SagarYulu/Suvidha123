#!/usr/bin/env node

/**
 * Dual Database Migration Tool
 * Supports both PostgreSQL and MySQL based on environment configuration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const dbType = process.env.DATABASE_TYPE?.toLowerCase() || 'postgresql';

console.log(`🗄️  Database Migration Tool - ${dbType.toUpperCase()}`);

function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkDatabaseConnection() {
  console.log(`\n🔍 Checking ${dbType} connection...`);
  
  if (dbType === 'mysql') {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '3306';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'yulu_db';
    
    console.log(`📡 MySQL Connection: ${user}@${host}:${port}/${database}`);
    
    if (!password) {
      console.warn('⚠️  Warning: No MySQL password set (DB_PASSWORD)');
    }
  } else {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('❌ DATABASE_URL not found for PostgreSQL');
      process.exit(1);
    }
    console.log(`📡 PostgreSQL Connection: ${dbUrl.split('@')[1]?.split('?')[0] || 'configured'}`);
  }
}

async function main() {
  const action = process.argv[2] || 'push';
  
  console.log(`🚀 Starting ${action} for ${dbType} database\n`);
  
  // Check connection
  checkDatabaseConnection();
  
  switch (action) {
    case 'push':
      if (dbType === 'mysql') {
        runCommand(
          'npx drizzle-kit push --config=drizzle.mysql.config.ts',
          'Pushing MySQL schema'
        );
      } else {
        runCommand(
          'npx drizzle-kit push',
          'Pushing PostgreSQL schema'
        );
      }
      break;
      
    case 'generate':
      if (dbType === 'mysql') {
        runCommand(
          'npx drizzle-kit generate --config=drizzle.mysql.config.ts',
          'Generating MySQL migrations'
        );
      } else {
        runCommand(
          'npx drizzle-kit generate',
          'Generating PostgreSQL migrations'
        );
      }
      break;
      
    case 'migrate':
      if (dbType === 'mysql') {
        runCommand(
          'npx drizzle-kit migrate --config=drizzle.mysql.config.ts',
          'Running MySQL migrations'
        );
      } else {
        runCommand(
          'npx drizzle-kit migrate',
          'Running PostgreSQL migrations'
        );
      }
      break;
      
    case 'studio':
      if (dbType === 'mysql') {
        runCommand(
          'npx drizzle-kit studio --config=drizzle.mysql.config.ts',
          'Starting MySQL Studio'
        );
      } else {
        runCommand(
          'npx drizzle-kit studio',
          'Starting PostgreSQL Studio'
        );
      }
      break;
      
    case 'test':
      console.log('\n🧪 Testing database connection...');
      // Import and test the database connection
      try {
        const { db } = await import('./backend/db.js');
        console.log('✅ Database connection successful');
        console.log(`📊 Using ${dbType} database`);
      } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
      }
      break;
      
    default:
      console.log(`
📖 Usage: node migrate-dual.js [action]

Actions:
  push     - Push schema to database (default)
  generate - Generate migration files
  migrate  - Run pending migrations
  studio   - Start Drizzle Studio
  test     - Test database connection

Environment Variables:
  DATABASE_TYPE=postgresql|mysql (default: postgresql)
  
PostgreSQL:
  DATABASE_URL=postgresql://user:pass@host:port/db
  
MySQL:
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=password
  DB_NAME=yulu_db

Examples:
  # Push to PostgreSQL (default)
  DATABASE_TYPE=postgresql node migrate-dual.js push
  
  # Push to MySQL
  DATABASE_TYPE=mysql node migrate-dual.js push
  
  # Test connection
  node migrate-dual.js test
      `);
      break;
  }
  
  console.log(`\n🎉 ${action} operation completed for ${dbType}!`);
}

main().catch(console.error);