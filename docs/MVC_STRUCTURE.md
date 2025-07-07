# MVC (Model-View-Controller) Structure

## Overview
The backend has been refactored to follow the MVC architectural pattern for better organization, maintainability, and scalability.

## Directory Structure

```
server/
├── config/           # Configuration files
│   ├── db.ts        # Database connection configuration
│   ├── jwt.ts       # JWT secret configuration
│   └── vite.ts      # Vite server configuration
├── controllers/      # Business logic layer
│   ├── authController.ts      # Authentication logic
│   ├── employeeController.ts  # Employee management logic
│   ├── issueController.ts     # Issue management logic
│   └── index.ts              # Controller exports
├── middleware/       # Express middleware
│   ├── auth.ts      # Authentication middleware
│   ├── cityFilter.ts # City-based filtering middleware
│   └── rbac.ts      # Role-based access control
├── models/          # Data models
│   ├── DashboardUser.ts # Dashboard user model
│   ├── Employee.ts      # Employee model
│   ├── Issue.ts         # Issue model
│   └── index.ts         # Model exports
├── routes/          # API route definitions
│   ├── api/         # API route grouping
│   ├── authRoutes.ts    # Authentication routes
│   ├── employeeRoutes.ts # Employee routes
│   ├── issueRoutes.ts   # Issue routes
│   └── index.ts         # Route exports
├── services/        # Service layer
│   ├── storage.ts   # Database abstraction service
│   └── websocket/   # WebSocket services
├── utils/           # Utility functions
│   ├── businessHoursAnalytics.ts # Business hours calculations
│   ├── migrateMasterData.ts      # Data migration utilities
│   ├── pushSchema.ts             # Schema management
│   ├── seedData.ts               # Database seeding
│   ├── seedOriginalData.ts       # Original data seeding
│   ├── sla.ts                    # SLA utilities
│   └── timezone.ts               # Timezone utilities
├── index.ts         # Main server entry point
└── routes.ts        # Main routes file (to be refactored)
```

## MVC Components

### Models (`/models`)
- Define data structures and business entities
- Handle data validation and relationships
- Interact with the database through the storage service

### Views
- In this architecture, views are handled by the React frontend
- The backend serves JSON data via RESTful APIs

### Controllers (`/controllers`)
- Contain business logic
- Process requests and prepare responses
- Call models and services as needed
- Handle error responses

### Routes (`/routes`)
- Define API endpoints
- Map HTTP methods to controller functions
- Apply middleware for authentication and validation

### Services (`/services`)
- Provide reusable functionality across controllers
- Abstract complex operations
- Handle external integrations

### Middleware (`/middleware`)
- Process requests before they reach controllers
- Handle authentication, authorization, and filtering
- Add request/response modifications

### Config (`/config`)
- Centralize configuration settings
- Manage environment-specific variables
- Configure external services

### Utils (`/utils`)
- Provide helper functions
- Contain business logic utilities
- Handle data transformations

## Benefits of MVC Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Maintainability**: Easy to locate and modify specific functionality
3. **Scalability**: New features can be added without affecting existing code
4. **Testability**: Components can be tested in isolation
5. **Reusability**: Services and utilities can be shared across controllers
6. **Code Organization**: Clear structure makes onboarding easier

## Next Steps

The large `routes.ts` file still contains mixed concerns and should be further refactored by:
1. Extracting remaining route definitions to appropriate route files
2. Moving business logic to controllers
3. Extracting WebSocket logic to the websocket service
4. Creating additional service files for complex operations