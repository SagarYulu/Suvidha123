-- Seed Data for Yulu Employee Issue Management System
-- Run this script after creating all tables

-- Insert initial dashboard admin user
-- Password: admin123 (bcrypt hash)
INSERT INTO dashboard_users (name, email, password, role) VALUES
('Admin', 'admin@yulu.com', '$2b$10$8Dy95E3B4YeZMmU8x.M6.eFqNEKJ8zmL3R.pV.1XNLvkKKxMkUJKC', 'Super Admin');

-- Insert RBAC roles
INSERT INTO rbac_roles (name, description) VALUES
('Super Admin', 'Full system access'),
('HR Admin', 'HR management access'),
('City Head', 'City-level management'),
('CRM', 'Customer relationship management'),
('Cluster Head', 'Cluster-level management'),
('Ops Head', 'Operations management'),
('TA Associate', 'Talent acquisition'),
('Employee', 'Basic employee access');

-- Insert RBAC permissions
INSERT INTO rbac_permissions (name, description) VALUES
('view:dashboard', 'View dashboard'),
('manage:users', 'Manage all users'),
('manage:tickets_all', 'Manage all tickets'),
('manage:tickets_assigned', 'Manage assigned tickets'),
('view:tickets_all', 'View all tickets'),
('view:tickets_assigned', 'View assigned tickets'),
('view:issue_analytics', 'View issue analytics'),
('view:feedback_analytics', 'View feedback analytics'),
('access:all_cities', 'Access all cities data'),
('access:city_restricted', 'Access only assigned city data'),
('manage:dashboard_users', 'Manage dashboard users'),
('access:security', 'Access security features');

-- Assign all permissions to Super Admin role (role_id = 1)
INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT 1, id FROM rbac_permissions;

-- Assign Super Admin role to admin user (user_id = 1, role_id = 1)
INSERT INTO rbac_user_roles (user_id, role_id) VALUES (1, 1);

-- Insert master cities
INSERT INTO master_cities (name, created_by) VALUES
('Bangalore', 1),
('Delhi', 1),
('Mumbai', 1);

-- Insert master clusters
-- Bangalore clusters (city_id = 1)
INSERT INTO master_clusters (name, city_id, created_by) VALUES
('Whitefield', 1, 1),
('Indiranagar', 1, 1),
('Koramangala', 1, 1),
('HSR Layout', 1, 1),
('Electronic City', 1, 1),
('Marathahalli', 1, 1),
('Bellandur', 1, 1),
('BTM Layout', 1, 1),
('Jayanagar', 1, 1),
('JP Nagar', 1, 1);

-- Delhi clusters (city_id = 2)
INSERT INTO master_clusters (name, city_id, created_by) VALUES
('Connaught Place', 2, 1),
('Karol Bagh', 2, 1),
('Dwarka', 2, 1),
('Rohini', 2, 1),
('Saket', 2, 1),
('Lajpat Nagar', 2, 1),
('Janakpuri', 2, 1),
('Vasant Kunj', 2, 1),
('Nehru Place', 2, 1),
('Greater Kailash', 2, 1);

-- Mumbai clusters (city_id = 3)
INSERT INTO master_clusters (name, city_id, created_by) VALUES
('Andheri', 3, 1),
('Bandra', 3, 1),
('Powai', 3, 1),
('Lower Parel', 3, 1),
('Malad', 3, 1),
('Borivali', 3, 1),
('Thane', 3, 1),
('Vashi', 3, 1),
('Kurla', 3, 1),
('Dadar', 3, 1);

-- Insert master roles
-- Employee roles
INSERT INTO master_roles (name, type, created_by) VALUES
('Mechanic', 'employee', 1),
('Pilot', 'employee', 1),
('Marshal', 'employee', 1),
('Charging Executive', 'employee', 1),
('OPC Executive', 'employee', 1),
('Quality Analyst', 'employee', 1),
('Rider', 'employee', 1),
('Freelancer', 'employee', 1);

-- Dashboard user roles
INSERT INTO master_roles (name, type, created_by) VALUES
('Super Admin', 'dashboard_user', 1),
('HR Admin', 'dashboard_user', 1),
('City Head', 'dashboard_user', 1),
('CRM', 'dashboard_user', 1),
('Ops Head', 'dashboard_user', 1),
('TA Associate', 'dashboard_user', 1),
('Cluster Head', 'dashboard_user', 1);

-- Insert sample employees
-- Password for all employees: 1234 (bcrypt hash)
INSERT INTO employees (user_id, name, email, phone, emp_id, city, cluster, manager, role, password, date_of_joining, blood_group, date_of_birth, account_number, ifsc_code) VALUES
(8832976, 'Mallesh N', 'chinnumalleshchinnu@gmail.com', '6364725906', 'XPH1884', 'Bangalore', 'Whitefield', 'Satyajith', 'Mechanic', '$2b$10$zNJZT7p0tr/xKklH3w.oFO8c9CQFrm7IlOOKKrU0AqTq9nEq0bxm2', '2025-03-10', 'A+', '2003-02-19', '110027659324', 'CNRB0000439'),
(8854375, 'EDWIN JOHNSON', 'edwinjohnson309@gmail.com', '7025853060', 'XPH1885', 'Bangalore', 'Indiranagar', 'Satyajith', 'Mechanic', '$2b$10$zNJZT7p0tr/xKklH3w.oFO8c9CQFrm7IlOOKKrU0AqTq9nEq0bxm2', '2025-03-08', 'B-', '2002-03-26', '71899500057507', 'YESB0000718'),
(8875533, 'Jerin renny', 'Jerinrenny412@gmail.com', '7902296436', 'XPH1886', 'Bangalore', 'Indiranagar', 'Satyajith', 'Mechanic', '$2b$10$zNJZT7p0tr/xKklH3w.oFO8c9CQFrm7IlOOKKrU0AqTq9nEq0bxm2', '2025-03-08', 'A+', '2002-02-12', '50100633652379', 'HDFC0006269', NULL);

-- Insert additional dashboard users
INSERT INTO dashboard_users (name, email, password, city, role, created_by) VALUES
('HR Admin', 'hr@yulu.com', '$2b$10$8Dy95E3B4YeZMmU8x.M6.eFqNEKJ8zmL3R.pV.1XNLvkKKxMkUJKC', 'Bangalore', 'HR Admin', 1),
('City Head Bangalore', 'cityhead.blr@yulu.com', '$2b$10$8Dy95E3B4YeZMmU8x.M6.eFqNEKJ8zmL3R.pV.1XNLvkKKxMkUJKC', 'Bangalore', 'City Head', 1),
('Sagar K M', 'sagar.km@yulu.bike', '$2b$10$8Dy95E3B4YeZMmU8x.M6.eFqNEKJ8zmL3R.pV.1XNLvkKKxMkUJKC', 'Bangalore', 'Super Admin', 1);

-- Assign roles to dashboard users
INSERT INTO rbac_user_roles (user_id, role_id) VALUES
(2, 2), -- HR Admin role to hr@yulu.com
(3, 3), -- City Head role to cityhead.blr@yulu.com
(4, 1); -- Super Admin role to sagar.km@yulu.bike

-- Insert sample issues
INSERT INTO issues (employee_id, type_id, sub_type_id, description, status, priority, created_at, assigned_to) VALUES
(1, 'salary', 'salary-not-received', 'My salary for June has not been credited yet. Please check and update.', 'in_progress', 'medium', '2025-07-06 11:46:21', 4);

-- Insert sample comments from employee
INSERT INTO issue_comments (issue_id, employee_id, content, created_at) VALUES
(1, 1, 'Please look into this urgently as I have bills to pay.', '2025-07-06 12:15:00'),
(1, 1, 'Thank you for addressing my concern. I appreciate your quick response. When can I expect this to be resolved?', '2025-07-06 18:04:00');

-- Insert sample comments from admin (using employee_id = 4 for Sagar K M)
-- Note: In the actual system, admin comments are stored differently
INSERT INTO issue_comments (issue_id, employee_id, content, created_at) VALUES
(1, 4, 'Hi Mallesh, I will get back to you by today EOD', '2025-07-06 13:00:43'),
(1, 4, 'Hi Mallesh we discussed you have received the salary closing the loop.', '2025-07-06 13:49:15'),
(1, 4, 'Closing the issue', '2025-07-06 14:00:04');

-- Insert sample holidays
INSERT INTO holidays (name, date, type, recurring, description) VALUES
('New Year', '2025-01-01', 'government', TRUE, 'New Year celebration'),
('Republic Day', '2025-01-26', 'government', TRUE, 'Indian Republic Day'),
('Holi', '2025-03-14', 'government', FALSE, 'Festival of colors'),
('Good Friday', '2025-04-18', 'government', FALSE, 'Christian holiday'),
('Independence Day', '2025-08-15', 'government', TRUE, 'Indian Independence Day'),
('Gandhi Jayanti', '2025-10-02', 'government', TRUE, 'Birth anniversary of Mahatma Gandhi'),
('Diwali', '2025-10-20', 'government', FALSE, 'Festival of lights'),
('Christmas', '2025-12-25', 'government', TRUE, 'Christmas Day');

-- Update issue audit trail
INSERT INTO issue_audit_trail (issue_id, changed_by, change_type, old_value, new_value, created_at) VALUES
(1, 4, 'status_change', 'open', 'in_progress', '2025-07-06 12:20:00'),
(1, 4, 'assignment', NULL, '4', '2025-07-06 12:20:00');

-- Sample notifications
INSERT INTO issue_notifications (issue_id, user_id, user_type, type, message, is_read, created_at) VALUES
(1, 1, 'employee', 'status_update', 'Your issue #1 status has been updated to in_progress', TRUE, '2025-07-06 12:20:00'),
(1, 1, 'employee', 'comment', 'New comment on your issue #1', TRUE, '2025-07-06 13:00:43');

-- Print summary
SELECT 'Data seeding completed successfully!' AS Status;
SELECT COUNT(*) AS 'Total Employees' FROM employees;
SELECT COUNT(*) AS 'Total Dashboard Users' FROM dashboard_users;
SELECT COUNT(*) AS 'Total Issues' FROM issues;
SELECT COUNT(*) AS 'Total Comments' FROM issue_comments;
SELECT COUNT(*) AS 'Total Roles' FROM rbac_roles;
SELECT COUNT(*) AS 'Total Permissions' FROM rbac_permissions;
SELECT COUNT(*) AS 'Total Cities' FROM master_cities;
SELECT COUNT(*) AS 'Total Clusters' FROM master_clusters;
SELECT COUNT(*) AS 'Total Holidays' FROM holidays;