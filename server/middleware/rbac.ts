import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { db } from '../config/db';
import { sql } from 'drizzle-orm';

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
      
      console.log(`RBAC Check - User ${req.user.id} permissions:`, userPermissions);
      console.log(`RBAC Check - Required permissions:`, requiredPermissions);
      
      // Check if user has required permissions
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        console.log(`RBAC Check - User ${req.user.id} DENIED access. Missing permissions:`, requiredPermissions);
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      console.log(`RBAC Check - User ${req.user.id} GRANTED access`);

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

async function getUserPermissions(userId: number): Promise<string[]> {
  try {
    console.log(`Getting permissions for user ${userId}`);
    const result = await db.execute(sql`
      SELECT DISTINCT p.name as permission_name
      FROM dashboard_users du
      JOIN rbac_roles r ON r.name = du.role
      JOIN rbac_role_permissions rp ON rp.role_id = r.id
      JOIN rbac_permissions p ON p.id = rp.permission_id
      WHERE du.id = ${userId}
    `);

    console.log(`Query result for user ${userId}:`, result);
    console.log(`Result rows:`, result.rows);
    
    const permissions = result.rows.map((row: any) => row.permission_name);
    console.log(`User ${userId} permissions:`, permissions);
    return permissions;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
}