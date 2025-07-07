#!/bin/bash

# MySQL Local Setup Script for Yulu Employee Issue Management System
# This script automates the MySQL database setup process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="yulu_grievance_db"
DB_USER="yulu_user"
DB_PASS="YuluSecurePass123!"
DB_HOST="localhost"
DB_PORT="3306"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}MySQL Local Setup Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}MySQL is not installed. Please install MySQL first.${NC}"
    echo "Visit: https://dev.mysql.com/downloads/"
    exit 1
fi

# Check if MySQL is running
if ! mysqladmin ping -h"$DB_HOST" --silent; then
    echo -e "${RED}MySQL is not running. Starting MySQL...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start mysql
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start mysql
    else
        echo -e "${RED}Please start MySQL manually${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}MySQL is running${NC}"

# Prompt for MySQL root password
echo -e "${YELLOW}Enter MySQL root password:${NC}"
read -s ROOT_PASS

# Create database and user
echo -e "${GREEN}Creating database and user...${NC}"
mysql -u root -p"$ROOT_PASS" <<EOF
-- Drop database if exists (for fresh start)
DROP DATABASE IF EXISTS $DB_NAME;

-- Create database
CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Drop user if exists
DROP USER IF EXISTS '$DB_USER'@'$DB_HOST';

-- Create user
CREATE USER '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASS';

-- Grant permissions
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'$DB_HOST';

-- Apply changes
FLUSH PRIVILEGES;

-- Show success
SELECT 'Database and user created successfully!' AS Status;
EOF

# Create tables
echo -e "${GREEN}Creating tables...${NC}"
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < create_tables.sql

# Seed data
echo -e "${GREEN}Seeding initial data...${NC}"
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < seed_data.sql

# Create .env file
echo -e "${GREEN}Creating .env file...${NC}"
cat > ../.env <<EOF
# Database Configuration for MySQL
DATABASE_TYPE=mysql
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_NAME=$DB_NAME

# JWT Configuration
JWT_SECRET=your-secret-key

# Server Configuration
PORT=5000
NODE_ENV=development
EOF

# Install npm packages
echo -e "${GREEN}Installing npm packages...${NC}"
cd ..
npm install mysql2 drizzle-orm drizzle-kit

# Generate Drizzle schema
echo -e "${GREEN}Generating Drizzle schema...${NC}"
npm run db:generate

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Database Details:${NC}"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $DB_PASS"
echo "Host: $DB_HOST:$DB_PORT"
echo ""
echo -e "${YELLOW}Default Login Credentials:${NC}"
echo "Admin: admin@yulu.com / admin123"
echo "Employee: chinnumalleshchinnu@gmail.com / XPH1884"
echo ""
echo -e "${YELLOW}To start the application:${NC}"
echo "npm run dev"
echo ""
echo -e "${GREEN}Happy coding!${NC}"