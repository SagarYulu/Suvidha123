# MVC Architecture Implementation

## Overview
The backend has been refactored into a clean Model-View-Controller (MVC) architecture for better organization, maintainability, and scalability.

## Directory Structure

```
server/
├── models/                 # Data Access Layer
│   ├── Employee.ts        # Employee data operations
│   ├── DashboardUser.ts   # Dashboard user operations
│   ├── Issue.ts           # Issue management operations
│   └── index.ts           # Model exports
│
├── controllers/           # Business Logic Layer
│   ├── authController.ts  # Authentication logic
│   ├── employeeController.ts # Employee management
│   ├── issueController.ts # Issue management
│   └── index.ts          # Controller exports
│
├── routes/               # API Route Definitions
│   ├── authRoutes.ts     # /api/auth/*
│   ├── employeeRoutes.ts # /api/employees/*
│   ├── issueRoutes.ts    # /api/issues/*
│   └── index.ts          # Route aggregator
│
├── middleware/           # Middleware Functions
│   ├── auth.ts          # JWT authentication
│   ├── rbac.ts          # Role-based access control
│   └── cityFilter.ts    # City-based filtering
│
├── services/            # Business Services (to be implemented)
│   ├── authService.ts   # Authentication services
│   ├── emailService.ts  # Email notifications
│   └── slaService.ts    # SLA calculations
│
└── index.ts            # Server entry point
```

## Architecture Benefits

### 1. Separation of Concerns
- **Models**: Handle all database operations
- **Controllers**: Contain business logic
- **Routes**: Define API endpoints
- **Middleware**: Handle cross-cutting concerns

### 2. Maintainability
- Each component has a single responsibility
- Easy to locate and modify specific functionality
- Clear dependencies between layers

### 3. Testability
- Models can be tested with database mocks
- Controllers can be tested independently
- Routes can be tested with supertest

### 4. Scalability
- Easy to add new models, controllers, and routes
- Services layer for shared business logic
- Clear extension points for new features

## API Routes Structure

### Authentication Routes (`/api/auth`)
- `POST /api/auth/login` - Unified login
- `POST /api/auth/mobile-verify` - Mobile verification
- `GET /api/auth/verify` - Token verification
- `POST /api/auth/logout` - Logout

### Employee Routes (`/api/employees`)
- `GET /api/employees` - List employees
- `GET /api/employees/:id` - Get employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `POST /api/employees/bulk` - Bulk create
- `GET /api/employees/profile/me` - Get profile

### Issue Routes (`/api/issues`)
- `GET /api/issues` - List issues
- `GET /api/issues/stats` - Get statistics
- `GET /api/issues/:id` - Get issue
- `POST /api/issues` - Create issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `GET /api/issues/my/issues` - Employee's issues
- `GET /api/issues/assigned/me` - Assigned issues
- `PUT /api/issues/:id/assign` - Assign issue
- `PATCH /api/issues/:id/status` - Update status

## Usage Example

```typescript
// In a controller
export class EmployeeController {
  async getEmployees(req: Request, res: Response) {
    try {
      const filters = req.query;
      const employees = await employeeModel.findAll(filters);
      return res.json(employees);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch employees' });
    }
  }
}

// In a model
export class EmployeeModel {
  async findAll(filters?: FilterOptions): Promise<Employee[]> {
    let query = db.select().from(employees);
    // Apply filters...
    return query;
  }
}

// In routes
router.get('/employees', authMiddleware, employeeController.getEmployees);
```

## Migration Notes

1. All existing API endpoints remain unchanged
2. Database operations moved from storage.ts to respective models
3. Business logic extracted from routes.ts to controllers
4. Middleware functions remain in their current location
5. Frontend API calls don't need any changes

## Next Steps

1. Implement service layer for complex business logic
2. Add request validation middleware
3. Implement response formatting middleware
4. Add comprehensive error handling
5. Add API documentation with Swagger/OpenAPI