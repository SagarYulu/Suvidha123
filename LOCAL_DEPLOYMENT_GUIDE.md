# Yulu Employee Issue Management System - Local Deployment Guide

## 🚀 Complete Local Deployment Instructions

This guide provides step-by-step instructions for setting up the Yulu Employee Issue Management System locally with MySQL database.

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher  
- **MySQL**: Version 8.0 or higher
- **Git**: Latest version

### Check Prerequisites
```bash
node --version    # Should be 18.0+
npm --version     # Should be 8.0+
mysql --version   # Should be 8.0+
git --version     # Any recent version
```

---

## 🛠️ Technology Stack

### Frontend Stack
- **React 18** with TypeScript
- **Vite** (Build tool & dev server)
- **Tailwind CSS** (Styling)
- **React Router** (Client-side routing)
- **Axios** (API communication)
- **React Context API** (State management)
- **shadcn/ui** (UI components)
- **TanStack Query** (Server state management)

### Backend Stack
- **Node.js** with Express.js
- **TypeScript** (Type safety)
- **MySQL** with mysql2 driver
- **Drizzle ORM** (Database operations)
- **JWT** (Authentication)
- **bcrypt** (Password hashing)
- **WebSocket** (Real-time communication)

### Development Tools
- **tsx** (TypeScript execution)
- **nodemon** (Auto-restart)
- **ESBuild** (Fast bundling)
- **Drizzle Kit** (Database migrations)

---

## 📁 Project Structure

```
yulu-employee-system/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Route components
│   │   ├── services/          # API service layer
│   │   ├── contexts/          # React context providers
│   │   └── lib/               # Utility libraries
│   ├── public/                # Static assets
│   └── package.json
├── backend/                    # Express.js backend
│   ├── routes.ts              # API route handlers
│   ├── storage.ts             # Database operations
│   ├── middleware/            # Authentication & RBAC
│   ├── seedData.ts            # Database seeding
│   └── index.ts               # Server entry point
├── server/                     # Alternative backend structure
├── shared/                     # Shared types and schemas
│   ├── schema.ts              # PostgreSQL schema
│   ├── schema-mysql.ts        # MySQL schema
│   └── database-config.ts     # Database configuration
├── docs/                       # Documentation
├── .env                        # Environment variables
├── package.json               # Root dependencies
├── drizzle.config.ts          # PostgreSQL config
├── drizzle.mysql.config.ts    # MySQL config
└── migrate-dual.js            # Migration utility
```

---

## 🔧 Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd yulu-employee-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies (if separate)
cd frontend && npm install && cd ..

# Install backend dependencies (if separate)
cd backend && npm install && cd ..
```

### 3. MySQL Database Setup

#### Install MySQL (if not installed)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS with Homebrew
brew install mysql

# Windows
# Download MySQL installer from mysql.com
```

#### Start MySQL Service
```bash
# Ubuntu/Debian
sudo systemctl start mysql
sudo systemctl enable mysql

# macOS
brew services start mysql

# Windows
# Start MySQL service from Services panel
```

#### Create Database and User
```bash
# Login to MySQL as root
mysql -u root -p

# Create database
CREATE DATABASE FS_Grievance_management;

# Create user (optional - you can use root)
CREATE USER 'yulu_user'@'localhost' IDENTIFIED BY 'Yulu@123';
GRANT ALL PRIVILEGES ON FS_Grievance_management.* TO 'yulu_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

### 4. Environment Configuration

Create `.env` file in the root directory:
```bash
# Database Configuration
DATABASE_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Yulu@123
DB_NAME=FS_Grievance_management
DB_PORT=3306

# JWT Configuration
JWT_SECRET=FS_Grievance_Management_JWT_Secret_Key_2025_Yulu_Secure_Auth_Token
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL fallback (for production)
DATABASE_URL=postgresql://username:password@host:port/database
```

### 5. Database Schema Migration

#### Push Schema to Database
```bash
# Push MySQL schema to database
npm run db:push

# Alternative: Use migration utility
node migrate-dual.js setup
```

#### Verify Database Connection
```bash
# Test database connection
node migrate-dual.js check
```

### 6. Database Seeding

#### Seed with Sample Data
```bash
# Run comprehensive data seeding
npm run db:seed

# Or use the migration utility
node migrate-dual.js seed
```

#### Verify Data Seeding
```bash
# Check if data was seeded correctly
mysql -u root -p'Yulu@123' -D FS_Grievance_management -e "
SELECT COUNT(*) as employee_count FROM employees;
SELECT COUNT(*) as dashboard_user_count FROM dashboard_users;
SELECT COUNT(*) as issues_count FROM issues;
"
```

---

## 🚀 Running the Application

### Development Mode
```bash
# Start both frontend and backend
npm run dev

# The application will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
```

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 🔐 Authentication System

### JWT Configuration
- **Secret Key**: Configured in `.env` file
- **Token Expiry**: 24 hours
- **Hashing Algorithm**: HS256

### User Types
1. **Dashboard Users**: Admin interface access
2. **Employees**: Mobile interface access

### Test Credentials

#### Dashboard Access
```
Email: sagar.km@yulu.bike
Password: admin123
Role: Super Admin
```

#### Mobile Access
```
Email: chinnumalleshchinnu@gmail.com
Employee ID: XPH1884
Role: Mechanic
```

---

## 🗄️ Database Schema Overview

### Core Tables
- **employees**: Employee information and mobile access
- **dashboard_users**: Admin users for dashboard access
- **issues**: Issue tickets and management
- **issue_comments**: Public comments on issues
- **issue_internal_comments**: Internal admin comments
- **ticket_feedback**: Employee feedback on resolved issues
- **issue_audit_trail**: Activity logging and tracking

### Master Data Tables
- **master_roles**: System roles and permissions
- **master_cities**: City information
- **master_clusters**: Cluster/location mapping
- **role_permissions**: RBAC permission mappings
- **holidays**: Business hours calculation

### Key Features
- **Auto-increment IDs**: MySQL-compatible integer primary keys
- **Foreign Key Constraints**: Proper data integrity
- **Indexes**: Optimized query performance
- **JSON Fields**: Flexible data storage
- **Timestamp Tracking**: Created/updated timestamps

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Dashboard user login
- `POST /api/auth/mobile-verify` - Mobile employee verification
- `POST /api/auth/logout` - User logout

### Issue Management
- `GET /api/issues` - List issues with filtering
- `POST /api/issues` - Create new issue
- `PATCH /api/issues/:id` - Update issue status
- `GET /api/issues/:id/comments` - Get issue comments
- `POST /api/issues/:id/comments` - Add comment

### User Management
- `GET /api/dashboard-users` - List dashboard users
- `POST /api/dashboard-users` - Create dashboard user
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee

### Analytics
- `GET /api/sla/metrics` - SLA compliance metrics
- `GET /api/sla/alerts` - SLA breach alerts
- `GET /api/analytics/overview` - Dashboard overview

### Master Data
- `GET /api/master/roles` - System roles
- `GET /api/master/cities` - Cities list
- `GET /api/master/clusters` - Clusters list

---

## 🔧 Configuration Options

### Database Switching
The system supports both MySQL and PostgreSQL. Switch by updating `.env`:

```bash
# For MySQL
DATABASE_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Yulu@123
DB_NAME=FS_Grievance_management

# For PostgreSQL
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://username:password@host:port/database
```

### Environment Variables
- `NODE_ENV`: development/production
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: JWT signing secret
- `DATABASE_TYPE`: mysql/postgresql
- `DB_*`: MySQL connection parameters
- `DATABASE_URL`: PostgreSQL connection string

---

## 🛡️ Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Token Expiry**: 24-hour token validity
- **CORS Protection**: Cross-origin request security

### Authorization (RBAC)
- **Role-Based Access**: 8 distinct user roles
- **Permission System**: Granular permission control
- **City Restrictions**: Location-based access control
- **Route Protection**: Middleware-based endpoint security

### Data Security
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Parameterized queries
- **Rate Limiting**: API request throttling
- **Helmet.js**: Security headers

---

## 📊 Business Logic

### Issue Management
- **Priority Levels**: Low, Medium, High, Critical
- **Status Workflow**: Open → In Progress → Resolved → Closed
- **Assignment System**: Automatic and manual assignment
- **Comment System**: Public and internal comments

### SLA Management
- **Response Time Tracking**: First response monitoring
- **Resolution Time Tracking**: Issue resolution monitoring
- **Business Hours**: Indian Standard Time calculation
- **Holiday Management**: Government holiday exclusions

### Analytics
- **Real-time Dashboards**: Live data visualization
- **Trend Analysis**: Historical data insights
- **Compliance Reporting**: SLA adherence tracking
- **Sentiment Analysis**: Feedback sentiment scoring

---

## 🔄 Data Migration

### From PostgreSQL to MySQL
```bash
# 1. Export PostgreSQL data
pg_dump -U username -d database_name > postgres_backup.sql

# 2. Convert schema (manual process)
# Update data types, syntax differences

# 3. Import to MySQL
mysql -u root -p'Yulu@123' FS_Grievance_management < mysql_converted.sql
```

### Seed Data Migration
```bash
# Run original data seeding
node backend/seedOriginalData.js

# Or use comprehensive seeding
node backend/seedComprehensiveData.js
```

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check MySQL service
sudo systemctl status mysql

# Check credentials
mysql -u root -p'Yulu@123'

# Check database exists
SHOW DATABASES;
```

#### JWT Authentication Errors
```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Check token generation
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sagar.km@yulu.bike","password":"admin123"}'
```

#### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Use different port
PORT=5001 npm run dev
```

#### Schema Push Failed
```bash
# Check database connection
node migrate-dual.js check

# Force push schema
npm run db:push -- --force
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# MySQL query logging
DEBUG=mysql npm run dev
```

---

## 📈 Performance Optimization

### Database Optimization
- **Connection Pooling**: Configured for optimal performance
- **Indexes**: Strategic indexing on frequently queried fields
- **Query Optimization**: Efficient JOIN operations
- **Caching**: Redis integration ready

### Frontend Optimization
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Vite optimizations
- **Image Optimization**: Efficient asset handling
- **Caching**: API response caching

### Backend Optimization
- **Compression**: Gzip response compression
- **Rate Limiting**: API request throttling
- **WebSocket Optimization**: Efficient real-time communication
- **Memory Management**: Garbage collection optimization

---

## 🚀 Production Deployment

### Build Process
```bash
# Build frontend
npm run build

# Build backend
npm run build:server

# Start production
npm start
```

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
PORT=80
JWT_SECRET=<strong-production-secret>
DATABASE_TYPE=mysql
DB_HOST=<production-host>
DB_USER=<production-user>
DB_PASSWORD=<production-password>
DB_NAME=<production-database>
```

### Security Checklist
- [ ] Change default JWT secret
- [ ] Update database credentials
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Enable logging
- [ ] Configure backups

---

## 📚 Additional Resources

### Documentation
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Frontend Architecture](./docs/frontend.md)
- [Backend Architecture](./docs/backend.md)

### Available npm Scripts
```bash
# Core Development Scripts (Available in package.json)
npm run dev              # Start development server
npm run build            # Build for production  
npm run start            # Start production server
npm run check            # TypeScript type checking
npm run db:push          # Push schema to PostgreSQL (default)

# Extended Database Scripts (Use deployment script)
./scripts/deployment-scripts.sh db:push      # Push schema to MySQL
./scripts/deployment-scripts.sh db:generate  # Generate migrations
./scripts/deployment-scripts.sh db:studio    # Open database studio
./scripts/deployment-scripts.sh db:check     # Check database connection
./scripts/deployment-scripts.sh db:backup    # Backup database
./scripts/deployment-scripts.sh db:restore   # Restore database

# Manual Database Commands
drizzle-kit push --config=drizzle.mysql.config.ts     # Push MySQL schema
drizzle-kit generate --config=drizzle.mysql.config.ts # Generate MySQL migrations
drizzle-kit studio --config=drizzle.mysql.config.ts   # Open MySQL studio
tsx backend/seedComprehensiveData.ts                  # Seed database
node migrate-dual.js setup                            # Complete setup
node migrate-dual.js check                            # Check connection
```

### Quick Setup Commands
```bash
# One-command complete setup
./scripts/deployment-scripts.sh setup

# Step-by-step setup
./scripts/deployment-scripts.sh install    # Install dependencies
./scripts/deployment-scripts.sh env        # Create .env file
./scripts/deployment-scripts.sh mysql      # Setup MySQL database
./scripts/deployment-scripts.sh migrate    # Migrate schema
./scripts/deployment-scripts.sh seed       # Seed data

# Verification
./scripts/deployment-scripts.sh test-auth  # Test authentication
./scripts/deployment-scripts.sh verify     # Verify deployment
```

### Support
For issues or questions:
1. Check this documentation
2. Review error logs
3. Verify environment configuration
4. Check database connectivity
5. Validate JWT configuration

---

## 🎯 Success Verification

After completing the setup, verify everything works:

1. **Database Connection**: Tables created successfully
2. **Authentication**: Both dashboard and mobile login work
3. **API Endpoints**: All endpoints respond correctly
4. **Frontend**: React app loads without errors
5. **WebSocket**: Real-time features functional
6. **RBAC**: Role-based access working
7. **Analytics**: Dashboard displays data correctly

### Final Test
```bash
# Test dashboard login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sagar.km@yulu.bike","password":"admin123"}'

# Test mobile login
curl -X POST http://localhost:5000/api/auth/mobile-verify \
  -H "Content-Type: application/json" \
  -d '{"email":"chinnumalleshchinnu@gmail.com","employeeId":"XPH1884"}'

# Test protected endpoint
curl -X GET http://localhost:5000/api/issues \
  -H "Authorization: Bearer <token-from-login>"
```

If all tests pass, your local deployment is successful! 🎉

---

*This guide serves as a comprehensive reference for local deployment of the Yulu Employee Issue Management System. Keep it updated as the system evolves.*