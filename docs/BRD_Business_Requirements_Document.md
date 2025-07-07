# Business Requirements Document (BRD)
## Yulu Employee Grievance Management System

### Document Version: 1.0
### Date: January 2025
### Status: Final for Deployment

---

## 1. Executive Summary

The Yulu Employee Grievance Management System is a comprehensive digital platform designed to streamline the process of raising, tracking, and resolving employee grievances. The system consists of two primary interfaces:
- **Admin Dashboard Portal** - For HR teams, managers, and administrators
- **Employee Mobile App** - For field employees to raise and track issues

## 2. Business Objectives

1. **Digitize Grievance Management**: Replace manual/email-based grievance handling
2. **Improve Response Time**: Implement SLA tracking and automated escalations
3. **Enhance Transparency**: Real-time status updates and tracking
4. **Data-Driven Decisions**: Analytics and reporting for management insights
5. **Mobile-First Approach**: Easy access for field employees via mobile devices

## 3. System Architecture Overview

### 3.1 Two-Portal System
1. **Admin Dashboard** (Desktop Web Application)
   - URL: https://[domain]/login
   - Users: HR Admin, City Head, Cluster Head, CRM, Ops Head, TA Associate

2. **Employee Mobile App** (Mobile Web Application)
   - URL: https://[domain]/mobile/login
   - Users: Mechanics, Pilots, Marshals, Charging Executives, OPC Executives, Riders

### 3.2 Authentication Systems
- **Separate Authentication**: Admin and Employee logins are completely independent
- **No Shared Sessions**: Logging into one portal doesn't affect the other
- **Different Credentials**: 
  - Admin: Email + Password
  - Employee: Email + Employee ID (no password required)

## 4. Detailed Feature Requirements

### 4.1 Admin Dashboard Portal

#### 4.1.1 Login Page
- **Authentication Method**: Email + Password
- **Security Features**:
  - Password hashing with bcrypt
  - JWT token generation
  - Session management
  - "Remember Me" option
- **Error Handling**: Clear messages for invalid credentials
- **Password Visibility Toggle**: Show/hide password option

#### 4.1.2 Dashboard Page
- **Key Metrics Display**:
  - Total Open Issues
  - Issues Resolved Today
  - Average Resolution Time
  - SLA Compliance Rate
- **Charts and Visualizations**:
  - Issues by Status (Pie Chart)
  - Issues by Priority (Bar Chart)
  - Issues by City (Horizontal Bar Chart)
  - Issues by Type (Sunburst Chart)
- **Quick Actions**:
  - View All Issues
  - View Assigned Issues
  - Access Analytics
- **Real-time Updates**: Auto-refresh every 30 seconds

#### 4.1.3 Issues Management Page
- **List View Features**:
  - Sortable columns (ID, Title, Status, Priority, Created Date)
  - Pagination (25/50/100 items per page)
  - Search functionality
  - Advanced filters:
    - Status (Open, In Progress, Resolved, Closed)
    - Priority (Low, Medium, High, Critical)
    - Date Range
    - Assigned To
    - Employee City/Cluster
- **Issue Actions**:
  - View Details
  - Assign/Reassign
  - Update Status
  - Add Comments
  - View Timeline
- **Bulk Operations**:
  - Bulk assign to agent
  - Bulk status update
  - Export selected issues

#### 4.1.4 Issue Detail Page
- **Issue Information Display**:
  - Employee Details (Name, ID, Role, City, Cluster)
  - Issue Type and Subtype
  - Description
  - Priority Level
  - Current Status
  - Assigned Agent
  - Creation Date/Time
  - Last Updated
- **Activity Timeline**:
  - Color-coded events (Status changes, Comments, Assignments)
  - Timestamp for each activity
  - User who performed action
- **Comment System**:
  - Public Comments (visible to employee)
  - Internal Comments (admin-only)
  - Real-time updates via WebSocket
  - Typing indicators
- **Actions Available**:
  - Update Status
  - Change Priority
  - Assign/Reassign
  - Add Attachments
  - Close Issue
- **SLA Tracking**:
  - Time to First Response
  - Total Resolution Time
  - SLA Breach Indicator

#### 4.1.5 Analytics Page
- **Issue Analytics Tab**:
  - Total Issues by Month
  - Issues by Category
  - Resolution Time Trends
  - Top Issue Types
  - City-wise Distribution
- **Feedback Analytics Tab**:
  - Overall Satisfaction Score
  - Sentiment Distribution (Positive/Neutral/Negative)
  - Agent Performance Ratings
  - Feedback Trends
- **TAT (Turn Around Time) Analysis**:
  - Average TAT by Priority
  - TAT Distribution
  - SLA Compliance Percentage
  - Breach Analysis
- **Export Options**:
  - Download as CSV
  - Download as PDF Report
  - Email Report
  - Schedule Automated Reports

#### 4.1.6 User Management Page
- **Employee Management**:
  - List all employees with filters
  - Add/Edit/Delete employees
  - Bulk upload via CSV
  - View employee issue history
- **Dashboard User Management**:
  - List all admin users
  - Add/Edit/Delete admin users
  - Assign roles and permissions
  - Activity logs
- **Bulk Upload Features**:
  - Download CSV template
  - Drag-and-drop file upload
  - Real-time validation
  - Error reporting with line numbers
  - Success/failure summary

#### 4.1.7 Settings Page
- **Master Data Management**:
  - **Roles Management**:
    - Employee Roles (Mechanic, Pilot, Marshal, etc.)
    - Dashboard Roles (HR Admin, City Head, etc.)
    - Add/Edit/Delete operations
  - **Cities Management**:
    - List of operational cities
    - Add new cities
    - Edit/Delete existing cities
  - **Clusters Management**:
    - Clusters mapped to cities
    - Add/Edit/Delete clusters
    - City-cluster relationship
  - **Holiday Calendar**:
    - Government holidays
    - Restricted holidays
    - Add/Edit/Delete holidays
    - Recurring holiday settings
- **Audit Logs**:
  - Track all master data changes
  - User who made changes
  - Timestamp of changes
  - Old vs New values

#### 4.1.8 Access Control (RBAC)
- **Role-Based Permissions**:
  - View Dashboard
  - Manage All Users
  - Manage All Tickets
  - Manage Assigned Tickets Only
  - View All Tickets
  - View Assigned Tickets Only
  - View Issue Analytics
  - View Feedback Analytics
  - Access All Cities
  - Access City Restricted
  - Manage Dashboard Users
  - Access Security Features
- **Pre-defined Roles**:
  1. **Super Admin**: Full system access
  2. **HR Admin**: Full ticket access, user management, analytics (all cities)
  3. **City Head**: Dashboard, assigned tickets, analytics (city-restricted)
  4. **CRM**: Dashboard, assigned tickets, issue analytics (city-restricted)
  5. **Ops Head**: Dashboard, assigned tickets, analytics (all cities)
  6. **TA Associate**: Dashboard, assigned tickets, issue analytics (city-restricted)
  7. **Cluster Head**: Dashboard, assigned tickets, issue analytics (city-restricted)

### 4.2 Employee Mobile App

#### 4.2.1 Mobile Login Page
- **Authentication**: Email + Employee ID (no password)
- **Verification Process**:
  1. Employee enters email
  2. Employee enters Employee ID
  3. System verifies combination
  4. JWT token generated
  5. Redirect to home page
- **Security**: Rate limiting to prevent brute force
- **Remember Me**: Store credentials locally

#### 4.2.2 Mobile Home Page
- **Welcome Section**:
  - Personalized greeting with employee name
  - Role and city display
  - Quick stats (Total tickets, Resolved tickets)
- **Navigation**:
  - Home button
  - Raise Ticket (center floating button)
  - Logout
- **Recent Issues**: List of last 5 issues with status

#### 4.2.3 Raise Ticket Page
- **Issue Type Selection**:
  - Salary Issues
  - Leave Management
  - Workplace Concerns
  - Technical Problems
  - Equipment Issues
  - Safety Concerns
  - Training Needs
  - Policy Clarifications
- **Sub-type Selection** (Dynamic based on type):
  - Salary → Salary Not Received, Deductions, Bonus Issues
  - Leave → Leave Balance, Leave Approval, Holiday queries
  - Workplace → Harassment, Discrimination, Work Environment
  - etc.
- **Issue Details**:
  - Description field (minimum 20 characters)
  - Priority selection (auto-suggested based on type)
  - File attachment option (images only)
- **Submission**:
  - Validation checks
  - Success confirmation
  - Issue ID generation

#### 4.2.4 My Issues Page
- **Issue List**:
  - All issues raised by employee
  - Status indicators (color-coded)
  - Sort by date/status
  - Search functionality
- **Issue Cards Display**:
  - Issue ID
  - Type and Subtype
  - Status badge
  - Created date
  - Last update indicator

#### 4.2.5 Issue Detail Page (Mobile)
- **Issue Information**:
  - Complete issue details
  - Current status
  - Priority level
  - Timeline of updates
- **Comments Section**:
  - View all comments
  - Add new comment
  - Real-time updates
  - See admin responses
- **Actions**:
  - Add comment (when open/in-progress)
  - Reopen ticket (within 48 hours of closure)
  - Submit feedback (when resolved/closed)
- **Status-based UI**:
  - Open/In-Progress: Blue header
  - Resolved/Closed: Gray header

#### 4.2.6 Feedback Submission
- **Availability**: Only for resolved/closed tickets
- **Feedback Form**:
  - Rating (1-5 stars)
  - Sentiment selection (Happy/Neutral/Sad)
  - Optional comment
  - Agent rating
- **Rules**:
  - One-time submission only
  - Cannot be edited
  - Mandatory for closure confirmation

## 5. Business Logic and Rules

### 5.1 Issue Assignment Logic
- **Auto-assignment based on**:
  - Issue type
  - Employee city/cluster
  - Agent availability
  - Current workload
- **Manual override**: Admins can reassign anytime
- **Escalation**: Unassigned issues > 2 hours alert

### 5.2 SLA (Service Level Agreement) Rules
- **Response Time SLA**:
  - Critical: 1 hour
  - High: 2 hours
  - Medium: 4 hours
  - Low: 8 hours
- **Resolution Time SLA**:
  - Critical: 4 hours
  - High: 8 hours
  - Medium: 24 hours
  - Low: 48 hours
- **Business Hours**: 9 AM - 5 PM, Monday-Saturday
- **Holidays Excluded**: Government holidays not counted

### 5.3 Status Workflow
1. **Open**: Initial status when raised
2. **In Progress**: When agent starts working
3. **Resolved**: Solution provided
4. **Closed**: Employee satisfied/48 hours elapsed

### 5.4 Reopening Rules
- **Time Limit**: 48 hours after resolution
- **Automatic Closure**: After 48 hours if no response
- **Reopen Count**: Tracked for analytics

### 5.5 Access Restrictions
- **City-based Filtering**:
  - City Heads see only their city data
  - Cluster Heads see only their cluster
  - HR/Super Admin see all data
- **Ticket Visibility**:
  - Employees see only their tickets
  - Agents see assigned tickets
  - Managers see team tickets

### 5.6 Internal Comments
- **Visibility**: Admin-to-admin only
- **Use Cases**:
  - Internal discussions
  - Sensitive information
  - Investigation notes
- **Not visible to**: Employees

### 5.7 File Upload Rules
- **Allowed Types**: JPG, PNG, PDF
- **Max Size**: 5MB per file
- **Max Files**: 3 per issue
- **Storage**: Secure server storage
- **Access Control**: Only authorized users

## 6. Integration Points

### 6.1 Email Notifications
- Issue raised confirmation
- Status updates
- SLA breach alerts
- Assignment notifications

### 6.2 WebSocket Real-time Updates
- Live comment updates
- Status change notifications
- Typing indicators
- User presence

### 6.3 Export Integrations
- CSV exports for Excel
- PDF generation for reports
- Scheduled report emails

## 7. Security Requirements

### 7.1 Authentication Security
- Bcrypt password hashing
- JWT token expiry (24 hours)
- Session management
- Rate limiting on login

### 7.2 Data Security
- Role-based access control
- City-based data isolation
- Audit trails for all actions
- Secure file storage

### 7.3 API Security
- JWT verification on all endpoints
- CORS configuration
- Input validation
- SQL injection prevention

## 8. Performance Requirements

- Page load time: < 3 seconds
- API response time: < 1 second
- Concurrent users: 500+
- Database queries: Optimized with indexes
- Real-time updates: < 100ms latency

## 9. Compliance and Audit

- All actions logged with timestamp
- User identification for every action
- Data retention policy (2 years)
- Regular security audits
- GDPR compliance for personal data

## 10. Success Metrics

1. **Adoption Rate**: 90% employees using mobile app
2. **Resolution Time**: 50% reduction in average TAT
3. **SLA Compliance**: 95% issues resolved within SLA
4. **User Satisfaction**: 4+ star average rating
5. **Efficiency**: 70% reduction in email grievances

---

**Document Approval**

Prepared by: Product Team  
Reviewed by: HR Leadership  
Approved by: Technology Committee  
Date: January 2025