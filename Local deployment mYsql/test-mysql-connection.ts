// MySQL Connection Test Script
// Run with: npm run mysql:test

import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema-mysql';

// Load environment variables
config();

async function testMySQLConnection() {
  console.log('🔍 Testing MySQL Connection...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'yulu_user',
    password: process.env.DB_PASSWORD || 'YuluSecurePass123!',
    database: process.env.DB_NAME || 'yulu_grievance_db',
  };
  
  console.log('📋 Configuration:');
  console.log(`Host: ${config.host}:${config.port}`);
  console.log(`Database: ${config.database}`);
  console.log(`User: ${config.user}`);
  console.log('');
  
  try {
    // Test basic connection
    console.log('1️⃣ Testing basic connection...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Basic connection successful!');
    
    // Test database access
    console.log('\n2️⃣ Testing database access...');
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('✅ Can access MySQL server');
    
    // Test current database
    console.log('\n3️⃣ Testing current database...');
    await connection.execute(`USE ${config.database}`);
    console.log(`✅ Connected to database: ${config.database}`);
    
    // Test tables
    console.log('\n4️⃣ Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Found ${(tables as any[]).length} tables`);
    
    if ((tables as any[]).length > 0) {
      console.log('\n📊 Tables in database:');
      (tables as any[]).forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
    }
    
    // Test Drizzle ORM connection
    console.log('\n5️⃣ Testing Drizzle ORM connection...');
    const pool = mysql.createPool(config);
    const db = drizzle(pool, { schema, mode: 'default' });
    
    // Try a simple query
    const employeeCount = await db.select().from(schema.employees);
    console.log(`✅ Drizzle ORM working! Found ${employeeCount.length} employees`);
    
    // Test write permissions
    console.log('\n6️⃣ Testing write permissions...');
    await connection.execute(`
      CREATE TEMPORARY TABLE test_permissions (
        id INT PRIMARY KEY,
        test VARCHAR(50)
      )
    `);
    await connection.execute('DROP TEMPORARY TABLE test_permissions');
    console.log('✅ Write permissions confirmed');
    
    // Check character set
    console.log('\n7️⃣ Checking character set...');
    const [charset] = await connection.execute(`
      SELECT @@character_set_database as charset, 
             @@collation_database as collation
    `);
    console.log(`✅ Character set: ${(charset as any[])[0].charset}`);
    console.log(`✅ Collation: ${(charset as any[])[0].collation}`);
    
    // Close connections
    await connection.end();
    await pool.end();
    
    console.log('\n🎉 All tests passed! MySQL is properly configured.');
    console.log('\n📝 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:5000');
    console.log('3. Login with: admin@yulu.com / admin123');
    
  } catch (error: any) {
    console.error('\n❌ Connection test failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔐 Access denied. Check your credentials in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n🔌 Connection refused. Is MySQL running?');
      console.error('Try: sudo systemctl start mysql');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n📁 Database does not exist. Run setup script first:');
      console.error('npm run mysql:setup');
    }
    
    process.exit(1);
  }
}

// Run the test
testMySQLConnection().catch(console.error);