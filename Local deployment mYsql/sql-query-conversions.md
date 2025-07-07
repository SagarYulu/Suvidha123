# PostgreSQL to MySQL Query Conversions

## Common SQL Query Conversions

### 1. SERIAL to AUTO_INCREMENT
**PostgreSQL:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY
);
```

**MySQL:**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY
);
```

### 2. Arrays to JSON
**PostgreSQL:**
```sql
-- Column definition
tags TEXT[]

-- Query
SELECT * FROM issues WHERE 'urgent' = ANY(tags);
```

**MySQL:**
```sql
-- Column definition
tags JSON

-- Query
SELECT * FROM issues WHERE JSON_CONTAINS(tags, '"urgent"');
```

### 3. Date/Time Functions
**PostgreSQL:**
```sql
-- Current timestamp
NOW()

-- Interval
created_at > NOW() - INTERVAL '7 days'

-- Date truncation
DATE_TRUNC('month', created_at)
```

**MySQL:**
```sql
-- Current timestamp
NOW() or CURRENT_TIMESTAMP

-- Interval
created_at > NOW() - INTERVAL 7 DAY

-- Date truncation
DATE_FORMAT(created_at, '%Y-%m-01')
```

### 4. String Operations
**PostgreSQL:**
```sql
-- String concatenation
first_name || ' ' || last_name

-- Case-insensitive search
LOWER(email) = LOWER('test@example.com')

-- Pattern matching
email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
```

**MySQL:**
```sql
-- String concatenation
CONCAT(first_name, ' ', last_name)

-- Case-insensitive search (default in MySQL)
email = 'test@example.com'

-- Pattern matching
email REGEXP '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$'
```

### 5. UPSERT Operations
**PostgreSQL:**
```sql
INSERT INTO users (email, name) 
VALUES ('test@example.com', 'Test User')
ON CONFLICT (email) 
DO UPDATE SET name = EXCLUDED.name;
```

**MySQL:**
```sql
INSERT INTO users (email, name) 
VALUES ('test@example.com', 'Test User')
ON DUPLICATE KEY UPDATE name = VALUES(name);
```

### 6. JSON Operations
**PostgreSQL:**
```sql
-- Extract JSON field
data->>'name'

-- JSON contains
data @> '{"status": "active"}'

-- Update JSON field
UPDATE users SET data = jsonb_set(data, '{address,city}', '"New York"');
```

**MySQL:**
```sql
-- Extract JSON field
JSON_EXTRACT(data, '$.name') or data->>'$.name'

-- JSON contains
JSON_CONTAINS(data, '{"status": "active"}')

-- Update JSON field
UPDATE users SET data = JSON_SET(data, '$.address.city', 'New York');
```

### 7. Window Functions
**PostgreSQL & MySQL (8.0+):**
```sql
-- Same syntax for both
SELECT 
  id,
  name,
  ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
FROM employees;
```

### 8. CTEs (Common Table Expressions)
**PostgreSQL & MySQL (8.0+):**
```sql
-- Same syntax for both
WITH employee_counts AS (
  SELECT city, COUNT(*) as count
  FROM employees
  GROUP BY city
)
SELECT * FROM employee_counts WHERE count > 10;
```

### 9. Full-Text Search
**PostgreSQL:**
```sql
-- Using tsvector
SELECT * FROM issues 
WHERE to_tsvector('english', description) @@ to_tsquery('english', 'urgent');
```

**MySQL:**
```sql
-- Using FULLTEXT index
ALTER TABLE issues ADD FULLTEXT(description);
SELECT * FROM issues 
WHERE MATCH(description) AGAINST('urgent' IN NATURAL LANGUAGE MODE);
```

### 10. Sequences
**PostgreSQL:**
```sql
-- Create sequence
CREATE SEQUENCE user_id_seq;

-- Use sequence
SELECT nextval('user_id_seq');
```

**MySQL:**
```sql
-- Use AUTO_INCREMENT
-- No direct sequence support, use AUTO_INCREMENT columns
-- Or create a sequence table:
CREATE TABLE sequences (
  name VARCHAR(50) PRIMARY KEY,
  value INT NOT NULL
);
```

## Raw SQL in Application Code

### PostgreSQL (using pg):
```javascript
const result = await pool.query(`
  SELECT * FROM employees 
  WHERE city = $1 AND created_at > NOW() - INTERVAL '30 days'
`, ['Bangalore']);
```

### MySQL (using mysql2):
```javascript
const [rows] = await pool.execute(`
  SELECT * FROM employees 
  WHERE city = ? AND created_at > NOW() - INTERVAL 30 DAY
`, ['Bangalore']);
```

## Drizzle ORM Differences

### PostgreSQL Schema:
```typescript
import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  tags: text('tags').array(),
  metadata: jsonb('metadata')
});
```

### MySQL Schema:
```typescript
import { mysqlTable, int, text, timestamp, json } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  tags: json('tags'), // Store arrays as JSON
  metadata: json('metadata')
});
```

## Connection String Differences

### PostgreSQL:
```
postgresql://user:password@localhost:5432/database
DATABASE_URL=postgresql://user:password@localhost:5432/yulu_db
```

### MySQL:
```
mysql://user:password@localhost:3306/database
DATABASE_URL=mysql://user:password@localhost:3306/yulu_db
```

## Important Notes

1. **Case Sensitivity**: MySQL table names are case-sensitive on Linux but not on Windows/Mac. PostgreSQL is case-insensitive unless quoted.

2. **Boolean Type**: MySQL uses TINYINT(1) for boolean, while PostgreSQL has native BOOLEAN.

3. **UUID**: PostgreSQL has native UUID type, MySQL uses CHAR(36) or BINARY(16).

4. **Timezone**: PostgreSQL TIMESTAMP WITH TIME ZONE vs MySQL TIMESTAMP (UTC only).

5. **Triggers**: Different syntax between PostgreSQL and MySQL.

6. **Stored Procedures**: Completely different syntax and capabilities.

## Disclaimer

⚠️ **Important**: While this guide covers common conversions, always test thoroughly when migrating between databases. Some features may not have direct equivalents, and performance characteristics can differ significantly between PostgreSQL and MySQL.