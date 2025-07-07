#!/bin/bash

# Function to fix API endpoints in a file
fix_endpoints() {
    local file=$1
    echo "Fixing $file..."
    
    # Fix common patterns
    sed -i "s|authenticatedAxios.get('/escalations/|authenticatedAxios.get('/api/escalations/|g" "$file"
    sed -i "s|authenticatedAxios.post('/escalations/|authenticatedAxios.post('/api/escalations/|g" "$file"
    sed -i "s|authenticatedAxios.get('/employees')|authenticatedAxios.get('/api/employees')|g" "$file"
    sed -i "s|authenticatedAxios.get(\`/employees/|authenticatedAxios.get(\`/api/employees/|g" "$file"
    sed -i "s|authenticatedAxios.post('/employees/|authenticatedAxios.post('/api/employees/|g" "$file"
    sed -i "s|authenticatedAxios.get('/dashboard-users')|authenticatedAxios.get('/api/dashboard-users')|g" "$file"
    sed -i "s|authenticatedAxios.get(\`/dashboard-users/|authenticatedAxios.get(\`/api/dashboard-users/|g" "$file"
    sed -i "s|authenticatedAxios.post('/dashboard-users/|authenticatedAxios.post('/api/dashboard-users/|g" "$file"
    sed -i "s|authenticatedAxios.post('/issues'|authenticatedAxios.post('/api/issues'|g" "$file"
    sed -i "s|authenticatedAxios.get(\`/issues/|authenticatedAxios.get(\`/api/issues/|g" "$file"
    sed -i "s|authenticatedAxios.post(\`/issues/|authenticatedAxios.post(\`/api/issues/|g" "$file"
    sed -i "s|authenticatedAxios.patch(\`/issues/|authenticatedAxios.patch(\`/api/issues/|g" "$file"
    sed -i "s|authenticatedAxios.post('/issue-audit-trail'|authenticatedAxios.post('/api/issue-audit-trail'|g" "$file"
}

# Find all TypeScript files and fix them
find client/src -name "*.ts" -o -name "*.tsx" | while read file; do
    if grep -q "authenticatedAxios" "$file"; then
        fix_endpoints "$file"
    fi
done

echo "API endpoint fixes completed!"
