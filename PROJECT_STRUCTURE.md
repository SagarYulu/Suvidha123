# Yulu Employee Issue Management System - Project Structure

## Overview
This is a full-stack web application with Node.js/Express backend, React frontend, and PostgreSQL database.

## Directory Structure

**Note:** While the directories are named `client/` and `server/` for compatibility with existing build tools, they function as FRONTEND and BACKEND respectively.

```
yulu-employee-management/
├── 📁 client/                  # FRONTEND (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components and routes
│   │   ├── services/           # API services and data layer
│   │   ├── hooks/              # Custom React hooks
│   │   ├── contexts/           # React context providers
│   │   ├── utils/              # Utility functions
│   │   └── types/              # TypeScript definitions
│   ├── index.html
│   └── public/
│
├── 📁 server/                  # BACKEND (Node.js + Express + TypeScript)
│   ├── index.ts               # Main application entry point
│   ├── routes.ts              # API routes and endpoints
│   ├── db.ts                  # Database connection
│   ├── storage.ts             # Database abstraction layer
│   ├── middleware/            # Auth, RBAC, city filtering
│   └── utils/                 # Backend utilities
│
├── 📁 shared/                  # Database Schema & Types
│   ├── schema.ts              # Complete database schema (Drizzle)
│   ├── businessHoursUtils.ts  # Business logic utilities
│   └── holidays.ts            # Holiday calendar management
│
├── 📁 docs/                   # Documentation
│   ├── frontend/              # Frontend architecture docs
│   ├── backend/               # Backend architecture docs
│   └── database/              # Database schema docs
│
├── drizzle.config.ts          # Database configuration
├── migrate.js                 # Production migration script
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── replit.md                  # Project status and changelog
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and build
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management

### Backend
- **Node.js** with TypeScript
- **Express.js** web framework
- **PostgreSQL** database
- **Drizzle ORM** for database management
- **JWT** authentication
- **WebSocket** for real-time features
- **RBAC** (Role-Based Access Control)

### Database
- **PostgreSQL** hosted on Neon
- **16 tables** with comprehensive schema
- **Auto-increment integer IDs**
- **Foreign key constraints**
- **RBAC system** with roles and permissions
- **SLA tracking** and business hours calculation

## Key Features

### Authentication & Authorization
- Separate login systems for employees and dashboard users
- JWT-based authentication
- Role-based access control with 8 distinct roles
- City-based access restrictions
- Permission-based feature access

### Issue Management
- Comprehensive issue tracking system
- Priority levels (low, medium, high, critical)
- Status tracking (open, in_progress, resolved, closed)
- Assignment and escalation workflows
- Comment system with internal/external comments
- Real-time WebSocket updates

### Analytics & Reporting
- SLA compliance tracking
- Business hours calculations
- Trend analysis and metrics
- Feedback sentiment analysis
- Export functionality
- Real-time dashboards

### User Management
- Employee profile management
- Dashboard user administration
- Bulk user upload with CSV validation
- City and cluster organization
- Role and permission management

## Development Commands

```bash
# Start development server
npm run dev

# Database operations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio

# Production migration
node migrate.js setup
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Unified login for all users
- `POST /api/auth/mobile-verify` - Mobile employee verification

### User Management
- `/api/employees/` - Employee CRUD operations
- `/api/dashboard-users/` - Dashboard user management
- `/api/employees/bulk` - Bulk employee upload
- `/api/dashboard-users/bulk` - Bulk dashboard user upload

### Issue Management
- `/api/issues/` - Issue tracking and management
- `/api/issues/:id/comments` - Issue comments
- `/api/issues/:id/internal-comments` - Internal comments

### RBAC System
- `/api/rbac/roles` - Role management
- `/api/rbac/permissions` - Permission management
- `/api/rbac/user-roles` - User role assignments

### Analytics
- `/api/sla/metrics` - SLA compliance metrics
- `/api/sla/alerts` - SLA breach detection
- `/api/analytics/` - Various analytics endpoints

### Master Data
- `/api/master/roles` - Employee role definitions
- `/api/master/cities` - City management
- `/api/master/clusters` - Cluster-city relationships

## Deployment

The application is designed for Replit deployment with:
- Single-port configuration (frontend and backend on port 5000)
- Environment variable configuration
- PostgreSQL database integration
- Production-ready security middleware