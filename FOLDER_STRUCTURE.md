# Yulu Employee Issue Management System - Folder Structure

## 📁 Project Root
```
yulu-employee-management/
│
├── 📁 client/              ⬅️ FRONTEND (React + TypeScript)
│   ├── 📄 index.html         - Entry HTML file
│   └── 📁 src/               - Source code
│       ├── 📁 components/    - React components
│       ├── 📁 pages/         - Page components
│       ├── 📁 services/      - API calls
│       ├── 📁 contexts/      - React contexts
│       ├── 📁 hooks/         - Custom hooks
│       ├── 📁 utils/         - Utility functions
│       ├── 📄 App.tsx        - Main app component
│       └── 📄 main.tsx       - Entry point
│
├── 📁 server/              ⬅️ BACKEND (Node.js + Express)
│   ├── 📁 models/            - MVC: Data layer
│   │   ├── Employee.ts
│   │   ├── DashboardUser.ts
│   │   └── Issue.ts
│   ├── 📁 controllers/       - MVC: Business logic
│   │   ├── authController.ts
│   │   ├── employeeController.ts
│   │   └── issueController.ts
│   ├── 📁 routes/            - MVC: API endpoints
│   │   ├── authRoutes.ts
│   │   ├── employeeRoutes.ts
│   │   └── issueRoutes.ts
│   ├── 📁 middleware/        - Auth, RBAC, filters
│   ├── 📁 services/          - Shared services
│   ├── 📁 utils/             - Server utilities
│   └── 📄 index.ts           - Server entry point
│
├── 📁 shared/              ⬅️ SHARED CODE
│   ├── 📄 schema.ts          - Database schemas
│   └── 📄 holidays.ts        - Shared constants
│
├── 📁 docs/                ⬅️ DOCUMENTATION
│   ├── 📁 architecture/
│   ├── 📁 database/
│   └── 📁 deployment/
│
└── 📁 scripts/             ⬅️ DEPLOYMENT SCRIPTS
    └── deployment-scripts.sh
```

## Architecture Overview

### 🎨 Frontend (`client/`)
- **Technology**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: React Context API
- **Routing**: React Router (wouter)
- **API Communication**: Axios

### 🚀 Backend (`server/`)
- **Technology**: Node.js + Express + TypeScript
- **Architecture**: MVC Pattern
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens
- **Real-time**: WebSocket support

### 🔗 Communication Flow
```
Frontend (client/) ←→ API Calls ←→ Backend (server/)
                                         ↓
                                   PostgreSQL DB
```

## Key Features by Folder

### Frontend Features
- **Mobile App** (`client/src/pages/mobile/`)
- **Admin Dashboard** (`client/src/pages/admin/`)
- **Authentication** (`client/src/contexts/AuthContext.tsx`)
- **Real-time Updates** (`client/src/services/websocketService.ts`)

### Backend Features
- **Authentication API** (`server/routes/authRoutes.ts`)
- **Employee Management** (`server/controllers/employeeController.ts`)
- **Issue Tracking** (`server/models/Issue.ts`)
- **RBAC System** (`server/middleware/rbac.ts`)

This structure provides clear separation between frontend and backend while maintaining the MVC pattern on the server side.