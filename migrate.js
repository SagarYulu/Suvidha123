#!/usr/bin/env node

/**
 * Production Migration Script
 * 
 * Usage:
 *   node migrate.js setup     - Create tables and seed master data
 *   node migrate.js check     - Verify database connection and tables
 *   node migrate.js backup    - Create database backup
 *   node migrate.js restore   - Restore from backup
 */

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { seedOriginalSupabaseData } from './server/seedOriginalData.js';
import * as schema from './shared/schema.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

const command = process.argv[2];

async function checkConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log(`📅 Server time: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = result.rows.map(row => row.table_name);
    console.log('📋 Existing tables:', tables);
    
    const requiredTables = [
      'employees', 
      'dashboard_users', 
      'issues', 
      'issue_comments',
      'master_roles',
      'master_cities', 
      'master_clusters'
    ];
    
    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables:', missingTables);
      return false;
    }
    
    console.log('✅ All required tables exist');
    return true;
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up database...');
  
  try {
    // Push schema using drizzle-kit
    console.log('📝 Creating tables...');
    await execAsync('npm run db:push');
    console.log('✅ Tables created successfully');
    
    // Seed master data
    console.log('🌱 Seeding master data...');
    await seedOriginalSupabaseData();
    console.log('✅ Master data seeded successfully');
    
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function backupDatabase() {
  if (!process.env.PGPASSWORD) {
    console.error('❌ PGPASSWORD environment variable required for backup');
    process.exit(1);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `backup-${timestamp}.sql`;
  
  try {
    console.log('💾 Creating database backup...');
    
    const pgDumpCmd = `pg_dump "${process.env.DATABASE_URL}" > ${filename}`;
    await execAsync(pgDumpCmd);
    
    console.log(`✅ Backup created: ${filename}`);
    
    // Get backup size
    const { stdout } = await execAsync(`ls -lh ${filename}`);
    console.log(`📊 Backup size: ${stdout.split(' ')[4]}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

async function restoreDatabase() {
  const backupFile = process.argv[3];
  
  if (!backupFile) {
    console.error('❌ Usage: node migrate.js restore <backup-file.sql>');
    process.exit(1);
  }
  
  try {
    console.log(`🔄 Restoring from ${backupFile}...`);
    
    const restoreCmd = `psql "${process.env.DATABASE_URL}" < ${backupFile}`;
    await execAsync(restoreCmd);
    
    console.log('✅ Database restored successfully');
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  }
}

async function getStats() {
  try {
    const stats = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM employees'),
      pool.query('SELECT COUNT(*) as count FROM dashboard_users'),
      pool.query('SELECT COUNT(*) as count FROM issues'),
      pool.query('SELECT COUNT(*) as count FROM issue_comments'),
      pool.query('SELECT COUNT(*) as count FROM master_roles'),
      pool.query('SELECT COUNT(*) as count FROM master_cities'),
      pool.query('SELECT COUNT(*) as count FROM master_clusters')
    ]);
    
    console.log('📊 Database Statistics:');
    console.log(`   👥 Employees: ${stats[0].rows[0].count}`);
    console.log(`   🔐 Dashboard Users: ${stats[1].rows[0].count}`);
    console.log(`   🎫 Issues: ${stats[2].rows[0].count}`);
    console.log(`   💬 Comments: ${stats[3].rows[0].count}`);
    console.log(`   🏷️  Roles: ${stats[4].rows[0].count}`);
    console.log(`   🏙️  Cities: ${stats[5].rows[0].count}`);
    console.log(`   🏢 Clusters: ${stats[6].rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error getting stats:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🔧 Yulu Issue Management - Migration Tool\n');
  
  const connected = await checkConnection();
  if (!connected) {
    process.exit(1);
  }
  
  switch (command) {
    case 'setup':
      await setupDatabase();
      await getStats();
      break;
      
    case 'check':
      await checkTables();
      await getStats();
      break;
      
    case 'backup':
      await backupDatabase();
      break;
      
    case 'restore':
      await restoreDatabase();
      break;
      
    default:
      console.log('Usage: node migrate.js <command>');
      console.log('');
      console.log('Commands:');
      console.log('  setup     - Create tables and seed master data');
      console.log('  check     - Verify database connection and tables');
      console.log('  backup    - Create database backup');
      console.log('  restore   - Restore from backup file');
      console.log('');
      console.log('Examples:');
      console.log('  node migrate.js setup');
      console.log('  node migrate.js check');
      console.log('  node migrate.js backup');
      console.log('  node migrate.js restore backup-2025-07-04.sql');
      break;
  }
  
  await pool.end();
}

main().catch(console.error);