import { db } from "./db";
import { sql } from "drizzle-orm";

async function pushCompleteSchema() {
  console.log("Creating missing tables...");
  
  try {
    // Create issue_internal_comments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS issue_internal_comments (
        id SERIAL PRIMARY KEY,
        issue_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        employee_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created issue_internal_comments table");

    // Create issue_audit_trail table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS issue_audit_trail (
        id SERIAL PRIMARY KEY,
        issue_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        employee_id INTEGER NOT NULL,
        previous_status TEXT,
        new_status TEXT,
        details JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created issue_audit_trail table");

    // Create issue_notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS issue_notifications (
        id SERIAL PRIMARY KEY,
        issue_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created issue_notifications table");

    // Create RBAC tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rbac_roles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created rbac_roles table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rbac_permissions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created rbac_permissions table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rbac_role_permissions (
        id SERIAL PRIMARY KEY,
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created rbac_role_permissions table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rbac_user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created rbac_user_roles table");

    // Create master data tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS master_roles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created master_roles table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS master_cities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created master_cities table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS master_clusters (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        city_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created master_clusters table");

    // Create audit log tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS dashboard_user_audit_logs (
        id SERIAL PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        changes JSONB NOT NULL,
        performed_by INTEGER,
        performed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created dashboard_user_audit_logs table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS master_audit_logs (
        id SERIAL PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        changes JSONB NOT NULL,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ Created master_audit_logs table");

    console.log("\n✅ All tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating tables:", error);
    process.exit(1);
  }
}

pushCompleteSchema();