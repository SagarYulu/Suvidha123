# Technical Documentation
## Yulu Employee Grievance Management System

### Document Version: 1.0
### Date: January 2025
### Status: Final for Deployment

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────┬───────────────────────────────────────┤
│   Employee Mobile App   │        Admin Dashboard                 │
│   (React + Tailwind)    │      (React + Tailwind)              │
└─────────────────────────┴───────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                    Express.js Server                             │
│                     (Port 5000)                                  │
│  ┌─────────────┬──────────────┬──────────────┬──────────────┐ │
│  │   Routes    │  Middleware  │  Controllers │   Services   │ │
│  └─────────────┴──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    │                                │
┌───────────────────▼──────────┐  ┌─────────────────▼────────────┐
│        DATA LAYER            │  │    REAL-TIME LAYER           │
├──────────────────────────────┤  ├──────────────────────────────┤
│   PostgreSQL / MySQL         │  │     WebSocket Server         │
│   (Drizzle ORM)             │  │    (Socket.io)               │
└──────────────────────────────┘  └──────────────────────────────┘
```

### 1.2 Technology Stack

#### Frontend Technologies
```yaml
Framework: React 18.2.0
Build Tool: Vite 5.0
Styling: 
  - Tailwind CSS 3.4
  - shadcn/ui components
  - Radix UI primitives
State Management: 
  - React Context API
  - TanStack Query v5
Routing: Wouter 3.0
Form Handling: React Hook Form + Zod
HTTP Client: Axios
Real-time: WebSocket API
TypeScript: 5.0+
```

#### Backend Technologies
```yaml
Runtime: Node.js 20.18.1
Framework: Express.js 4.18
Language: TypeScript 5.0
ORM: Drizzle ORM
Databases: 
  - PostgreSQL 15 (Primary)
  - MySQL 8.0 (Alternative)
Authentication: JWT (jsonwebtoken)
Password Hashing: bcrypt
Session Management: express-session
WebSocket: ws library
API Documentation: Swagger/OpenAPI 3.0
Process Manager: PM2 (production)
```

#### DevOps & Tools
```yaml
Version Control: Git
Package Manager: npm 10.0+
Code Quality: ESLint + Prettier
Testing: Vitest (planned)
Build System: ESBuild
Environment: dotenv
Logging: Console + File logging
Monitoring: Health checks endpoint
```

## 2. Project Structure

### 2.1 Directory Structure
```
yulu-grievance-system/
├── client/                      # Frontend React application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── layouts/       # Layout components
│   │   │   ├── mobile/        # Mobile-specific components
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── contexts/          # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin pages
│   │   │   └── mobile/       # Mobile pages
│   │   ├── services/         # API service functions
│   │   └── App.tsx           # Main application component
│   └── index.html             # Entry HTML file
│
├── server/                     # Backend Express application
│   ├── config/                # Configuration files
│   │   ├── db.ts             # Database connection
│   │   └── jwt.ts            # JWT configuration
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── employee.controller.ts
│   │   └── issue.controller.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts           # JWT authentication
│   │   ├── rbac.ts           # Role-based access
│   │   └── filter.ts         # Data filtering
│   ├── models/               # Data models
│   │   ├── Employee.ts
│   │   ├── DashboardUser.ts
│   │   └── Issue.ts
│   ├── routes/               # API routes
│   │   ├── auth.routes.ts
│   │   ├── employee.routes.ts
│   │   └── issue.routes.ts
│   ├── services/             # Business logic
│   │   ├── storage.ts        # Database operations
│   │   └── websocket.ts      # WebSocket service
│   ├── utils/                # Helper functions
│   │   └── sla.ts           # SLA calculations
│   ├── index.ts             # Server entry point
│   └── routes.ts            # Route registration
│
├── shared/                    # Shared code
│   ├── schema.ts            # PostgreSQL schema
│   ├── schema-mysql.ts      # MySQL schema
│   └── types.ts             # TypeScript types
│
├── docs/                     # Documentation
│   ├── BRD_Business_Requirements_Document.md
│   ├── PRD_Product_Requirements_Document.md
│   └── Technical_Documentation.md
│
├── Local deployment mYsql/   # MySQL deployment files
│   ├── create_tables.sql
│   ├── seed_data.sql
│   └── ... (15 more files)
│
├── swagger/                  # API documentation
│   └── swagger.json
│
├── scripts/                  # Utility scripts
│   └── deployment-scripts.sh
│
├── package.json             # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── .env.example            # Environment variables template
└── README.md               # Project documentation
```

### 2.2 Key Files Description

#### Configuration Files
- **package.json**: Dependencies and scripts
- **tsconfig.json**: TypeScript compiler options
- **vite.config.ts**: Frontend build configuration
- **drizzle.config.ts**: Database ORM configuration
- **.env**: Environment variables (not in Git)

#### Database Schema Files
- **shared/schema.ts**: PostgreSQL table definitions
- **shared/schema-mysql.ts**: MySQL table definitions
- **drizzle/**: Generated migration files

## 3. Database Design

### 3.1 Entity Relationship Diagram
```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  employees   │     │ dashboard_users │     │    issues    │
├──────────────┤     ├─────────────────┤     ├──────────────┤
│ id (PK)      │     │ id (PK)         │     │ id (PK)      │
│ user_id      │     │ name            │     │ employee_id  │◄─┐
│ name         │     │ email           │  ┌─►│ assigned_to  │  │
│ email        │     │ password        │  │  │ type_id      │  │
│ emp_id       │     │ role            │  │  │ sub_type_id  │  │
│ city         │     └─────────────────┘  │  │ status       │  │
│ cluster      │              │           │  │ priority     │  │
└──────────────┘              │           │  └──────────────┘  │
       │                      │           │          │         │
       │                      ▼           │          │         │
       │              ┌───────────────┐  │          ▼         │
       │              │ rbac_user_roles│  │   ┌──────────────┐│
       │              ├───────────────┤  │   │issue_comments││
       │              │ user_id (FK)   │  │   ├──────────────┤│
       │              │ role_id (FK)   │  │   │ id (PK)      ││
       │              └───────────────┘  │   │ issue_id (FK)││
       │                      │           │   │ employee_id  ││
       │                      ▼           │   │ content      ││
       │              ┌───────────────┐  │   └──────────────┘│
       │              │  rbac_roles    │  │                   │
       │              ├───────────────┤  │                   │
       │              │ id (PK)        │  │                   │
       │              │ name           │  │                   │
       │              │ description    │  │                   │
       │              └───────────────┘  │                   │
       │                                  │                   │
       └──────────────────────────────────┴───────────────────┘
```

### 3.2 Database Tables

#### Core Tables (18 total)
1. **employees** - Field employee records
2. **dashboard_users** - Admin user records
3. **issues** - Grievance tickets
4. **issue_comments** - Public comments
5. **issue_internal_comments** - Private admin notes
6. **issue_audit_trail** - Change history
7. **issue_notifications** - User notifications
8. **ticket_feedback** - Resolution feedback
9. **rbac_roles** - Role definitions
10. **rbac_permissions** - Permission definitions
11. **rbac_role_permissions** - Role-permission mapping
12. **rbac_user_roles** - User-role assignments
13. **master_roles** - Master role data
14. **master_cities** - City list
15. **master_clusters** - Cluster list
16. **dashboard_user_audit_logs** - Admin activity logs
17. **master_audit_logs** - Master data changes
18. **holidays** - Holiday calendar

### 3.3 Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_employee_id ON issues(employee_id);
CREATE INDEX idx_issues_created_at ON issues(created_at);
CREATE INDEX idx_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_emp_id ON employees(emp_id);

-- Composite indexes
CREATE INDEX idx_issues_status_priority ON issues(status, priority);
CREATE INDEX idx_rbac_user_role ON rbac_user_roles(user_id, role_id);
```

## 4. API Documentation

### 4.1 API Overview
- **Base URL**: `https://[domain]/api`
- **Authentication**: Bearer token (JWT)
- **Content-Type**: `application/json`
- **Rate Limiting**: 100 requests/minute

### 4.2 Complete API Endpoints

#### Authentication APIs (4 endpoints)
```http
POST   /api/auth/login
POST   /api/auth/mobile-verify
GET    /api/auth/verify
POST   /api/auth/logout
```

#### Employee APIs (12 endpoints)
```http
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
POST   /api/employees/bulk
GET    /api/employees/export
GET    /api/employee/profile
PATCH  /api/employee/profile
GET    /api/employees/search
GET    /api/employees/by-city/:city
GET    /api/employees/by-cluster/:cluster
```

#### Dashboard User APIs (10 endpoints)
```http
GET    /api/dashboard-users
GET    /api/dashboard-users/:id
POST   /api/dashboard-users
PUT    /api/dashboard-users/:id
DELETE /api/dashboard-users/:id
POST   /api/dashboard-users/bulk
GET    /api/dashboard-users/export
PATCH  /api/dashboard-users/:id/password
GET    /api/dashboard-users/roles
GET    /api/dashboard-users/activity-logs
```

#### Issue Management APIs (15 endpoints)
```http
GET    /api/issues
GET    /api/issues/:id
POST   /api/issues
PATCH  /api/issues/:id
DELETE /api/issues/:id
GET    /api/issues/my/issues
POST   /api/issues/:id/assign
POST   /api/issues/:id/close
POST   /api/issues/:id/reopen
GET    /api/issues/:id/timeline
GET    /api/issues/:id/attachments
POST   /api/issues/:id/attachments
GET    /api/issues/export
GET    /api/issues/by-status/:status
GET    /api/issues/sla-breached
```

#### Comment APIs (6 endpoints)
```http
GET    /api/issues/:id/comments
POST   /api/issues/:id/comments
GET    /api/issues/:id/internal-comments
POST   /api/issues/:id/internal-comments
PUT    /api/comments/:id
DELETE /api/comments/:id
```

#### Feedback APIs (5 endpoints)
```http
GET    /api/feedback
GET    /api/feedback/:issueId
POST   /api/feedback
GET    /api/feedback/by-agent/:agentId
GET    /api/feedback/export
```

#### Analytics APIs (8 endpoints)
```http
GET    /api/analytics/dashboard
GET    /api/analytics/issues
GET    /api/analytics/feedback
GET    /api/analytics/sla
GET    /api/analytics/tat
GET    /api/analytics/trends
GET    /api/analytics/agent-performance
POST   /api/analytics/generate-report
```

#### Master Data APIs (12 endpoints)
```http
GET    /api/master-data/roles
POST   /api/master-data/roles
PUT    /api/master-data/roles/:id
DELETE /api/master-data/roles/:id
GET    /api/master-data/cities
POST   /api/master-data/cities
PUT    /api/master-data/cities/:id
DELETE /api/master-data/cities/:id
GET    /api/master-data/clusters
POST   /api/master-data/clusters
PUT    /api/master-data/clusters/:id
DELETE /api/master-data/clusters/:id
```

#### RBAC APIs (10 endpoints)
```http
GET    /api/rbac/roles
GET    /api/rbac/permissions
GET    /api/rbac/roles/:id/permissions
POST   /api/rbac/roles/:id/permissions
DELETE /api/rbac/roles/:id/permissions/:permId
GET    /api/rbac/users/:id/roles
POST   /api/rbac/users/:id/roles
DELETE /api/rbac/users/:id/roles/:roleId
GET    /api/rbac/users/:id/permissions
GET    /api/rbac/check-access
```

#### Holiday APIs (5 endpoints)
```http
GET    /api/holidays
GET    /api/holidays/:id
POST   /api/holidays
PUT    /api/holidays/:id
DELETE /api/holidays/:id
```

#### System APIs (4 endpoints)
```http
GET    /api/health
GET    /api/system/info
GET    /api/system/logs
POST   /api/system/clear-cache
```

### 4.3 Swagger Documentation
- **URL**: `https://[domain]/api-docs`
- **Specification**: OpenAPI 3.0
- **Features**:
  - Interactive API testing
  - Request/Response examples
  - Authentication testing
  - Schema validation

### 4.4 WebSocket Events

#### Client Events
```javascript
// Connection
socket.emit('authenticate', { token: 'JWT_TOKEN' });
socket.emit('join-issue', { issueId: 123 });
socket.emit('leave-issue', { issueId: 123 });

// Communication
socket.emit('typing', { issueId: 123, isTyping: true });
socket.emit('comment', { issueId: 123, content: 'Message' });
socket.emit('status-change', { issueId: 123, status: 'resolved' });
```

#### Server Events
```javascript
// Connection
socket.on('authenticated', { userId, name });
socket.on('joined-issue', { issueId });
socket.on('error', { message });

// Updates
socket.on('comment-added', { comment });
socket.on('user-typing', { userId, name, isTyping });
socket.on('status-changed', { issueId, status, changedBy });
socket.on('user-joined', { userId, name });
socket.on('user-left', { userId });
```

## 5. CRUD Operations

### 5.1 Employee CRUD
```typescript
// CREATE
async createEmployee(data: InsertEmployee): Promise<Employee> {
  // Hash password
  data.password = await bcrypt.hash(data.password, 10);
  // Insert into database
  const [result] = await db.insert(employees).values(data).returning();
  return result;
}

// READ
async getEmployees(filters?: EmployeeFilters): Promise<Employee[]> {
  let query = db.select().from(employees);
  if (filters?.city) {
    query = query.where(eq(employees.city, filters.city));
  }
  return await query;
}

// UPDATE
async updateEmployee(id: number, data: Partial<Employee>): Promise<Employee> {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  const [result] = await db.update(employees)
    .set(data)
    .where(eq(employees.id, id))
    .returning();
  return result;
}

// DELETE
async deleteEmployee(id: number): Promise<boolean> {
  const result = await db.delete(employees)
    .where(eq(employees.id, id));
  return result.count > 0;
}
```

### 5.2 Issue CRUD with Business Logic
```typescript
// CREATE with auto-assignment
async createIssue(data: CreateIssueDto): Promise<Issue> {
  // Auto-assign based on type and location
  const assignee = await this.getAssignee(data.typeId, data.employeeCity);
  
  const issue = await db.insert(issues).values({
    ...data,
    assignedTo: assignee?.id,
    status: 'open',
    createdAt: new Date()
  }).returning();
  
  // Create audit trail
  await this.createAuditLog(issue.id, 'created', null, 'open');
  
  // Send notifications
  await this.notifyAssignee(assignee, issue);
  
  return issue;
}

// UPDATE with SLA tracking
async updateIssueStatus(id: number, status: string): Promise<Issue> {
  const oldIssue = await this.getIssueById(id);
  
  // Update timestamps based on status
  const updates: any = { status };
  if (status === 'in_progress' && !oldIssue.firstResponseAt) {
    updates.firstResponseAt = new Date();
  }
  if (status === 'resolved') {
    updates.resolvedAt = new Date();
  }
  
  // Check SLA breach
  const slaBreached = await this.checkSLABreach(oldIssue, updates);
  updates.slaBreached = slaBreached;
  
  const [result] = await db.update(issues)
    .set(updates)
    .where(eq(issues.id, id))
    .returning();
    
  // Create audit trail
  await this.createAuditLog(id, 'status_change', oldIssue.status, status);
  
  return result;
}
```

## 6. Authentication & Authorization

### 6.1 JWT Implementation
```typescript
// Token generation
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      type: user.type // 'employee' or 'dashboard_user'
    },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
}

// Token verification middleware
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
```

### 6.2 RBAC Implementation
```typescript
// Permission checking
export async function checkPermission(userId: number, permission: string): Promise<boolean> {
  const userPermissions = await db.query.rbacUserRoles.findMany({
    where: eq(rbacUserRoles.userId, userId),
    with: {
      role: {
        with: {
          permissions: true
        }
      }
    }
  });
  
  return userPermissions.some(ur => 
    ur.role.permissions.some(p => p.name === permission)
  );
}

// RBAC middleware
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const hasPermission = await checkPermission(req.user.id, permission);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

## 7. Performance Optimizations

### 7.1 Database Optimizations
```typescript
// Connection pooling
const pool = new Pool({
  max: 20,                  // Maximum connections
  idleTimeoutMillis: 30000, // Close idle connections
  connectionTimeoutMillis: 2000,
});

// Query optimization with indexes
const issues = await db.select()
  .from(issues)
  .where(and(
    eq(issues.status, 'open'),
    gte(issues.createdAt, lastWeek)
  ))
  .orderBy(desc(issues.priority))
  .limit(50);

// Batch operations
const batchInsert = await db.insert(employees)
  .values(employeeList)
  .onConflictDoNothing();
```

### 7.2 Caching Strategy
```typescript
// In-memory cache for frequent data
const cache = new Map();

export async function getCachedMasterData(key: string) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetchMasterData(key);
  cache.set(key, data);
  
  // Clear cache after 5 minutes
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);
  
  return data;
}
```

### 7.3 Frontend Optimizations
```typescript
// React Query for data caching
const { data: issues } = useQuery({
  queryKey: ['issues', filters],
  queryFn: () => fetchIssues(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// Lazy loading components
const Analytics = lazy(() => import('./pages/Analytics'));

// Image optimization
<img 
  src={imageUrl} 
  loading="lazy"
  decoding="async"
  alt="Issue attachment"
/>
```

## 8. Security Measures

### 8.1 Input Validation
```typescript
// Zod schemas for validation
const createIssueSchema = z.object({
  typeId: z.string().min(1),
  subTypeId: z.string().min(1),
  description: z.string().min(20).max(1000),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  attachments: z.array(z.string()).max(3).optional()
});

// Validation middleware
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: error.errors });
    }
  };
}
```

### 8.2 Security Headers
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### 8.3 SQL Injection Prevention
```typescript
// Using parameterized queries with Drizzle
const user = await db.select()
  .from(employees)
  .where(eq(employees.email, userInput)) // Safe from SQL injection
  .limit(1);

// Never use string concatenation
// BAD: `SELECT * FROM users WHERE email = '${userInput}'`
// GOOD: Drizzle ORM handles parameterization automatically
```

## 9. Deployment Configuration

### 9.1 Environment Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://user:pass@host:5432/db  # PostgreSQL
# OR
DATABASE_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=yulu_user
DB_PASSWORD=YuluSecurePass123!
DB_NAME=yulu_grievance_db

# Application Configuration
NODE_ENV=production
PORT=5000
BASE_URL=https://grievance.yulu.com

# Security
JWT_SECRET=your-256-bit-secret-key-here
SESSION_SECRET=your-session-secret-key
BCRYPT_ROUNDS=10

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@yulu.com
SMTP_PASS=app-specific-password

# File Upload
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_DIR=./uploads

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=info
```

### 9.2 Production Build Process
```bash
# Build frontend
npm run build:client
# Output: dist/client/

# Build backend
npm run build:server
# Output: dist/server/

# Combined build
npm run build
```

### 9.3 Server Requirements
```yaml
Minimum Requirements:
  CPU: 2 cores
  RAM: 4GB
  Storage: 20GB SSD
  OS: Ubuntu 20.04 LTS
  
Recommended:
  CPU: 4 cores
  RAM: 8GB
  Storage: 50GB SSD
  Database: Separate server
  
Software:
  Node.js: 20.18.1
  npm: 10.0+
  PostgreSQL: 15+ OR MySQL: 8.0+
  nginx: 1.18+ (reverse proxy)
  PM2: 5.0+ (process manager)
  SSL: Let's Encrypt
```

## 10. Migration Guide

### 10.1 PostgreSQL to MySQL Migration
```bash
# 1. Export PostgreSQL data
pg_dump -h localhost -U postgres yulu_db > postgres_backup.sql

# 2. Run migration script
cd "Local deployment mYsql"
./migration-from-postgresql.sh

# 3. Update environment variables
DATABASE_TYPE=mysql
# Update connection details

# 4. Test connection
npm run mysql:test

# 5. Verify data
mysql -u yulu_user -p yulu_grievance_db -e "SELECT COUNT(*) FROM employees;"
```

### 10.2 Code Changes for MySQL
```typescript
// Update imports
import * as schema from '@/shared/schema-mysql';
import { mysqlHelpers } from '@/server/config/db-mysql';

// Update array operations
// PostgreSQL: WHERE tags @> ARRAY['urgent']
// MySQL: WHERE JSON_CONTAINS(tags, '"urgent"')

// Update date operations
// PostgreSQL: created_at > NOW() - INTERVAL '7 days'
// MySQL: created_at > NOW() - INTERVAL 7 DAY
```

## 11. Monitoring & Maintenance

### 11.1 Health Check Endpoint
```typescript
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected',
    memory: process.memoryUsage(),
  };
  
  try {
    // Check database connection
    await db.select().from(employees).limit(1);
  } catch (error) {
    health.status = 'unhealthy';
    health.database = 'disconnected';
  }
  
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});
```

### 11.2 Logging Strategy
```typescript
// Structured logging
const log = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: error?.message,
      stack: error?.stack
    }));
  }
};

// Usage
log.info('Issue created', { issueId: 123, userId: 456 });
```

### 11.3 Backup Strategy
```bash
# Automated daily backups
0 2 * * * /usr/bin/pg_dump -U postgres yulu_db | gzip > /backups/yulu_$(date +\%Y\%m\%d).sql.gz

# MySQL backup
0 2 * * * /usr/bin/mysqldump -u yulu_user -p$DB_PASS yulu_grievance_db | gzip > /backups/yulu_$(date +\%Y\%m\%d).sql.gz

# Cleanup old backups (keep 30 days)
0 3 * * * find /backups -name "*.sql.gz" -mtime +30 -delete
```

## 12. Package Dependencies

### 12.1 Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "wouter": "^3.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "date-fns": "^3.0.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "@radix-ui/react-*": "latest"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 12.2 Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.0",
    "express-session": "^1.17.0",
    "dotenv": "^16.3.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "drizzle-orm": "latest",
    "pg": "^8.11.0",
    "mysql2": "^3.6.0",
    "ws": "^8.16.0",
    "zod": "^3.22.0",
    "multer": "^1.4.5",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/ws": "^8.5.0",
    "tsx": "^4.6.0",
    "typescript": "^5.0.0",
    "drizzle-kit": "latest",
    "nodemon": "^3.0.0"
  }
}
```

## 13. API Integration Examples

### 13.1 Frontend API Client
```typescript
// services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 13.2 API Usage Examples
```typescript
// Create issue
export async function createIssue(data: CreateIssueDto) {
  const response = await apiClient.post('/issues', data);
  return response.data;
}

// Get issues with filters
export async function getIssues(filters: IssueFilters) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  
  const response = await apiClient.get(`/issues?${params}`);
  return response.data;
}

// Real-time updates
export function subscribeToIssue(issueId: number) {
  const ws = new WebSocket(`wss://${window.location.host}/ws`);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'authenticate',
      token: localStorage.getItem('token')
    }));
    ws.send(JSON.stringify({
      type: 'join-issue',
      issueId
    }));
  };
  
  return ws;
}
```

## 14. Testing Strategy

### 14.1 Unit Testing
```typescript
// Example test for SLA calculation
describe('SLA Calculation', () => {
  it('should calculate business hours correctly', () => {
    const start = new Date('2025-01-06 09:00:00'); // Monday 9 AM
    const end = new Date('2025-01-06 17:00:00');   // Monday 5 PM
    
    const hours = calculateBusinessHours(start, end);
    expect(hours).toBe(8);
  });
  
  it('should exclude weekends', () => {
    const start = new Date('2025-01-10 17:00:00'); // Friday 5 PM
    const end = new Date('2025-01-13 09:00:00');   // Monday 9 AM
    
    const hours = calculateBusinessHours(start, end);
    expect(hours).toBe(0); // Weekend excluded
  });
});
```

### 14.2 API Testing
```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yulu.com","password":"admin123"}'

# Test issue creation
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "typeId":"salary",
    "subTypeId":"salary-not-received",
    "description":"Salary not credited for last month",
    "priority":"high"
  }'
```

## 15. Troubleshooting Guide

### 15.1 Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL
sudo systemctl status postgresql
psql -U postgres -c "SELECT 1"

# Check MySQL
sudo systemctl status mysql
mysql -u root -p -e "SELECT 1"

# Verify credentials in .env
cat .env | grep DATABASE
```

#### JWT Token Issues
```typescript
// Debug token
const token = req.headers.authorization?.split(' ')[1];
console.log('Token:', token);

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  console.log('Decoded:', decoded);
} catch (error) {
  console.error('JWT Error:', error.message);
}
```

#### WebSocket Connection Issues
```javascript
// Client-side debugging
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = (event) => {
  console.log('WebSocket closed:', event.code, event.reason);
};

// Server-side debugging
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});
```

### 15.2 Performance Issues

#### Slow Queries
```sql
-- Identify slow queries (PostgreSQL)
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_issues_employee_status 
ON issues(employee_id, status);
```

#### Memory Leaks
```typescript
// Monitor memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  console.log(`Memory: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
}, 60000);

// Clean up connections
process.on('SIGTERM', async () => {
  await db.$pool.end();
  wss.close();
  process.exit(0);
});
```

## 16. Future Considerations

### 16.1 Scalability Plan
1. **Horizontal Scaling**: Load balancer with multiple app servers
2. **Database Scaling**: Read replicas for analytics
3. **Caching Layer**: Redis for session and data caching
4. **CDN**: Static asset delivery
5. **Microservices**: Separate services for analytics, notifications

### 16.2 Technology Upgrades
1. **GraphQL**: For flexible data fetching
2. **Kubernetes**: Container orchestration
3. **Message Queue**: RabbitMQ for async processing
4. **Search Engine**: Elasticsearch for full-text search
5. **AI/ML**: Predictive analytics and auto-categorization

---

**Document Approval**

Technical Lead: _________________  
DevOps Lead: _________________  
Security Lead: _________________  
Date: January 2025

**Version History**
- v1.0 - Initial release (January 2025)