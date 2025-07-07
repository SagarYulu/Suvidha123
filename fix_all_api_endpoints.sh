#!/bin/bash

echo "=== Fixing ALL remaining API endpoints ==="

# Fix EscalationPanel.tsx
sed -i "s|/escalations/|/api/escalations/|g" client/src/components/admin/issues/EscalationPanel.tsx

# Fix issueStatusService.ts  
sed -i "s|authenticatedAxios.patch(\`/issues/|authenticatedAxios.patch(\`/api/issues/|g" client/src/services/issues/issueStatusService.ts

# Fix issueUtils.ts
sed -i "s|authenticatedAxios.get('/dashboard-users')|authenticatedAxios.get('/api/dashboard-users')|g" client/src/services/issues/issueUtils.ts

# Fix priorityUpdateService.ts
sed -i "s|authenticatedAxios.patch(\`/issues/|authenticatedAxios.patch(\`/api/issues/|g" client/src/services/issues/priorityUpdateService.ts

# Fix issueFetchService.ts - this one needs special handling
sed -i "s|endpoint = '/issues'|endpoint = '/api/issues'|g" client/src/services/issues/issueFetchService.ts
sed -i "s|endpoint = \`/issues/\${issueId}\`|endpoint = \`/api/issues/\${issueId}\`|g" client/src/services/issues/issueFetchService.ts

# Fix ticketFeedbackService.ts
sed -i "s|authenticatedAxios.post('/ticket-feedback/|authenticatedAxios.post('/api/ticket-feedback/|g" client/src/services/ticketFeedbackService.ts
sed -i "s|authenticatedAxios.get(\`/issues/|authenticatedAxios.get(\`/api/issues/|g" client/src/services/ticketFeedbackService.ts
sed -i "s|authenticatedAxios.get('/ticket-feedback')|authenticatedAxios.get('/api/ticket-feedback')|g" client/src/services/ticketFeedbackService.ts

# Fix roleService.ts
sed -i "s|authenticatedAxios.get('/dashboard-users/|authenticatedAxios.get('/api/dashboard-users/|g" client/src/services/roleService.ts
sed -i "s|authenticatedAxios.get('/rbac/|authenticatedAxios.get('/api/rbac/|g" client/src/services/roleService.ts
sed -i "s|authenticatedAxios.put('/rbac/|authenticatedAxios.put('/api/rbac/|g" client/src/services/roleService.ts
sed -i "s|authenticatedAxios.delete('/rbac/|authenticatedAxios.delete('/api/rbac/|g" client/src/services/roleService.ts

echo "All API endpoints fixed!"
