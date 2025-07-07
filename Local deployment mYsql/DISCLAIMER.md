# ⚠️ IMPORTANT DISCLAIMER - MySQL Local Deployment

## Database Migration Notice

This MySQL deployment guide is provided as an **ALTERNATIVE** to the primary PostgreSQL setup. Please be aware of the following:

### 1. Primary Database
- **PostgreSQL** is the primary and recommended database for this application
- All development and testing has been done primarily on PostgreSQL
- The application is optimized for PostgreSQL features and performance

### 2. MySQL Compatibility
- MySQL support is provided for local development and cost-conscious deployments
- While fully functional, some features may have different performance characteristics
- Requires MySQL 8.0 or higher for full feature compatibility

### 3. Feature Differences

| Feature | PostgreSQL | MySQL | Impact |
|---------|-----------|--------|--------|
| Arrays | Native array support | Stored as JSON | Slightly different query syntax |
| Full-text search | Built-in tsvector | FULLTEXT indexes | Different search capabilities |
| JSON operations | JSONB with indexing | JSON type | Performance differences |
| Case sensitivity | Case-insensitive | OS-dependent | May affect queries |
| Transactions | Full ACID | Full ACID (InnoDB) | None if using InnoDB |

### 4. Migration Considerations
- **Data Types**: Some PostgreSQL types don't have direct MySQL equivalents
- **Queries**: Raw SQL queries may need modification
- **Performance**: Index strategies may need adjustment
- **Backups**: Different backup/restore procedures

### 5. Testing Requirements
If using MySQL in production:
1. Thoroughly test all features
2. Performance test with expected data volumes
3. Test backup and recovery procedures
4. Monitor query performance
5. Test all RBAC and permission features

### 6. Support Level
- PostgreSQL: **Full support**, primary development target
- MySQL: **Community support**, alternative deployment option

### 7. When to Use MySQL
✅ **Recommended for:**
- Local development environments
- Small deployments with budget constraints
- Shared hosting environments
- Teams with existing MySQL expertise

❌ **Not recommended for:**
- Large-scale production deployments
- Applications requiring PostgreSQL-specific features
- High-performance requirements without proper testing

### 8. Production Recommendations
For production deployments, we recommend:
1. **PostgreSQL** on managed services (Neon, Supabase, AWS RDS)
2. **MySQL** only after thorough testing and performance validation
3. Regular backups regardless of database choice
4. Monitoring and alerting for both options

### 9. No Warranty
This MySQL deployment option is provided "as is" without warranty of any kind. The development team primarily supports PostgreSQL deployments.

### 10. Getting Help
- **PostgreSQL issues**: Full support via standard channels
- **MySQL issues**: Community support, best-effort basis
- **Migration help**: Documentation provided, implementation responsibility lies with deployer

---

## Acknowledgment

By using the MySQL deployment option, you acknowledge that:
1. You understand the differences between PostgreSQL and MySQL
2. You accept responsibility for testing and validation
3. You understand the support limitations
4. You will maintain your own backups and monitoring

---

**Remember**: When in doubt, use PostgreSQL. It's the database this application was designed for.

Last updated: January 2025