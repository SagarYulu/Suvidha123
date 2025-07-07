# MySQL Local Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. MySQL Connection Issues

#### Error: `ER_ACCESS_DENIED_ERROR`
```
Error: Access denied for user 'yulu_user'@'localhost'
```

**Solution:**
```bash
# Login as root
mysql -u root -p

# Check user exists
SELECT User, Host FROM mysql.user WHERE User = 'yulu_user';

# Recreate user with correct password
DROP USER IF EXISTS 'yulu_user'@'localhost';
CREATE USER 'yulu_user'@'localhost' IDENTIFIED BY 'YuluSecurePass123!';
GRANT ALL PRIVILEGES ON yulu_grievance_db.* TO 'yulu_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Error: `ECONNREFUSED`
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Enable MySQL to start on boot
sudo systemctl enable mysql
```

### 2. Table Creation Issues

#### Error: `ER_TABLE_EXISTS_ERROR`
```
Error: Table 'employees' already exists
```

**Solution:**
```bash
# Drop all tables and recreate
mysql -u yulu_user -p yulu_grievance_db

DROP DATABASE yulu_grievance_db;
CREATE DATABASE yulu_grievance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yulu_grievance_db;

# Then run create_tables.sql again
SOURCE create_tables.sql;
```

#### Error: Foreign Key Constraint
```
Error: Cannot add foreign key constraint
```

**Solution:**
Ensure tables are created in the correct order. The create_tables.sql script already handles this, but if running manually:
1. Create parent tables first (employees, dashboard_users)
2. Then create child tables (issues, comments, etc.)

### 3. Character Set Issues

#### Error: Incorrect string value
```
Error: Incorrect string value: '\xF0\x9F\x98\x80' for column 'content'
```

**Solution:**
```sql
-- Ensure database uses utf8mb4
ALTER DATABASE yulu_grievance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Convert existing tables
ALTER TABLE issue_comments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Drizzle ORM Issues

#### Error: Unknown database type
```
Error: Unknown database type "mysql"
```

**Solution:**
```bash
# Ensure mysql2 is installed
npm install mysql2

# Check DATABASE_TYPE in .env
cat .env | grep DATABASE_TYPE
# Should show: DATABASE_TYPE=mysql
```

#### Error: Schema not found
```
Error: Cannot find module './shared/schema-mysql'
```

**Solution:**
```bash
# Generate MySQL schema
npm run db:generate

# If that doesn't work, check drizzle.config.ts
cat drizzle.config.ts
```

### 5. Authentication Issues

#### Error: JWT Token Invalid
```
Error: JsonWebTokenError: invalid signature
```

**Solution:**
1. Check JWT_SECRET in .env matches across all environments
2. Clear browser localStorage
3. Login again

#### Error: bcrypt compare fails
```
Error: Invalid credentials
```

**Solution:**
```bash
# Generate new password hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(console.log);"

# Update in database
mysql -u yulu_user -p yulu_grievance_db
UPDATE dashboard_users SET password = '$2b$10$...' WHERE email = 'admin@yulu.com';
```

### 6. Port Already in Use

#### Error: `EADDRINUSE`
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### 7. Timezone Issues

#### Issue: Timestamps showing wrong time

**Solution:**
```sql
-- Check MySQL timezone
SELECT @@global.time_zone, @@session.time_zone;

-- Set to IST
SET GLOBAL time_zone = '+05:30';
SET time_zone = '+05:30';

-- Or in MySQL config (my.cnf)
[mysqld]
default-time-zone = '+05:30'
```

### 8. Migration from PostgreSQL

#### Issue: Array columns not working

**PostgreSQL:**
```sql
tags TEXT[]
```

**MySQL Solution:**
```sql
tags JSON
-- Store as JSON array: ["tag1", "tag2"]
```

#### Issue: SERIAL not working

**PostgreSQL:**
```sql
id SERIAL PRIMARY KEY
```

**MySQL Solution:**
```sql
id INT AUTO_INCREMENT PRIMARY KEY
```

### 9. Performance Issues

#### Slow Queries

**Solution:**
```sql
-- Enable query log
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/var/log/mysql/query.log';

-- Check slow queries
SHOW PROCESSLIST;

-- Add indexes
CREATE INDEX idx_issues_employee_status ON issues(employee_id, status);
```

### 10. Backup and Recovery

#### Create Backup
```bash
# Full backup
mysqldump -u yulu_user -p yulu_grievance_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Structure only
mysqldump -u yulu_user -p yulu_grievance_db --no-data > structure.sql

# Data only
mysqldump -u yulu_user -p yulu_grievance_db --no-create-info > data.sql
```

#### Restore from Backup
```bash
# Restore full backup
mysql -u yulu_user -p yulu_grievance_db < backup_20250108_120000.sql
```

## Diagnostic Commands

### Check MySQL Status
```bash
# Service status
sudo systemctl status mysql

# MySQL version
mysql --version

# Connection test
mysql -u yulu_user -p -e "SELECT 1"

# Database size
mysql -u yulu_user -p -e "SELECT table_schema AS 'Database', 
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' 
  FROM information_schema.tables 
  WHERE table_schema = 'yulu_grievance_db' 
  GROUP BY table_schema;"
```

### Check Tables
```bash
# List all tables
mysql -u yulu_user -p yulu_grievance_db -e "SHOW TABLES;"

# Check table structure
mysql -u yulu_user -p yulu_grievance_db -e "DESCRIBE employees;"

# Count records
mysql -u yulu_user -p yulu_grievance_db -e "
  SELECT 'employees' as table_name, COUNT(*) as count FROM employees
  UNION ALL
  SELECT 'dashboard_users', COUNT(*) FROM dashboard_users
  UNION ALL
  SELECT 'issues', COUNT(*) FROM issues;"
```

### Application Logs
```bash
# Check Node.js logs
npm run dev

# Check MySQL error log
sudo tail -f /var/log/mysql/error.log

# Check general query log
sudo tail -f /var/log/mysql/query.log
```

## Getting Help

If you're still experiencing issues:

1. Check the error message carefully
2. Search for the exact error online
3. Check MySQL documentation: https://dev.mysql.com/doc/
4. Check Drizzle ORM documentation: https://orm.drizzle.team/
5. Review the application logs
6. Ensure all dependencies are installed: `npm install`
7. Try a fresh installation if needed

Remember to always backup your data before making significant changes!