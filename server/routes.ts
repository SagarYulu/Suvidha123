import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./services/storage";
import { pool } from "./config/db";
import { seedDatabase } from "./utils/seedData";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { 
  insertEmployeeSchema, insertDashboardUserSchema, insertIssueSchema, 
  insertIssueCommentSchema, insertTicketFeedbackSchema, insertHolidaySchema 
} from "@shared/schema";
import { authenticateToken, requireDashboardUser, requireEmployee, requirePermission } from "./middleware/auth";
import { businessHoursAnalytics } from "./utils/businessHoursAnalytics";
import { GOVERNMENT_HOLIDAYS_2025 } from "../shared/holidays";
import { JWT_SECRET } from "./config/jwt";
import { apiRoutes } from "./routes/index";

// Helper function to validate password (handles both bcrypt and plaintext)
async function validatePassword(inputPassword: string, storedPassword: string): Promise<boolean> {
  // Check if stored password looks like a bcrypt hash
  if (storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2y$')) {
    // It's a bcrypt hash, use bcrypt.compare
    return await bcrypt.compare(inputPassword, storedPassword);
  } else {
    // It's plaintext, use direct comparison
    return inputPassword === storedPassword;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount modular API routes
  app.use('/api', apiRoutes);

  // Authentication routes (public - no auth required)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt:", { email, password: password ? "[REDACTED]" : "MISSING" });
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Check if it's an employee login
      const employee = await storage.getEmployeeByEmail(email);
      if (employee) {
        const isValidPassword = await validatePassword(password, employee.password);
        if (isValidPassword) {
          const token = jwt.sign(
            { 
              id: employee.id, 
              userType: 'employee',
              email: employee.email,
              role: employee.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          return res.json({
            token,
            user: {
              id: employee.id,
              email: employee.email,
              name: employee.name,
              role: employee.role,
              userType: 'employee'
            }
          });
        }
      }

      // Check if it's a dashboard user login
      console.log("Checking dashboard user for email:", email);
      const dashboardUser = await storage.getDashboardUserByEmail(email);
      console.log("Dashboard user found:", dashboardUser ? "YES" : "NO");
      if (dashboardUser) {
        console.log("Stored password hash:", dashboardUser.password);
        console.log("Input password:", password);
        const isValidPassword = await validatePassword(password, dashboardUser.password);
        console.log("Password validation result:", isValidPassword);
        if (isValidPassword) {
          const token = jwt.sign(
            { 
              id: dashboardUser.id, 
              userType: 'dashboard_user',
              email: dashboardUser.email,
              role: dashboardUser.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          return res.json({
            token,
            user: {
              id: dashboardUser.id,
              email: dashboardUser.email,
              name: dashboardUser.name,
              role: dashboardUser.role,
              userType: 'dashboard_user'
            }
          });
        }
      }

      return res.status(401).json({ error: "Invalid credentials" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Mobile verification endpoint - verify by email and employeeId
  app.post("/api/auth/mobile-verify", async (req, res) => {
    try {
      const { email, employeeId } = req.body;
      
      if (!email || !employeeId) {
        return res.status(400).json({ error: "Email and employee ID are required" });
      }

      // Find employee by email and empId
      const employee = await storage.getEmployeeByEmail(email);
      if (employee && employee.empId === employeeId) {
        const token = jwt.sign(
          { 
            id: employee.id, 
            userType: 'employee',
            email: employee.email,
            role: employee.role
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        return res.json({
          token,
          user: {
            id: employee.id,
            email: employee.email,
            name: employee.name,
            role: employee.role,
            userType: 'employee'
          }
        });
      }

      return res.status(401).json({ error: "Invalid credentials" });
    } catch (error) {
      console.error("Mobile verification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    // Since JWT is stateless, logout is handled on the client side
    res.json({ message: "Logged out successfully" });
  });

  // Employee routes (protected)
  // Employee self-profile endpoint - allows employees to get their own details
  app.get("/api/employee/profile", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { id: userId, userType } = req.user;
      
      // Only allow employees to access their own profile
      if (userType !== 'employee') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const employee = await storage.getEmployeeById(userId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/employees", authenticateToken, requireDashboardUser, requirePermission('manage:users'), async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/employees/:id", authenticateToken, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      if (isNaN(employeeId)) {
        return res.status(400).json({ error: "Invalid employee ID" });
      }
      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/employees", authenticateToken, requireDashboardUser, requirePermission('manage:users'), async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(400).json({ error: "Invalid employee data" });
    }
  });

  app.post("/api/employees/bulk", authenticateToken, requireDashboardUser, requirePermission('manage:users'), async (req, res) => {
    try {
      const { employees } = req.body;
      
      if (!Array.isArray(employees)) {
        return res.status(400).json({ error: "employees must be an array" });
      }
      
      if (employees.length === 0) {
        return res.status(400).json({ error: "No employees provided" });
      }
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      // Process each employee individually for better error handling
      for (let i = 0; i < employees.length; i++) {
        try {
          const validatedData = insertEmployeeSchema.parse(employees[i]);
          await storage.createEmployee(validatedData);
          successCount++;
        } catch (error: any) {
          errorCount++;
          errors.push(`Row ${i + 1}: ${error.message || 'Invalid employee data'}`);
          console.error(`Error creating employee ${i + 1}:`, error);
        }
      }
      
      res.status(201).json({
        successCount,
        errorCount,
        totalProcessed: employees.length,
        errors: errors.slice(0, 10), // Limit errors to first 10 for response size
      });
    } catch (error) {
      console.error("Error in bulk employee creation:", error);
      res.status(500).json({ error: "Internal server error during bulk creation" });
    }
  });

  app.put("/api/employees/:id", authenticateToken, requireDashboardUser, requirePermission('manage:users'), async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      if (isNaN(employeeId)) {
        return res.status(400).json({ error: "Invalid employee ID" });
      }
      const employee = await storage.updateEmployee(employeeId, req.body);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/employees/:id", authenticateToken, requireDashboardUser, requirePermission('manage:users'), async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      if (isNaN(employeeId)) {
        return res.status(400).json({ error: "Invalid employee ID" });
      }
      const success = await storage.deleteEmployee(employeeId);
      if (!success) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard user routes (protected)
  app.get("/api/dashboard-users", authenticateToken, requireDashboardUser, requirePermission('manage:dashboard_users'), async (req, res) => {
    try {
      const users = await storage.getDashboardUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching dashboard users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/dashboard-users", authenticateToken, requireDashboardUser, requirePermission('manage:dashboard_users'), async (req, res) => {
    try {
      const validatedData = insertDashboardUserSchema.parse(req.body);
      const user = await storage.createDashboardUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating dashboard user:", error);
      res.status(400).json({ error: "Invalid dashboard user data" });
    }
  });

  app.post("/api/dashboard-users/bulk", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const { users } = req.body;
      
      console.log("Bulk upload received:", { userCount: users?.length, firstUser: users?.[0] });
      
      if (!Array.isArray(users)) {
        return res.status(400).json({ error: "users must be an array" });
      }
      
      if (users.length === 0) {
        return res.status(400).json({ error: "No users provided" });
      }
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      // Process each user individually for better error handling
      for (let i = 0; i < users.length; i++) {
        try {
          console.log(`Processing user ${i + 1}:`, users[i]);
          
          // Hash the password before validation
          const userWithHashedPassword = {
            ...users[i],
            password: users[i].password ? await bcrypt.hash(users[i].password, 10) : await bcrypt.hash("changeme123", 10)
          };
          
          console.log(`User ${i + 1} after password hash:`, { ...userWithHashedPassword, password: '[HASHED]' });
          
          const validatedData = insertDashboardUserSchema.parse(userWithHashedPassword);
          console.log(`User ${i + 1} after validation:`, { ...validatedData, password: '[HASHED]' });
          
          const created = await storage.createDashboardUser(validatedData);
          console.log(`User ${i + 1} created successfully:`, created.id);
          
          successCount++;
        } catch (error: any) {
          errorCount++;
          const errorMessage = error.message || 'Invalid dashboard user data';
          errors.push(`Row ${i + 1}: ${errorMessage}`);
          console.error(`Error creating dashboard user ${i + 1}:`, error);
          
          // Log validation errors in detail
          if (error.issues) {
            console.error(`Validation issues for user ${i + 1}:`, error.issues);
          }
        }
      }
      
      console.log(`Bulk upload complete: ${successCount} success, ${errorCount} errors`);
      
      res.status(201).json({
        successCount,
        errorCount,
        totalProcessed: users.length,
        errors: errors.slice(0, 10), // Limit errors to first 10 for response size
      });
    } catch (error) {
      console.error("Error in bulk dashboard user creation:", error);
      res.status(500).json({ error: "Internal server error during bulk creation" });
    }
  });

  app.get("/api/dashboard-users/:id", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const user = await storage.getDashboardUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "Dashboard user not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching dashboard user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/dashboard-users/:id", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const user = await storage.updateDashboardUser(userId, req.body);
      if (!user) {
        return res.status(404).json({ error: "Dashboard user not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating dashboard user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/dashboard-users/:id", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const success = await storage.deleteDashboardUser(userId);
      if (!success) {
        return res.status(404).json({ error: "Dashboard user not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting dashboard user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Issue routes (protected)
  // Commented out - now handled by modular routes in routes/issueRoutes.ts
  /* app.get("/api/issues", authenticateToken, async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        assignedTo: req.query.assignedTo as string,
        employeeId: req.query.employeeId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      
      // If user is an employee, only show their own issues
      if (req.user?.userType === 'employee') {
        filters.employeeId = req.user.id.toString();
      }
      
      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      let issues = await storage.getIssues(filters);
      
      // Apply city restrictions for dashboard users with city-restricted access
      if (req.user?.userType === 'dashboard_user') {
        try {
          // Get current user's details and permissions
          const userId = req.user.id;
          const dashboardUser = await storage.getDashboardUserById(userId);
          
          if (dashboardUser?.city) {
            // Query user's RBAC permissions to check for city restrictions
            const rbacQuery = await pool.query(`
              SELECT p.name as permission_name 
              FROM rbac_user_roles ur
              JOIN rbac_role_permissions rp ON ur.role_id = rp.role_id
              JOIN rbac_permissions p ON rp.permission_id = p.id
              WHERE ur.user_id = $1
            `, [userId]);
            
            const permissions = rbacQuery.rows.map((row: any) => row.permission_name);
            const hasAllCityAccess = permissions.includes('access:all_cities');
            const hasCityRestricted = permissions.includes('access:city_restricted');
            
            // If user has city restrictions and not all-city access, filter by city
            if (hasCityRestricted && !hasAllCityAccess) {
              console.log(`Applying city filter for user ${userId}: ${dashboardUser.city}`);
              
              // Get all unique employee IDs from issues
              const employeeIds = Array.from(new Set(issues.map(issue => issue.employeeId).filter(Boolean)));
              
              if (employeeIds.length > 0) {
                // Query employees directly using raw SQL to avoid type issues
                const placeholders = employeeIds.map((_, index) => `$${index + 1}`).join(',');
                const employeeQuery = await pool.query(
                  `SELECT id, city FROM employees WHERE id IN (${placeholders})`,
                  employeeIds
                );
                
                const employeeCityMap = new Map();
                employeeQuery.rows.forEach((emp: any) => {
                  employeeCityMap.set(emp.id, emp.city);
                });
                
                // Filter issues by employee city matching user's city
                const originalCount = issues.length;
                issues = issues.filter(issue => {
                  const employeeCity = employeeCityMap.get(issue.employeeId);
                  return employeeCity === dashboardUser.city;
                });
                
                console.log(`City filtering: ${originalCount} -> ${issues.length} issues for city: ${dashboardUser.city}`);
              }
            }
          }
        } catch (error) {
          console.error('Error applying city restrictions:', error);
          // Continue without filtering on error
        }
      }

      res.json(issues);
    } catch (error) {
      console.error("Error fetching issues:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }); */

  app.get("/api/issues/count", authenticateToken, async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        assignedTo: req.query.assignedTo as string,
        employeeId: req.query.employeeId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      
      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const issues = await storage.getIssues(filters);
      res.json({ count: issues.length });
    } catch (error) {
      console.error("Error fetching issues count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/issues/:id", authenticateToken, async (req, res) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      const issue = await storage.getIssueById(issueId);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      
      // Authorization check: dashboard users can see all issues, employees can only see their own
      if (req.user?.userType === 'employee') {
        // Ensure both values are compared as numbers
        const userIdNum = Number(req.user.id);
        const issueEmployeeIdNum = Number(issue.employeeId);
        
        console.log(`Employee access check - User ID: ${userIdNum}, Issue Employee ID: ${issueEmployeeIdNum}, Issue ID: ${issueId}`);
        
        if (issueEmployeeIdNum !== userIdNum) {
          console.log(`Access denied: Employee ${userIdNum} cannot access issue ${issueId} created by employee ${issueEmployeeIdNum}`);
          return res.status(403).json({ error: "You do not have permission to view this issue" });
        }
        
        console.log(`Access granted: Employee ${userIdNum} can access their own issue ${issueId}`);
      }
      
      res.json(issue);
    } catch (error) {
      console.error("Error fetching issue:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/issues", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertIssueSchema.parse(req.body);
      const issue = await storage.createIssue(validatedData);
      res.status(201).json(issue);
    } catch (error) {
      console.error("Error creating issue:", error);
      res.status(400).json({ error: "Invalid issue data" });
    }
  });

  app.put("/api/issues/:id", authenticateToken, async (req, res) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      const issue = await storage.updateIssue(issueId, req.body);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      res.json(issue);
    } catch (error) {
      console.error("Error updating issue:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/issues/:id", authenticateToken, async (req, res) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      console.log(`PATCH /api/issues/${issueId} - Update data:`, req.body);
      
      // Get current issue to compare status changes
      const currentIssue = await storage.getIssueById(issueId);
      if (!currentIssue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      
      // Update the issue
      const issue = await storage.updateIssue(issueId, req.body);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      
      // Record audit trail for status changes
      if (req.body.status && req.body.status !== currentIssue.status) {
        console.log(`Status change detected: ${currentIssue.status} → ${req.body.status}`);
      }
      
      console.log(`Successfully updated issue ${issueId} to status: ${issue.status}`);
      res.json(issue);
    } catch (error) {
      console.error("Error updating issue:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Issue comment routes (protected)
  app.get("/api/issues/:issueId/comments", authenticateToken, async (req, res) => {
    try {
      const issueId = parseInt(req.params.issueId);
      if (isNaN(issueId)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      const comments = await storage.getIssueComments(issueId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching issue comments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/issues/:issueId/comments", authenticateToken, async (req, res) => {
    try {
      const issueId = parseInt(req.params.issueId);
      if (isNaN(issueId)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      
      // Use employeeId from request body, or fall back to authenticated user ID
      const employeeId = req.body.employeeId || req.user?.id;
      
      if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
      }
      
      const validatedData = insertIssueCommentSchema.parse({
        content: req.body.content,
        issueId: issueId,
        employeeId: employeeId
      });
      
      const comment = await storage.createIssueComment(validatedData);
      
      // Get user info for audit trail
      let userInfo = null;
      if (req.user?.userType === 'dashboard_user') {
        const dashboardUser = await storage.getDashboardUserById(employeeId);
        if (dashboardUser) {
          userInfo = {
            name: dashboardUser.name,
            role: dashboardUser.role,
            id: dashboardUser.id
          };
        }
      } else {
        const employee = await storage.getEmployeeById(employeeId);
        if (employee) {
          userInfo = {
            name: employee.name,
            role: employee.role,
            id: employee.id
          };
        }
      }
      
      // Create audit trail entry
      await storage.createIssueAuditTrail({
        issueId: issueId,
        action: 'comment_added',
        employeeId: employeeId,
        details: {
          comment_content: req.body.content.substring(0, 100) + (req.body.content.length > 100 ? '...' : ''),
          performer: userInfo
        }
      });
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating issue comment:", error);
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  // Issue internal comment routes (protected)
  app.get("/api/issues/:issueId/internal-comments", authenticateToken, async (req, res) => {
    try {
      const issueId = parseInt(req.params.issueId);
      if (isNaN(issueId)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      
      // Get internal comments for the issue
      const comments = await storage.getIssueInternalComments(issueId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching issue internal comments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/issues/:issueId/internal-comments", authenticateToken, async (req, res) => {
    try {
      const issueId = parseInt(req.params.issueId);
      if (isNaN(issueId)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      
      // Use employeeId from request body, or fall back to authenticated user ID
      const employeeId = req.body.employeeId || req.user?.id;
      
      if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
      }
      
      const validatedData = {
        content: req.body.content,
        issueId: issueId,
        employeeId: employeeId
      };
      
      const comment = await storage.createIssueInternalComment(validatedData);
      
      // Get user info for audit trail
      let userInfo = null;
      if (req.user?.userType === 'dashboard_user') {
        const dashboardUser = await storage.getDashboardUserById(employeeId);
        if (dashboardUser) {
          userInfo = {
            name: dashboardUser.name,
            role: dashboardUser.role,
            id: dashboardUser.id
          };
        }
      } else {
        const employee = await storage.getEmployeeById(employeeId);
        if (employee) {
          userInfo = {
            name: employee.name,
            role: employee.role,
            id: employee.id
          };
        }
      }
      
      // Create audit trail entry
      await storage.createIssueAuditTrail({
        issueId: issueId,
        action: 'internal_comment_added',
        employeeId: employeeId,
        details: {
          comment_content: req.body.content.substring(0, 100) + (req.body.content.length > 100 ? '...' : ''),
          performer: userInfo
        }
      });
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating issue internal comment:", error);
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  // Issue audit trail routes (protected)
  app.get("/api/issues/:issueId/audit-trail", authenticateToken, async (req, res) => {
    try {
      const issueId = parseInt(req.params.issueId);
      if (isNaN(issueId)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      
      // Get audit trail for the issue
      const auditTrail = await storage.getIssueAuditTrail(issueId);
      res.json(auditTrail);
    } catch (error) {
      console.error("Error fetching issue audit trail:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/issue-audit-trail", authenticateToken, async (req, res) => {
    try {
      const { issueId, employeeId, action, previousStatus, newStatus, details } = req.body;
      
      // Validate required fields
      if (!issueId || !employeeId || !action) {
        return res.status(400).json({ error: "Missing required fields: issueId, employeeId, action" });
      }
      
      // Create audit trail entry
      const auditEntry = await storage.createIssueAuditTrail({
        issueId: parseInt(issueId),
        employeeId: parseInt(employeeId),
        action,
        previousStatus,
        newStatus,
        details: details ? JSON.stringify(details) : null
      });
      
      res.status(201).json(auditEntry);
    } catch (error) {
      console.error("Error creating audit trail entry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Ticket feedback routes (protected)
  app.get("/api/ticket-feedback", authenticateToken, async (req, res) => {
    try {
      const issueIdParam = req.query.issueId as string;
      const employeeIdParam = req.query.employeeId as string;
      const employeeUuidParam = req.query.employeeUuid as string;
      
      const issueId = issueIdParam ? parseInt(issueIdParam) : undefined;
      if (issueIdParam && isNaN(issueId!)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      
      // Handle employee parameter (could be employeeId or employeeUuid)
      let employeeId: number | undefined;
      if (employeeIdParam) {
        employeeId = parseInt(employeeIdParam);
        if (isNaN(employeeId)) {
          return res.status(400).json({ error: "Invalid employee ID" });
        }
      } else if (employeeUuidParam) {
        employeeId = parseInt(employeeUuidParam);
        if (isNaN(employeeId)) {
          return res.status(400).json({ error: "Invalid employee UUID" });
        }
      }
      
      // Get all feedback first
      const feedback = await storage.getTicketFeedback(issueId);
      
      // Apply additional filters for analytics
      let filteredFeedback = feedback;
      
      // Filter by employee if specified
      if (employeeId) {
        filteredFeedback = filteredFeedback.filter((f: any) => f.employeeId === employeeId);
      }
      
      // Filter by city if specified
      if (req.query.city && req.query.city !== 'all') {
        filteredFeedback = filteredFeedback.filter((f: any) => f.city === req.query.city);
      }
      
      // Filter by cluster if specified
      if (req.query.cluster && req.query.cluster !== 'all') {
        filteredFeedback = filteredFeedback.filter((f: any) => f.cluster === req.query.cluster);
      }
      
      // If both issueId and employeeId are provided, check if feedback exists for this combination
      if (issueId && employeeId) {
        const exists = filteredFeedback.some((f: any) => f.issueId === issueId && f.employeeId === employeeId);
        return res.json({ exists });
      }
      
      // Filter by date range
      if (req.query.startDate) {
        const startDate = new Date(req.query.startDate as string);
        filteredFeedback = filteredFeedback.filter((f: any) => {
          const feedbackDate = new Date(f.createdAt || f.created_at || '');
          return feedbackDate >= startDate;
        });
      }
      
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate as string);
        endDate.setDate(endDate.getDate() + 1); // Include the end date
        filteredFeedback = filteredFeedback.filter((f: any) => {
          const feedbackDate = new Date(f.createdAt || f.created_at || '');
          return feedbackDate < endDate;
        });
      }
      
      // Filter by sentiment
      if (req.query.sentiment) {
        filteredFeedback = filteredFeedback.filter((f: any) => f.sentiment === req.query.sentiment);
      }
      
      // Filter by city
      if (req.query.city) {
        filteredFeedback = filteredFeedback.filter((f: any) => f.city === req.query.city);
      }
      
      // Filter by cluster
      if (req.query.cluster) {
        filteredFeedback = filteredFeedback.filter((f: any) => f.cluster === req.query.cluster);
      }
      
      // Filter by agent
      if (req.query.agentId) {
        filteredFeedback = filteredFeedback.filter((f: any) => f.agentId === req.query.agentId || f.agent_id === req.query.agentId);
      }
      
      if (req.query.agentName) {
        filteredFeedback = filteredFeedback.filter((f: any) => f.agentName === req.query.agentName || f.agent_name === req.query.agentName);
      }
      
      res.json(filteredFeedback);
    } catch (error) {
      console.error("Error fetching ticket feedback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/ticket-feedback", authenticateToken, async (req, res) => {
    try {
      // Convert issueId and employeeId to numbers if they're strings
      const requestData = {
        ...req.body,
        issueId: typeof req.body.issueId === 'string' ? parseInt(req.body.issueId) : req.body.issueId,
        employeeId: typeof req.body.employeeId === 'string' ? parseInt(req.body.employeeId) : req.body.employeeId
      };
      
      // Get employee details to add city and cluster
      if (requestData.employeeId) {
        const employee = await storage.getEmployee(requestData.employeeId);
        if (employee) {
          requestData.city = employee.city;
          requestData.cluster = employee.cluster;
        }
      }
      
      const validatedData = insertTicketFeedbackSchema.parse(requestData);
      const feedback = await storage.createTicketFeedback(validatedData);
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating ticket feedback:", error);
      res.status(400).json({ error: "Invalid feedback data" });
    }
  });

  app.post("/api/ticket-feedback/bulk", authenticateToken, async (req, res) => {
    try {
      const { issueIds } = req.body;
      if (!Array.isArray(issueIds)) {
        return res.status(400).json({ error: "issueIds must be an array" });
      }

      // Get all feedback for the provided issue IDs
      const allFeedback = await storage.getTicketFeedback();
      const feedbacks = allFeedback.filter((feedback: any) => 
        issueIds.includes(String(feedback.issueId))
      );

      res.json({ feedbacks });
    } catch (error) {
      console.error("Error fetching bulk ticket feedback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });



  // Sentiment analysis route (protected)
  app.post("/api/analyze-sentiment", authenticateToken, async (req, res) => {
    try {
      const { feedback } = req.body;
      
      if (!feedback) {
        return res.status(400).json({ error: "Missing feedback text" });
      }

      // Simple sentiment analysis implementation
      const positiveWords = [
        "good", "great", "excellent", "amazing", "awesome", "fantastic", "wonderful", 
        "happy", "satisfied", "convenient", "helpful", "easy", "comfortable", "enjoy",
        "like", "love", "appreciate", "best", "better", "improved", "thank", "thanks"
      ];

      const negativeWords = [
        "bad", "poor", "terrible", "awful", "horrible", "disappointing", "frustrated",
        "difficult", "hard", "unhappy", "unsatisfied", "inconvenient", "unhelpful", 
        "uncomfortable", "dislike", "hate", "worst", "worse", "not good", "problem",
        "issue", "complaint", "broken", "useless", "waste", "annoying", "annoyed"
      ];

      const normalized = feedback.toLowerCase();
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      for (const word of positiveWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = normalized.match(regex);
        if (matches) {
          positiveCount += matches.length;
        }
      }
      
      for (const word of negativeWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = normalized.match(regex);
        if (matches) {
          negativeCount += matches.length;
        }
      }
      
      let score = 0;
      if (positiveCount > 0 || negativeCount > 0) {
        score = (positiveCount - negativeCount) / (positiveCount + negativeCount);
      }
      
      let label;
      if (score >= 0.3) {
        label = "positive";
      } else if (score > -0.3 && score < 0.3) {
        label = "neutral";
      } else {
        label = "negative";
      }

      let suggestedRating;
      if (score >= 0.5) {
        suggestedRating = 5;
      } else if (score >= 0.1) {
        suggestedRating = 4;
      } else if (score >= -0.1) {
        suggestedRating = 3;
      } else if (score >= -0.5) {
        suggestedRating = 2;
      } else {
        suggestedRating = 1;
      }

      res.json({
        sentiment_score: score,
        sentiment_label: label,
        rating: suggestedRating,
        suggested_tags: [],
        flag_urgent: false,
        flag_abusive: false
      });
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Helper function to calculate actual time taken with prorated business hours
  function calculateBusinessHoursIST(startDate: Date, endDate: Date): number {
    // Convert to IST timezone
    const istStart = new Date(startDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const istEnd = new Date(endDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
    // Working hours: Monday-Saturday, 9 AM - 5 PM IST (8 hours per day)
    const workingStartHour = 9;
    const workingEndHour = 17;
    const hoursPerWorkingDay = 8;
    
    // Calculate total elapsed time
    const totalMs = istEnd.getTime() - istStart.getTime();
    const totalHours = totalMs / (1000 * 60 * 60);
    
    // If ticket was created and resolved within same working day, calculate actual working hours
    if (istStart.toDateString() === istEnd.toDateString() && 
        istStart.getDay() !== 0 && // Not Sunday
        istStart.getHours() >= workingStartHour && istStart.getHours() < workingEndHour &&
        istEnd.getHours() >= workingStartHour && istEnd.getHours() <= workingEndHour) {
      return totalHours;
    }
    
    // For tickets spanning multiple days or non-working hours, calculate prorated business hours
    let businessHours = 0;
    let currentDate = new Date(istStart);
    
    while (currentDate < istEnd) {
      const dayOfWeek = currentDate.getDay();
      
      // Skip Sundays completely
      if (dayOfWeek !== 0) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(workingStartHour, 0, 0, 0);
        
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(workingEndHour, 0, 0, 0);
        
        const periodStart = currentDate < dayStart ? dayStart : currentDate;
        const periodEnd = istEnd > dayEnd ? dayEnd : istEnd;
        
        if (periodStart < periodEnd) {
          const periodHours = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60);
          businessHours += periodHours;
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(workingStartHour, 0, 0, 0);
    }
    
    // If no business hours calculated (e.g., weekend-only resolution), show prorated time
    if (businessHours === 0 && totalHours > 0) {
      // Prorate based on working day ratio (6 working days out of 7, 8 working hours out of 24)
      const workingDayRatio = 6/7; // Monday-Saturday out of 7 days
      const workingHourRatio = 8/24; // 8 working hours out of 24 hours
      businessHours = totalHours * workingDayRatio * workingHourRatio;
      
      console.log(`Prorated calculation: Total ${totalHours.toFixed(2)}h × ${workingDayRatio} × ${workingHourRatio} = ${businessHours.toFixed(2)}h business hours`);
    }
    
    return Math.max(0, businessHours);
  }

  // Business Hours Metrics endpoint
  app.get("/api/analytics/business-metrics", authenticateToken, async (req, res) => {
    try {
      const issues = await storage.getIssues({});
      
      // Calculate simple business hours metrics
      const { calculateBusinessHours, formatBusinessHours } = await import("../shared/businessHoursUtils");
      
      let totalResolutionHours = 0;
      let totalFirstResponseHours = 0;
      let resolvedCount = 0;
      let respondedCount = 0;
      
      console.log('Business metrics: Processing', issues.length, 'issues');
      
      issues.forEach(issue => {
        console.log(`Issue ${issue.id}: status=${issue.status}, createdAt=${issue.createdAt}, closedAt=${issue.closedAt}, resolvedAt=${issue.resolvedAt}, firstResponseAt=${issue.firstResponseAt}`);
        
        // Calculate resolution time for closed/resolved issues
        if ((issue.status === 'closed' || issue.status === 'resolved') && issue.createdAt) {
          // Use resolvedAt if available, otherwise use closedAt
          const endTime = issue.resolvedAt || issue.closedAt;
          if (endTime) {
            try {
              const createdAt = new Date(issue.createdAt);
              const resolvedAt = new Date(endTime);
              
              // Calculate proper business hours using IST timezone
              const businessHours = calculateBusinessHoursIST(createdAt, resolvedAt);
              
              const totalMs = resolvedAt.getTime() - createdAt.getTime();
              const totalHours = totalMs / (1000 * 60 * 60);
              
              console.log(`Issue ${issue.id}: Resolution time = ${businessHours.toFixed(2)} business hours (${totalHours.toFixed(2)} total hours) - Created: ${createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}, Resolved: ${resolvedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
              
              totalResolutionHours += businessHours;
              resolvedCount++;
            } catch (error) {
              console.error('Error calculating resolution time:', error);
            }
          }
        }
        
        // Calculate first response time
        if (issue.firstResponseAt && issue.createdAt) {
          try {
            const createdAt = new Date(issue.createdAt);
            const firstResponseAt = new Date(issue.firstResponseAt);
            
            // Calculate proper business hours using IST timezone
            const businessHours = calculateBusinessHoursIST(createdAt, firstResponseAt);
            
            const totalMs = firstResponseAt.getTime() - createdAt.getTime();
            const totalHours = totalMs / (1000 * 60 * 60);
            
            console.log(`Issue ${issue.id}: First response time = ${businessHours.toFixed(2)} business hours (${totalHours.toFixed(2)} total hours) - Created: ${createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}, Responded: ${firstResponseAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
            
            totalFirstResponseHours += businessHours;
            respondedCount++;
          } catch (error) {
            console.error('Error calculating first response time:', error);
          }
        }
      });
      
      const avgResolutionTime = resolvedCount > 0 ? totalResolutionHours / resolvedCount : 0;
      const avgFirstResponseTime = respondedCount > 0 ? totalFirstResponseHours / respondedCount : 0;
      
      res.json({
        avgResolutionTime,
        avgFirstResponseTime,
        avgResolutionTimeFormatted: formatBusinessHours(avgResolutionTime),
        avgFirstResponseTimeFormatted: formatBusinessHours(avgFirstResponseTime),
        resolvedCount,
        respondedCount,
        totalIssues: issues.length
      });
    } catch (error) {
      console.error("Error calculating business metrics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SLA and TAT reporting routes
  app.get("/api/sla/metrics", authenticateToken, async (req, res) => {
    try {
      const { calculateSLAMetrics, calculateTATStats } = await import("./utils/sla");
      
      // Get all issues for SLA calculation
      const allIssues = await storage.getIssues();
      
      // Calculate SLA metrics for each issue
      const issuesWithSLA = allIssues.map(issue => ({
        ...issue,
        slaMetrics: calculateSLAMetrics(issue)
      }));
      
      // Calculate overall TAT statistics
      const tatStats = calculateTATStats(allIssues);
      
      // Calculate SLA compliance by priority
      const slaByPriority = ['critical', 'high', 'medium', 'low'].map(priority => {
        const priorityIssues = allIssues.filter(issue => issue.priority === priority);
        const resolvedPriorityIssues = priorityIssues.filter(issue => 
          issue.status === 'resolved' || issue.status === 'closed'
        );
        
        const slaCompliantIssues = resolvedPriorityIssues.filter(issue => {
          const metrics = calculateSLAMetrics(issue);
          return !metrics.isResolutionSLABreached;
        });
        
        return {
          priority,
          totalIssues: priorityIssues.length,
          resolvedIssues: resolvedPriorityIssues.length,
          slaCompliantIssues: slaCompliantIssues.length,
          complianceRate: resolvedPriorityIssues.length > 0 
            ? (slaCompliantIssues.length / resolvedPriorityIssues.length) * 100 
            : 0
        };
      });
      
      res.json({
        overallTAT: tatStats,
        slaByPriority,
        issuesWithSLA: issuesWithSLA.slice(0, 20) // Return only first 20 for performance
      });
    } catch (error) {
      console.error("Error calculating SLA metrics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/sla/alerts", authenticateToken, async (req, res) => {
    try {
      const { getIssuesNearSLABreach } = await import("./utils/sla");
      
      const openIssues = await storage.getIssues({ 
        status: 'open'
      });
      const inProgressIssues = await storage.getIssues({ 
        status: 'in_progress'
      });
      
      const allActiveIssues = [...openIssues, ...inProgressIssues];
      
      // Get issues within 1 hour of SLA breach
      const nearBreachIssues = getIssuesNearSLABreach(allActiveIssues, 1);
      
      res.json({
        nearBreachIssues: nearBreachIssues.map(({ issue, slaMetrics }) => ({
          id: issue.id,
          description: issue.description,
          priority: issue.priority,
          status: issue.status,
          createdAt: issue.createdAt,
          timeToBreach: slaMetrics.resolutionTimeRemaining,
          slaStatus: slaMetrics.slaStatus
        }))
      });
    } catch (error) {
      console.error("Error fetching SLA alerts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Master data routes (protected)
  
  // Master roles routes
  app.get("/api/master-roles", authenticateToken, async (req, res) => {
    try {
      const result = await storage.getMasterRoles();
      res.json(result);
    } catch (error) {
      console.error("Error fetching master roles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/master-roles", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Role name is required" });
      }
      const result = await storage.createMasterRole(name);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating master role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/master-roles/:id", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const { name } = req.body;
      if (isNaN(roleId) || !name) {
        return res.status(400).json({ error: "Invalid role ID or missing name" });
      }
      const result = await storage.updateMasterRole(roleId, name);
      if (!result) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error updating master role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/master-roles/:id", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: "Invalid role ID" });
      }
      const success = await storage.deleteMasterRole(roleId);
      if (!success) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting master role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Master cities routes
  app.get("/api/master-cities", authenticateToken, async (req, res) => {
    try {
      const result = await storage.getMasterCities();
      res.json(result);
    } catch (error) {
      console.error("Error fetching master cities:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/master-cities", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "City name is required" });
      }
      const result = await storage.createMasterCity(name);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating master city:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/master-cities/:id", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const cityId = parseInt(req.params.id);
      const { name } = req.body;
      if (isNaN(cityId) || !name) {
        return res.status(400).json({ error: "Invalid city ID or missing name" });
      }
      const result = await storage.updateMasterCity(cityId, name);
      if (!result) {
        return res.status(404).json({ error: "City not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error updating master city:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/master-cities/:id", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const cityId = parseInt(req.params.id);
      if (isNaN(cityId)) {
        return res.status(400).json({ error: "Invalid city ID" });
      }
      const success = await storage.deleteMasterCity(cityId);
      if (!success) {
        return res.status(404).json({ error: "City not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting master city:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Master clusters routes
  app.get("/api/master-clusters", authenticateToken, async (req, res) => {
    try {
      const result = await storage.getMasterClusters();
      res.json(result);
    } catch (error) {
      console.error("Error fetching master clusters:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/master-clusters", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const { name, cityId } = req.body;
      if (!name || !cityId) {
        return res.status(400).json({ error: "Cluster name and city ID are required" });
      }
      const result = await storage.createMasterCluster(name, cityId);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating master cluster:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/master-clusters/:id", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const clusterId = parseInt(req.params.id);
      const { name, cityId } = req.body;
      if (isNaN(clusterId) || !name || !cityId) {
        return res.status(400).json({ error: "Invalid cluster ID or missing data" });
      }
      const result = await storage.updateMasterCluster(clusterId, name, cityId);
      if (!result) {
        return res.status(404).json({ error: "Cluster not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error updating master cluster:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/master-clusters/:id", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const clusterId = parseInt(req.params.id);
      if (isNaN(clusterId)) {
        return res.status(400).json({ error: "Invalid cluster ID" });
      }
      const success = await storage.deleteMasterCluster(clusterId);
      if (!success) {
        return res.status(404).json({ error: "Cluster not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting master cluster:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Audit logs routes (protected)
  app.get("/api/audit-logs", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      // For now, return empty array since audit logs aren't fully implemented
      res.json([]);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/audit-logs", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      // For now, just acknowledge the request since audit logs aren't fully implemented
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating audit log:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Migration routes (protected)
  app.post("/api/migrate-master-data", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const { migrateMasterDataReferences, populateMasterDataFromExisting } = await import("./migrateMasterData");
      
      // First populate any missing master data
      const populateResult = await populateMasterDataFromExisting();
      if (!populateResult.success) {
        return res.status(500).json({ error: populateResult.error });
      }
      
      // Then migrate the foreign key references
      const migrateResult = await migrateMasterDataReferences();
      if (!migrateResult.success) {
        return res.status(500).json({ error: migrateResult.error });
      }
      
      res.json({ 
        message: "Master data migration completed successfully",
        details: {
          populate: populateResult.message,
          migrate: migrateResult.message
        }
      });
    } catch (error) {
      console.error("Error during master data migration:", error);
      res.status(500).json({ error: "Failed to migrate master data" });
    }
  });

  // Seed data route (protected - for development/demo)
  app.post("/api/seed-data", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const result = await seedDatabase();
      res.json({ 
        message: "Database seeded successfully", 
        data: result 
      });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  // Add original Supabase data route
  app.post("/api/seed-original-data", async (req, res) => {
    try {
      // Add authentic Supabase data programmatically
      
      // Dashboard users with correct columns
      const dashboardUsers = [
        {
          name: "Sagar KM",
          email: "sagar.km@yulu.bike", 
          password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          role: "City Head",
          phone: "+91-9876543220",
          city: "Bangalore",
          cluster: "Central"
        },
        {
          name: "Amit Sharma",
          email: "amit.sharma@yulu.bike",
          password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", 
          role: "City Head",
          phone: "+91-9876543221",
          city: "Mumbai",
          cluster: "Central"
        },
        {
          name: "Rajesh Kumar", 
          email: "rajesh.kumar@yulu.bike",
          password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          role: "City Head",
          phone: "+91-9876543222", 
          city: "Delhi",
          cluster: "Central"
        },
        {
          name: "HR Admin",
          email: "hr@yulu.bike",
          password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          role: "HR Admin", 
          phone: "+91-9876543223",
          city: "Bangalore",
          cluster: "HQ_YULU PTP"
        }
      ];

      // Create dashboard users
      const createdDashboardUsers = [];
      for (const userData of dashboardUsers) {
        try {
          const user = await storage.createDashboardUser(userData);
          createdDashboardUsers.push(user);
        } catch (error) {
          console.log(`Dashboard user ${userData.name} may already exist`);
        }
      }

      // Employees with correct columns 
      const employees = [
        {
          name: "Ravi Kumar",
          email: "ravi.kumar@yulu.bike",
          password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          empId: "EMP003",
          phone: "+91-9876543210",
          city: "Bangalore", 
          cluster: "Koramangala",
          role: "Delivery Executive",
          manager: "Sagar KM"
        },
        {
          name: "Priya Singh",
          email: "priya.singh@yulu.bike",
          password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          empId: "EMP004", 
          phone: "+91-9876543211",
          city: "Mumbai",
          cluster: "Andheri",
          role: "Pilot",
          manager: "Amit Sharma"
        },
        {
          name: "Suresh Yadav",
          email: "suresh.yadav@yulu.bike",
          password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          empId: "EMP005",
          phone: "+91-9876543212",
          city: "Delhi",
          cluster: "Dwarka", 
          role: "Mechanic",
          manager: "Rajesh Kumar"
        },
        {
          name: "Kavita Sharma",
          email: "kavita.sharma@yulu.bike",
          password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          empId: "EMP006",
          phone: "+91-9876543213",
          city: "Bangalore",
          cluster: "HSR Layout",
          role: "Marshal", 
          manager: "Sagar KM"
        },
        {
          name: "Deepak Gupta",
          email: "deepak.gupta@yulu.bike", 
          password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          empId: "EMP007",
          phone: "+91-9876543214",
          city: "Mumbai",
          cluster: "Bandra",
          role: "Zone Screener",
          manager: "Amit Sharma"
        },
        {
          name: "Sunita Devi",
          email: "sunita.devi@yulu.bike",
          password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          empId: "EMP008",
          phone: "+91-9876543215", 
          city: "Delhi",
          cluster: "Central Delhi",
          role: "Yulu Captain",
          manager: "Rajesh Kumar"
        },
        {
          name: "Manish Tiwari",
          email: "manish.tiwari@yulu.bike",
          password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          empId: "EMP009",
          phone: "+91-9876543216",
          city: "Bangalore",
          cluster: "Electronic city",
          role: "Bike Captain",
          manager: "Sagar KM" 
        },
        {
          name: "Rekha Singh",
          email: "rekha.singh@yulu.bike",
          password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
          empId: "EMP010",
          phone: "+91-9876543217",
          city: "Mumbai",
          cluster: "Powai",
          role: "Operator",
          manager: "Amit Sharma"
        }
      ];

      // Create employees
      const createdEmployees = [];
      for (const empData of employees) {
        try {
          const employee = await storage.createEmployee(empData);
          createdEmployees.push(employee);
        } catch (error) {
          console.log(`Employee ${empData.name} may already exist`);
        }
      }

      res.json({
        message: "Original Supabase data added successfully",
        summary: {
          dashboardUsers: createdDashboardUsers.length,
          employees: createdEmployees.length
        }
      });
    } catch (error) {
      console.error("Error adding original data:", error);
      res.status(500).json({ error: "Failed to add original data" });
    }
  });

  const httpServer = createServer(app);
  
  // Add WebSocket support for real-time chat
  const { WebSocketServer, WebSocket } = await import('ws');
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Extend WebSocket type for custom properties
  interface ExtendedWebSocket extends InstanceType<typeof WebSocket> {
    issueId?: string;
    userId?: string;
  }
  
  // Store active connections by user
  const activeConnections = new Map<string, ExtendedWebSocket>();
  
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection established');
    const extendedWs = ws as ExtendedWebSocket;
    
    extendedWs.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'authenticate':
            // Authenticate user and store connection
            const { token, userId } = data;
            if (token && userId) {
              activeConnections.set(userId, extendedWs);
              extendedWs.userId = userId;
              extendedWs.send(JSON.stringify({ type: 'authenticated', userId }));
              console.log(`User ${userId} authenticated and connected`);
            }
            break;
            
          case 'join_issue':
            // User joins an issue chat room
            const { issueId } = data;
            extendedWs.issueId = issueId;
            console.log(`User joined issue ${issueId} chat`);
            break;
            
          case 'new_comment':
            // Broadcast new comment to all users in the issue
            const { comment, issueId: commentIssueId } = data;
            broadcastToIssue(commentIssueId, {
              type: 'comment_added',
              comment,
              timestamp: new Date()
            });
            break;
            
          case 'status_change':
            // Broadcast status change to all users in the issue
            const { status, issueId: statusIssueId } = data;
            broadcastToIssue(statusIssueId, {
              type: 'status_updated',
              status,
              timestamp: new Date()
            });
            break;
            
          case 'typing':
            // Broadcast typing indicator
            const { isTyping, userName, typingIssueId } = data;
            broadcastToIssue(typingIssueId, {
              type: 'typing_indicator',
              isTyping,
              userName,
              timestamp: new Date()
            }, extendedWs); // Exclude sender
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    extendedWs.on('close', () => {
      // Remove connection from active connections
      activeConnections.forEach((connection, userId) => {
        if (connection === extendedWs) {
          activeConnections.delete(userId);
          console.log(`User ${userId} disconnected`);
        }
      });
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // RBAC routes (protected)
  
  // Get all roles
  app.get("/api/rbac/roles", authenticateToken, async (req, res) => {
    try {
      const { pool } = await import("./config/db");
      const query = `SELECT * FROM rbac_roles ORDER BY name`;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching RBAC roles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all permissions
  app.get("/api/rbac/permissions", authenticateToken, async (req, res) => {
    try {
      const { pool } = await import("./config/db");
      const query = `SELECT * FROM rbac_permissions ORDER BY name`;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching RBAC permissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get permissions for a specific role
  app.get("/api/rbac/roles/:roleId/permissions", authenticateToken, async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: "Invalid role ID" });
      }
      
      const { pool } = await import("./config/db");
      const query = `
        SELECT p.* 
        FROM rbac_permissions p
        INNER JOIN rbac_role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = $1
        ORDER BY p.name
      `;
      const result = await pool.query(query, [roleId]);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Assign permission to role
  app.post("/api/rbac/role-permissions", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const { roleId, permissionId } = req.body;
      
      if (!roleId || !permissionId) {
        return res.status(400).json({ error: "Role ID and Permission ID are required" });
      }
      
      const { pool } = await import("./config/db");
      const query = `
        INSERT INTO rbac_role_permissions (role_id, permission_id, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (role_id, permission_id) DO NOTHING
        RETURNING *
      `;
      const result = await pool.query(query, [roleId, permissionId]);
      
      if (result.rows.length === 0) {
        return res.status(200).json({ message: "Permission already assigned to role" });
      }
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error assigning permission to role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Remove permission from role
  app.delete("/api/rbac/roles/:roleId/permissions/:permissionId", authenticateToken, requireDashboardUser, async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);
      
      if (isNaN(roleId) || isNaN(permissionId)) {
        return res.status(400).json({ error: "Invalid role ID or permission ID" });
      }
      
      const { pool } = await import("./config/db");
      const query = `
        DELETE FROM rbac_role_permissions 
        WHERE role_id = $1 AND permission_id = $2
      `;
      const result = await pool.query(query, [roleId, permissionId]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Permission assignment not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error removing permission from role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Helper function to broadcast to all users in an issue
  function broadcastToIssue(issueId: string, message: any, excludeWs?: ExtendedWebSocket) {
    wss.clients.forEach((client) => {
      const extendedClient = client as ExtendedWebSocket;
      if (extendedClient.readyState === WebSocket.OPEN && 
          extendedClient.issueId === issueId && 
          extendedClient !== excludeWs) {
        extendedClient.send(JSON.stringify(message));
      }
    });
  }
  
  return httpServer;
}
