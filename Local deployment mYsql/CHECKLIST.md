# MySQL Local Deployment Checklist

Use this checklist to ensure your MySQL deployment is complete and working correctly.

## Pre-Deployment Checklist

### 1. System Requirements
- [ ] Node.js 18+ installed
- [ ] MySQL 8.0+ installed
- [ ] Git installed
- [ ] 2GB+ free disk space

### 2. MySQL Setup
- [ ] MySQL service is running
- [ ] Root password is set
- [ ] Can connect via command line: `mysql -u root -p`

## Deployment Checklist

### 3. Database Creation
- [ ] Database created: `yulu_grievance_db`
- [ ] User created: `yulu_user`
- [ ] Permissions granted to user
- [ ] Character set is `utf8mb4`

### 4. Schema Setup
- [ ] All tables created (18 tables total)
- [ ] Foreign key constraints active
- [ ] Indexes created
- [ ] AUTO_INCREMENT working

### 5. Data Seeding
- [ ] Admin user created
- [ ] Sample employees added
- [ ] Master data populated
- [ ] RBAC roles and permissions set

### 6. Environment Configuration
- [ ] `.env` file created
- [ ] `DATABASE_TYPE=mysql` set
- [ ] Database credentials correct
- [ ] JWT_SECRET configured

### 7. Code Setup
- [ ] `schema-mysql.ts` copied to `shared/`
- [ ] `storage-mysql.ts` integrated
- [ ] `drizzle.config.ts` updated
- [ ] MySQL packages installed

### 8. Application Testing
- [ ] Server starts without errors
- [ ] Can access http://localhost:5000
- [ ] Admin login works
- [ ] Employee login works
- [ ] Issues can be created
- [ ] Comments work
- [ ] RBAC permissions enforced

## Post-Deployment Checklist

### 9. Functionality Testing
- [ ] Dashboard loads correctly
- [ ] User management works
- [ ] Issue creation/update works
- [ ] Filtering and search work
- [ ] Bulk upload functions
- [ ] Master data management works

### 10. Performance Check
- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] No connection timeouts
- [ ] Concurrent users supported

### 11. Security Verification
- [ ] Passwords are hashed
- [ ] JWT tokens working
- [ ] SQL injection protected
- [ ] CORS configured
- [ ] Rate limiting active

### 12. Backup & Recovery
- [ ] Backup script tested
- [ ] Restore process verified
- [ ] Backup schedule planned
- [ ] Storage location secured

## Common Issues to Check

### If Login Fails:
- [ ] Password is 'admin123' (not hashed)
- [ ] JWT_SECRET matches in all places
- [ ] bcrypt is installed
- [ ] User exists in database

### If Database Errors:
- [ ] MySQL version is 8.0+
- [ ] All tables created
- [ ] Foreign keys not violated
- [ ] Character set is utf8mb4

### If Application Won't Start:
- [ ] Port 5000 is free
- [ ] All npm packages installed
- [ ] .env file in root directory
- [ ] No syntax errors in config

## Final Verification

### 13. Complete System Test
- [ ] Create new employee
- [ ] Employee raises issue
- [ ] Admin assigns issue
- [ ] Add comments
- [ ] Close issue
- [ ] View analytics
- [ ] Export data

### 14. Documentation Review
- [ ] README is accurate
- [ ] API endpoints documented
- [ ] Deployment steps clear
- [ ] Troubleshooting guide helpful

## Sign-off

- [ ] All checklist items completed
- [ ] System fully functional
- [ ] Ready for use

---

**Date Completed:** _______________

**Completed By:** _______________

**Notes:**
_________________________________
_________________________________
_________________________________