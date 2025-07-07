# Yulu Employee Issue Management System

A comprehensive employee issue management platform with role-based access control, real-time analytics, and dual-database support for flexible deployment options.

## 🚀 Quick Start

### One-Command Setup
```bash
# Complete automated setup
./scripts/deployment-scripts.sh setup
```

### Manual Setup
```bash
# Install dependencies
npm install

# Setup MySQL database
./scripts/deployment-scripts.sh mysql

# Create environment file
./scripts/deployment-scripts.sh env

# Migrate schema and seed data
./scripts/deployment-scripts.sh migrate
./scripts/deployment-scripts.sh seed

# Start development server
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database Studio**: `./scripts/deployment-scripts.sh db:studio`

## 🔐 Test Credentials

### Dashboard Access (Admin Interface)
```
Email: sagar.km@yulu.bike
Password: admin123
Role: Super Admin
```

### Mobile Access (Employee Interface)  
```
Email: chinnumalleshchinnu@gmail.com
Employee ID: XPH1884
Role: Mechanic
```

## 🛠️ Technology Stack

### Frontend
- **React 18** + TypeScript
- **Vite** (Build tool & dev server)
- **Tailwind CSS** (Styling)
- **shadcn/ui** (Component library)
- **TanStack Query** (Server state)
- **React Router** (Client routing)

### Backend
- **Node.js** + Express.js
- **TypeScript** (Type safety)
- **Drizzle ORM** (Database operations)
- **MySQL** (Primary database)
- **JWT** (Authentication)
- **WebSocket** (Real-time features)

## 📊 Key Features

- **8 User Roles**: Super Admin, HR Admin, City Head, CRM, Ops Head, Cluster Head, TA Associate, Employee
- **City-Based Access**: Location-restricted data access for enhanced security
- **Real-time Communication**: Live comments, typing indicators, WebSocket updates
- **SLA Management**: Business hours calculation, breach detection, TAT tracking
- **Analytics Dashboard**: Issue trends, sentiment analysis, performance metrics
- **Dual Database Support**: PostgreSQL (production) or MySQL (local) deployment
- **Mobile-First Design**: Responsive interface optimized for all devices

## 🗄️ Database Support

### MySQL (Local Development)
```bash
DATABASE_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Yulu@123
DB_NAME=FS_Grievance_management
```

### PostgreSQL (Production)
```bash
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://username:password@host:port/database
```

## 📋 Available Commands

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run check            # TypeScript checking
```

### Database Management
```bash
./scripts/deployment-scripts.sh db:push      # Push schema
./scripts/deployment-scripts.sh db:studio    # Database studio
./scripts/deployment-scripts.sh db:check     # Check connection
./scripts/deployment-scripts.sh db:backup    # Backup database
```

### Deployment Scripts
```bash
./scripts/deployment-scripts.sh setup        # Complete setup
./scripts/deployment-scripts.sh verify       # Verify deployment
./scripts/deployment-scripts.sh test-auth    # Test authentication
```

## 📚 Documentation

- **[Local Deployment Guide](./LOCAL_DEPLOYMENT_GUIDE.md)** - Complete setup instructions
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Codebase organization
- **[API Documentation](./docs/api.md)** - Backend API reference
- **[Database Schema](./docs/database.md)** - Database structure

## 🔧 Troubleshooting

### Common Issues
1. **Database Connection**: Run `./scripts/deployment-scripts.sh db:check`
2. **Authentication Errors**: Verify JWT_SECRET in `.env` file
3. **Port Conflicts**: Check if port 5000 is available
4. **Schema Issues**: Run `./scripts/deployment-scripts.sh db:push`

### Getting Help
1. Check the [Local Deployment Guide](./LOCAL_DEPLOYMENT_GUIDE.md)
2. Verify environment configuration
3. Test authentication endpoints
4. Review application logs

## 🎯 Architecture Overview

```
Frontend (React/Vite) ←→ Backend (Express/Node.js) ←→ Database (MySQL/PostgreSQL)
        ↓                          ↓                           ↓
    Components              JWT Auth + RBAC              Drizzle ORM
    TanStack Query          WebSocket Server             Connection Pool
    Tailwind CSS            Business Logic              Schema Management
```

## 🚀 Deployment

### Local Development
- Clone repository
- Run `./scripts/deployment-scripts.sh setup`
- Access at http://localhost:5173

### Production Deployment
- Build: `npm run build`
- Configure environment variables
- Deploy to hosting platform
- Setup database and run migrations

---

**For complete setup instructions, see [LOCAL_DEPLOYMENT_GUIDE.md](./LOCAL_DEPLOYMENT_GUIDE.md)**