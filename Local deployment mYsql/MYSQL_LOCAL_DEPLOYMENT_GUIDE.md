# Complete MySQL Local Deployment Guide for Yulu Employee Issue Management System

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MySQL Installation](#mysql-installation)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Schema Creation](#schema-creation)
6. [Data Types Mapping](#data-types-mapping)
7. [Table Creation Scripts](#table-creation-scripts)
8. [Data Seeding](#data-seeding)
9. [Code Configuration Changes](#code-configuration-changes)
10. [API Endpoints](#api-endpoints)
11. [Running the Application](#running-the-application)
12. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Node.js 18+ and npm
- MySQL 8.0 or higher
- Git
- Text editor (VS Code recommended)

### Required npm packages
```bash
npm install mysql2 drizzle-orm drizzle-kit
```

## MySQL Installation

### Windows
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run installer and select "MySQL Server 8.0"
3. Set root password (remember this!)
4. Default port: 3306

### macOS
```bash
# Using Homebrew
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

## Database Setup

### 1. Login to MySQL
```bash
mysql -u root -p
# Enter your root password
```

### 2. Create Database and User
```sql
-- Create database
CREATE DATABASE yulu_grievance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'yulu_user'@'localhost' IDENTIFIED BY 'YuluSecurePass123!';

-- Grant permissions
GRANT ALL PRIVILEGES ON yulu_grievance_db.* TO 'yulu_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Use the database
USE yulu_grievance_db;
```

## Environment Configuration

### Create .env file in root directory
```bash
# Database Configuration for MySQL
DATABASE_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=yulu_user
DB_PASSWORD=YuluSecurePass123!
DB_NAME=yulu_grievance_db

# JWT Configuration
JWT_SECRET=your-secret-key

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Data Types Mapping

### PostgreSQL to MySQL Type Conversions

| PostgreSQL Type | MySQL Type | Notes |
|----------------|------------|--------|
| SERIAL | INT AUTO_INCREMENT | Primary keys |
| TEXT | TEXT | Long text fields |
| VARCHAR | VARCHAR(255) | String fields |
| BOOLEAN | BOOLEAN or TINYINT(1) | True/False values |
| TIMESTAMP | TIMESTAMP | Date/time fields |
| INTEGER | INT | Numeric fields |
| JSON/JSONB | JSON | JSON data |
| ARRAY | JSON | Arrays stored as JSON |

## Schema Creation

### Update drizzle.config.ts
```typescript
import { defineConfig } from "drizzle-kit";
import { getDatabaseType } from "./shared/database-config";

const dbType = getDatabaseType();

export default defineConfig({
  dialect: dbType === 'mysql' ? 'mysql' : 'postgresql',
  schema: dbType === 'mysql' ? "./shared/schema-mysql.ts" : "./shared/schema.ts",
  out: "./drizzle",
  dbCredentials: dbType === 'mysql' ? {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'yulu_grievance_db',
  } : {
    url: process.env.DATABASE_URL!,
  },
});
```

## Table Creation Scripts

### Complete MySQL Schema (save as create_tables.sql)
```sql
-- Employees table
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  emp_id VARCHAR(50) UNIQUE NOT NULL,
  city VARCHAR(100),
  cluster VARCHAR(100),
  manager VARCHAR(255),
  role VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  date_of_joining DATE,
  blood_group VARCHAR(10),
  date_of_birth DATE,
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_emp_id (emp_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard Users table
CREATE TABLE dashboard_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  employee_id INT,
  user_id INT,
  phone VARCHAR(20),
  city VARCHAR(100),
  cluster VARCHAR(100),
  manager VARCHAR(255),
  role VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issues table
CREATE TABLE issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  type_id VARCHAR(50) NOT NULL,
  sub_type_id VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  assigned_to INT,
  resolved_at TIMESTAMP NULL,
  first_response_at TIMESTAMP NULL,
  sla_breached BOOLEAN DEFAULT FALSE,
  last_status_change_at TIMESTAMP NULL,
  reopenable_until TIMESTAMP NULL,
  previously_closed_at JSON,
  attachment_url TEXT,
  attachments JSON,
  mapped_type_id VARCHAR(50),
  mapped_sub_type_id VARCHAR(50),
  mapped_at TIMESTAMP NULL,
  mapped_by INT,
  escalation_level INT DEFAULT 0,
  escalated_at TIMESTAMP NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES dashboard_users(id) ON DELETE SET NULL,
  FOREIGN KEY (mapped_by) REFERENCES dashboard_users(id) ON DELETE SET NULL,
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue Comments table
CREATE TABLE issue_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_id INT NOT NULL,
  employee_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  INDEX idx_issue_id (issue_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue Internal Comments table
CREATE TABLE issue_internal_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_id INT NOT NULL,
  dashboard_user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (dashboard_user_id) REFERENCES dashboard_users(id) ON DELETE CASCADE,
  INDEX idx_issue_id (issue_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue Audit Trail table
CREATE TABLE issue_audit_trail (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_id INT NOT NULL,
  changed_by INT NOT NULL,
  change_type VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  INDEX idx_issue_id (issue_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issue Notifications table
CREATE TABLE issue_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_id INT NOT NULL,
  user_id INT NOT NULL,
  user_type ENUM('employee', 'dashboard_user') NOT NULL,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  INDEX idx_user_id_type (user_id, user_type),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ticket Feedback table
CREATE TABLE ticket_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_id INT UNIQUE NOT NULL,
  employee_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  sentiment ENUM('positive', 'neutral', 'negative') NOT NULL,
  comment TEXT,
  agent_id INT,
  agent_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES dashboard_users(id) ON DELETE SET NULL,
  INDEX idx_issue_id (issue_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RBAC Roles table
CREATE TABLE rbac_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RBAC Permissions table
CREATE TABLE rbac_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RBAC Role Permissions table
CREATE TABLE rbac_role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RBAC User Roles table
CREATE TABLE rbac_user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES dashboard_users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Master Roles table
CREATE TABLE master_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  type ENUM('employee', 'dashboard_user') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES dashboard_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Master Cities table
CREATE TABLE master_cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES dashboard_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Master Clusters table
CREATE TABLE master_clusters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (city_id) REFERENCES master_cities(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES dashboard_users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_cluster_city (name, city_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard User Audit Logs table
CREATE TABLE dashboard_user_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dashboard_user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dashboard_user_id) REFERENCES dashboard_users(id) ON DELETE CASCADE,
  INDEX idx_dashboard_user_id (dashboard_user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Master Audit Logs table
CREATE TABLE master_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSON,
  new_values JSON,
  changed_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (changed_by) REFERENCES dashboard_users(id) ON DELETE CASCADE,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Holidays table
CREATE TABLE holidays (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  type ENUM('government', 'restricted') NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_holiday_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Data Seeding

### 1. Seed Initial Admin User
```sql
-- Insert initial dashboard admin user
INSERT INTO dashboard_users (name, email, password, role) VALUES
('Admin', 'admin@yulu.com', '$2b$10$8Dy95E3B4YeZMmU8x.M6.eFqNEKJ8zmL3R.pV.1XNLvkKKxMkUJKC', 'Super Admin');
-- Password: admin123

-- Insert RBAC roles
INSERT INTO rbac_roles (name, description) VALUES
('Super Admin', 'Full system access'),
('HR Admin', 'HR management access'),
('City Head', 'City-level management'),
('CRM', 'Customer relationship management'),
('Cluster Head', 'Cluster-level management'),
('Ops Head', 'Operations management'),
('TA Associate', 'Talent acquisition'),
('Employee', 'Basic employee access');

-- Insert RBAC permissions
INSERT INTO rbac_permissions (name, description) VALUES
('view:dashboard', 'View dashboard'),
('manage:users', 'Manage all users'),
('manage:tickets_all', 'Manage all tickets'),
('manage:tickets_assigned', 'Manage assigned tickets'),
('view:tickets_all', 'View all tickets'),
('view:tickets_assigned', 'View assigned tickets'),
('view:issue_analytics', 'View issue analytics'),
('view:feedback_analytics', 'View feedback analytics'),
('access:all_cities', 'Access all cities data'),
('access:city_restricted', 'Access only assigned city data'),
('manage:dashboard_users', 'Manage dashboard users'),
('access:security', 'Access security features');

-- Assign permissions to Super Admin role
INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT 1, id FROM rbac_permissions;

-- Assign Super Admin role to admin user
INSERT INTO rbac_user_roles (user_id, role_id) VALUES (1, 1);

-- Insert master data
INSERT INTO master_cities (name, created_by) VALUES
('Bangalore', 1),
('Delhi', 1),
('Mumbai', 1);

INSERT INTO master_clusters (name, city_id, created_by) VALUES
-- Bangalore clusters
('Whitefield', 1, 1),
('Indiranagar', 1, 1),
('Koramangala', 1, 1),
('HSR Layout', 1, 1),
('Electronic City', 1, 1),
('Marathahalli', 1, 1),
('Bellandur', 1, 1),
('BTM Layout', 1, 1),
('Jayanagar', 1, 1),
('JP Nagar', 1, 1),
-- Delhi clusters
('Connaught Place', 2, 1),
('Karol Bagh', 2, 1),
('Dwarka', 2, 1),
('Rohini', 2, 1),
('Saket', 2, 1),
('Lajpat Nagar', 2, 1),
('Janakpuri', 2, 1),
('Vasant Kunj', 2, 1),
('Nehru Place', 2, 1),
('Greater Kailash', 2, 1),
-- Mumbai clusters
('Andheri', 3, 1),
('Bandra', 3, 1),
('Powai', 3, 1),
('Lower Parel', 3, 1),
('Malad', 3, 1),
('Borivali', 3, 1),
('Thane', 3, 1),
('Vashi', 3, 1),
('Kurla', 3, 1),
('Dadar', 3, 1);

INSERT INTO master_roles (name, type, created_by) VALUES
-- Employee roles
('Mechanic', 'employee', 1),
('Pilot', 'employee', 1),
('Marshal', 'employee', 1),
('Charging Executive', 'employee', 1),
('OPC Executive', 'employee', 1),
('Quality Analyst', 'employee', 1),
('Rider', 'employee', 1),
('Freelancer', 'employee', 1),
-- Dashboard user roles
('Super Admin', 'dashboard_user', 1),
('HR Admin', 'dashboard_user', 1),
('City Head', 'dashboard_user', 1),
('CRM', 'dashboard_user', 1),
('Ops Head', 'dashboard_user', 1),
('TA Associate', 'dashboard_user', 1),
('Cluster Head', 'dashboard_user', 1);
```

### 2. Seed Sample Data (seed_data.sql)
```sql
-- Insert sample employees
INSERT INTO employees (user_id, name, email, phone, emp_id, city, cluster, manager, role, password, date_of_joining, blood_group, date_of_birth, account_number, ifsc_code) VALUES
(8832976, 'Mallesh N', 'chinnumalleshchinnu@gmail.com', '6364725906', 'XPH1884', 'Bangalore', 'Whitefield', 'Satyajith', 'Mechanic', '$2b$10$zNJZT7p0tr/xKklH3w.oFO8c9CQFrm7IlOOKKrU0AqTq9nEq0bxm2', '2025-03-10', 'A+', '2003-02-19', '110027659324', 'CNRB0000439'),
(8854375, 'EDWIN JOHNSON', 'edwinjohnson309@gmail.com', '7025853060', 'XPH1885', 'Bangalore', 'Indiranagar', 'Satyajith', 'Mechanic', '$2b$10$zNJZT7p0tr/xKklH3w.oFO8c9CQFrm7IlOOKKrU0AqTq9nEq0bxm2', '2025-03-08', 'B-', '2002-03-26', '71899500057507', 'YESB0000718');

-- Insert sample issues
INSERT INTO issues (employee_id, type_id, sub_type_id, description, status, priority) VALUES
(1, 'salary', 'salary-not-received', 'My salary for June has not been credited yet. Please check and update.', 'in_progress', 'medium');

-- Insert sample comments
INSERT INTO issue_comments (issue_id, employee_id, content) VALUES
(1, 1, 'Please look into this urgently as I have bills to pay.');
```

## Code Configuration Changes

### 1. Update server/config/db.ts
```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@/shared/schema-mysql';

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(pool, { schema, mode: 'default' });
```

### 2. Update shared/database-config.ts
```typescript
export type DatabaseType = 'postgresql' | 'mysql';

export const getDatabaseType = (): DatabaseType => {
  return (process.env.DATABASE_TYPE as DatabaseType) || 'postgresql';
};

export const getDrizzleConfig = () => {
  const dbType = getDatabaseType();
  
  if (dbType === 'mysql') {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };
  }
  
  return {
    connectionString: process.env.DATABASE_URL,
  };
};
```

### 3. Raw SQL Query Updates

Replace PostgreSQL-specific syntax:

**PostgreSQL:**
```sql
SELECT * FROM users WHERE created_at > NOW() - INTERVAL '7 days';
```

**MySQL:**
```sql
SELECT * FROM users WHERE created_at > NOW() - INTERVAL 7 DAY;
```

**PostgreSQL array operations:**
```sql
SELECT * FROM issues WHERE tags @> ARRAY['urgent'];
```

**MySQL JSON operations:**
```sql
SELECT * FROM issues WHERE JSON_CONTAINS(tags, '"urgent"');
```

## API Endpoints

All API endpoints remain the same. No changes needed in routes. The application will automatically use MySQL when configured.

### Authentication Endpoints
- POST `/api/auth/login` - Admin/Employee login
- POST `/api/auth/mobile-verify` - Mobile verification
- GET `/api/auth/verify` - Verify JWT token
- POST `/api/auth/logout` - Logout

### Issue Management Endpoints
- GET `/api/issues` - Get all issues
- POST `/api/issues` - Create new issue
- GET `/api/issues/:id` - Get issue details
- PATCH `/api/issues/:id` - Update issue
- POST `/api/issues/:id/comments` - Add comment

### User Management Endpoints
- GET `/api/employees` - Get all employees
- POST `/api/employees` - Create employee
- GET `/api/dashboard-users` - Get dashboard users
- POST `/api/dashboard-users` - Create dashboard user

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Database Tables
```bash
# Run the create_tables.sql script
mysql -u yulu_user -p yulu_grievance_db < create_tables.sql
```

### 3. Seed Initial Data
```bash
# Run the seed_data.sql script
mysql -u yulu_user -p yulu_grievance_db < seed_data.sql
```

### 4. Generate Drizzle Schema
```bash
npm run db:generate
```

### 5. Test the Connection
```bash
# Run the MySQL connection test
npm run mysql:test
```

### 6. Start the Application
```bash
npm run dev
```

The application will start on http://localhost:5000

### Default Login Credentials
- Admin: admin@yulu.com / admin123
- Employee: chinnumalleshchinnu@gmail.com / XPH1884

## Additional NPM Scripts for MySQL

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate", 
    "db:studio": "drizzle-kit studio",
    "mysql:backup": "mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql",
    "mysql:test": "tsx Local\\ deployment\\ mYsql/test-mysql-connection.ts",
    "mysql:setup": "cd Local\\ deployment\\ mYsql && ./setup_mysql_local.sh"
  }
}

## Troubleshooting

### Common Issues

1. **Connection Refused Error**
   - Check if MySQL is running: `sudo systemctl status mysql`
   - Verify port 3306 is not blocked

2. **Authentication Failed**
   - Check username/password in .env
   - Verify user permissions: `SHOW GRANTS FOR 'yulu_user'@'localhost';`

3. **Table Already Exists**
   - Drop and recreate: `DROP DATABASE yulu_grievance_db; CREATE DATABASE yulu_grievance_db;`

4. **Foreign Key Constraint Errors**
   - Ensure tables are created in correct order
   - Check that referenced data exists

5. **Character Set Issues**
   - Ensure database uses utf8mb4: `ALTER DATABASE yulu_grievance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

### Debugging Commands

```bash
# Check MySQL version
mysql --version

# View all tables
mysql -u yulu_user -p -e "USE yulu_grievance_db; SHOW TABLES;"

# Check table structure
mysql -u yulu_user -p -e "USE yulu_grievance_db; DESCRIBE employees;"

# View error logs
sudo tail -f /var/log/mysql/error.log
```

## Performance Optimization

### 1. Connection Pooling
Already configured in db.ts with:
- connectionLimit: 10
- queueLimit: 0

### 2. Indexes
All foreign keys and frequently queried columns have indexes.

### 3. Query Optimization
- Use EXPLAIN to analyze slow queries
- Add composite indexes for multi-column queries

### 4. MySQL Configuration (my.cnf)
```ini
[mysqld]
innodb_buffer_pool_size = 1G
max_connections = 200
query_cache_size = 256M
query_cache_limit = 2M
```

## Backup and Restore

### Backup Database
```bash
mysqldump -u yulu_user -p yulu_grievance_db > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
mysql -u yulu_user -p yulu_grievance_db < backup_20250108.sql
```

## Security Best Practices

1. **Never commit .env file**
   - Add to .gitignore
   - Use environment-specific files

2. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols

3. **Limit User Permissions**
   - Grant only necessary privileges
   - Use separate users for read/write

4. **Enable SSL/TLS**
   ```sql
   GRANT USAGE ON *.* TO 'yulu_user'@'localhost' REQUIRE SSL;
   ```

5. **Regular Updates**
   - Keep MySQL updated
   - Monitor security advisories

---

## Summary

This guide provides complete instructions for deploying the Yulu Employee Issue Management System locally with MySQL. Follow each step carefully and refer to the troubleshooting section if you encounter issues.

For production deployment, consider using:
- MySQL managed services (AWS RDS, Google Cloud SQL)
- Proper backup strategies
- Monitoring and alerting
- Load balancing for high availability