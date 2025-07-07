# Dual Database Support Guide

This project now supports both PostgreSQL and MySQL databases through environment configuration.

## Environment Variables

### For PostgreSQL (Default)
```bash
# PostgreSQL Configuration (current production setup)
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://username:password@host:port/database
```

### For MySQL (Local Development)
```bash
# MySQL Configuration for local development
DATABASE_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=yulu_db
```

## Quick Setup

### 1. PostgreSQL (Production/Current)
- No changes needed - current setup works as-is
- Keep existing `DATABASE_URL` environment variable
- Application automatically detects PostgreSQL

### 2. MySQL (Local Development)
```bash
# 1. Install MySQL locally
sudo apt install mysql-server  # Ubuntu/Debian
# OR
brew install mysql            # macOS

# 2. Create database
mysql -u root -p
CREATE DATABASE yulu_db;
exit

# 3. Set environment variables
export DATABASE_TYPE=mysql
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=yulu_db

# 4. Generate MySQL migrations
npm run db:push:mysql

# 5. Start application
npm run dev
```

## Migration Commands

### PostgreSQL
```bash
npm run db:push              # Push schema to PostgreSQL
```

### MySQL
```bash
npm run db:push:mysql        # Push schema to MySQL
```

## How It Works

1. **Automatic Detection**: Application reads `DATABASE_TYPE` environment variable
2. **Schema Selection**: Automatically loads correct schema (PostgreSQL or MySQL)
3. **Connection Management**: Uses appropriate database driver
4. **Zero Code Changes**: All existing API endpoints work unchanged

## Database Schema Compatibility

Both database schemas are functionally identical:
- Same table structure
- Same relationships
- Same data types (adjusted for database compatibility)
- Same API interface

### Key Differences
| Feature | PostgreSQL | MySQL |
|---------|------------|-------|
| Auto Increment | `serial` | `int().autoincrement()` |
| JSON Storage | `jsonb` | `json` |
| Text Fields | `text` | `text` |
| Timestamps | `timestamp` | `timestamp` |

## Production Deployment

### Current (PostgreSQL)
- Replit deployment uses PostgreSQL by default
- No environment changes needed
- Keep existing `DATABASE_URL`

### MySQL Hosting Options
- **Local Server**: Use local MySQL installation
- **Cloud MySQL**: AWS RDS, Google Cloud SQL, Azure Database
- **Shared Hosting**: Most hosting providers support MySQL

## Data Migration

### PostgreSQL → MySQL
```bash
# 1. Export data from PostgreSQL
npm run migrate:export:pg

# 2. Transform and import to MySQL
npm run migrate:import:mysql
```

### MySQL → PostgreSQL
```bash
# 1. Export data from MySQL
npm run migrate:export:mysql

# 2. Transform and import to PostgreSQL
npm run migrate:import:pg
```

## Benefits

✅ **Deployment Flexibility**: Choose database based on hosting requirements
✅ **Cost Optimization**: Use free MySQL hosting for staging/development
✅ **Local Development**: Easy MySQL setup on local machines
✅ **Zero Downtime**: Switch databases without application changes
✅ **Backup Strategy**: Cross-database backup and restore options