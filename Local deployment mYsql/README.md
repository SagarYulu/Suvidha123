# MySQL Local Deployment Guide

This folder contains all the necessary files and documentation to deploy the Yulu Employee Issue Management System locally using MySQL instead of PostgreSQL.

## 📁 Files in this Directory

1. **MYSQL_LOCAL_DEPLOYMENT_GUIDE.md** - Complete step-by-step deployment guide
2. **create_tables.sql** - SQL script to create all database tables
3. **seed_data.sql** - SQL script to seed initial data
4. **setup_mysql_local.sh** - Automated setup script (Linux/Mac)
5. **env.example** - Example environment configuration file
6. **troubleshooting.md** - Common issues and solutions
7. **schema-mysql.ts** - Drizzle ORM schema for MySQL
8. **storage-mysql.ts** - Storage implementation for MySQL
9. **database-config-mysql.ts** - Database configuration
10. **drizzle.config.mysql.ts** - Drizzle configuration for MySQL
11. **sql-query-conversions.md** - PostgreSQL to MySQL query guide
12. **migration-from-postgresql.sh** - Migration script from PostgreSQL
13. **test-mysql-connection.ts** - Connection test script
14. **package.json.mysql** - NPM scripts for MySQL operations
15. **DISCLAIMER.md** - Important notes about MySQL vs PostgreSQL
16. **CHECKLIST.md** - Deployment verification checklist
17. **README.md** - This file

## 🚀 Quick Start

### Automated Setup (Linux/Mac)
```bash
cd "Local deployment mYsql"
./setup_mysql_local.sh
```

### Manual Setup
1. Install MySQL 8.0+
2. Create database: `mysql -u root -p < create_tables.sql`
3. Seed data: `mysql -u root -p yulu_grievance_db < seed_data.sql`
4. Copy `env.example` to `../.env` and update values
5. Install dependencies: `npm install mysql2 drizzle-orm drizzle-kit`
6. Run application: `npm run dev`

## 📋 Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn
- Git

## 🔑 Default Credentials

### Database
- User: `yulu_user`
- Password: `YuluSecurePass123!`
- Database: `yulu_grievance_db`

### Application Login
- Admin: `admin@yulu.com` / `admin123`
- Employee: `chinnumalleshchinnu@gmail.com` / `XPH1884`

## 📊 Database Schema

The MySQL schema includes:
- **employees** - Employee user accounts
- **dashboard_users** - Admin user accounts
- **issues** - Issue/ticket tracking
- **issue_comments** - Comments on issues
- **rbac_roles** - Role definitions
- **rbac_permissions** - Permission definitions
- **master_cities** - City master data
- **master_clusters** - Cluster master data
- **holidays** - Holiday calendar

## 🛠️ Troubleshooting

See `troubleshooting.md` for solutions to common issues:
- Connection errors
- Authentication problems
- Character set issues
- Migration from PostgreSQL
- Performance optimization

## 📝 Key Differences from PostgreSQL

| Feature | PostgreSQL | MySQL |
|---------|-----------|--------|
| Auto-increment | SERIAL | INT AUTO_INCREMENT |
| Arrays | column_name[] | JSON |
| Boolean | BOOLEAN | BOOLEAN or TINYINT(1) |
| JSON | JSONB | JSON |
| Full-text search | Built-in | FULLTEXT indexes |

## 🔄 Migration from PostgreSQL

If migrating from PostgreSQL:
1. Export data from PostgreSQL
2. Transform data types (see mapping table in main guide)
3. Import into MySQL
4. Update connection configuration

## 📚 Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Drizzle ORM MySQL Guide](https://orm.drizzle.team/docs/get-started-mysql)
- [Node.js MySQL2 Package](https://github.com/sidorares/node-mysql2)

## ⚡ Performance Tips

1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Connection Pooling**: Configured with 10 connections by default
3. **UTF8MB4**: Full Unicode support including emojis
4. **InnoDB Engine**: ACID compliance and foreign key support

## 🔒 Security Notes

1. Change default passwords before production use
2. Use environment variables for sensitive data
3. Enable SSL/TLS for database connections in production
4. Regular backups recommended

## 📞 Support

For issues specific to MySQL deployment:
1. Check `troubleshooting.md`
2. Review MySQL error logs
3. Verify all dependencies are installed
4. Ensure MySQL service is running

---

Happy coding! 🚀