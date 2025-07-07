import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { db } from '../config/db';

export const rbacMiddleware = (requiredPermissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Skip RBAC for employees - they have limited access
      if (req.user.userType === 'employee') {
        return next();
      }

      // Get user permissions from database
      const userPermissions = await getUserPermissions(req.user.id);
      
      // Check if user has required permissions
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

async function getUserPermissions(userId: number): Promise<string[]> {
  try {
    const result = await db.execute({
      sql: `
        SELECT p.permission_key
        FROM dashboard_users du
        JOIN role_permissions rp ON du.role = rp.role_name
        JOIN permissions p ON rp.permission_id = p.id
        WHERE du.id = ? AND rp.has_permission = true
      `,
      args: [userId]
    });

    return result.rows.map((row: any) => row.permission_key);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
}