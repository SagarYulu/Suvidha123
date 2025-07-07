# Complete MySQL Migration Guide - PostgreSQL to MySQL

This guide provides step-by-step instructions to migrate your Yulu Employee Issue Management System from PostgreSQL to MySQL, including all database schemas, API configurations, and JWT setup.

## 🚀 Quick Start - One Command Setup

```bash
# Complete automated MySQL setup
./scripts/deployment-scripts.sh setup
```

This single command will:
- Install all dependencies
- Create MySQL database
- Configure environment variables
- Migrate all schemas
- Seed data
- Configure JWT authentication
- Start the application

## 📋 Prerequisites

1. **MySQL Installation**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server mysql-client
   
   # macOS
   brew install mysql
   brew services start mysql
   
   # Windows
   # Download MySQL installer from https://dev.mysql.com/downloads/installer/
   ```

2. **Node.js 16+ and npm**
   ```bash
   node --version  # Should be 16.0.0 or higher
   npm --version   # Should be 7.0.0 or higher
   ```

## 🗄️ Step 1: MySQL Database Setup

### Create Database and User
```bash
# Login to MySQL
mysql -u root -p

# Run these commands in MySQL shell
CREATE DATABASE FS_Grievance_management;
CREATE USER 'yulu_user'@'localhost' IDENTIFIED BY 'Yulu@123';
GRANT ALL PRIVILEGES ON FS_Grievance_management.* TO 'yulu_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Or use the automated script:
```bash
./scripts/deployment-scripts.sh mysql
```

## 🔧 Step 2: Environment Configuration

### Create .env file
```bash
# Database Configuration - MySQL
DATABASE_TYPE=mysql
DB_HOST=localhost
DB_USER=yulu_user
DB_PASSWORD=Yulu@123
DB_NAME=FS_Grievance_management
DB_PORT=3306

# JWT Configuration
JWT_SECRET=FS_Grievance_Management_JWT_Secret_Key_2025_Yulu_Secure_Auth_Token
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Or use automated setup:
```bash
./scripts/deployment-scripts.sh env
```

## 📊 Step 3: Database Schema Migration

### MySQL Schema Structure
The system automatically detects MySQL and uses the correct schema. Here's what gets created:

```sql
-- Master Tables
CREATE TABLE master_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE master_cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE master_clusters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city_id INT NOT NULL,
  FOREIGN KEY (city_id) REFERENCES master_cities(id)
);

-- User Tables
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  employee_id VARCHAR(100) UNIQUE NOT NULL,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE dashboard_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Issue Management Tables
CREATE TABLE issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  type_id VARCHAR(100) NOT NULL,
  sub_type_id VARCHAR(100),
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  resolved_at TIMESTAMP NULL,
  first_response_at TIMESTAMP NULL,
  sla_breached BOOLEAN DEFAULT false,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES dashboard_users(id) ON DELETE SET NULL
);

-- Additional tables for comments, feedback, audit trails, etc.
```

### Run Schema Migration
```bash
# Using automated script
./scripts/deployment-scripts.sh migrate

# Or manually
drizzle-kit push --config=drizzle.mysql.config.ts
```

## 🔐 Step 4: JWT Authentication Setup

JWT is automatically configured with:
- **Secret Key**: `FS_Grievance_Management_JWT_Secret_Key_2025_Yulu_Secure_Auth_Token`
- **Expiry**: 24 hours
- **Algorithm**: HS256

### Authentication Endpoints
```javascript
// Dashboard Login
POST /api/auth/login
{
  "email": "sagar.km@yulu.bike",
  "password": "admin123"
}

// Mobile Employee Verification
POST /api/auth/mobile-verify
{
  "email": "chinnumalleshchinnu@gmail.com",
  "employeeId": "XPH1884"
}

// Token Verification
GET /api/auth/verify
Headers: { "Authorization": "Bearer <token>" }
```

## 🌱 Step 5: Seed Initial Data

### Automated Seeding
```bash
./scripts/deployment-scripts.sh seed
```

This creates:
- 8 Dashboard Users (Super Admin, HR Admin, City Heads, etc.)
- 10 Employees with realistic data
- 8 Sample Issues
- Master data (31 roles, 3 cities, 30 clusters)

### Test Credentials

**Dashboard Access:**
```
Email: sagar.km@yulu.bike
Password: admin123
Role: Super Admin
```

**Mobile Access:**
```
Email: chinnumalleshchinnu@gmail.com
Employee ID: XPH1884
```

## 🚀 Step 6: Start the Application

```bash
# Development mode
npm run dev

# Access points:
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
```

## ✅ Step 7: Verify Installation

### Test Authentication
```bash
./scripts/deployment-scripts.sh test-auth
```

### Verify All Systems
```bash
./scripts/deployment-scripts.sh verify
```

## 🔄 API Changes from PostgreSQL to MySQL

### Database Driver
- **PostgreSQL**: Uses `pg` package
- **MySQL**: Uses `mysql2` package

### Connection Configuration
```javascript
// PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});
```

### Schema Differences
- **IDs**: Changed from UUID to INT AUTO_INCREMENT
- **Timestamps**: MySQL uses TIMESTAMP instead of TIMESTAMPTZ
- **Booleans**: MySQL uses TINYINT(1) for BOOLEAN
- **Arrays**: Stored as JSON in MySQL

## 🛠️ Common Issues & Solutions

### 1. MySQL Connection Error
```bash
# Check MySQL service
sudo systemctl status mysql  # Linux
brew services list          # macOS

# Restart MySQL
sudo systemctl restart mysql # Linux
brew services restart mysql  # macOS
```

### 2. Authentication Failed
```bash
# Reset MySQL password
mysql -u root
ALTER USER 'yulu_user'@'localhost' IDENTIFIED BY 'Yulu@123';
FLUSH PRIVILEGES;
```

### 3. Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
```

### 4. Schema Push Failed
```bash
# Drop and recreate database
mysql -u root -p
DROP DATABASE FS_Grievance_management;
CREATE DATABASE FS_Grievance_management;
EXIT;

# Re-run migration
./scripts/deployment-scripts.sh migrate
```

## 📦 Complete Package Structure

```
/
├── scripts/
│   └── deployment-scripts.sh    # All automation scripts
├── backend/
│   ├── routes.ts               # API endpoints
│   ├── storage.ts              # Database operations
│   └── seedComprehensiveData.ts # Data seeding
├── shared/
│   ├── schema.ts               # PostgreSQL schema
│   ├── schema-mysql.ts         # MySQL schema
│   └── database-config.ts      # Auto-detection logic
├── drizzle.mysql.config.ts     # MySQL Drizzle config
├── .env                        # Environment variables
└── package.json                # Dependencies
```

## 🎯 Quick Commands Reference

```bash
# Complete setup
./scripts/deployment-scripts.sh setup

# Individual steps
./scripts/deployment-scripts.sh mysql      # Setup MySQL
./scripts/deployment-scripts.sh env        # Create .env
./scripts/deployment-scripts.sh migrate    # Migrate schema
./scripts/deployment-scripts.sh seed       # Seed data

# Development
npm run dev                               # Start dev server
./scripts/deployment-scripts.sh db:studio # Database GUI

# Testing
./scripts/deployment-scripts.sh test-auth # Test auth
./scripts/deployment-scripts.sh verify    # Verify setup
```

## 🔒 Security Notes

1. **Change default passwords** in production
2. **Use environment variables** for all sensitive data
3. **Enable SSL/TLS** for database connections in production
4. **Implement rate limiting** (already configured)
5. **Regular backups** using `./scripts/deployment-scripts.sh db:backup`

## 📚 Additional Resources

- [LOCAL_DEPLOYMENT_GUIDE.md](./LOCAL_DEPLOYMENT_GUIDE.md) - Comprehensive deployment guide
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database architecture details
- [API Documentation](./docs/api.md) - Complete API reference

---

**Need help?** The system is designed to work seamlessly with MySQL. All APIs, authentication, and features remain exactly the same - only the database changes!