import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { employeeModel } from '../models/Employee';
import { insertEmployeeSchema } from '@shared/schema';

export class EmployeeController {
  /**
   * Get all employees
   */
  async getEmployees(req: Request, res: Response) {
    try {
      const { city, cluster, role, search } = req.query;
      
      const employees = await employeeModel.findAll({
        city: city as string,
        cluster: cluster as string,
        role: role as string,
        search: search as string
      });
      
      return res.json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      return res.status(500).json({ error: 'Failed to fetch employees' });
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployee(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const employee = await employeeModel.findById(id);
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      return res.json(employee);
    } catch (error) {
      console.error('Error fetching employee:', error);
      return res.status(500).json({ error: 'Failed to fetch employee' });
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(req: Request, res: Response) {
    try {
      const validation = insertEmployeeSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      // Check if email already exists
      const existingEmployee = await employeeModel.findByEmail(validation.data.email);
      if (existingEmployee) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validation.data.password, 10);
      
      // Create employee
      const employee = await employeeModel.create({
        ...validation.data,
        password: hashedPassword
      });
      
      return res.status(201).json(employee);
    } catch (error) {
      console.error('Error creating employee:', error);
      return res.status(500).json({ error: 'Failed to create employee' });
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // If password is being updated, hash it
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
      
      const employee = await employeeModel.update(id, updates);
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      return res.json(employee);
    } catch (error) {
      console.error('Error updating employee:', error);
      return res.status(500).json({ error: 'Failed to update employee' });
    }
  }

  /**
   * Delete employee
   */
  async deleteEmployee(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const deleted = await employeeModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      return res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      console.error('Error deleting employee:', error);
      return res.status(500).json({ error: 'Failed to delete employee' });
    }
  }

  /**
   * Get employee profile (for logged in employee)
   */
  async getProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (user.userType !== 'employee') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const employee = await employeeModel.findById(user.id);
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      return res.json(employee);
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  /**
   * Bulk create employees
   */
  async bulkCreateEmployees(req: Request, res: Response) {
    try {
      const employees = req.body;
      
      if (!Array.isArray(employees)) {
        return res.status(400).json({ error: 'Invalid data format' });
      }

      const created = [];
      const errors = [];

      for (let i = 0; i < employees.length; i++) {
        try {
          const employee = employees[i];
          
          // Validate data
          const validation = insertEmployeeSchema.safeParse(employee);
          if (!validation.success) {
            errors.push({ index: i, email: employee.email, error: validation.error.errors });
            continue;
          }

          // Check if email exists
          const existing = await employeeModel.findByEmail(employee.email);
          if (existing) {
            errors.push({ index: i, email: employee.email, error: 'Email already exists' });
            continue;
          }

          // Hash password and create
          const hashedPassword = await bcrypt.hash(employee.password, 10);
          const newEmployee = await employeeModel.create({
            ...employee,
            password: hashedPassword
          });
          
          created.push(newEmployee);
        } catch (error) {
          errors.push({ index: i, email: employees[i].email, error: 'Failed to create' });
        }
      }

      return res.json({
        success: created.length,
        failed: errors.length,
        created,
        errors
      });
    } catch (error) {
      console.error('Error in bulk create:', error);
      return res.status(500).json({ error: 'Bulk create failed' });
    }
  }
}

// Export singleton instance
export const employeeController = new EmployeeController();