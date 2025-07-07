#!/bin/bash

# PostgreSQL to MySQL Migration Script
# This script helps migrate data from PostgreSQL to MySQL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PostgreSQL to MySQL Migration Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will migrate data from PostgreSQL to MySQL${NC}"
echo -e "${YELLOW}⚠️  Make sure you have backups before proceeding!${NC}"
echo ""

# Get PostgreSQL credentials
echo -e "${GREEN}Enter PostgreSQL connection details:${NC}"
read -p "PostgreSQL host (default: localhost): " PG_HOST
PG_HOST=${PG_HOST:-localhost}
read -p "PostgreSQL port (default: 5432): " PG_PORT
PG_PORT=${PG_PORT:-5432}
read -p "PostgreSQL database: " PG_DB
read -p "PostgreSQL user: " PG_USER
read -s -p "PostgreSQL password: " PG_PASS
echo ""

# Get MySQL credentials
echo -e "${GREEN}Enter MySQL connection details:${NC}"
read -p "MySQL host (default: localhost): " MY_HOST
MY_HOST=${MY_HOST:-localhost}
read -p "MySQL port (default: 3306): " MY_PORT
MY_PORT=${MY_PORT:-3306}
read -p "MySQL database: " MY_DB
read -p "MySQL user: " MY_USER
read -s -p "MySQL password: " MY_PASS
echo ""

# Export PostgreSQL data
echo -e "${GREEN}Exporting data from PostgreSQL...${NC}"

# Create export directory
mkdir -p pg_export

# Export each table to CSV
PGPASSWORD=$PG_PASS psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DB <<EOF
\COPY employees TO 'pg_export/employees.csv' WITH CSV HEADER;
\COPY dashboard_users TO 'pg_export/dashboard_users.csv' WITH CSV HEADER;
\COPY issues TO 'pg_export/issues.csv' WITH CSV HEADER;
\COPY issue_comments TO 'pg_export/issue_comments.csv' WITH CSV HEADER;
\COPY issue_internal_comments TO 'pg_export/issue_internal_comments.csv' WITH CSV HEADER;
\COPY issue_audit_trail TO 'pg_export/issue_audit_trail.csv' WITH CSV HEADER;
\COPY issue_notifications TO 'pg_export/issue_notifications.csv' WITH CSV HEADER;
\COPY ticket_feedback TO 'pg_export/ticket_feedback.csv' WITH CSV HEADER;
\COPY rbac_roles TO 'pg_export/rbac_roles.csv' WITH CSV HEADER;
\COPY rbac_permissions TO 'pg_export/rbac_permissions.csv' WITH CSV HEADER;
\COPY rbac_role_permissions TO 'pg_export/rbac_role_permissions.csv' WITH CSV HEADER;
\COPY rbac_user_roles TO 'pg_export/rbac_user_roles.csv' WITH CSV HEADER;
\COPY master_roles TO 'pg_export/master_roles.csv' WITH CSV HEADER;
\COPY master_cities TO 'pg_export/master_cities.csv' WITH CSV HEADER;
\COPY master_clusters TO 'pg_export/master_clusters.csv' WITH CSV HEADER;
\COPY dashboard_user_audit_logs TO 'pg_export/dashboard_user_audit_logs.csv' WITH CSV HEADER;
\COPY master_audit_logs TO 'pg_export/master_audit_logs.csv' WITH CSV HEADER;
\COPY holidays TO 'pg_export/holidays.csv' WITH CSV HEADER;
EOF

echo -e "${GREEN}Data exported successfully!${NC}"

# Create MySQL database and tables
echo -e "${GREEN}Creating MySQL database and tables...${NC}"
mysql -h $MY_HOST -P $MY_PORT -u $MY_USER -p$MY_PASS <<EOF
DROP DATABASE IF EXISTS $MY_DB;
CREATE DATABASE $MY_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE $MY_DB;
SOURCE create_tables.sql;
EOF

# Import data into MySQL
echo -e "${GREEN}Importing data into MySQL...${NC}"

# Function to import CSV with proper handling
import_table() {
    local table=$1
    local csv_file="pg_export/${table}.csv"
    
    if [ -f "$csv_file" ]; then
        echo -e "${BLUE}Importing $table...${NC}"
        
        # Create temporary SQL file for import
        cat > "import_${table}.sql" <<EOF
USE $MY_DB;
SET foreign_key_checks = 0;

LOAD DATA LOCAL INFILE '$csv_file'
INTO TABLE $table
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

SET foreign_key_checks = 1;
EOF
        
        mysql -h $MY_HOST -P $MY_PORT -u $MY_USER -p$MY_PASS --local-infile=1 < "import_${table}.sql"
        rm "import_${table}.sql"
    else
        echo -e "${YELLOW}Warning: $csv_file not found, skipping...${NC}"
    fi
}

# Import tables in correct order (respecting foreign keys)
import_table "employees"
import_table "dashboard_users"
import_table "rbac_roles"
import_table "rbac_permissions"
import_table "master_cities"
import_table "master_roles"
import_table "issues"
import_table "issue_comments"
import_table "issue_internal_comments"
import_table "issue_audit_trail"
import_table "issue_notifications"
import_table "ticket_feedback"
import_table "rbac_role_permissions"
import_table "rbac_user_roles"
import_table "master_clusters"
import_table "dashboard_user_audit_logs"
import_table "master_audit_logs"
import_table "holidays"

# Fix AUTO_INCREMENT values
echo -e "${GREEN}Fixing AUTO_INCREMENT values...${NC}"
mysql -h $MY_HOST -P $MY_PORT -u $MY_USER -p$MY_PASS $MY_DB <<EOF
-- Get max IDs and set AUTO_INCREMENT
SELECT @max_emp := IFNULL(MAX(id), 0) + 1 FROM employees;
SELECT @max_dash := IFNULL(MAX(id), 0) + 1 FROM dashboard_users;
SELECT @max_issue := IFNULL(MAX(id), 0) + 1 FROM issues;
SELECT @max_comment := IFNULL(MAX(id), 0) + 1 FROM issue_comments;

SET @sql = CONCAT('ALTER TABLE employees AUTO_INCREMENT = ', @max_emp);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('ALTER TABLE dashboard_users AUTO_INCREMENT = ', @max_dash);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('ALTER TABLE issues AUTO_INCREMENT = ', @max_issue);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = CONCAT('ALTER TABLE issue_comments AUTO_INCREMENT = ', @max_comment);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
EOF

# Data transformations
echo -e "${GREEN}Applying data transformations...${NC}"

# Convert PostgreSQL arrays to JSON arrays
mysql -h $MY_HOST -P $MY_PORT -u $MY_USER -p$MY_PASS $MY_DB <<EOF
-- If you have array columns, convert them here
-- Example: UPDATE issues SET tags = JSON_ARRAY('tag1', 'tag2') WHERE tags IS NOT NULL;
EOF

# Verify migration
echo -e "${GREEN}Verifying migration...${NC}"
mysql -h $MY_HOST -P $MY_PORT -u $MY_USER -p$MY_PASS $MY_DB <<EOF
SELECT 'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'dashboard_users', COUNT(*) FROM dashboard_users
UNION ALL
SELECT 'issues', COUNT(*) FROM issues
UNION ALL
SELECT 'issue_comments', COUNT(*) FROM issue_comments;
EOF

# Cleanup
echo -e "${GREEN}Cleaning up temporary files...${NC}"
rm -rf pg_export

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Migration completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your .env file with MySQL credentials"
echo "2. Set DATABASE_TYPE=mysql in .env"
echo "3. Test the application thoroughly"
echo "4. Check for any data inconsistencies"
echo ""
echo -e "${RED}Important: Some features may behave differently in MySQL.${NC}"
echo -e "${RED}Test thoroughly before using in production!${NC}"