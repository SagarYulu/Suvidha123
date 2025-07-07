import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { employeeModel } from '../models/Employee';
import { dashboardUserModel } from '../models/DashboardUser';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt';

export class AuthController {
  /**
   * Unified login for both dashboard users and employees
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      console.log('Login attempt:', { email, password: '[REDACTED]' });

      // Check dashboard user first
      const dashboardUser = await dashboardUserModel.findByEmail(email);
      console.log('Checking dashboard user for email:', email);
      console.log('Dashboard user found:', dashboardUser ? 'YES' : 'NO');

      if (dashboardUser) {
        console.log('Stored password hash:', dashboardUser.password);
        console.log('Input password:', password);
        
        const isValidPassword = await bcrypt.compare(password, dashboardUser.password);
        console.log('Password validation result:', isValidPassword);

        if (isValidPassword) {
          const token = jwt.sign(
            { 
              id: dashboardUser.id, 
              email: dashboardUser.email, 
              role: dashboardUser.role,
              userType: 'dashboard_user'
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
          );

          return res.json({
            token,
            user: {
              id: dashboardUser.id,
              email: dashboardUser.email,
              name: dashboardUser.name,
              role: dashboardUser.role,
              city: dashboardUser.city,
              userType: 'dashboard_user'
            }
          });
        }
      }

      // Check employee
      const employee = await employeeModel.findByEmail(email);
      if (employee) {
        const isValidPassword = await bcrypt.compare(password, employee.password);
        
        if (isValidPassword) {
          const token = jwt.sign(
            { 
              id: employee.id, 
              email: employee.email, 
              role: employee.role || 'Employee',
              userType: 'employee'
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
          );

          return res.json({
            token,
            user: {
              id: employee.id,
              email: employee.email,
              name: employee.name,
              role: employee.role || 'Employee',
              empId: employee.empId,
              city: employee.city,
              userType: 'employee'
            }
          });
        }
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * Mobile employee verification
   */
  async mobileVerify(req: Request, res: Response) {
    try {
      const { email, employeeId } = req.body;

      if (!email || !employeeId) {
        return res.status(400).json({ error: 'Email and employee ID are required' });
      }

      const employee = await employeeModel.findByEmail(email);
      
      if (!employee || employee.empId !== employeeId) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          id: employee.id, 
          email: employee.email, 
          role: employee.role || 'Employee',
          userType: 'employee'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        token,
        user: {
          id: employee.id,
          email: employee.email,
          name: employee.name,
          role: employee.role || 'Employee',
          empId: employee.empId,
          city: employee.city,
          userType: 'employee'
        }
      });
    } catch (error) {
      console.error('Mobile verify error:', error);
      return res.status(500).json({ error: 'Verification failed' });
    }
  }

  /**
   * Verify JWT token
   */
  async verify(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Get fresh user data
      let userData;
      if (user.userType === 'dashboard_user') {
        userData = await dashboardUserModel.findById(user.id);
      } else {
        userData = await employeeModel.findById(user.id);
      }

      if (!userData) {
        return res.status(401).json({ error: 'User not found' });
      }

      return res.json({
        valid: true,
        user: {
          ...userData,
          userType: user.userType
        }
      });
    } catch (error) {
      console.error('Verify error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  /**
   * Logout (client-side token removal)
   */
  async logout(req: Request, res: Response) {
    // Token is removed on client side
    return res.json({ message: 'Logged out successfully' });
  }
}

// Export singleton instance
export const authController = new AuthController();